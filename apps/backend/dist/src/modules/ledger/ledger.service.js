"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var LedgerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ledger_entry_entity_1 = require("../db/entities/ledger-entry.entity");
let LedgerService = LedgerService_1 = class LedgerService {
    constructor(ledgerRepo) {
        this.ledgerRepo = ledgerRepo;
        this.logger = new common_1.Logger(LedgerService_1.name);
    }
    async createEntry(transactionId, account, amount, currency = 'INR', type, referenceId = null, description = '') {
        const entry = this.ledgerRepo.create({
            transactionId,
            account,
            amount,
            currency,
            type,
            referenceId,
            description,
        });
        return await this.ledgerRepo.save(entry);
    }
    async createTransaction(transactionId, debitAccount, creditAccount, amount, currency = 'INR', type, referenceId = null, description = '') {
        if (amount <= 0) {
            throw new Error('Amount must be positive');
        }
        await this.createEntry(transactionId, debitAccount, amount, currency, type, referenceId, description);
        await this.createEntry(transactionId, creditAccount, -amount, currency, type, referenceId, description);
        this.logger.log(`Created ledger transaction ${transactionId}: ${debitAccount} +${amount}, ${creditAccount} -${amount}`);
    }
    async getEntriesByTransactionId(transactionId) {
        return await this.ledgerRepo.find({
            where: { transactionId },
            order: { createdAt: 'ASC' },
        });
    }
    async getEntriesByAccount(account, startDate, endDate) {
        return await this.ledgerRepo.find({
            where: {
                account,
                createdAt: startDate,
            }(endDate),
        }, order, { createdAt: 'ASC' });
    }
    ;
};
exports.LedgerService = LedgerService;
exports.LedgerService = LedgerService = LedgerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ledger_entry_entity_1.LedgerEntryEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], LedgerService);
//# sourceMappingURL=ledger.service.js.map