# 📚 Standards et Conventions de Code

## Conventions de Nommage

### Variables et Fonctions
```javascript
// ✅ Bon : camelCase
const userName = 'John';
const getUserData = () => { };

// ❌ Mauvais : snake_case ou PascalCase
const user_name = 'John';
const GetUserData = () => { };
```

### Composants React
```javascript
// ✅ Bon : PascalCase
export const UserProfile = () => { };

// ❌ Mauvais : camelCase
export const userProfile = () => { };
```

### Constantes
```javascript
// ✅ Bon : UPPER_SNAKE_CASE
const MAX_RETRIES = 3;
const API_TIMEOUT = 5000;

// ❌ Mauvais
const maxRetries = 3;
const apiTimeout = 5000;
```

## Sctructure des Fichiers

### Backend Controllers
```javascript
// ✅ Bon
const getUser = handleAsyncError(async (req, res) => {
  const user = await userService.getUser(req.params.id);
  res.json({ success: true, data: user });
});

// ❌ Mauvais : gestion d'erreur manquante
const getUser = async (req, res) => {
  const user = await userService.getUser(req.params.id);
  res.json(user);
};
```

### Frontend Composants
```javascript
// ✅ Bon : utilisez les imports nommés
import { useState, useEffect } from 'react';
import { Button, Card } from '../components/UI';

// ❌ Mauvais : imports non cohérents
import React from 'react';
import Button from '../components/Button';
```

## Gestion d'Erreurs

### Backend
```javascript
// ✅ Bon : erreurs structurées
if (!email) {
  throw new AppError('Email is required', 400, 'EMAIL_REQUIRED');
}

// ❌ Mauvais : messages génériques
if (!email) {
  throw new Error('Erreur');
}
```

### Frontend
```javascript
// ✅ Bon : gestion complète
try {
  const data = await fetchData();
  setData(data);
} catch (error) {
  const message = error.error?.message || 'Failed to load';
  setError(message);
}

// ❌ Mauvais : pas de gestion
const data = await fetchData();
setData(data);
```

## Validations

### Toujours valider les inputs
```javascript
// ✅ Bon
const { email, password } = req.body;
if (!email || !password) {
  throw new AppError('Email and password required', 400);
}
if (!validateEmail(email)) {
  throw new AppError('Invalid email', 400);
}

// ❌ Mauvais : pas de validation
const { email, password } = req.body;
const user = await User.findOne({ where: { email } });
```

## Commentaires

### Quand commenter
```javascript
// ✅ Bon : expliquer le pourquoi, pas le quoi
// Retry avec exponential backoff pour éviter les surcharges
const delay = Math.pow(2, attempt) * 1000;

// ❌ Mauvais : commentaire inutile
// Incrémenter i
i++;

// ❌ Mauvais : explique le code
// Boucler sur les utilisateurs
users.forEach(user => {
  // Vérifier si actif
  if (user.active) {
    // Ajouter à la liste
    activeUsers.push(user);
  }
});
```

## API Responses

### Format Uniforme
```javascript
// ✅ Bon : réponse structurée
res.json({
  success: true,
  data: { id: 1, name: 'John' },
});

res.status(400).json({
  success: false,
  error: {
    message: 'Invalid input',
    code: 'INVALID_INPUT',
  },
});

// ❌ Mauvais : formats inconsistants
res.json({ id: 1, name: 'John' });
res.json({ message: 'Error' });
```

## Base de Données

### Transactions pour les opérations critiques
```javascript
// ✅ Bon
const transaction = await db.sequelize.transaction();
try {
  const user = await db.User.create(data, { transaction });
  const server = await db.Server.create(serverData, { transaction });
  await transaction.commit();
} catch (error) {
  await transaction.rollback();
  throw error;
}

// ❌ Mauvais : pas de transaction
const user = await db.User.create(data);
const server = await db.Server.create(serverData); // Peut échouer
```

## Performance

### Éviter les N+1 Queries
```javascript
// ✅ Bon : eager loading
const servers = await db.Server.findAll({
  include: [{ model: db.User, as: 'user' }],
});

// ❌ Mauvais : N+1 query
const servers = await db.Server.findAll();
servers.forEach(async (server) => {
  const user = await db.User.findByPk(server.userId); // N+1
});
```

### Pagination pour les listes
```javascript
// ✅ Bon
const limit = 20;
const offset = (page - 1) * limit;
const { count, rows } = await db.Server.findAndCountAll({
  limit,
  offset,
  order: [['createdAt', 'DESC']],
});

res.json({ data: rows, total: count, page });

// ❌ Mauvais : retourner tout
const servers = await db.Server.findAll();
res.json(servers); // Peut être très lourd
```

## React Patterns

### Hooks Personnalisés
```javascript
// ✅ Bon : logique réutilisable
const useAuth = () => {
  const [user, setUser] = useState(null);
  // Logique d'auth
  return { user, login, logout };
};

// ❌ Mauvais : logique dans le composant
const Component = () => {
  const [user, setUser] = useState(null);
  // Beaucoup de logique ici
};
```

### Memoization
```javascript
// ✅ Bon : éviter les re-renders inutiles
const handleClick = useCallback(() => {
  doSomething(data);
}, [data]);

// ❌ Mauvais : recréé à chaque render
const handleClick = () => {
  doSomething(data);
};
```

## Testing

### Structure des Tests
```javascript
// ✅ Bon : clair et descriptif
describe('AuthService', () => {
  describe('login', () => {
    it('should return token for valid credentials', async () => {
      // arrange
      // act
      // assert
    });

    it('should throw error for invalid credentials', async () => {
      // test
    });
  });
});
```

## Sécurité

### HTTPS en Production
```javascript
// ✅ Bon
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

### Sanitizer les Inputs
```javascript
// ✅ Bon
const sanitize = (input) => {
  return input.trim().toLowerCase();
};

// ❌ Mauvais : inputs bruts
const user = await db.User.findOne({ where: { email: userInput } });
```

## Déploiement

### Checklist avant production
- [ ] Pas de console.log
- [ ] Gestion d'erreur complète
- [ ] Variables d'environnement configurées
- [ ] Base de données sécurisée
- [ ] HTTPS activé
- [ ] Logs centralisés
- [ ] Backup automatique
- [ ] Tests passent
- [ ] Performance optimisée
- [ ] Dépendances à jour

## Outils de Qualité

### ESLint
```bash
npx eslint src/
```

### Prettier
```bash
npx prettier --write src/
```

### npm audit
```bash
npm audit
npm audit fix
```

---

**Remember** : Le code n'est jamais fini, il évolue ! 🚀
