# BL-Host - Game Server Panel

Une application web moderne pour gérer vos serveurs de jeux dans une interface unique.

## ✨ Fonctionnalités

- 🔐 Authentification sécurisée (JWT)
- 🖥️ Gestion complète des serveurs (CRUD)
- ⚡ Démarrage/Arrêt des serveurs
- 📊 Statistiques en temps réel
- 🎮 Support de plusieurs jeux
- 📱 Interface responsive
- 🎨 Design moderne avec Tailwind CSS
- 🛡️ Routes protégées

## 🏗️ Architecture

```
bl-host/
├── backend/              # API Node.js/Express
│   ├── config/          # Configuration
│   ├── controllers/      # Logique métier
│   ├── models/          # Modèles Sequelize
│   ├── routes/          # Routes API
│   ├── services/        # Services métier
│   ├── middleware/      # Middleware
│   ├── utils/           # Utilitaires
│   └── server.js        # Entrée backend
├── frontend/            # App React/Vite
│   ├── src/
│   │   ├── components/  # Composants réutilisables
│   │   ├── pages/       # Pages
│   │   ├── services/    # Services API
│   │   ├── hooks/       # Hooks personnalisés
│   │   ├── utils/       # Utilitaires
│   │   └── App.jsx      # Entrée frontend
│   └── vite.config.js
├── .env.example         # Variables d'environnement
└── README.md
```

## 🚀 Installation Rapide

### Prérequis
- Node.js 14+
- npm ou yarn

### Backend

```bash
cd backend
npm install
cp ../.env.example .env  # Configurer les variables
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Accédez à l'application à `http://localhost:5173`

## 📝 Variables d'Environnement

Créez un fichier `.env` à la racine :

```env
NODE_ENV=development
PORT=5000
DB_DIALECT=sqlite
JWT_SECRET=your_secret_key_here
CORS_ORIGIN=http://localhost:5173
```

## 🔑 Identifiants de Démonstration

- **Email**: admin@blhost.com
- **Mot de passe**: admin123

## 📚 Documentation API

### Authentification

- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/refresh` - Rafraîchir le token
- `GET /api/auth/me` - Profil actuel

### Serveurs

- `GET /api/servers` - Lister les serveurs
- `POST /api/servers` - Créer un serveur
- `GET /api/servers/:id` - Obtenir un serveur
- `PUT /api/servers/:id` - Modifier un serveur
- `DELETE /api/servers/:id` - Supprimer un serveur
- `POST /api/servers/:id/action` - Démarrer/Arrêter

### Statistiques

- `GET /api/stats` - Statistiques globales

## 🧪 Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm run test
```

## 📦 Déploiement

Consultez [deploy-vps.sh](./deploy-vps.sh) pour le déploiement en production.

## 🛠️ Stack Technique

### Backend
- Node.js + Express
- Sequelize ORM
- SQLite / MySQL
- JWT pour l'authentification
- bcryptjs pour le hachage

### Frontend
- React 18
- Vite (build tool)
- Tailwind CSS
- Axios (HTTP client)
- React Router

## 🤝 Contribution

Les contributions sont les bienvenues!

## 📄 Licence

MIT - Voir LICENSE

## 📧 Support

Pour toute question, ouvrez une issue sur GitHub.
```bash
cd backend
npm install
npm run seed    # Creates admin user (admin@blhost.com / admin123)
npm run dev       # Starts server on http://localhost:5000
```

3. Setup Frontend
```bash
cd ../frontend
npm install
npm run dev       # Starts Vite dev server on http://localhost:5173
```

### Default Admin Account
- Email: admin@blhost.com
- Password: admin123

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Servers (Protected)
- `GET /api/servers` - Get all servers for user
- `POST /api/servers` - Create new server
- `GET /api/servers/:id` - Get specific server
- `PUT /api/servers/:id` - Update server
- `DELETE /api/servers/:id` - Delete server
- `POST /api/servers/:id/start` - Start server
- `POST /api/servers/:id/stop` - Stop server

### Statistics (Protected)
- `GET /api/stats` - Get server statistics

## Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=blhost
DIALECT=sqlite
STORAGE=./database.sqlite
JWT_SECRET=your-secret-key-here
```

## Features in Detail

### Server Management
- Create servers with customizable resources (RAM, disk, CPU)
- Select from popular games (Minecraft, Rust, Valheim, Fortnite, etc.)
- Add custom description and ports
- Edit existing server configurations
- Delete servers permanently

### Server Control
- Start/stop servers with visual feedback
- Status indicators (online/offline/starting/stopping)
- Optimistic UI updates for better UX

### Dashboard
- Overview of total servers, online servers, users, and uptime
- Recent activity feed
- System resource visualization (CPU, memory, disk)

### User Profile
- View and manage account information
- Notification preferences
- Security settings

## Design Principles

- **Mobile First**: Responsive design works on all device sizes
- **Accessibility**: Proper contrast, focus states, and ARIA labels
- **Performance**: Optimized React rendering and API calls
- **User Experience**: Loading states, error handling, and confirmation dialogs
- **Modern UI**: Tailwind CSS with custom component styling
- **Dark Mode**: Automatic switching based on system preference

## Future Enhancements

- [ ] Real-time server status updates (WebSockets)
- [ ] Actual server deployment capabilities
- [ ] Resource usage monitoring
- [ ] Backup and restore functionality
- [ ] Multi-user permissions and roles
- [ ] Internationalization (i18n)
- [ ] Docker integration for isolated server instances
- [ ] Advanced server configuration options
- [ ] Notification system (email/webhook)
- [ ] Analytics and reporting

## License

MIT License - feel free to use, modify, and distribute this project.

## Acknowledgments

- Inspired by Pterodactyl Panel
- Built with love using modern web technologies
- Tailwind CSS for stunning UI
- React for component-based architecture