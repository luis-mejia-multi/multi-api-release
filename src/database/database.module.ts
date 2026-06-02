import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServiceEntity } from '../services/entities/service.entity';
import { ReleaseEntity } from '../releases/entities/release.entity';
import { ReleaseServiceEntity } from '../releases/entities/release-service.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('app.db.host'),
        port: config.get<number>('app.db.port'),
        username: config.get<string>('app.db.username'),
        password: config.get<string>('app.db.password'),
        database: config.get<string>('app.db.database'),
        schema: 'releases',
        entities: [ServiceEntity, ReleaseEntity, ReleaseServiceEntity],
        synchronize: false,
        logging: false,
      }),
    }),
  ],
})
export class DatabaseModule {}
