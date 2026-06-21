# 🚀 Guide de Démarrage - BL-Host

## Installation Complète

### 1. Installer les Dépendances

```bash
# À la racine du projet
npm run install-all
```

Ou manuellement :

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configuration des Variables d'Environnement

#### Backend (.env)

```bash
cd backend
cp ../.env.example .env
```

Fichier `.env` :
```env
NODE_ENV=development
PORT=5000
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite
JWT_SECRET=super_secret_key_change_in_production
JWT_EXPIRATION=7d
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=info
```

#### Frontend (.env)

```bash
cd ../frontend
cp ../.env.example .env
```

Fichier `.env` :
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=BL-Host
```

### 3. Initialiser la Base de Données

```bash
cd backend
npm run seed
```

Cela va :
- Créer la base de données
- Créer l'utilisateur admin
- Ajouter des serveurs de démo

### 4. Démarrer l'Application

#### Option 1 : Démarrage Simultané (Recommended)

```bash
npm run dev  # À la racine
```

#### Option 2 : Démarrage Séparé

Terminal 1 - Backend :
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend :
```bash
cd frontend
npm run dev
```

### 5. Accéder à l'Application

- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:5000/api

### 📝 Identifiants de Démonstration

- **Email** : admin@blhost.com
- **Mot de passe** : admin123

## 🛠️ Commands Disponibles

### Backend

```bash
npm start          # Production
npm run dev        # Développement
npm run seed       # Initialiser DB
npm test          # Tests
```

### Frontend

```bash
npm run dev       # Développement
npm run build     # Build production
npm run preview   # Prévisualisation
```

### Root

```bash
npm run install-all   # Installer tout
npm run dev          # Dev mode complet
npm run build        # Build tout
npm start            # Production
```

## 🐛 Troubleshooting

### Port déjà utilisé

```bash
# Port 5000 (Backend)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Port 5173 (Frontend)
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Base de données corrompue

```bash
cd backend
rm database.sqlite
npm run seed
```

### Erreurs CORS

Vérifier que `CORS_ORIGIN` dans `.env` backend correspond au frontend URL

### Erreurs de dépendances

```bash
# Supprimer et réinstaller
rm -rf node_modules package-lock.json
npm install
```

## 📚 Structure du Projet

```
bl-host/
├── backend/
│   ├── config/       # Configuration
│   ├── controllers/  # Controllers
│   ├── models/       # Models Sequelize
│   ├── routes/       # Routes API
│   ├── services/     # Services métier
│   ├── middleware/   # Middleware
│   ├── utils/        # Utilitaires
│   └── server.js     # Entrée
├── frontend/
│   ├── src/
│   │   ├── components/  # Composants
│   │   ├── pages/       # Pages
│   │   ├── services/    # Services API
│   │   ├── hooks/       # Hooks
│   │   ├── utils/       # Utilitaires
│   │   └── App.jsx      # Entrée
│   └── vite.config.js
├── .env.example
├── .gitignore
├── README.md
├── CHANGELOG.md
└── package.json
```

## 🎨 Customisation

### Changer les couleurs

Fichier : `frontend/tailwind.config.js`

```js
theme: {
  extend: {
    colors: {
      primary: '#your-color',
    }
  }
}
```

### Ajouter des jeux

Fichier : `frontend/src/constants.js`

```js
export const GAMES = [
  { id: 'minecraft', name: 'Minecraft' },
  // Ajouter vos jeux
];
```

## 🔒 Sécurité

### Avant la Production

1. Changer `JWT_SECRET` dans `.env`
2. Configurer une vraie base de données (MySQL)
3. Configurer HTTPS
4. Ajouter rate limiting
5. Activer logging
6. Mettre à jour les dépendances

```bash
npm audit fix
```

## 📞 Support

Pour toute question ou problème :
1. Vérifier la documentation
2. Consulter les logs (backend/logs/)
3. Ouvrir une issue

## ✅ Checklist Production

- [ ] JWT_SECRET changé
- [ ] CORS_ORIGIN configuré
- [ ] Base de données MySQL
- [ ] SSL/HTTPS activé
- [ ] Logs configurés
- [ ] Backup automatique
- [ ] Monitoring en place
- [ ] Tests passent
