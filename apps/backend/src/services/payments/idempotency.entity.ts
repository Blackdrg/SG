import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, Unique } from 'typeorm';

@Entity('idempotency_keys')
@Index(['key', 'operation'], { unique: true })
export class IdempotencyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  key: string;

  @Column()
  operation: string;

  @Column()
  userId: string;

  @Column('jsonb')
  requestPayload: any;

  @Column('jsonb', { nullable: true })
  responsePayload: any;

  @Column({ nullable: true })
  statusCode: number;

  @Column({ default: false })
  isCompleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  completedAt: Date;
}