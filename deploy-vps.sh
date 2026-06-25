#!/bin/bash
# =============================================================================
# BL-Host Panel - Script de déploiement pour VPS Debian 12 / Ubuntu
# -----------------------------------------------------------------------------
# Ce script :
#   1. Installe Node.js 20, Nginx, PM2 (et Certbot si un domaine est fourni)
#   2. Clone (ou met à jour) le dépôt
#   3. Build le frontend (servi par Nginx) et lance le backend (via PM2)
#   4. Initialise la base de données (utilisateur admin + serveurs démo)
#   5. Configure Nginx (reverse proxy /api) + HTTPS automatique si domaine
#   6. Active le démarrage automatique au boot
#
# Le script est ré-exécutable : relancé, il met simplement à jour le déploiement.
# =============================================================================

set -euo pipefail

echo "=== BL-Host Panel - Déploiement VPS ==="
echo ""

# --- Vérifier les droits root --------------------------------------------------
if [ "$EUID" -ne 0 ]; then
  echo "Veuillez exécuter ce script en root (sudo)."
  exit 1
fi

# --- Saisie des paramètres -----------------------------------------------------
DEFAULT_REPO="https://github.com/NXT-DEVOFF/bl-host.git"
echo -n "URL du dépôt Git [${DEFAULT_REPO}] : "
read REPO_URL
REPO_URL="${REPO_URL:-$DEFAULT_REPO}"

echo -n "Nom de domaine OU adresse IP du VPS (ex: panel.mondomaine.com ou 103.102.135.188) : "
read DOMAIN
if [ -z "$DOMAIN" ]; then
  echo "Un domaine ou une IP est requis."
  exit 1
fi

echo -n "Email administrateur (pour le certificat SSL, laisser vide si pas de domaine) : "
read ADMIN_EMAIL

