import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  db: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'dev_user',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_DATABASE ?? 'multiapp-release',
  },
  github: {
    token: process.env.GH_MULTI_TOKEN ?? '',
    org: process.env.GH_ORG ?? 'multi-develop',
  },
}));
