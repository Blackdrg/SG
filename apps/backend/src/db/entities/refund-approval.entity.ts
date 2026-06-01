import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { OrderEntity } from './order.entity';

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
   requestType!: 'customer_request' | 'agent_initiated' | 'policy_exception' | 'dispute_resolution';

   @Column()
    approvalStatus!: 'pending' | 'approved' | 'rejected' | 'processed' | 'failed';

   @Column({ nullable: true })
   approverId?: string;

   @Column({ nullable: true })
   approvedAt?: Date;

    @Column({ nullable: true })
    rejectionReason?: string;

    @Column({ nullable: true })
    approvalNotes?: string;

    @Column({ nullable: true })
   processedAt?: Date;

   @Column({ nullable: true })
   processedBy?: string;

   @Column({ default: false })
   requiresManagerApproval!: boolean; // Whether manager approval is needed (based on amount/policy)

   @Column({ nullable: true })
   managerApproverId?: string;

   @Column({ nullable: true })
   managerApprovedAt?: Date;

   @CreateDateColumn()
   createdAt!: Date;

   @UpdateDateColumn()
   updatedAt!: Date;
}