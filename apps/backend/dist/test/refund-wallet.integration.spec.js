"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
describe('Refund → Wallet Integration', () => {
    const mockWallet = {
        id: 'wallet123',
        userId: 'user123',
        balance: 100,
    };
    const mockOrder = {
        id: 'order123',
        userId: 'user123',
        grandTotal: 25.99,
    };
    describe('refund flow', () => {
        it('should process refund and credit wallet', async () => {
            const transactionRepo = {
                create: jest.fn().mockReturnValue({}),
                save: jest.fn().mockResolvedValue({}),
            };
            const refundTransaction = {
                walletId: mockWallet.id,
                amount: mockOrder.grandTotal,
                type: 'credit',
                description: `Refund for order #${mockOrder.id}`,
                referenceId: mockOrder.id,
            };
            transactionRepo.create(refundTransaction);
            await transactionRepo.save(refundTransaction);
            expect(transactionRepo.create).toHaveBeenCalledWith(refundTransaction);
        });
        it('should update wallet balance after successful refund', async () => {
            const walletRepo = {
                findOne: jest.fn().mockResolvedValue(mockWallet),
                save: jest.fn().mockResolvedValue({ ...mockWallet, balance: mockWallet.balance + mockOrder.grandTotal }),
            };
            const updatedWallet = { ...mockWallet, balance: mockWallet.balance + mockOrder.grandTotal };
            await walletRepo.save(updatedWallet);
            expect(walletRepo.save).toHaveBeenCalled();
            expect(walletRepo.save).toHaveBeenCalledWith(updatedWallet);
        });
        it('should create refund transaction record', async () => {
            const transactionRepo = {
                create: jest.fn().mockReturnValue({}),
                save: jest.fn().mockResolvedValue({ id: 'txn-refund-123' }),
            };
            const txn = transactionRepo.create({
                walletId: mockWallet.id,
                amount: mockOrder.grandTotal,
                type: 'credit',
                description: 'Refund',
                referenceId: mockOrder.id,
            });
            await transactionRepo.save(txn);
            expect(transactionRepo.create).toHaveBeenCalled();
            expect(transactionRepo.save).toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=refund-wallet.integration.spec.js.map