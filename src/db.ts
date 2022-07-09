import { DataSource } from 'typeorm';

const port: number =
  typeof process.env.POSTGRESQL_PORT === 'string'
    ? Number(process.env.POSTGRESQL_PORT)
    : 5432;

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRESQL_HOST,
  port,
  username: process.env.POSTGRESQL_USER,
  password: process.env.POSTGRESQL_PASSWORD,
  database: process.env.POSTGRESQL_DB,
  synchronize: true,
  // logging: true,
  entities: ['src/entity/**/*.ts'],
});
