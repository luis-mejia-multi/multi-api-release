import { Injectable } from '@nestjs/common';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { ServicesService } from '../../services/services.service';
import { ReleasesService } from '../../releases/releases.service';
import { GithubService } from '../../github/github.service';
import { ServiceEntity } from '../../services/entities/service.entity';
import { ReleaseStatus } from '../../common/enums/release-status.enum';
import { generateVersion } from '../../common/utils/version.util';
import { createSpinner, createTable, success, error, warn, info } from '../../common/utils/output.util';
import { DEFAULT_BRANCH } from '../../common/constants/services.constant';

type MainAction = 'release' | 'history' | 'services' | 'exit';

@Injectable()
export class InteractiveCommand {
  constructor(
    private readonly servicesService: ServicesService,
    private readonly releasesService: ReleasesService,
    private readonly githubService: GithubService,
  ) {}

  async execute(): Promise<void> {
    this.printBanner();

    let running = true;
    while (running) {
      const { action } = await inquirer.prompt<{ action: MainAction }>([
        {
          type: 'list',
          name: 'action',
          message: 'Selecciona una opción:',
          choices: [
            { name: `${chalk.green('▶')}  Crear Release`, value: 'release' },
            { name: `${chalk.blue('≡')}  Historial de Releases`, value: 'history' },
            { name: `${chalk.cyan('◈')}  Catálogo de Servicios`, value: 'services' },
            new inquirer.Separator(),
            { name: `${chalk.red('✕')}  Salir`, value: 'exit' },
          ],
        },
      ]);

      switch (action) {
        case 'release':
          await this.handleCreateRelease();
          break;
        case 'history':
          await this.handleHistory();
          break;
        case 'services':
          await this.handleServices();
          break;
        case 'exit':
          running = false;
          break;
      }

      if (running && action !== 'exit') {
        console.log();
      }
    }

    console.log(chalk.gray('\nHasta pronto.\n'));
  }

  // ─── Create Release ────────────────────────────────────────────────────────

  private async handleCreateRelease(): Promise<void> {
    console.log();
    const allServices = await this.servicesService.findAllActive();

    if (allServices.length === 0) {
      warn('No hay servicios activos. Ejecuta primero: node dist/main.js db seed');
      return;
    }

    const { selectedNames } = await inquirer.prompt<{ selectedNames: string[] }>([
      {
        type: 'checkbox',
        name: 'selectedNames',
        message: `Selecciona servicios a desplegar ${chalk.gray('(Space = marcar, Enter = confirmar)')}:`,
        pageSize: 15,
        choices: allServices.map((svc) => ({
          name: this.formatServiceChoice(svc),
          value: svc.name,
        })),
        validate: (input: string[]) =>
          input.length > 0 ? true : 'Selecciona al menos un servicio.',
      },
    ]);

    const services = allServices.filter((s) => selectedNames.includes(s.name));
    const version = generateVersion();

    console.log();
    this.printReleaseSummary(services, version);

    const { notes } = await inquirer.prompt<{ notes: string }>([
      {
        type: 'input',
        name: 'notes',
        message: `Notas del release ${chalk.gray('(opcional)')}:`,
      },
    ]);

    const { confirmed } = await inquirer.prompt<{ confirmed: boolean }>([
      {
        type: 'confirm',
        name: 'confirmed',
        message: `¿Crear release ${chalk.cyan(version)} para ${chalk.bold(String(services.length))} servicio(s)?`,
        default: false,
      },
    ]);

    if (!confirmed) {
      info('Cancelado.');
      return;
    }

    console.log();
    await this.executeRelease(services, version, notes || undefined);
  }

