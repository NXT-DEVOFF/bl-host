require('dotenv').config();
const db = require('./models');
const bcrypt = require('bcryptjs');
const logger = require('./config/logger');

const seedDatabase = async () => {
  try {
    // Sync database
    logger.info('Syncing database...');
    await db.sequelize.sync();
    logger.info('Database synced successfully');

    // Check if admin user already exists
    const adminExists = await db.User.findOne({ 
      where: { email: 'admin@blhost.com' } 
    });

    if (adminExists) {
      logger.info('Admin user already exists');
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await db.User.create({
      email: 'admin@blhost.com',
      password: hashedPassword,
      role: 'admin',
    });

    logger.info('Admin user created successfully', {
      id: adminUser.id,
      email: adminUser.email,
    });

    // Create demo servers
    const demoServers = [
      {
        name: 'Demo Server 1',
        game: 'Minecraft',
        ip_address: '192.168.1.1',
        port: 25565,
        userId: adminUser.id,
        status: 'offline',
      },
      {
        name: 'Demo Server 2',
        game: 'Counter-Strike 2',
        ip_address: '192.168.1.2',
        port: 27015,
        userId: adminUser.id,
        status: 'online',
      },
    ];

    for (const server of demoServers) {
      await db.Server.create(server);
    }

    logger.info('Demo servers created successfully');
  } catch (error) {
    logger.error('Error seeding database', { error: error.message });
    process.exit(1);
  }
};

seedDatabase().then(() => {
  logger.info('Database seeding completed');
  process.exit(0);
});