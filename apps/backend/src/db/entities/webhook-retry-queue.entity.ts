import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('webhook_retry_queue')
export class WebhookRetryQueueEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  @Index()
  webhookId!: string;

  @Column()
  gateway!: string;

  @Column()
  eventType!: string;

  @Column('jsonb')
  payload!: Record<string, any>;

  @Column()
  attempt!: number;

  @Column()
  maxAttempts!: number;

  @Column({ default: 'pending' })
  status!: 'pending' | 'processing' | 'succeeded' | 'failed' | 'discarded';

  @Column({ nullable: true })
  lastError!: string;

  @Column({ nullable: true })
  scheduledAt!: Date;

  @Column({ nullable: true })
  processedAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}