import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { ServiceRepository } from './repositories/service.repository';
import { ServiceEntity } from './entities/service.entity';
import { ServiceTier } from '../common/enums/service-tier.enum';
import { ServiceNotFoundException } from '../common/exceptions/service-not-found.exception';
import { REPO_LIST_PATH } from '../common/constants/services.constant';

@Injectable()
export class ServicesService {
  constructor(private readonly serviceRepo: ServiceRepository) {}

  findAll(): Promise<ServiceEntity[]> {
    return this.serviceRepo.findAll();
  }

  findAllActive(): Promise<ServiceEntity[]> {
    return this.serviceRepo.findAllActive();
  }

  async findByName(name: string): Promise<ServiceEntity> {
    const service = await this.serviceRepo.findByName(name);
    if (!service || !service.isActive) {
      throw new ServiceNotFoundException(name);
    }
    return service;
  }

  async findByNames(names: string[]): Promise<ServiceEntity[]> {
    const services = await this.serviceRepo.findByNames(names);
    const foundNames = services.map((s) => s.name);
    for (const name of names) {
      if (!foundNames.includes(name)) {
        throw new ServiceNotFoundException(name);
      }
    }
    const inactive = services.filter((s) => !s.isActive);
    if (inactive.length > 0) {
      throw new ServiceNotFoundException(inactive[0].name);
    }
    return services;
  }

  async seedFromFile(filePath: string = REPO_LIST_PATH): Promise<number> {
    const content = fs.readFileSync(filePath, 'utf-8');
    const names = content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const existing = await this.serviceRepo.count();
    if (existing > 0) {
      return 0;
    }

    const entities: Partial<ServiceEntity>[] = names.map((name) => ({
      name,
      repository: name,
      tier: ServiceTier.MS,
      isActive: true,
    }));

    await this.serviceRepo.saveMany(entities);
    return entities.length;
  }

  async updateLastRelease(serviceId: string, version: string): Promise<void> {
    await this.serviceRepo.save({
      id: serviceId,
      lastReleasedVersion: version,
      lastReleasedAt: new Date(),
    });
  }
}
