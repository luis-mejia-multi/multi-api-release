import { Injectable } from '@nestjs/common';
import chalk from 'chalk';
import { ReleasesService } from '../../releases/releases.service';
import { error } from '../../common/utils/output.util';

@Injectable()
export class ReleaseStatusCommand {
  constructor(private readonly releasesService: ReleasesService) {}

  async execute(id: string): Promise<void> {
    const release = await this.releasesService.findById(id);
    if (!release) {
      error(`Release '${id}' not found`);
      process.exit(1);
    }

    console.log('\n' + chalk.cyan.bold(`Release: ${release.version}`));
    console.log(`  ID:          ${release.id}`);
    console.log(`  Status:      ${this.colorStatus(release.status)}`);
    console.log(`  Created by:  ${release.createdBy}`);
    console.log(`  Notes:       ${release.notes ?? chalk.gray('—')}`);
    console.log(`  Created at:  ${release.createdAt.toISOString()}`);
    console.log();

    if (release.services && release.services.length > 0) {
      console.log(chalk.bold('Services:'));
      for (const rs of release.services) {
        console.log(
          `  ${chalk.cyan(rs.service?.name ?? rs.serviceId)} — tag: ${rs.tagName} — SHA: ${rs.gitSha.slice(0, 8)}`,
        );
      }
    }
    console.log();
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
