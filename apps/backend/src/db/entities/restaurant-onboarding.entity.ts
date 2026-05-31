import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { RestaurantEntity } from './restaurant.entity';

export enum OnboardingStep {
  BUSINESS_REGISTRATION = 'business_registration',
  DOCUMENT_UPLOAD = 'document_upload',
  BANK_VERIFICATION = 'bank_verification',
  MENU_SETUP = 'menu_setup',
  STAFF_INVITE = 'staff_invite',
  GST_CONFIG = 'gst_config',
  PRICING_SETUP = 'pricing_setup',
  PAYOUT_SETUP = 'payout_setup',
  COMPLETION = 'completion',
}

export enum OnboardingStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  AWAITING_REVIEW = 'awaiting_review',
}

@Entity('restaurant_onboarding')
export class RestaurantOnboardingEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  restaurantId!: string;

  @ManyToOne(() => RestaurantEntity)
  restaurant!: RestaurantEntity;

  @Column({ type: 'enum', enum: OnboardingStep, default: OnboardingStep.BUSINESS_REGISTRATION })
  currentStep!: OnboardingStep;

  @Column({ type: 'enum', enum: OnboardingStatus, default: OnboardingStatus.PENDING })
  status!: OnboardingStatus;

  @Column('simple-json', { nullable: true })
  businessDetails!: {
    legalName?: string;
    tradeName?: string;
    gstin?: string;
    businessType?: string;
    registrationDate?: string;
  };

  @Column('simple-json', { nullable: true })
  documentStatus!: {
    fssai?: boolean;
    gstCertificate?: boolean;
    businessLicense?: boolean;
    bankStatement?: boolean;
    cancelledCheque?: boolean;
  };

  @Column('simple-json', { nullable: true })
  bankDetails!: {
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    branchName?: string;
    verified?: boolean;
  };

  @Column('simple-json', { nullable: true })
  menuSetup!: {
    categoriesCreated?: number;
    itemsAdded?: number;
    readyForReview?: boolean;
  };

  @Column({ nullable: true })
  rejectionReason!: string;

  @Column({ nullable: true })
  reviewedBy!: string;

  @Column({ nullable: true })
  reviewedAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}