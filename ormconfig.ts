import { prototype } from 'events';
import { DataSource, DataSourceOptions } from 'typeorm';

export const dbConfig = {
  synchronize: true,
  migrations: ['dist/db/migration/*.js'],
  // cli: {
  //   migrationsDir: 'migrations',
  // },
};

console.log(process.env.NODE_ENV);
console.log(process.env.DB_HOST);
switch (process.env.NODE_ENV) {
  case 'development':
    Object.assign(dbConfig, {
      type: 'sqlite',
      database: 'db.sqlite',
      entities: ['dist/**/*.entity.js'],
    });
    break;
  case 'test':
    Object.assign(dbConfig, {
      type: 'sqlite',
      database: 'test.sqlite',
      entities: ['**/*.entity.ts'],
    });
    break;
  case 'production':
    Object.assign(dbConfig, {
      type: 'postgres',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: ['dist/**/*.entity.js'],
      ssl: {
        rejectUnauthorized: false,
      },
    });
    break;
  default:
    throw new Error('Unkown Environment');
}

const dataSource = new DataSource(dbConfig as DataSourceOptions);
export default dataSource;
