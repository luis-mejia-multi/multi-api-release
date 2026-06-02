import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ReleaseStatus } from '../../common/enums/release-status.enum';
import { ReleaseServiceEntity } from './release-service.entity';

@Entity('release')
export class ReleaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  version!: string;

  @Column({
    type: 'enum',
    enum: ReleaseStatus,
    enumName: 'release_status',
    default: ReleaseStatus.PENDING,
  })
  status!: ReleaseStatus;

  @Column({ name: 'created_by', type: 'varchar', length: 100 })
  createdBy!: string;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @OneToMany(() => ReleaseServiceEntity, (rs) => rs.release, { eager: false })
  services!: ReleaseServiceEntity[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
