import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReleaseServiceEntity } from '../entities/release-service.entity';

@Injectable()
export class ReleaseServiceRepository {
  constructor(
    @InjectRepository(ReleaseServiceEntity)
    private readonly repo: Repository<ReleaseServiceEntity>,
  ) {}

  save(entity: Partial<ReleaseServiceEntity>): Promise<ReleaseServiceEntity> {
    return this.repo.save(entity as ReleaseServiceEntity);
  }

  findByRelease(releaseId: string): Promise<ReleaseServiceEntity[]> {
    return this.repo.find({
      where: { releaseId },
      relations: ['service'],
    });
  }
}
