import { Injectable } from '@nestjs/common';
import { ReleaseRepository } from './repositories/release.repository';
import { ReleaseServiceRepository } from './repositories/release-service.repository';
import { ReleaseEntity } from './entities/release.entity';
import { ReleaseStatus } from '../common/enums/release-status.enum';
import { generateVersion } from '../common/utils/version.util';

export interface CreateReleaseServiceInput {
  serviceId: string;
  tagName: string;
  gitSha: string;
  imageTag: string;
}

@Injectable()
export class ReleasesService {
  constructor(
    private readonly releaseRepo: ReleaseRepository,
    private readonly releaseServiceRepo: ReleaseServiceRepository,
  ) {}

  async createRelease(
    notes?: string,
    version?: string,
  ): Promise<ReleaseEntity> {
    const v = version ?? generateVersion();
    return this.releaseRepo.save({
      version: v,
      status: ReleaseStatus.PENDING,
      createdBy: process.env.USER ?? 'cli',
      notes: notes ?? null,
    });
  }

  async addService(
    releaseId: string,
    input: CreateReleaseServiceInput,
  ): Promise<void> {
    await this.releaseServiceRepo.save({
      releaseId,
      serviceId: input.serviceId,
      tagName: input.tagName,
      gitSha: input.gitSha,
      imageTag: input.imageTag,
    });
  }

  async updateStatus(releaseId: string, status: ReleaseStatus): Promise<void> {
    await this.releaseRepo.updateStatus(releaseId, status);
  }

  findReleases(serviceName?: string, limit = 20): Promise<ReleaseEntity[]> {
    return this.releaseRepo.findMany(serviceName, limit);
  }

  findById(idOrLatest: string): Promise<ReleaseEntity | null> {
    if (idOrLatest === 'latest') {
      return this.releaseRepo.findLatest();
    }
    return this.releaseRepo.findById(idOrLatest);
  }
}
