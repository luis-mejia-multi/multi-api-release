import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Command } from 'commander';
import { AppModule } from './app.module';
import { setupCli } from './cli/cli.setup';
import { InteractiveCommand } from './cli/commands/interactive.command';

const HELP_FLAGS = new Set(['-h', '--help', '-V', '--version']);

function isHelpRequest(): boolean {
  return process.argv.slice(2).some((a) => HELP_FLAGS.has(a));
}

function isInteractiveMode(): boolean {
  return process.argv.length <= 2;
}

async function runHelp(): Promise<void> {
  const program = new Command();
  program
    .name('multi-release')
    .description(
      'CLI para orquestar releases de producción — multi-develop.\n' +
      '  Sin argumentos: lanza el menú interactivo.',
    )
    .version('0.0.1');

  const db = program.command('db').description('Gestión de base de datos');
  db.command('migrate').description('Ejecutar scripts SQL pendientes');
  db.command('seed').description('Cargar 30 servicios desde repository-list.txt');

  const service = program.command('service').description('Catálogo de servicios');
  service.command('list').description('Listar todos los servicios');
  service.command('info <name>').description('Detalle de un servicio');

  const release = program.command('release').description('Gestión de releases');
  release
    .command('create [service]')
    .description('Crear un release de producción')
    .option('-s, --services <services>', 'Lista separada por comas')
    .option('-y, --yes', 'Sin confirmación')
    .option('-n, --notes <notes>', 'Notas del release')
    .option('--dry-run', 'Preview sin crear tags');
  release
    .command('list')
    .description('Historial de releases')
    .option('-s, --service <service>', 'Filtrar por servicio')
    .option('-l, --limit <limit>', 'Máximo de resultados');
  release
    .command('status <id>')
    .description('Detalle de un release (usa "latest" para el más reciente)');

  program.parse(process.argv);
}

async function bootstrap() {
  if (isHelpRequest()) {
    await runHelp();
    return;
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error'],
  });

  try {
    if (isInteractiveMode()) {
      const cmd = app.get(InteractiveCommand);
      await cmd.execute();
    } else {
      await setupCli(app);
    }
  } catch (err) {
    console.error((err as Error).message);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

bootstrap().catch((err: Error) => {
  console.error(err.message);
  process.exit(1);
});
