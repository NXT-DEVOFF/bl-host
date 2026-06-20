const db = require('./models');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
  try {
    // Sync database
    await db.sequelize.sync();
    console.log('Database synced');
    // Check if admin user already exists
    const adminExists = await db.User.findOne({ where: { email: 'admin@blhost.com' } });
    if (adminExists) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await db.User.create({
      email: 'admin@blhost.com',
      password: hashedPassword,
      role: 'admin',
    });

    console.log('Admin user created:', adminUser.toJSON());
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
};

seedAdmin();