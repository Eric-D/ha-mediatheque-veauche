/* Captures du tutoriel, contre une instance Home Assistant jetable. */
const { chromium } = require('playwright');
const fs = require('fs');

const HA = 'http://127.0.0.1:8123';
const OUT = process.env.OUT || '/tmp/shots';
const USER = 'demo', PASS = 'demo1234demo';
const CARD_ID = '123456789';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const done = [];

async function shot(page, name, wait = 1000) {
  await sleep(wait);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  done.push(name);
  console.log('  📸', name);
}

async function step(name, fn) {
  try { await fn(); }
  catch (e) { console.log('  ⚠️ ', name, '→', e.message.split('\n')[0]); }
}

async function login(page) {
  await page.goto(HA, { waitUntil: 'domcontentloaded' });
  await sleep(2500);
  const u = page.locator('input[autocomplete="username"]').first();
  await u.waitFor({ timeout: 30000 });
  await u.fill(USER);
  await page.locator('input[type="password"]').first().fill(PASS);
  await page.keyboard.press('Enter');
  await sleep(4000);
}

/* Enregistre une config de tableau de bord via le websocket déjà authentifié
   de la page : piloter l'éditeur à la souris serait long et fragile. */
async function setDashboard(page, cards) {
  return page.evaluate(async (cards) => {
    const conn = (await window.hassConnection).conn;
    await conn.sendMessagePromise({
      type: 'lovelace/config/save',
      url_path: null,
      config: { views: [{ title: 'Accueil', cards }] },
    });
    return true;
  }, cards);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 860 },
    deviceScaleFactor: 2, locale: 'fr-FR', timezoneId: 'Europe/Paris',
  });
  const page = await ctx.newPage();

  await login(page);
  console.log('  connecté');

  // ---------- 01 : page des intégrations ----------
  await step('01', async () => {
    await page.goto(`${HA}/config/integrations`, { waitUntil: 'domcontentloaded' });
    await shot(page, '01-integrations', 3000);
  });

  // ---------- 02 : recherche de l'intégration ----------
  await step('02', async () => {
    await page.getByText('Ajouter une intégration').first().click({ timeout: 15000 });
    await sleep(3000);
    await page.locator('input[type=text], input[type=search]').last().fill('médiath');
    await shot(page, '02-rechercher-integration', 2500);
  });

  // ---------- 03/04 : formulaire d'identifiants ----------
  await step('03', async () => {
    await page.getByText('Médiathèque de Veauche').first().click({ timeout: 15000 });
    await sleep(4000);
    await shot(page, '03-identifiants-vide', 1200);

    const txt = page.locator('input[type=text]:visible');
    const pwd = page.locator('input[type=password]:visible');
    console.log('     champs :', await txt.count(), 'texte /', await pwd.count(), 'mot de passe');
    await txt.last().fill(CARD_ID);
    await pwd.last().fill('motdepasse-demo');
    await shot(page, '04-identifiants-rempli', 1000);
  });

  // ---------- 05 : succès ----------
  await step('05', async () => {
    await page.getByText(/^(Valider|Envoyer|Soumettre|Suivant)$/i).last()
      .click({ timeout: 8000 })
      .catch(async () => { await page.locator('input[type=password]:visible').last().press('Enter'); });
    await sleep(12000);
    await shot(page, '05-succes', 1500);
    await page.getByText(/^(Terminer|Fermer)$/i).last().click({ timeout: 5000 }).catch(() => {});
    await sleep(1500);
  });

  // ---------- 06 : l'intégration est là ----------
  await step('06', async () => {
    await page.goto(`${HA}/config/integrations/integration/mediatheque_veauche`, { waitUntil: 'domcontentloaded' });
    await shot(page, '06-integration-ajoutee', 4000);
  });

  // ---------- 07 : les capteurs ----------
  await step('07', async () => {
    await page.goto(`${HA}/config/entities`, { waitUntil: 'domcontentloaded' });
    await sleep(2500);
    await page.locator('input[type=text], input[type=search]').first().fill('emprunt');
    await shot(page, '07-capteurs', 2500);
  });

  // ---------- cartes ----------
  const ENT = 'sensor.emprunts_mediatheque';
  await step('08', async () => {
    await page.goto(`${HA}/home/overview`, { waitUntil: 'domcontentloaded' });
    await sleep(3000);
    await setDashboard(page, [{ type: 'custom:mediatheque-card', entity: ENT }]);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await shot(page, '08-carte-liste', 5000);
  });

  await step('09', async () => {
    await setDashboard(page, [{ type: 'custom:mediatheque-card', entity: ENT, mode: 'covers' }]);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await shot(page, '09-carte-couvertures', 5000);
  });

  await step('10', async () => {
    await setDashboard(page, [{ type: 'custom:mediatheque-card', entity: ENT, mode: 'carousel' }]);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await shot(page, '10-carte-carousel', 5000);
  });

  await step('11', async () => {
    await page.locator('.mc-car-barcode').first().click({ timeout: 10000 });
    await shot(page, '11-code-barres', 2000);
    await page.keyboard.press('Escape');
    await sleep(800);
  });

  await step('12', async () => {
    await page.locator('.mc-car-tile').first().click({ timeout: 10000 });
    await shot(page, '12-fiche-livre', 2000);
  });

  console.log('\n', done.length, 'captures :', done.join(', '));
  await browser.close();
})();
