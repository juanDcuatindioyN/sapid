import sequelize from './config';
import { syncModels } from './models';

async function migrate() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    console.log('🔄 Running migrations...');
    await syncModels(false); // false = don't drop existing tables
    console.log('✅ Migrations completed successfully.');

    await sequelize.close();
    console.log('✅ Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
