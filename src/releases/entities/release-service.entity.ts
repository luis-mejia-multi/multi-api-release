import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ReleaseEntity } from './release.entity';
import { ServiceEntity } from '../../services/entities/service.entity';

@Entity('release_service')
export class ReleaseServiceEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => ReleaseEntity, (r) => r.services, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'release_id' })
  release!: ReleaseEntity;

  @Column({ name: 'release_id', type: 'uuid' })
  releaseId!: string;

  @ManyToOne(() => ServiceEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'service_id' })
  service!: ServiceEntity;

  @Column({ name: 'service_id', type: 'uuid' })
  serviceId!: string;

  @Column({ name: 'tag_name', type: 'varchar', length: 100 })
  tagName!: string;

  @Column({ name: 'git_sha', type: 'varchar', length: 40 })
  gitSha!: string;

  @Column({ name: 'image_tag', type: 'varchar', length: 150 })
  imageTag!: string;

  @Column({ name: 'workflow_run_id', type: 'bigint', nullable: true })
  workflowRunId!: number | null;

  @Column({ name: 'workflow_status', type: 'varchar', length: 50, nullable: true })
  workflowStatus!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
