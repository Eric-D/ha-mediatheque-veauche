const { chromium } = require('playwright');
const HA='http://127.0.0.1:8123', OUT=process.env.OUT;
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
const shot=async(p,n,w=1200)=>{await sleep(w);await p.screenshot({path:`${OUT}/${n}.png`});console.log('  📸',n);};
const step=async(n,f)=>{try{await f()}catch(e){console.log('  ⚠️ ',n,'→',e.message.split('\n')[0])}};

const DASH='ma-mediatheque';
async function ensureDash(p){
  return p.evaluate(async(url)=>{
    const conn=(await window.hassConnection).conn;
    try{
      const list=await conn.sendMessagePromise({type:'lovelace/dashboards/list'});
      if(!list.some(d=>d.url_path===url)){
        await conn.sendMessagePromise({type:'lovelace/dashboards/create',
          url_path:url,title:'Médiathèque',icon:'mdi:book-open-variant',show_in_sidebar:true,require_admin:false});
      }
      return 'ok';
    }catch(e){ return 'ERR '+JSON.stringify(e); }
  },DASH);
}
async function setDash(p,cards){
  return p.evaluate(async({url,cards})=>{
    const conn=(await window.hassConnection).conn;
    await conn.sendMessagePromise({type:'lovelace/config/save',url_path:url,
      config:{views:[{title:'Médiathèque',cards}]}});
  },{url:DASH,cards});
}
(async()=>{
  const b=await chromium.launch();
  const c=await b.newContext({viewport:{width:1280,height:860},deviceScaleFactor:2,locale:'fr-FR',timezoneId:'Europe/Paris'});
  const p=await c.newPage();
  await p.goto(HA,{waitUntil:'domcontentloaded'}); await sleep(2500);
  await p.locator('input[autocomplete="username"]').first().fill('demo');
  await p.locator('input[type="password"]').first().fill('demo1234demo');
  await p.keyboard.press('Enter'); await sleep(4500);

  const ENT = await p.evaluate(async()=>{
    const conn=(await window.hassConnection).conn;
    const st=await conn.sendMessagePromise({type:'get_states'});
    const m=st.find(s=>s.entity_id.includes('emprunts_mediatheque'));
    return m && m.entity_id;
  });
  console.log('  entité :', ENT);

  console.log('  dashboard :', await ensureDash(p)); await sleep(1500);
  await p.goto(`${HA}/${DASH}`,{waitUntil:'domcontentloaded'}); await sleep(3000);

  const render = async(name, card)=>{
    await p.goto(`${HA}/home/overview`,{waitUntil:'domcontentloaded'}); await sleep(2500);
    await setDash(p,[card]);
    await p.goto(`${HA}/${DASH}`,{waitUntil:'domcontentloaded'});
    await shot(p,name,6000);
  };
  await step('liste', ()=>render('08-carte-liste',{type:'custom:mediatheque-card',entity:ENT}));
  await step('couvertures', ()=>render('09-carte-couvertures',{type:'custom:mediatheque-card',entity:ENT,mode:'covers'}));
  await step('carousel', ()=>render('10-carte-carousel',{type:'custom:mediatheque-card',entity:ENT,mode:'carousel'}));
  await step('code-barres', async()=>{
    await p.locator('.mc-car-barcode').first().click({timeout:12000});
    await shot(p,'11-code-barres',2000);
    await p.locator('.mc-modal-btn-close').first().click({timeout:5000}).catch(()=>p.keyboard.press('Escape'));
    await sleep(1000);
  });
  await step('fiche', async()=>{
    await p.goto(`${HA}/${DASH}`,{waitUntil:'domcontentloaded'}); await sleep(5000);
    const t=p.locator('.mc-car-tile').first();
    await t.waitFor({timeout:12000});
    await t.click({force:true});
    await shot(p,'12-fiche-livre',2500);
  });
  await b.close();
})();
