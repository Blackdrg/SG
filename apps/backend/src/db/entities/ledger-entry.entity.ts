import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('ledger_entries')
export class LedgerEntryEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  transactionId!: string; // Groups entries of a single transaction

  @Column()
  account!: string; // e.g., 'cash', 'revenue', 'refund', 'fees'

  @Column('decimal', { precision: 12, scale: 2 })
  amount!: number; // Can be positive or negative

  @Column({ default: 'INR' })
  currency!: string;

  @Column()
  type!: string; // e.g., 'payment', 'refund', 'fee', 'adjustment'

  @Column({ nullable: true })
  referenceId!: string; // e.g., payment intent id, order id, dispute id

  @Column()
  description!: string;

  @CreateDateColumn()
  createdAt!: Date;
}