import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { WalletEntity } from './wallet.entity';

@Entity('wallet_transactions')
export class WalletTransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  walletId!: string;

  @ManyToOne('WalletEntity')
  wallet!: any;

  @Column('decimal', { precision: 12, scale: 2 })
  amount!: number;

  @Column()
  type!: 'credit' | 'debit';

  @Column()
  description!: string;

  @Column({ nullable: true })
  referenceId!: string; // Order ID or Payout ID

  @CreateDateColumn()
  createdAt!: Date;
}
