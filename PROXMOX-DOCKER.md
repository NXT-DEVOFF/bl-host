# BL-Host Wings — Hôte Docker sur Proxmox

Ce guide met en place l'**orchestrateur réel** des serveurs de jeu : Docker, piloté
par le panel BL-Host via l'API Docker (start/stop/restart/logs/console **réels**).

> Tant que Docker n'est pas joignable, le panel reste en **mode démo**
> (start/stop simulés) — rien ne casse.

Deux approches :

- **Option A (recommandée, la plus simple)** : Docker **sur le même LXC** que le
  panel → socket local, aucun certificat. **Automatisé** par `deploy-vps.sh` /
  `update-vps.sh`.
- **Option B (avancée)** : Docker sur une **VM/hôte séparé**, piloté via l'API
  Docker en **TLS** (sections 1 à 7 plus bas).

---

## Option A — Tout sur le même LXC (recommandé)

Le plus simple : le panel **et** Docker tournent dans le même conteneur LXC. Le
backend utilise alors le socket local `/var/run/docker.sock` (le service tourne en
root via PM2, donc l'accès au socket est immédiat).

### Prérequis Proxmox : activer le « nesting » sur le LXC

Docker ne peut tourner dans un LXC que si celui-ci a le **nesting** activé. Sur
l'**hôte Proxmox** (pas dans le LXC) :

```bash
pct set <CTID> --features nesting=1,keyctl=1
pct reboot <CTID>
```

(`<CTID>` = l'ID de votre conteneur LXC, ex. `100`.)

### Déploiement

Lancez simplement le déploiement habituel **dans le LXC** : il installe Node,
Nginx, PM2 **et Docker**, configure `DOCKER_SOCKET=/var/run/docker.sock`, puis
démarre tout (Docker compris) au boot.

```bash
sudo bash deploy-vps.sh          # première installation
# ou, si déjà déployé :
sudo bash /home/blhost/app/update-vps.sh
```

Vérifiez ensuite :

```bash
docker info                                   # doit répondre sans erreur
pm2 logs bl-host-api | grep -i docker         # « Service Docker initialisé. »
```

Puis **créez un nouveau serveur** dans le panel (les anciens serveurs démo n'ont
pas de conteneur et restent en mode démo). C'est tout — pas de certificats à gérer.

> Si `docker info` échoue, c'est presque toujours le **nesting** non activé
> (voir ci-dessus).

---

## Option B — Hôte Docker séparé (avancé, TLS)

Les sections ci-dessous décrivent l'alternative : Docker sur une **VM/hôte
distant** piloté par le panel via TCP+TLS. Inutile si vous avez choisi l'option A.

## 1. Créer la VM Docker sur Proxmox

Le plus simple et le plus robuste est une **VM** (Debian 12) plutôt qu'un LXC
(Docker dans un LXC exige l'option « nesting » et reste plus fragile).

1. Téléversez une ISO Debian 12 et créez une VM (ex. 4 vCPU, 8 Go RAM, 80 Go disque).
2. Installez Debian, notez son **IP locale** (ex. `192.168.1.50`).
3. Installez les prérequis puis Docker (en root) :

```bash
# Sur une Debian 12 minimale, curl/openssl ne sont pas toujours présents
apt-get update && apt-get install -y curl openssl ca-certificates

curl -fsSL https://get.docker.com | sh
systemctl enable --now docker
```

---

## 2. Exposer l'API Docker en TLS (recommandé)

L'API Docker non chiffrée (port 2375) donne un **accès root** à la machine : ne
l'exposez jamais en clair sur un réseau public. On génère des certificats TLS.

Sur la VM Docker, en root :

```bash
mkdir -p /etc/docker/certs && cd /etc/docker/certs
HOST_IP=192.168.1.50      # <-- IP de la VM Docker

# Autorité de certification
openssl genrsa -aes256 -out ca-key.pem 4096          # (choisissez une passphrase)
openssl req -new -x509 -days 3650 -key ca-key.pem -sha256 -out ca.pem -subj "/CN=blhost-ca"

# Certificat serveur
openssl genrsa -out server-key.pem 4096
openssl req -subj "/CN=$HOST_IP" -new -key server-key.pem -out server.csr
echo "subjectAltName = IP:$HOST_IP,IP:127.0.0.1" > extfile.cnf
echo "extendedKeyUsage = serverAuth" >> extfile.cnf
openssl x509 -req -days 3650 -sha256 -in server.csr -CA ca.pem -CAkey ca-key.pem \
  -CAcreateserial -out server-cert.pem -extfile extfile.cnf

# Certificat client (utilisé par le panel BL-Host)
openssl genrsa -out key.pem 4096
openssl req -subj "/CN=client" -new -key key.pem -out client.csr
echo "extendedKeyUsage = clientAuth" > extfile-client.cnf
openssl x509 -req -days 3650 -sha256 -in client.csr -CA ca.pem -CAkey ca-key.pem \
  -CAcreateserial -out cert.pem -extfile extfile-client.cnf
```

Configurez le démon Docker pour écouter en TLS :

```bash
mkdir -p /etc/systemd/system/docker.service.d
cat > /etc/systemd/system/docker.service.d/override.conf <<'EOF'
[Service]
ExecStart=
ExecStart=/usr/bin/dockerd --host=unix:///var/run/docker.sock \
  --host=tcp://0.0.0.0:2376 \
  --tlsverify \
  --tlscacert=/etc/docker/certs/ca.pem \
  --tlscert=/etc/docker/certs/server-cert.pem \
  --tlskey=/etc/docker/certs/server-key.pem
EOF

systemctl daemon-reload
systemctl restart docker
```

---

## 3. Copier les certificats CLIENT vers le serveur du panel

Le backend BL-Host a besoin de **3 fichiers** : `ca.pem`, `cert.pem`, `key.pem`.

Sur la VM Docker :

```bash
# Récupérez ces 3 fichiers depuis /etc/docker/certs :
#   ca.pem      cert.pem      key.pem
```

Sur le serveur du panel (où tourne BL-Host), placez-les dans un dossier dédié :

```bash
mkdir -p /home/blhost/docker-certs
# copiez-y ca.pem, cert.pem, key.pem (scp, etc.)
chown -R blhost:blhost /home/blhost/docker-certs
chmod 600 /home/blhost/docker-certs/*
```

---

## 4. Configurer le backend BL-Host

Dans `backend/.env` (ou via le bloc déjà prévu) :

```env
DOCKER_HOST=tcp://192.168.1.50:2376
DOCKER_TLS_VERIFY=1
DOCKER_CERT_PATH=/home/blhost/docker-certs
```

Installez la dépendance puis redémarrez :

```bash
cd /home/blhost/app/backend
npm install            # installe dockerode
pm2 restart bl-host-api
pm2 logs bl-host-api    # vous devez voir « Service Docker initialisé. »
```

> Si le backend tourne **directement** sur la VM Docker, vous pouvez à la place
> utiliser le socket local : `DOCKER_SOCKET=/var/run/docker.sock` (et retirer les
> variables `DOCKER_*` TCP).

---

## 5. Réseau & pare-feu

- Le port **2376** (API Docker TLS) ne doit être accessible **que** depuis le
  serveur du panel (filtrez par IP / réseau privé Proxmox).
- Chaque serveur de jeu publie un **port hôte** (le panel alloue `30000 + id` par
  défaut, ou le port que vous saisissez). Ouvrez ces ports vers la VM Docker pour
  que les joueurs puissent se connecter.

---

## 6. Jeux pris en charge

Définis dans [`backend/config/games.js`](backend/config/games.js) (images Docker) :

| Jeu | Image Docker | Port interne |
|-----|--------------|--------------|
| Minecraft (Java) | `itzg/minecraft-server` | 25565/tcp |
| Rust | `didstopia/rust-server` | 28015/udp |
| Valheim | `lloesche/valheim-server` | 2456/udp |
| CS2 / CS:GO | `cm2network/csgo` | 27015/udp |
| Terraria | `ryshe/terraria` | 7777/tcp |

Pour ajouter un jeu : ajoutez une entrée dans `GAME_IMAGES` (image, port,
protocole, dossier de données). Aucun autre changement nécessaire.

---

## 7. Vérifier

1. Créez un serveur **Minecraft** depuis le panel.
   → le backend télécharge l'image et crée le conteneur `blhost-<id>`.
2. Cliquez **Démarrer** → le conteneur démarre réellement.
3. La **console** (page du serveur) affiche les logs en direct ; le badge passe à
   **« En direct »**.
4. Sur la VM Docker, `docker ps` doit lister le conteneur `blhost-<id>`.

Si quelque chose échoue, le serveur reste créé en **mode démo** et les logs du
backend (`pm2 logs bl-host-api`) indiquent la cause exacte.
