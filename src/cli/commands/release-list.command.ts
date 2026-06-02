import { Injectable } from '@nestjs/common';
import chalk from 'chalk';
import { ReleasesService } from '../../releases/releases.service';
import { createTable } from '../../common/utils/output.util';

export interface ReleaseListOptions {
  service?: string;
  limit?: string;
}

@Injectable()
export class ReleaseListCommand {
  constructor(private readonly releasesService: ReleasesService) {}

  async execute(options: ReleaseListOptions): Promise<void> {
    const limit = parseInt(options.limit ?? '20', 10);
    const releases = await this.releasesService.findReleases(
      options.service,
      limit,
    );

    if (releases.length === 0) {
      console.log(chalk.gray('No releases found.'));
      return;
    }

    const table = createTable([
      'Version',
      'Status',
      'Services',
      'Created By',
      'Date',
    ]);

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
    console.log(`\nShowing ${releases.length} release(s)`);
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
