import { INestApplicationContext } from '@nestjs/common';
import { Command } from 'commander';
import { DbMigrateCommand } from './commands/db-migrate.command';
import { DbSeedCommand } from './commands/db-seed.command';
import { ServiceListCommand } from './commands/service-list.command';
import { ServiceInfoCommand } from './commands/service-info.command';
import { ReleaseCreateCommand } from './commands/release-create.command';
import { ReleaseListCommand } from './commands/release-list.command';
import { ReleaseStatusCommand } from './commands/release-status.command';
import type { ReleaseCreateOptions } from './commands/release-create.command';
import type { ReleaseListOptions } from './commands/release-list.command';

export async function setupCli(app: INestApplicationContext): Promise<void> {
  const program = new Command();

  program
    .name('multi-release')
    .description('CLI for orchestrating production releases of multi-develop microservices')
    .version('0.0.1');

  // --- db commands ---
  const db = program.command('db').description('Database management');

  db.command('migrate')
    .description('Run pending TypeORM migrations')
    .action(async () => {
      const cmd = app.get(DbMigrateCommand);
      await cmd.execute();
    });

  db.command('seed')
    .description('Seed 30 services from repository-list.txt')
    .action(async () => {
      const cmd = app.get(DbSeedCommand);
      await cmd.execute();
    });

  // --- service commands ---
  const service = program.command('service').description('Service catalog');

  service
    .command('list')
    .description('List all services with last release info')
    .action(async () => {
      const cmd = app.get(ServiceListCommand);
      await cmd.execute();
    });

  service
    .command('info <name>')
    .description('Show details for a service')
    .action(async (name: string) => {
      const cmd = app.get(ServiceInfoCommand);
      await cmd.execute(name);
    });

  // --- release commands ---
  const release = program.command('release').description('Release management');

  release
    .command('create [service]')
    .description('Create a new production release (tag git repos)')
    .option('-s, --services <services>', 'Comma-separated list of services')
    .option('-y, --yes', 'Skip confirmation prompt')
    .option('-n, --notes <notes>', 'Release notes')
    .option('--dry-run', 'Preview without creating tags')
    .action(async (svc: string | undefined, options: ReleaseCreateOptions) => {
      const cmd = app.get(ReleaseCreateCommand);
      await cmd.execute(svc, options);
    });

  release
    .command('list')
    .description('List recent releases')
    .option('-s, --service <service>', 'Filter by service name')
    .option('-l, --limit <limit>', 'Max results (default: 20)', '20')
    .action(async (options: ReleaseListOptions) => {
      const cmd = app.get(ReleaseListCommand);
      await cmd.execute(options);
    });

  release
    .command('status <id>')
    .description('Show release details (use "latest" for the most recent)')
    .action(async (id: string) => {
      const cmd = app.get(ReleaseStatusCommand);
      await cmd.execute(id);
    });

  await program.parseAsync(process.argv);
}
