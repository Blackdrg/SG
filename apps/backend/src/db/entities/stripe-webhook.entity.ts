import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('stripe_webhooks')
export class StripeWebhookEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  webhookId!: string; // The Stripe webhook ID (evt_...)

  @Column()
  eventType!: string; // The type of event (e.g., charge.refunded)

  @Column()
  processedAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;
}