  private async executeRelease(
    services: ServiceEntity[],
    version: string,
    notes?: string,
  ): Promise<void> {
    const release = await this.releasesService.createRelease(notes, version);
    let hasFailed = false;

    for (const svc of services) {
      const spinner = createSpinner(`  ${svc.name} — obteniendo SHA...`).start();
      try {
        const sha = await this.githubService.getBranchSha(svc.repository, DEFAULT_BRANCH);
        spinner.text = `  ${svc.name} — creando tag ${version}...`;
        await this.githubService.createTag(svc.repository, version, sha);
        await this.releasesService.addService(release.id, {
          serviceId: svc.id,
          tagName: version,
          gitSha: sha,
          imageTag: `prd.${svc.name}.release`,
        });
        await this.servicesService.updateLastRelease(svc.id, version);
        spinner.succeed(`  ${svc.name} ${chalk.gray('→')} ${chalk.cyan(version)}`);
      } catch (err: unknown) {
        spinner.fail(`  ${svc.name} — ${chalk.red((err as Error).message)}`);
        hasFailed = true;
      }
    }

    const finalStatus = hasFailed ? ReleaseStatus.FAILED : ReleaseStatus.BUILDING;
    await this.releasesService.updateStatus(release.id, finalStatus);

    console.log();
    if (hasFailed) {
      warn(`Release ${chalk.cyan(version)} completado con errores.`);
    } else {
      success(`Release ${chalk.cyan(version)} creado — ArgoCD sincronizará automáticamente.`);
    }
  }

  // ─── History ───────────────────────────────────────────────────────────────

  private async handleHistory(): Promise<void> {
    const { limit } = await inquirer.prompt<{ limit: number }>([
      {
        type: 'list',
        name: 'limit',
        message: 'Mostrar últimos:',
        choices: [
          { name: '10 releases', value: 10 },
          { name: '20 releases', value: 20 },
          { name: '50 releases', value: 50 },
        ],
        default: 10,
      },
    ]);

    const releases = await this.releasesService.findReleases(undefined, limit);
    console.log();

    if (releases.length === 0) {
      info('No hay releases registrados.');
      return;
    }

    const table = createTable(['Versión', 'Estado', 'Servicios', 'Creado por', 'Fecha']);
    for (const r of releases) {
      table.push([
        chalk.cyan(r.version),
        this.colorStatus(r.status),
        String(r.services?.length ?? 0),
        r.createdBy,
        r.createdAt.toISOString().split('T')[0],
      ]);
    }
    console.log(table.toString());
  }

  // ─── Services ──────────────────────────────────────────────────────────────

  private async handleServices(): Promise<void> {
    const services = await this.servicesService.findAll();
    console.log();

    const table = createTable(['Servicio', 'Tier', 'Última versión', 'Fecha']);
    for (const svc of services) {
      table.push([
        svc.name,
        svc.tier,
        svc.lastReleasedVersion ?? chalk.gray('—'),
        svc.lastReleasedAt
          ? svc.lastReleasedAt.toISOString().split('T')[0]
          : chalk.gray('—'),
      ]);
    }
    console.log(table.toString());
    console.log(chalk.gray(`\n${services.length} servicios registrados`));
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private printBanner(): void {
    console.log();
    console.log(chalk.cyan.bold('  multi-release') + chalk.gray(' v0.0.1'));
    console.log(chalk.gray('  Production Release Orchestrator — multi-develop'));
    console.log(chalk.gray('  ─────────────────────────────────────────────'));
    console.log();
  }

  private printReleaseSummary(services: ServiceEntity[], version: string): void {
    const table = createTable(['Servicio', 'Repo', 'Branch', 'Tag']);
    for (const svc of services) {
      table.push([svc.name, svc.repository, DEFAULT_BRANCH, chalk.cyan(version)]);
    }
    console.log(table.toString());
    console.log();
  }

  private formatServiceChoice(svc: ServiceEntity): string {
    const last = svc.lastReleasedVersion
      ? chalk.gray(`last: ${svc.lastReleasedVersion}`)
      : chalk.gray('sin releases');
    return `${svc.name.padEnd(42)} ${last}`;
  }

  private colorStatus(status: string): string {
    const map: Record<string, chalk.Chalk> = {
      pending: chalk.yellow,
      building: chalk.blue,
      deployed: chalk.green,
      failed: chalk.red,
    };
    return (map[status] ?? chalk.white)(status.toUpperCase());
  }
}
