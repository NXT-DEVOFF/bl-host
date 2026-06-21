# 🏗️ Architecture Complète - BL-Host

## Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT BROWSER                        │
│            (React 18 + Vite + Tailwind CSS)            │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTP/HTTPS
                     │ (REST API)
                     ▼
┌─────────────────────────────────────────────────────────┐
│               API SERVER (Node.js/Express)              │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Middleware (Auth, Logging, Error Handling)     │  │
│  ├──────────────────────────────────────────────────┤  │
│  │  Routes & Controllers                           │  │
│  │  ├─ Auth Routes         → AuthController        │  │
│  │  ├─ Server Routes       → ServerController      │  │
│  │  └─ Stats Routes        → StatsController       │  │
│  ├──────────────────────────────────────────────────┤  │
│  │  Services Layer                                 │  │
│  │  ├─ AuthService                                 │  │
│  │  ├─ ServerService                               │  │
│  │  └─ Validation & Business Logic                 │  │
│  ├──────────────────────────────────────────────────┤  │
│  │  Models (Sequelize ORM)                         │  │
│  │  ├─ User                                        │  │
│  │  └─ Server                                      │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ SQL Queries
                     ▼
        ┌────────────────────────┐
        │  Database (SQLite/     │
        │   MySQL in Prod)       │
        │  ┌──────────────────┐  │
        │  │ users            │  │
        │  │ servers          │  │
        │  └──────────────────┘  │
        └────────────────────────┘
```

## Frontend - Architecture Complète

```
src/
├── App.jsx                    # Routeur principal
├── main.jsx                   # Point d'entrée React
├── index.css                  # Styles globaux (Tailwind)
│
├── components/
│   ├── PrivateRoute.jsx       # Protection des routes
│   └── UI.jsx                 # Composants réutilisables
│       ├── Card
│       ├── Button (variants: primary, secondary, danger, success)
│       ├── Input
│       ├── Badge
│       ├── Loading
│       ├── Error
│       ├── Success
│       └── Modal
│
├── pages/
│   ├── Login.jsx              # Authentification
│   ├── Register.jsx           # Inscription
│   ├── Dashboard.jsx          # Accueil + statistiques
│   ├── Servers.jsx            # Liste des serveurs
│   ├── ServerCreate.jsx       # Création/édition serveur
│   ├── ServerView.jsx         # Détails + actions
│   └── Profile.jsx            # Profil utilisateur
│
├── services/
│   ├── api.js                 # Client Axios configuré
│   ├── authService.js         # Authentification API
│   └── serverService.js       # Gestion serveurs API
│
├── hooks/
│   ├── useForm.js             # Gestion de formulaires
│   └── useAsync.js            # Requêtes async
│
├── utils/
│   ├── validators.js          # Validations côté client
│   ├── helpers.js             # Fonctions utilitaires
│   └── constants.js           # Constantes (jeux, routes)
│
└── config/
    └── vite.config.js         # Configuration Vite
```

## Backend - Architecture Complète

```
backend/
├── server.js                  # Entrée principale
│
├── config/
│   ├── database.js            # Configuration Sequelize
│   └── logger.js              # Système de logging
│
├── middleware/
│   ├── auth.js                # Authentification JWT
│   └── errorHandler.js        # Gestion d'erreurs (dans utils)
│
├── controllers/
│   ├── authController.js      # Endpoints auth
│   ├── serverController.js    # Endpoints serveurs
│   └── statsController.js     # Endpoints stats
│
├── routes/
│   ├── auth.js                # Routes d'auth
│   ├── servers.js             # Routes serveurs
│   └── stats.js               # Routes stats
│
├── services/
│   ├── authService.js         # Logique authentification
│   └── serverService.js       # Logique serveurs
│
├── models/
│   ├── index.js               # Configuration Sequelize
│   ├── User.js                # Model User
│   └── Server.js              # Model Server
│
├── utils/
│   ├── errorHandler.js        # Classes et middleware erreurs
│   └── validators.js          # Validations serveur
│
├── logs/                      # Dossier des logs
│   ├── error.log              # Erreurs
│   └── warn.log               # Avertissements
│
└── database.sqlite            # BD SQLite (dev)
```

## Flux de Données - Exemple: Créer un Serveur

### 1. Frontend (React)

```
User clicks "Create Server"
        ↓
