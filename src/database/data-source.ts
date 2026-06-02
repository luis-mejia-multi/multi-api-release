import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { ServiceEntity } from '../services/entities/service.entity';
import { ReleaseEntity } from '../releases/entities/release.entity';
import { ReleaseServiceEntity } from '../releases/entities/release-service.entity';

// Standalone DataSource for direct TypeORM CLI usage if needed.
// Requires env vars: DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'dev_user',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_DATABASE ?? 'multiapp-release',
  schema: 'releases',
  entities: [ServiceEntity, ReleaseEntity, ReleaseServiceEntity],
  synchronize: false,
  logging: false,
});
