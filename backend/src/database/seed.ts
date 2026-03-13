import bcrypt from 'bcrypt';
import sequelize from './config';
import { Usuario } from './models';

async function seed() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

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
    console.log('✅ Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
