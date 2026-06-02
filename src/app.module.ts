import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import { DatabaseModule } from './database/database.module';
import { ServicesModule } from './services/services.module';
import { ReleasesModule } from './releases/releases.module';
import { GithubModule } from './github/github.module';
import { CliModule } from './cli/cli.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: '.env',
    }),
    DatabaseModule,
    ServicesModule,
    ReleasesModule,
    GithubModule,
    CliModule,
  ],
})
export class AppModule {}
