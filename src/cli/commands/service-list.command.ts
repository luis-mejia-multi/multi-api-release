import { Injectable } from '@nestjs/common';
import chalk from 'chalk';
import { ServicesService } from '../../services/services.service';
import { createTable } from '../../common/utils/output.util';

@Injectable()
export class ServiceListCommand {
  constructor(private readonly servicesService: ServicesService) {}

  async execute(): Promise<void> {
    const services = await this.servicesService.findAll();

    const table = createTable([
      'Name',
      'Tier',
      'Last Version',
      'Last Released',
      'Active',
    ]);

    for (const svc of services) {
      table.push([
        svc.name,
        svc.tier,
        svc.lastReleasedVersion ?? chalk.gray('—'),
        svc.lastReleasedAt
          ? svc.lastReleasedAt.toISOString().split('T')[0]
          : chalk.gray('—'),
        svc.isActive ? chalk.green('✓') : chalk.red('✗'),
      ]);
    }

    console.log(table.toString());
    console.log(`\nTotal: ${services.length} services`);
  }
}
