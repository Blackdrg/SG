import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum PushTrackingEvent {
  SENT = 'sent',
  DELIVERED = 'delivered',
  OPENED = 'opened',
  FAILED = 'failed',
  REJECTED = 'rejected'
}

@Entity('notification_analytics')
export class NotificationAnalyticsEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column()
  notificationId!: string;

  @Column()
  deviceToken!: string;

  @Column({ type: 'enum', enum: PushTrackingEvent })
  event!: PushTrackingEvent;

  @Column({ nullable: true })
  fcmMessageId!: string;

  @Column({ nullable: true })
  apnsMessageId!: string;

  @Column({ nullable: true })
  receivedAt!: Date;

  @Column({ nullable: true })
  openedAt!: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: {
    platform?: 'ios' | 'android' | 'web';
    appVersion?: string;
    deviceInfo?: string;
    error?: string;
  };

  @CreateDateColumn()
  createdAt!: Date;
}