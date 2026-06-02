import { Injectable } from '@nestjs/common';
import chalk from 'chalk';
import { ServicesService } from '../../services/services.service';
import { ReleasesService } from '../../releases/releases.service';
import { GithubService } from '../../github/github.service';
import { ReleaseStatus } from '../../common/enums/release-status.enum';
import { ServiceNotFoundException } from '../../common/exceptions/service-not-found.exception';
import {
  createSpinner,
  createTable,
  success,
  error,
  info,
  warn,
} from '../../common/utils/output.util';
import { confirm } from '../../common/utils/confirm.util';
import { generateVersion } from '../../common/utils/version.util';
import { DEFAULT_BRANCH } from '../../common/constants/services.constant';

export interface ReleaseCreateOptions {
  services?: string;
  yes?: boolean;
  notes?: string;
  dryRun?: boolean;
}

@Injectable()
export class ReleaseCreateCommand {
  constructor(
    private readonly servicesService: ServicesService,
    private readonly releasesService: ReleasesService,
    private readonly githubService: GithubService,
  ) {}

  async execute(
    service: string | undefined,
    options: ReleaseCreateOptions,
  ): Promise<void> {
    const serviceNames = this.parseServiceNames(service, options.services);
    if (serviceNames.length === 0) {
      error('Provide a service name or --services s1,s2,s3');
      process.exit(1);
    }

    const services = await this.resolveServices(serviceNames);
    const version = generateVersion();

    this.printSummaryTable(services, version);

    if (options.dryRun) {
      info('Dry run — no tags will be created.');
      return;
    }

    if (!options.yes) {
      const ok = await confirm(
        `Create ${services.length} release tag(s) with version ${version}?`,
      );
      if (!ok) {
        info('Aborted.');
        return;
      }
    }

    const release = await this.releasesService.createRelease(
      options.notes,
      version,
    );
    const hasFailed = await this.processServices(services, release.id, version);
    const finalStatus = hasFailed
      ? ReleaseStatus.FAILED
      : ReleaseStatus.BUILDING;
    await this.releasesService.updateStatus(release.id, finalStatus);

    console.log();
    if (hasFailed) {
      warn(`Release ${release.version} completed with errors (status: FAILED)`);
    } else {
      success(
        `Release ${chalk.cyan(release.version)} created — status: BUILDING`,
      );
      info('ArgoCD will sync automatically when Docker builds complete.');
    }
  }

  private parseServiceNames(
    positional: string | undefined,
    flag: string | undefined,
  ): string[] {
    if (flag) {
      return flag
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return positional ? [positional] : [];
  }

  private async resolveServices(names: string[]) {
    try {
      return await this.servicesService.findByNames(names);
    } catch (err) {
      if (err instanceof ServiceNotFoundException) {
        error(err.message);
        process.exit(1);
      }
      throw err;
    }
  }

  private printSummaryTable(
    services: Awaited<ReturnType<ServicesService['findByNames']>>,
    version: string,
  ): void {
    const table = createTable(['Service', 'Repository', 'Branch', 'Version']);
    for (const svc of services) {
      table.push([svc.name, svc.repository, DEFAULT_BRANCH, version]);
    }
    console.log('\n' + table.toString());
  }

  private async processServices(
    services: Awaited<ReturnType<ServicesService['findByNames']>>,
    releaseId: string,
    version: string,
  ): Promise<boolean> {
    let hasFailed = false;

    for (const svc of services) {
      const spinner = createSpinner(
        `  ${svc.name} — getting SHA...`,
      ).start();
      try {
        const sha = await this.githubService.getBranchSha(
          svc.repository,
          DEFAULT_BRANCH,
        );
        spinner.text = `  ${svc.name} — creating tag ${version}...`;

        await this.githubService.createTag(svc.repository, version, sha);

        const imageTag = `prd.${svc.name}.release`;
        await this.releasesService.addService(releaseId, {
          serviceId: svc.id,
          tagName: version,
          gitSha: sha,
          imageTag,
        });
        await this.servicesService.updateLastRelease(svc.id, version);
        spinner.succeed(`  ${svc.name} — tagged ${chalk.cyan(version)}`);
      } catch (err: unknown) {
        spinner.fail(`  ${svc.name} — ${chalk.red((err as Error).message)}`);
        hasFailed = true;
      }
    }

    return hasFailed;
  }
}
