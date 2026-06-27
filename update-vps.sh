#!/bin/bash
# =============================================================================
# BL-Host Panel - Script de mise à jour rapide (VPS déjà déployé)
# -----------------------------------------------------------------------------
# À utiliser après un "git push" pour mettre à jour un VPS déjà configuré
# par deploy-vps.sh. Il :
#   1. Récupère la dernière version du code (git pull)
#   2. Met à jour les dépendances backend si besoin
#   3. Rebuild le frontend et le republie via Nginx
#   4. Redémarre le backend (PM2)
#
# Le fichier backend/.env et la base de données (database.sqlite) sont conservés.
# =============================================================================

set -euo pipefail

if [ "$EUID" -ne 0 ]; then
  echo "Veuillez exécuter ce script en root (sudo)."
  exit 1
fi

APP_DIR="/home/blhost/app"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"
NGINX_DIR="/var/www/blhost"

if [ ! -d "$APP_DIR/.git" ]; then
  echo "Aucun déploiement trouvé dans $APP_DIR."
  echo "Lancez d'abord le déploiement initial : sudo bash deploy-vps.sh"
  exit 1
fi

echo "=== BL-Host - Mise à jour ==="

# Autoriser git à opérer sur ce dépôt même s'il appartient à 'blhost'
git config --global --add safe.directory "$APP_DIR" 2>/dev/null || true

# --- [1/4] Récupération du code ------------------------------------------------
echo "[1/4] Récupération de la dernière version (git pull)..."
git -C "$APP_DIR" reset --hard
git -C "$APP_DIR" pull

# --- [2/4] Dépendances backend -------------------------------------------------
echo "[2/4] Mise à jour des dépendances backend..."
cd "$BACKEND_DIR"
npm install --omit=dev

# BL-Host Wings : s'assurer que Docker est installé et configuré localement.
if ! command -v docker >/dev/null 2>&1; then
  echo "Installation de Docker..."
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker || true
if ! grep -q "^DOCKER_SOCKET=" "$BACKEND_DIR/.env" && ! grep -q "^DOCKER_HOST=" "$BACKEND_DIR/.env"; then
  echo "DOCKER_SOCKET=/var/run/docker.sock" >> "$BACKEND_DIR/.env"
fi
if ! docker info >/dev/null 2>&1; then
  echo "⚠ Docker non fonctionnel. Si LXC Proxmox, activez le nesting sur l'hôte :"
  echo "    pct set <CTID> --features nesting=1,keyctl=1   (puis redémarrez le LXC)"
fi

# --- [3/4] Build et publication du frontend -----------------------------------
echo "[3/4] Build du frontend..."
cd "$FRONTEND_DIR"
NODE_ENV=development npm install
VITE_API_URL=/api npm run build

echo "Publication du build..."
mkdir -p "$NGINX_DIR"
rm -rf "${NGINX_DIR:?}/"*
cp -r "$FRONTEND_DIR/dist/"* "$NGINX_DIR"/
chown -R www-data:www-data "$NGINX_DIR"

# --- [4/4] Redémarrage du backend ---------------------------------------------
echo "[4/4] Redémarrage du backend (PM2)..."
cd "$BACKEND_DIR"
if pm2 describe bl-host-api >/dev/null 2>&1; then
  pm2 restart bl-host-api --update-env
else
  pm2 start ecosystem.config.js
fi
pm2 save

# Recharger Nginx (au cas où la config aurait changé)
nginx -t && systemctl reload nginx

# --- Vérification --------------------------------------------------------------
echo "Vérification du backend..."
sleep 3
if curl -fs http://127.0.0.1:5000/health | grep -q '"status":"ok"'; then
  echo "✓ Mise à jour terminée, le backend répond correctement."
else
  echo "⚠ Le backend ne répond pas encore. Logs :"
  pm2 logs bl-host-api --lines 15 --nostream || true
fi