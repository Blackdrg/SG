import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, Unique } from 'typeorm';

@Entity('idempotency_keys')
@Unique(['key', 'operation'])
export class IdempotencyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  key: string;

  @Index()
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