ServerCreate.jsx montré
        ↓
Formulaire rempli, validation côté client
        ↓
handleSubmit() appelé
        ↓
serverService.createServer(data)
```

### 2. Service API (Frontend)

```
serverService.createServer()
        ↓
POST /api/servers avec le token JWT
        ↓
apiClient intercepte et ajoute le token
        ↓
Requête envoyée au backend
```

### 3. Backend - Requête Arrive

```
POST /api/servers
        ↓
authenticateToken middleware
  ├─ Extrait le token
  ├─ Vérifie la signature JWT
  ├─ Attache userId à req
        ↓
serverController.createServer()
        ↓
handleAsyncError wrapper
  ├─ Attrape les erreurs
  ├─ Les passe au error handler
```

### 4. Business Logic (Service)

```
serverController appelle serverService.createServer()
        ↓
ServerService valide les données
  ├─ Vérifie le nom (3-100 chars)
  ├─ Vérifie l'IP si fournie
  ├─ Vérifie le port si fourni
  ├─ Jetem AppError si erreur
        ↓
Si valide, crée le Server en BD
  ├─ db.Server.create()
  ├─ Sequelize génère SQL
  ├─ BD retourne l'objet créé
        ↓
Service retourne le serveur
```

### 5. Response Format

```
Controller envoie réponse:
{
  success: true,
  data: { id, name, game, status, ip_address, port, ... }
}
        ↓
Frontend reçoit via apiClient
        ↓
Message de succès affiché
        ↓
Redirection vers la page serveur
```

## Sécurité - Couches

### 1. JWT Authentication
```javascript
const token = jwt.sign(
  { userId: user.id, email, role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
// Vérifié sur chaque requête protégée
```

### 2. Password Hashing
```javascript
const hashedPassword = await bcrypt.hash(password, 10);
// 10 rounds = ~100ms par hash
```

### 3. Validation Stricte
```javascript
if (!validateEmail(email)) throw new AppError(...)
if (!validatePassword(password)) throw new AppError(...)
if (!validateServerName(name)) throw new AppError(...)
```

### 4. CORS Protection
```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));
```

### 5. Error Handling
```javascript
try/catch → handleAsyncError → errorHandler middleware
Pas de stack traces en production
```

## Performance Optimizations

### Frontend
- ✅ Vite (instant HMR)
- ✅ Component splitting
- ✅ Lazy loading routes
- ✅ useCallback/useMemo
- ✅ Axios response caching (implicite)

### Backend
- ✅ Sequelize query optimization
- ✅ Eager loading (include)
- ✅ Connection pooling
- ✅ Request logging
- ✅ Error early exit

### Database
- ✅ Indexes on foreign keys
- ✅ Proper column types
- ✅ Connection pooling
- ✅ SQLite for dev, MySQL for prod

## Scalability Path

### Phase 1: Current
- Single Node.js instance
- SQLite database
- Basic auth

### Phase 2: Production Ready
- Multiple instances (load balancer)
- MySQL database
- Redis for sessions
- Monitoring (Sentry)

### Phase 3: Enterprise
- Kubernetes deployment
- Database replicas
- WebSockets for real-time
- Analytics dashboard
- Backup systems

## Monitoring & Logs

### Log Levels
```
ERROR   → database.sqlite: Erreurs critiques
WARN    → warn.log: Avertissements
INFO    → console: Opérations normales
DEBUG   → console (dev only): Détails
```

### What to Monitor
- 🔴 Erreurs de base de données
- 🟡 Requêtes lentes (> 1s)
- 🟢 Uploads/Téléchargements
- 📊 Nombre d'utilisateurs connectés
- 📈 Usage CPU/Mémoire

## Deployment Checklist

- [ ] Variables d'environnement configurées
- [ ] Base de données MySQL
- [ ] SSL/HTTPS
- [ ] Nginx reverse proxy
- [ ] PM2/Forever pour Node
- [ ] Backups automatiques
- [ ] Logs centralisés
- [ ] Monitoring actif
- [ ] Alertes configurées
- [ ] Documentation mise à jour
