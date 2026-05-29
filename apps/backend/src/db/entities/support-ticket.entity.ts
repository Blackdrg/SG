import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { UserEntity } from './user.entity';

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum TicketCategory {
  ORDER = 'order',
  PAYMENT = 'payment',
  DELIVERY = 'delivery',
  QUALITY = 'quality',
  ACCOUNT = 'account',
  TECHNICAL = 'technical',
}

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  AWAITING_CUSTOMER = 'awaiting_customer',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

@Entity('support_tickets')
export class SupportTicketEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  ticketNumber!: string;

  @Column()
  subject!: string;

  @Column({ type: 'enum', enum: TicketCategory })
  category!: TicketCategory;

  @Column({ type: 'enum', enum: TicketPriority, default: TicketPriority.MEDIUM })
  priority!: TicketPriority;

  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.OPEN })
  status!: TicketStatus;

  @Column()
  createdById!: string;

  @ManyToOne(() => UserEntity)
  createdBy!: UserEntity;

  @Column({ nullable: true })
  assignedToId!: string;

  @ManyToOne(() => UserEntity, { nullable: true })
  assignedTo!: UserEntity;

  @Column({ nullable: true })
  escalatedToId!: string;

  @ManyToOne(() => UserEntity, { nullable: true })
  escalatedTo!: UserEntity;

  @Column({ nullable: true })
  escalationLevel!: number;

  @Column({ nullable: true })
  slaBreachedAt!: Date;

  @OneToMany('TicketMessageEntity', (message: any) => message.ticket)
  messages!: any[];

  @Column('simple-json', { nullable: true })
  metadata!: {
    orderId?: string;
    restaurantId?: string;
    driverId?: string;
    disputeId?: string;
  };

  @Column({ nullable: true })
  resolutionNotes!: string;

  @Column({ nullable: true })
  resolvedAt!: Date;

  @Column({ default: false })
  satisfactionSurveySent!: boolean;

  @Column({ nullable: true })
  satisfactionRating!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

@Entity('ticket_messages')
export class TicketMessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  ticketId!: string;

  @ManyToOne(() => SupportTicketEntity)
  ticket!: SupportTicketEntity;

  @Column()
  senderId!: string;

  @ManyToOne(() => UserEntity)
  sender!: UserEntity;

  @Column()
  message!: string;

  @Column({ default: false })
  isInternalNote!: boolean;

  @Column({ default: false })
  isSystemMessage!: boolean;

  @Column('simple-json', { nullable: true })
  attachments!: string[];

  @CreateDateColumn()
  createdAt!: Date;
}