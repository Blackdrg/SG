import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('branch_controls')
export class BranchControlEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  branchId!: string; // Reference to restaurant branch

  @Column()
  controlType!: 'pause_orders' | 'restrict_payment_methods' | 'limit_order_value' | 'restrict_delivery_radius'; // Type of control

  @Column({ nullable: true })
  controlValue?: any; // Value for the control (e.g., true/false for pause, amount for limit, etc.)

  @Column({ default: true })
  isActive!: boolean; // Whether the control is currently active

  @Column({ nullable: true })
  activatedAt?: Date; // When the control was activated

  @Column({ nullable: true })
  activatedBy?: string; // Who activated the control (staff/user ID)

  @Column({ nullable: true })
  expiresAt?: Date; // When the control expires (if temporary)

  @Column({ nullable: true })
  deactivatedAt?: Date; // When the control was deactivated

  @Column({ nullable: true })
  deactivatedBy?: string; // Who deactivated the control

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}