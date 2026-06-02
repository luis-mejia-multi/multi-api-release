import { Module } from '@nestjs/common';
import { ServicesModule } from '../services/services.module';
import { ReleasesModule } from '../releases/releases.module';
import { GithubModule } from '../github/github.module';
import { DbMigrateCommand } from './commands/db-migrate.command';
import { DbSeedCommand } from './commands/db-seed.command';
import { ServiceListCommand } from './commands/service-list.command';
import { ServiceInfoCommand } from './commands/service-info.command';
import { ReleaseCreateCommand } from './commands/release-create.command';
import { ReleaseListCommand } from './commands/release-list.command';
import { ReleaseStatusCommand } from './commands/release-status.command';
import { InteractiveCommand } from './commands/interactive.command';

@Module({
  imports: [ServicesModule, ReleasesModule, GithubModule],
  providers: [
    DbMigrateCommand,
    DbSeedCommand,
    ServiceListCommand,
    ServiceInfoCommand,
    ReleaseCreateCommand,
    ReleaseListCommand,
    ReleaseStatusCommand,
    InteractiveCommand,
  ],
})
export class CliModule {}
