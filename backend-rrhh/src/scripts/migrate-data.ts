import { DataSource } from 'typeorm';
import { migrateApplicationsToCandidate } from '../migrations/migrate-applications-to-candidates';

// Database configuration
const dataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5433,
  username: 'elevas_user',
  password: 'elevas_pass123',
  database: 'elevas_hr',
});

async function runMigration() {
  try {
    console.log('Connecting to database...');
    await dataSource.initialize();

    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();

    console.log('Starting migration...');
    await migrateApplicationsToCandidate(queryRunner);

    await queryRunner.release();
    await dataSource.destroy();

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();