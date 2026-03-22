import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { getEnv } from './env.config';
import * as path from 'path';

export const dbConfig: DataSourceOptions = {
  type: getEnv<string>('DB_TYPE') as 'mysql',
  host: getEnv<string>('DB_HOST'),
  port: getEnv<number>('DB_PORT', Number),
  username: getEnv<string>('DB_USERNAME'),
  password: getEnv<string>('DB_PASSWORD'),
  database: getEnv<string>('DB_DATABASE'),
  entities: [path.join(__dirname, '..', 'database/entities/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, '..', 'database/migrations/*.{js,ts}')],
  synchronize: false,
  logging: getEnv<boolean>('DB_LOGGING'),
};

/** Cấu hình cho NestJS TypeORM */
export const databaseConfig: TypeOrmModuleOptions = dbConfig;

/** Cấu hình cho TypeORM CLI - sử dụng cho migrations */
export const AppDataSource = new DataSource(dbConfig);
