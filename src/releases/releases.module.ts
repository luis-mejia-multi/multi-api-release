import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReleaseEntity } from './entities/release.entity';
import { ReleaseServiceEntity } from './entities/release-service.entity';
import { ReleaseRepository } from './repositories/release.repository';
import { ReleaseServiceRepository } from './repositories/release-service.repository';
import { ReleasesService } from './releases.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReleaseEntity, ReleaseServiceEntity])],
  providers: [ReleaseRepository, ReleaseServiceRepository, ReleasesService],
  exports: [ReleasesService],
})
export class ReleasesModule {}
