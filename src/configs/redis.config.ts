import { getEnv } from './env.config';

export const redisConfig = {
  host: getEnv<string>('REDIS_HOST'),
  port: getEnv<number>('REDIS_PORT'),
  password: getEnv<string>('REDIS_PASSWORD'),
  db: getEnv<number>('REDIS_DB'),
};
