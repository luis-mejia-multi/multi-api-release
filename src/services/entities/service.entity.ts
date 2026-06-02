import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ServiceTier } from '../../common/enums/service-tier.enum';

@Entity('service')
export class ServiceEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name!: string;

  @Column({ type: 'varchar', length: 100 })
  repository!: string;

  @Column({
    type: 'enum',
    enum: ServiceTier,
    enumName: 'service_tier',
    default: ServiceTier.MS,
  })
  tier!: ServiceTier;

  @Column({ name: 'last_released_version', type: 'varchar', length: 50, nullable: true })
  lastReleasedVersion!: string | null;

  @Column({ name: 'last_released_at', type: 'timestamptz', nullable: true })
  lastReleasedAt!: Date | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
