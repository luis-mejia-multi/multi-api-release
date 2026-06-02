import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceEntity } from './entities/service.entity';
import { ServiceRepository } from './repositories/service.repository';
import { ServicesService } from './services.service';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceEntity])],
  providers: [ServiceRepository, ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
