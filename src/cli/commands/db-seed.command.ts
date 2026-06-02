import { Injectable } from '@nestjs/common';
import { ServicesService } from '../../services/services.service';
import { success, info, warn } from '../../common/utils/output.util';

@Injectable()
export class DbSeedCommand {
  constructor(private readonly servicesService: ServicesService) {}

  async execute(): Promise<void> {
    info('Seeding services from repository-list.txt...');
    const count = await this.servicesService.seedFromFile();
    if (count === 0) {
      warn('Services already seeded. Skipping.');
    } else {
      success(`Seeded ${count} services.`);
    }
  }
}
