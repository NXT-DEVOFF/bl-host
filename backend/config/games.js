// =============================================================================
// Registre des images Docker par jeu
// -----------------------------------------------------------------------------
// Chaque entrée décrit comment lancer un serveur de jeu dans un conteneur Docker
// (l'équivalent d'un « egg » Pterodactyl, mais 100 % maison).
//
//   image         : image Docker à utiliser
//   containerPort : port interne exposé par le serveur de jeu
//   protocol      : 'tcp' ou 'udp'
//   dataPath      : dossier de données à persister via un volume Docker
//   env           : variables d'environnement de base passées au conteneur
//   memoryEnv     : (optionnel) fonction (RAM en Mo) -> variables d'env liées à
//                   la mémoire (certaines images veulent connaître la RAM)
// =============================================================================

const GAME_IMAGES = {
  minecraft: {
    label: 'Minecraft (Java)',
    image: 'itzg/minecraft-server:latest',
    containerPort: 25565,
    protocol: 'tcp',
    dataPath: '/data',
    env: { EULA: 'TRUE', TYPE: 'VANILLA' },
    memoryEnv: (mb) => ({ MEMORY: `${mb}M` }),
  },
  rust: {
    label: 'Rust',
    image: 'didstopia/rust-server:latest',
    containerPort: 28015,
    protocol: 'udp',
    dataPath: '/steamcmd/rust',
    env: { RUST_SERVER_NAME: 'BL-Host Rust', RUST_SERVER_MAXPLAYERS: '50' },
  },
  valheim: {
    label: 'Valheim',
    image: 'lloesche/valheim-server:latest',
    containerPort: 2456,
    protocol: 'udp',
    dataPath: '/config',
    env: { SERVER_NAME: 'BL-Host', WORLD_NAME: 'BLHost', SERVER_PASS: 'changeme123' },
  },
  csgo: {
    label: 'CS2 / CS:GO',
    image: 'cm2network/csgo:latest',
    containerPort: 27015,
    protocol: 'udp',
    dataPath: '/home/steam/csgo-dedicated',
    env: {},
  },
  terraria: {
    label: 'Terraria',
    image: 'ryshe/terraria:latest',
    containerPort: 7777,
    protocol: 'tcp',
    dataPath: '/config',
    env: {},
  },
};

// Alias : permet de retrouver une image à partir de différentes orthographes
// (valeurs du formulaire frontend, noms d'affichage, etc.).
const ALIASES = {
  cs2: 'csgo',
  csgo: 'csgo',
  counterstrike2: 'csgo',
  counterstrikeglobaloffensive: 'csgo',
  minecraftjava: 'minecraft',
  mc: 'minecraft',
};

/**
 * Résout la configuration Docker d'un jeu à partir d'un libellé quelconque.
 * Retourne `null` si le jeu n'est pas pris en charge (mode démo conservé).
 */
function resolveGameImage(game) {
  if (!game) return null;
  const key = String(game).toLowerCase().replace(/[^a-z0-9]/g, '');
  const resolved = ALIASES[key] || key;
  return GAME_IMAGES[resolved] ? { id: resolved, ...GAME_IMAGES[resolved] } : null;
}

module.exports = { GAME_IMAGES, resolveGameImage };
