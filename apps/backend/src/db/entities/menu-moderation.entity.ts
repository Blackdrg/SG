import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { MenuItemEntity } from './menu-item.entity';
import { RestaurantEntity } from './restaurant.entity';

export enum ModerationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CHANGES_REQUESTED = 'changes_requested',
}

export enum ModerationAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

@Entity('menu_moderation')
export class MenuModerationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  menuItemId!: string;

  @ManyToOne(() => MenuItemEntity)
  menuItem!: MenuItemEntity;

  @Column()
  restaurantId!: string;

  @ManyToOne(() => RestaurantEntity)
  restaurant!: RestaurantEntity;

  @Column({ type: 'enum', enum: ModerationAction })
  action!: ModerationAction;

  @Column({ type: 'enum', enum: ModerationStatus, default: ModerationStatus.PENDING })
  status!: ModerationStatus;

  @Column('simple-json', { nullable: true })
  originalData!: any;

  @Column('simple-json', { nullable: true })
  updatedData!: any;

  @Column({ nullable: true })
  rejectionReason!: string;

  @Column({ nullable: true })
  moderatorId!: string;

  @Column({ nullable: true })
  moderatorNotes!: string;

  @Column({ nullable: true })
  reviewedAt!: Date;

  @Column({ default: false })
  flaggedForReview!: boolean;

  @Column('simple-json', { nullable: true })
  aiFlags!: {
    priceAnomaly?: boolean;
    descriptionIssue?: boolean;
    imageProblem?: boolean;
    duplicateDetected?: boolean;
  };

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}