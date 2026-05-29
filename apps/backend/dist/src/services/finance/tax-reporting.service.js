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
var TaxReportingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxReportingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../../db/entities/order.entity");
const gst_detail_entity_1 = require("../../db/entities/gst-detail.entity");
const restaurant_entity_1 = require("../../db/entities/restaurant.entity");
const restaurant_gst_entity_1 = require("../../db/entities/restaurant-gst.entity");
const order_item_entity_1 = require("../../db/entities/order-item.entity");
let TaxReportingService = TaxReportingService_1 = class TaxReportingService {
    constructor(orderRepo, gstDetailRepo, restaurantRepo, restaurantGstRepo, orderItemRepo, dataSource) {
        this.orderRepo = orderRepo;
        this.gstDetailRepo = gstDetailRepo;
        this.restaurantRepo = restaurantRepo;
        this.restaurantGstRepo = restaurantGstRepo;
        this.orderItemRepo = orderItemRepo;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(TaxReportingService_1.name);
    }
    async generateGSTReport(restaurantId, month, year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        const orders = await this.orderRepo.find({
            where: {
                restaurantId: restaurantId,
                createdAt: (0, typeorm_2.Between)(startDate, endDate),
            },
            relations: ['gstDetail', 'items', 'items.menuItem'],
        });
        const gstDetails = orders
            .filter(o => o.gstDetail)
            .map(o => o.gstDetail);
        const summary = {
            period: { month, year },
            totalTaxableValue: gstDetails.reduce((sum, g) => sum + Number(g.taxableValue), 0),
            totalCGST: gstDetails.reduce((sum, g) => sum + Number(g.cgstAmount), 0),
            totalSGST: gstDetails.reduce((sum, g) => sum + Number(g.sgstAmount), 0),
            totalIGST: gstDetails.reduce((sum, g) => sum + Number(g.igstAmount), 0),
            totalGST: gstDetails.reduce((sum, g) => sum + Number(g.totalGstAmount), 0),
            totalInvoices: orders.length,
            hsnWise: await this.getHSNBreakdown(orders),
        };
        return {
            summary,
            invoices: orders.map(o => ({
                invoiceNumber: `INV-${o.id}`,
                date: o.createdAt,
                orderNumber: o.orderNumber,
                taxableValue: o.gstDetail?.taxableValue || 0,
                cgstAmount: o.gstDetail?.cgstAmount || 0,
                sgstAmount: o.gstDetail?.sgstAmount || 0,
                igstAmount: o.gstDetail?.igstAmount || 0,
                totalGST: o.gstDetail?.totalGstAmount || 0,
            })),
        };
    }
    async getHSNBreakdown(orders) {
        const hsnMap = new Map();
        for (const order of orders) {
            if (!order.gstDetail)
                continue;
            for (const item of order.items) {
                const hsnCode = item.hsnSac?.hsnCode || 'NOT_SPECIFIED';
                const existing = hsnMap.get(hsnCode) || {
                    hsnCode,
                    taxableValue: 0,
                    cgst: 0,
                    sgst: 0,
                    igst: 0,
                    total: 0,
                    quantity: 0,
                };
                existing.taxableValue += Number(item.totalPrice);
                existing.cgst += Number(item.cgstAmount || 0);
                existing.sgst += Number(item.sgstAmount || 0);
                existing.igst += Number(item.igstAmount || 0);
                existing.total += Number(item.totalTax || 0);
                existing.quantity += item.quantity;
                hsnMap.set(hsnCode, existing);
            }
        }
        return Array.from(hsnMap.values());
    }
    async exportGSTR1(restaurantId, month, year) {
        const report = await this.generateGSTReport(restaurantId, month, year);
        return report.invoices.map((inv) => ({
            'Invoice Number': inv.invoiceNumber,
            'Invoice Date': inv.date,
            'Customer Name': 'Customer',
            'Customer GSTIN': '',
            'Taxable Value': inv.taxableValue,
            'CGST Rate': inv.cgstAmount ? 9 : 0,
            'CGST Amount': inv.cgstAmount,
            'SGST Rate': inv.sgstAmount ? 9 : 0,
            'SGST Amount': inv.sgstAmount,
            'IGST Rate': inv.igstAmount ? 18 : 0,
            'IGST Amount': inv.igstAmount,
            'Total Tax': inv.totalGST,
        }));
    }
    async getTaxLiability(reportingMonth) {
        const month = reportingMonth.getMonth() + 1;
        const year = reportingMonth.getFullYear();
        const orders = await this.orderRepo.find({
            where: { createdAt: (0, typeorm_2.Between)(new Date(year, month - 1, 1), new Date(year, month, 0)) },
            relations: ['gstDetail'],
        });
        const totalGST = orders.reduce((sum, o) => sum + Number(o.tax || 0), 0);
        const taxReceivable = totalGST;
        const taxPayable = totalGST;
        return {
            reportingPeriod: { month, year },
            taxReceivable,
            taxPayable,
            netLiability: taxPayable - taxReceivable,
            ordersCount: orders.length,
        };
    }
    async getMonthlyTaxSummary(restaurantId, months = 12) {
        const summaries = [];
        const now = new Date();
        for (let i = 0; i < months; i++) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            summaries.push(await this.generateGSTReport(restaurantId, date.getMonth() + 1, date.getFullYear()));
        }
        return summaries;
    }
};
exports.TaxReportingService = TaxReportingService;
exports.TaxReportingService = TaxReportingService = TaxReportingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.OrderEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(gst_detail_entity_1.GSTDetailEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(restaurant_entity_1.RestaurantEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(restaurant_gst_entity_1.RestaurantGSTEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItemEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], TaxReportingService);
//# sourceMappingURL=tax-reporting.service.js.map