import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceEntity } from '../entities/service.entity';

@Injectable()
export class ServiceRepository {
  constructor(
    @InjectRepository(ServiceEntity)
    private readonly repo: Repository<ServiceEntity>,
  ) {}

  findAll(): Promise<ServiceEntity[]> {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  findAllActive(): Promise<ServiceEntity[]> {
    return this.repo.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  findByName(name: string): Promise<ServiceEntity | null> {
    return this.repo.findOne({ where: { name } });
  }

  findByNames(names: string[]): Promise<ServiceEntity[]> {
    return this.repo
      .createQueryBuilder('s')
      .where('s.name IN (:...names)', { names })
      .getMany();
  }

  save(entity: Partial<ServiceEntity>): Promise<ServiceEntity> {
    return this.repo.save(entity as ServiceEntity);
  }

  saveMany(entities: Partial<ServiceEntity>[]): Promise<ServiceEntity[]> {
    return this.repo.save(entities as ServiceEntity[]);
  }

  count(): Promise<number> {
    return this.repo.count();
  }
}
