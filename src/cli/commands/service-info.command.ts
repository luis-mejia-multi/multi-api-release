import { Injectable } from '@nestjs/common';
import chalk from 'chalk';
import { ServicesService } from '../../services/services.service';
import { error } from '../../common/utils/output.util';
import { ServiceNotFoundException } from '../../common/exceptions/service-not-found.exception';

@Injectable()
export class ServiceInfoCommand {
  constructor(private readonly servicesService: ServicesService) {}

  async execute(name: string): Promise<void> {
    try {
      const svc = await this.servicesService.findByName(name);
      console.log('\n' + chalk.cyan.bold(svc.name));
      console.log(`  Repository:    ${svc.repository}`);
      console.log(`  Tier:          ${svc.tier}`);
      console.log(
        `  Active:        ${svc.isActive ? chalk.green('yes') : chalk.red('no')}`,
      );
      console.log(
        `  Last version:  ${svc.lastReleasedVersion ?? chalk.gray('—')}`,
      );
      console.log(
        `  Last release:  ${svc.lastReleasedAt?.toISOString() ?? chalk.gray('—')}`,
      );
      console.log(`  Created:       ${svc.createdAt.toISOString()}`);
      console.log();
    } catch (err) {
      if (err instanceof ServiceNotFoundException) {
        error(err.message);
        process.exit(1);
      }
      throw err;
    }
  }
}
