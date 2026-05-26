export declare class WalletTransactionEntity {
    id: string;
    walletId: string;
    wallet: any;
    amount: number;
    type: 'credit' | 'debit';
    description: string;
    referenceId: string;
    createdAt: Date;
}
