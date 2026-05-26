import { WalletService } from './wallet.service';
export declare class WalletController {
    private readonly walletService;
    constructor(walletService: WalletService);
    getWallet(req: any): Promise<import("../../db/entities/wallet.entity").WalletEntity>;
    getBalance(req: any): Promise<{
        balance: number;
        currency: string;
    }>;
    getTransactions(req: any, limit?: number, offset?: number): Promise<import("../../db/entities/wallet-transaction.entity").WalletTransactionEntity[]>;
    creditWallet(req: any, amount: number, description: string, referenceId?: string): Promise<import("../../db/entities/wallet-transaction.entity").WalletTransactionEntity>;
    debitWallet(req: any, amount: number, description: string, referenceId?: string): Promise<import("../../db/entities/wallet-transaction.entity").WalletTransactionEntity>;
    compensateUser(req: any, amount: number, reason: string): Promise<import("../../db/entities/wallet-transaction.entity").WalletTransactionEntity>;
    processCODPayment(req: any, orderId: string, amount: string | number): Promise<boolean>;
    confirmCODCollection(req: any, orderId: string, amount: string | number): Promise<import("../../db/entities/wallet-transaction.entity").WalletTransactionEntity>;
    refundCOD(req: any, orderId: string, amount: string | number, reason: string): Promise<import("../../db/entities/wallet-transaction.entity").WalletTransactionEntity>;
    preventDuplicatePayment(req: any, orderId: string, amount: number): Promise<{
        allowed: boolean;
    }>;
}
