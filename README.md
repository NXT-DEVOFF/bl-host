# BL-Host - Game Server Panel

A modern game server panel inspired by Pterodactyl, built with Node.js/Express backend and React/Vite frontend.

## Features

- 🔐 Secure authentication (JWT-based)
- 🖥️ Server management (CRUD operations)
- ▶️ Server control (start/stop simulations)
- 📊 Dashboard with statistics
- 🔍 Search and filter servers
- 📱 Fully responsive design
- 🌓 Dark/Light mode support
- 🎨 Modern UI with Tailwind CSS
- 🛡️ Protected routes
- ⚡ Fast development with Vite

## Tech Stack

### Backend
- Node.js
- Express.js
- Sequelize ORM
- SQLite (development) / MySQL (production)
- JWT for authentication
- bcrypt for password hashing

### Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Axios for HTTP requests
- React Icons

## Quick Start

### Prerequisites
- Node.js (v14+)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd bl-host
```

2. Setup Backend
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