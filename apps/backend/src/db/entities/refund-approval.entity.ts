import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { OrderEntity } from '../order/order.entity';

@Entity('refund_approvals')
export class RefundApprovalEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => OrderEntity)
  order!: OrderEntity;

  @Column()
  refundId!: string; // External refund ID from payment processor

  @Column('decimal', { precision: 10, scale: 2 })
  refundAmount!: number; // Amount to be refunded

  @Column()
  currency!: string; // Currency of refund amount

  @Column()
  reason!: string; // Reason for refund request

  @Column()
  requestedBy!: string; // Who requested the refund (customer ID or staff ID)

  @Column()
  requestType!: 'customer_request' | 'agent_initiated' | 'policy_exception' | 'dispute_resolution'; // Type of refund request

  @Column()
  approvalStatus!: 'pending' | 'approved' | 'rejected' | 'processed'; // Current approval status

  @Column({ nullable: true })
  approverId?: string; // Who approved/rejected the refund

  @Column({ nullable: true })
  approvedAt?: Date; // When the refund was approved

  @Column({ nullable: true })
  rejectionReason?: string; // Reason if rejected

  @Column({ nullable: true })
  processedAt?: Date; // When the refund was actually processed

  @Column({ nullable: true })
  processedBy?: string; // Who processed the refund

  @Column({ default: false })
  requiresManagerApproval!: boolean; // Whether manager approval is needed (based on amount/policy)

  @Column({ nullable: true })
  managerApproverId?: string; // Manager who needs to approve

  @Column({ nullable: true })
  managerApprovedAt?: Date; // When manager approved

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}