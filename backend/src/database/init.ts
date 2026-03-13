import bcrypt from 'bcrypt';
import sequelize from './config';
import { syncModels, Usuario } from './models';

async function initDatabase() {
  try {
    console.log('🔄 Initializing database...');
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    console.log('🔄 Running migrations...');
    await syncModels(false); // false = don't drop existing tables
    console.log('✅ Migrations completed successfully.');

    console.log('🔄 Seeding database...');
    
    // Check if admin user already exists
    const existingAdmin = await Usuario.findOne({
      where: { usuario: 'admin' },
    });

    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists. Skipping seed.');
    } else {
      // Hash the default password
      const hashedPassword = await bcrypt.hash('admin123', parseInt(process.env.BCRYPT_ROUNDS || '10'));

      // Create default admin user
      await Usuario.create({
        nombre: 'Administrador',
        usuario: 'admin',
        password: hashedPassword,
        rol: 'administrador',
        estado: 'activo',
      });

      console.log('✅ Default admin user created successfully.');
      console.log('   Username: admin');
      console.log('   Password: admin123');
      console.log('   ⚠️  IMPORTANT: Change this password in production!');
    }

    await sequelize.close();
    console.log('✅ Database initialization completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initDatabase();
