import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReleaseEntity } from '../entities/release.entity';
import { ReleaseStatus } from '../../common/enums/release-status.enum';

@Injectable()
export class ReleaseRepository {
  constructor(
    @InjectRepository(ReleaseEntity)
    private readonly repo: Repository<ReleaseEntity>,
  ) {}

  save(entity: Partial<ReleaseEntity>): Promise<ReleaseEntity> {
    return this.repo.save(entity as ReleaseEntity);
  }

  findById(id: string): Promise<ReleaseEntity | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['services', 'services.service'],
    });
  }

  findByVersion(version: string): Promise<ReleaseEntity | null> {
    return this.repo.findOne({
      where: { version },
      relations: ['services', 'services.service'],
    });
  }

  findLatest(): Promise<ReleaseEntity | null> {
    return this.repo.findOne({
      order: { createdAt: 'DESC' },
      relations: ['services', 'services.service'],
    });
  }

  findMany(serviceName?: string, limit = 20): Promise<ReleaseEntity[]> {
    const qb = this.repo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.services', 'rs')
      .leftJoinAndSelect('rs.service', 's')
      .orderBy('r.created_at', 'DESC')
      .take(limit);

    if (serviceName) {
      qb.where('s.name = :serviceName', { serviceName });
    }

    return qb.getMany();
  }

  async updateStatus(id: string, status: ReleaseStatus): Promise<void> {
    await this.repo.update(id, { status });
  }
}