# Détecter si DOMAIN est une adresse IP (pas de SSL possible sur une IP nue)
IS_IP=false
if [[ "$DOMAIN" =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
  IS_IP=true
fi

# Décider si on active HTTPS (domaine + email fournis)
USE_SSL=false
PROTO="http"
if [ "$IS_IP" = false ] && [ -n "$ADMIN_EMAIL" ]; then
  USE_SSL=true
  PROTO="https"
fi

echo ""
echo "Dépôt        : $REPO_URL"
echo "Domaine/IP   : $DOMAIN"
echo "HTTPS (SSL)  : $([ "$USE_SSL" = true ] && echo "oui (Let's Encrypt)" || echo "non")"
echo ""
echo "Démarrage du déploiement dans 3 secondes... (Ctrl+C pour annuler)"
sleep 3

APP_DIR="/home/blhost/app"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"
NGINX_DIR="/var/www/blhost"
NGINX_CONF="/etc/nginx/sites-available/blhost"

# --- [1/13] Mise à jour du système --------------------------------------------
echo "[1/13] Mise à jour des paquets système..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y

# --- [2/13] Dépendances de base ------------------------------------------------
echo "[2/13] Installation de git, curl, nginx..."
apt-get install -y git curl nginx ca-certificates openssl

# --- [3/13] Node.js 20.x LTS ---------------------------------------------------
echo "[3/13] Installation de Node.js 20.x LTS..."
if ! command -v node >/dev/null 2>&1 || [ "$(node -v | cut -d. -f1 | tr -d 'v')" -lt 18 ]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

# --- [4/13] Vérification -------------------------------------------------------
echo "[4/13] Vérification des versions..."
node --version
npm --version
nginx -v

# --- [5/13] Utilisateur applicatif --------------------------------------------
echo "[5/13] Création de l'utilisateur système 'blhost'..."
if ! id "blhost" &>/dev/null; then
  useradd -m -s /bin/bash blhost
  echo "Utilisateur 'blhost' créé."
else
  echo "Utilisateur 'blhost' déjà présent."
fi

# --- [6/13] Récupération du code (clone ou mise à jour) ------------------------
echo "[6/13] Récupération du code source..."
mkdir -p /home/blhost
# Autoriser git à opérer sur ce dépôt même s'il appartient à 'blhost'
git config --global --add safe.directory "$APP_DIR" 2>/dev/null || true
if [ -d "$APP_DIR/.git" ]; then
  echo "Dépôt déjà présent, mise à jour (git pull)..."
  git -C "$APP_DIR" reset --hard
  git -C "$APP_DIR" pull
else
  rm -rf "$APP_DIR"
  git clone "$REPO_URL" "$APP_DIR"
fi
chown -R blhost:blhost "$APP_DIR"

# --- [7/13] Génération du fichier .env de production --------------------------
# Généré une seule fois : un redéploiement conserve le même JWT_SECRET
# (sinon tous les utilisateurs connectés seraient déconnectés à chaque mise à jour).
if [ -f "$BACKEND_DIR/.env" ] && grep -q "^JWT_SECRET=" "$BACKEND_DIR/.env"; then
  echo "[7/13] Configuration backend (.env) déjà présente, conservation."
else
  echo "[7/13] Génération de la configuration backend (.env)..."
  JWT_SECRET="$(openssl rand -hex 32)"
  cat > "$BACKEND_DIR/.env" <<EOF
NODE_ENV=production
PORT=5000

# Base de données SQLite (aucun serveur externe nécessaire)
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite

# Authentification
JWT_SECRET=$JWT_SECRET
JWT_EXPIRATION=7d

# CORS et logs
CORS_ORIGIN=$PROTO://$DOMAIN
LOG_LEVEL=info
EOF
fi
chown blhost:blhost "$BACKEND_DIR/.env"
chmod 600 "$BACKEND_DIR/.env"

# --- [8/13] Backend : dépendances + initialisation de la base -----------------
echo "[8/13] Installation des dépendances backend..."
cd "$BACKEND_DIR"
npm install --omit=dev
echo "Initialisation de la base de données (admin + serveurs démo)..."
npm run seed
chown -R blhost:blhost "$BACKEND_DIR"

# --- [9/13] Frontend : build de production ------------------------------------
echo "[9/13] Build du frontend..."
cd "$FRONTEND_DIR"
# NODE_ENV ne doit pas valoir 'production' ici, sinon Vite/Tailwind (devDeps) ne s'installent pas
NODE_ENV=development npm install
VITE_API_URL=/api npm run build

echo "Copie du build vers $NGINX_DIR..."
mkdir -p "$NGINX_DIR"
rm -rf "${NGINX_DIR:?}/"*
cp -r "$FRONTEND_DIR/dist/"* "$NGINX_DIR"/
chown -R www-data:www-data "$NGINX_DIR"

# --- [10/13] Configuration Nginx ----------------------------------------------
echo "[10/13] Configuration de Nginx..."
cat > "$NGINX_CONF" <<EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name $DOMAIN;

    root $NGINX_DIR;
    index index.html;

    # SPA React : toutes les routes inconnues renvoient index.html
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # API : reverse proxy vers le backend Node (préfixe /api conservé)
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    client_max_body_size 10M;
}
EOF

# Activer notre site et désactiver le site par défaut
ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/blhost
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl reload nginx

# --- [11/13] PM2 : process manager du backend ---------------------------------
echo "[11/13] Configuration de PM2..."
npm install -g pm2

cat > "$BACKEND_DIR/ecosystem.config.js" <<EOF
module.exports = {
  apps: [{
    name: 'bl-host-api',
    script: 'server.js',
    cwd: '$BACKEND_DIR',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
EOF

cd "$BACKEND_DIR"
pm2 delete bl-host-api 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
# Démarrage automatique au boot (PM2 tourne en root)
pm2 startup systemd -u root --hp /root >/dev/null 2>&1 || true
systemctl enable pm2-root >/dev/null 2>&1 || true

# --- [12/13] Pare-feu + SSL ----------------------------------------------------
echo "[12/13] Pare-feu et certificat SSL..."
# Ouvrir les ports si ufw est actif
if command -v ufw >/dev/null 2>&1 && ufw status | grep -q "Status: active"; then
  ufw allow OpenSSH || true
  ufw allow 'Nginx Full' || true
fi

if [ "$USE_SSL" = true ]; then
  echo "Installation de Certbot et obtention du certificat pour $DOMAIN..."
  apt-get install -y certbot python3-certbot-nginx
  if certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$ADMIN_EMAIL" --redirect; then
    echo "✓ HTTPS activé pour https://$DOMAIN"
  else
    echo "⚠ Échec de l'obtention du certificat SSL."
    echo "  Vérifiez que l'enregistrement DNS A de $DOMAIN pointe bien vers ce VPS,"
    echo "  puis relancez : sudo certbot --nginx -d $DOMAIN"
  fi
else
  echo "SSL non configuré (IP fournie ou email manquant)."
fi

# --- [13/13] Test de santé -----------------------------------------------------
echo "[13/13] Vérification du backend..."
sleep 4
if curl -fs http://127.0.0.1:5000/health | grep -q '"status":"ok"'; then
  echo "✓ Le backend répond correctement."
else
  echo "⚠ Le backend ne répond pas encore. Logs :"
  pm2 logs bl-host-api --lines 15 --nostream || true
fi

# --- Récapitulatif -------------------------------------------------------------
echo ""
echo "=== Déploiement terminé ! ==="
echo ""
echo "Votre panel BL-Host est accessible sur :"
echo "  $PROTO://$DOMAIN"
echo ""
echo "Identifiants administrateur par défaut :"
echo "  Email    : admin@blhost.com"
echo "  Mot de passe : admin123"
echo "  (Pensez à le changer après la première connexion.)"
echo ""
echo "Commandes utiles :"
echo "  pm2 status               # état du backend"
echo "  pm2 logs bl-host-api     # logs du backend"
echo "  pm2 restart bl-host-api  # redémarrer le backend"
echo ""
echo "Pour mettre à jour le site après un 'git push' :"
echo "  sudo bash $APP_DIR/deploy-vps.sh   # relancer ce script (il fera un git pull)"
echo ""
