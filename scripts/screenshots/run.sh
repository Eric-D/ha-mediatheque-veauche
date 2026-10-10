#!/usr/bin/env bash
# Régénère les captures de docs/INSTALLATION.md, de bout en bout.
#
# Monte une instance Home Assistant jetable dans Docker, y installe
# l'intégration, la fait pointer sur un faux portail local, puis pilote
# l'interface avec Playwright. Aucune donnée réelle n'est employée : ni compte
# de médiathèque, ni mot de passe, ni couverture distante.
#
# Les captures ne sont donc pas des maquettes : c'est la vraie interface de
# Home Assistant, avec la vraie carte, rendue par un vrai navigateur.
#
# Prérequis : docker, node, et un accès réseau pour l'image et la police emoji.
# Usage : scripts/screenshots/run.sh [dossier-de-sortie]
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$HERE/../.." && pwd)"
OUT="${1:-$REPO/docs/img}"
WORK="$(mktemp -d)"
PORT_HA=8123
PORT_PORTAL=8099
USER=demo
PASS=demo1234demo

cleanup() {
  docker rm -f hademo >/dev/null 2>&1 || true
  [[ -n "${PORTAL_PID:-}" ]] && kill "$PORTAL_PID" 2>/dev/null || true
  rm -rf "$WORK"
}
trap cleanup EXIT

echo "▸ faux portail de médiathèque sur :$PORT_PORTAL"
python3 -I "$HERE/fake_portal.py" >"$WORK/portal.log" 2>&1 &
PORTAL_PID=$!
sleep 2

echo "▸ configuration jetable de Home Assistant"
mkdir -p "$WORK/config/custom_components"
cp -r "$REPO/custom_components/mediatheque_veauche" "$WORK/config/custom_components/"
# Seule modification : l'intégration interroge le faux portail. Elle tourne
# sinon telle quelle, scraper compris.
sed -i "s|^BASE_URL = .*|BASE_URL = \"http://127.0.0.1:$PORT_PORTAL\"|" \
  "$WORK/config/custom_components/mediatheque_veauche/const.py"
printf 'default_config:\n' >"$WORK/config/configuration.yaml"

echo "▸ démarrage du conteneur"
docker rm -f hademo >/dev/null 2>&1 || true
docker run -d --name hademo --network host -e TZ=Europe/Paris \
  -v "$WORK/config:/config" ghcr.io/home-assistant/home-assistant:stable >/dev/null
until curl -sf -o /dev/null "http://127.0.0.1:$PORT_HA/"; do sleep 5; done

echo "▸ onboarding par l'API"
CODE=$(curl -s -X POST "http://127.0.0.1:$PORT_HA/api/onboarding/users" \
  -H 'Content-Type: application/json' \
  -d "{\"client_id\":\"http://127.0.0.1:$PORT_HA/\",\"name\":\"Demo\",\"username\":\"$USER\",\"password\":\"$PASS\",\"language\":\"fr\"}" \
  | python3 -c 'import json,sys;print(json.load(sys.stdin)["auth_code"])')
TOK=$(curl -s -X POST "http://127.0.0.1:$PORT_HA/auth/token" \
  -d "grant_type=authorization_code&code=$CODE&client_id=http://127.0.0.1:$PORT_HA/" \
  | python3 -c 'import json,sys;print(json.load(sys.stdin)["access_token"])')
for s in core_config analytics; do
  curl -s -X POST "http://127.0.0.1:$PORT_HA/api/onboarding/$s" -H "Authorization: Bearer $TOK" \
    -H 'Content-Type: application/json' -d "{\"client_id\":\"http://127.0.0.1:$PORT_HA/\"}" -o /dev/null
done
curl -s -X POST "http://127.0.0.1:$PORT_HA/api/onboarding/integration" -H "Authorization: Bearer $TOK" \
  -H 'Content-Type: application/json' \
  -d "{\"client_id\":\"http://127.0.0.1:$PORT_HA/\",\"redirect_uri\":\"http://127.0.0.1:$PORT_HA/?auth_callback=1\"}" -o /dev/null

echo "▸ police emoji (isolée, l'environnement n'est pas modifié)"
# Chromium sans police emoji rend l'icône de membre en carré vide.
export XDG_DATA_HOME="$WORK/xdg"
mkdir -p "$XDG_DATA_HOME/fonts"
FURL=$(curl -sS -A 'Mozilla/5.0' 'https://fonts.googleapis.com/css2?family=Noto+Color+Emoji' \
  | grep -o 'https://fonts.gstatic.com[^)]*' | head -1)
curl -sSL -o "$XDG_DATA_HOME/fonts/NotoColorEmoji.ttf" "$FURL"
fc-cache -f >/dev/null 2>&1 || true

echo "▸ navigateur"
cd "$HERE"
[[ -d node_modules/playwright ]] || npm i --no-save --silent playwright@1.64.0
npx playwright install chromium >/dev/null 2>&1 || true

mkdir -p "$OUT"
echo "▸ captures : parcours d'installation"
OUT="$OUT" node shoot.js
echo "▸ captures : cartes"
OUT="$OUT" node cards.js

echo "✓ captures écrites dans $OUT"
