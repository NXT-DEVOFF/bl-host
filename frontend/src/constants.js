export const GAMES = [
  { id: 'minecraft', name: 'Minecraft' },
  { id: 'cs2', name: 'Counter-Strike 2' },
  { id: 'valorant', name: 'Valorant' },
  { id: 'rust', name: 'Rust' },
  { id: 'rust', name: 'Rust' },
  { id: 'ark', name: 'ARK: Survival Evolved' },
];

export const SERVER_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  STARTING: 'starting',
  STOPPING: 'stopping',
};

export const SERVER_STATUS_COLORS = {
  online: 'bg-green-100 text-green-800',
  offline: 'bg-red-100 text-red-800',
  starting: 'bg-yellow-100 text-yellow-800',
  stopping: 'bg-yellow-100 text-yellow-800',
};

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  SERVERS: '/servers',
  SERVER_CREATE: '/servers/create',
  SERVER_VIEW: (id) => `/servers/${id}`,
  SERVER_EDIT: (id) => `/servers/${id}/edit`,
  PROFILE: '/profile',
};
