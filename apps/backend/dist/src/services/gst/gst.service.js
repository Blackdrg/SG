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
var GSTService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GSTService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../../db/entities/order.entity");
const order_item_entity_1 = require("../../db/entities/order-item.entity");
const gst_detail_entity_1 = require("../../db/entities/gst-detail.entity");
const hsn_sac_entity_1 = require("../../db/entities/hsn-sac.entity");
const restaurant_gst_entity_1 = require("../../db/entities/restaurant-gst.entity");
const menu_item_entity_1 = require("../../db/entities/menu-item.entity");
const restaurant_entity_1 = require("../../db/entities/restaurant.entity");
let GSTService = GSTService_1 = class GSTService {
    constructor(orderRepo, orderItemRepo, gstDetailRepo, hsnSacRepo, restaurantGstRepo, menuItemRepo, restaurantRepo) {
        this.orderRepo = orderRepo;
        this.orderItemRepo = orderItemRepo;
        this.gstDetailRepo = gstDetailRepo;
        this.hsnSacRepo = hsnSacRepo;
        this.restaurantGstRepo = restaurantGstRepo;
        this.menuItemRepo = menuItemRepo;
        this.restaurantRepo = restaurantRepo;
        this.logger = new common_1.Logger(GSTService_1.name);
    }
    async calculateGSTForOrder(orderId) {
        try {
            this.logger.log(`Calculating GST for order ${orderId}`);
            const order = await this.orderRepo.findOne({
                where: { id: orderId },
                relations: ['items', 'items.menuItem', 'items.menuItem.hsnSac'],
            });
            if (!order) {
                throw new Error(`Order not found: ${orderId}`);
            }
            const restaurant = await this.restaurantRepo.findOne({
                where: { id: order.restaurantId },
                relations: ['gstDetail'],
            });
            if (!restaurant) {
                throw new Error(`Restaurant not found: ${order.restaurantId}`);
            }
            const restaurantGST = restaurant.gstDetail;
            if (!restaurantGST) {
                throw new Error(`GST details not found for restaurant: ${order.restaurantId}`);
            }
            let totalTaxableValue = 0;
            let totalCGST = 0;
            let totalSGST = 0;
            let totalIGST = 0;
            for (const item of order.items) {
                const itemTotal = item.unitPrice * item.quantity;
                totalTaxableValue += itemTotal;
                let cgstRate = 0;
                let sgstRate = 0;
                let igstRate = 0;
                const gstRate = item.hsnSac?.gstRate || 18;
                const isIntraState = true;
                if (isIntraState) {
                    cgstRate = gstRate / 2;
                    sgstRate = gstRate / 2;
                    igstRate = 0;
                }
                else {
                    cgstRate = 0;
                    sgstRate = 0;
                    igstRate = gstRate;
                }
                const cgstAmount = (itemTotal * cgstRate) / 100;
                const sgstAmount = (itemTotal * sgstRate) / 100;
                const igstAmount = (itemTotal * igstRate) / 100;
                item.cgstRate = cgstRate;
                item.sgstRate = sgstRate;
                item.igstRate = igstRate;
                item.cgstAmount = cgstAmount;
                item.sgstAmount = sgstAmount;
                item.igstAmount = igstAmount;
                item.totalTax = cgstAmount + sgstAmount + igstAmount;
                item.totalAmount = itemTotal + item.totalTax;
                await this.orderItemRepo.save(item);
                totalCGST += cgstAmount;
                totalSGST += sgstAmount;
                totalIGST += igstAmount;
            }
            const totalGstAmount = totalCGST + totalSGST + totalIGST;
            const totalAmount = totalTaxableValue + totalGstAmount;
            let gstDetail = await this.gstDetailRepo.findOne({
                where: { orderId: order.id },
            });
            if (!gstDetail) {
                gstDetail = this.gstDetailRepo.create({
                    orderId: order.id,
                    order: order,
                });
            }
            gstDetail.taxableValue = totalTaxableValue;
            gstDetail.cgstRate = totalCGST > 0 ? (totalCGST / totalTaxableValue) * 100 : 0;
            gstDetail.sgstRate = totalSGST > 0 ? (totalSGST / totalTaxableValue) * 100 : 0;
            gstDetail.igstRate = totalIGST > 0 ? (totalIGST / totalTaxableValue) * 100 : 0;
            gstDetail.cgstAmount = totalCGST;
            gstDetail.sgstAmount = totalSGST;
            gstDetail.igstAmount = totalIGST;
            gstDetail.totalGstAmount = totalGstAmount;
            gstDetail.totalAmount = totalAmount;
            gstDetail.placeOfSupply = restaurantGST.stateCode;
            gstDetail.reverseChargeApplicable = false;
            order.tax = totalGstAmount;
            order.grandTotal = totalAmount;
            await this.gstDetailRepo.save(gstDetail);
            await this.orderRepo.save(order);
            this.logger.log(`GST calculated for order ${orderId}: Total GST = ${totalGstAmount}`);
            return gstDetail;
        }
        catch (error) {
            this.logger.error(`Error calculating GST for order ${orderId}`, error);
            throw error;
        }
    }
    async generateGSTInvoice(orderId) {
        try {
            this.logger.log(`Generating GST invoice for order ${orderId}`);
            const order = await this.orderRepo.findOne({
                where: { id: orderId },
                relations: [
                    'items',
                    'items.menuItem',
                    'items.menuItem.hsnSac',
                    'gstDetail',
                ],
            });
            if (!order) {
                throw new Error(`Order not found: ${orderId}`);
            }
            if (!order.gstDetail) {
                await this.calculateGSTForOrder(orderId);
                await this.orderRepo.findOne({
                    where: { id: orderId },
                    relations: [
                        'items',
                        'items.menuItem',
                        'items.menuItem.hsnSac',
                        'gstDetail',
                    ],
                });
            }
            const restaurant = await this.restaurantRepo.findOne({
                where: { id: order.restaurantId },
                relations: ['gstDetail'],
            });
            if (!restaurant || !restaurant.gstDetail) {
                throw new Error(`GST details not found for restaurant: ${order.restaurantId}`);
            }
            const gstDetail = order.gstDetail;
            const restaurantGST = restaurant.gstDetail;
            const invoiceNumber = `INV-${order.id}-${Date.now()}`;
            const invoiceData = {
                invoiceNumber,
                invoiceDate: new Date(),
                orderId: order.id,
                orderNumber: order.orderNumber,
                supplier: {
                    gstin: restaurantGST.gstin,
                    legalName: restaurantGST.legalNameOfBusiness,
                    tradeName: restaurantGST.tradeName,
                    address: restaurantGST.address,
                    stateCode: restaurantGST.stateCode,
                    state: restaurantGST.state,
                },
                customer: {
                    name: 'Customer Name',
                    address: 'Customer Address',
                    stateCode: 'XX',
                    state: 'State Name',
                },
                items: order.items.map(item => ({
                    description: item.menuItem.name,
                    hsnSacCode: item.hsnSac?.hsnCode || 'NOT_SPECIFIED',
                    quantity: item.quantity,
                    unit: item.menuItem.name.includes('kg') || item.menuItem.name.includes('liter') || item.menuItem.name.includes('ltr') ? 'kg/ltr' : 'pcs',
                    unitPrice: item.unitPrice,
                    totalPrice: item.totalPrice,
                    gstRate: item.cgstRate + item.sgstRate + item.igstRate,
                    cgstRate: item.cgstRate,
                    sgstRate: item.sgstRate,
                    igstRate: item.igstRate,
                    cgstAmount: item.cgstAmount,
                    sgstAmount: item.sgstAmount,
                    igstAmount: item.igstAmount,
                    totalTax: item.totalTax,
                    totalAmount: item.totalAmount,
                })),
                taxSummary: {
                    taxableValue: gstDetail.taxableValue,
                    cgstRate: gstDetail.cgstRate,
                    sgstRate: gstDetail.sgstRate,
                    igstRate: gstDetail.igstRate,
                    cgstAmount: gstDetail.cgstAmount,
                    sgstAmount: gstDetail.sgstAmount,
                    igstAmount: gstDetail.igstAmount,
                    totalGstAmount: gstDetail.totalGstAmount,
                    totalAmount: gstDetail.totalAmount,
                },
                placeOfSupply: gstDetail.placeOfSupply,
                reverseChargeApplicable: gstDetail.reverseChargeApplicable || false,
                subtotal: order.subtotal,
                discount: order.discount,
                tax: order.tax,
                deliveryFee: order.deliveryFee,
                tip: order.tip,
                grandTotal: order.grandTotal,
            };
            this.logger.log(`GST invoice generated for order ${orderId}`);
            return invoiceData;
        }
        catch (error) {
            this.logger.error(`Error generating GST invoice for order ${orderId}`, error);
            throw error;
        }
    }
    validateGSTIN(gstin) {
        if (!gstin || gstin.length !== 15) {
            return false;
        }
        const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
        return gstinRegex.test(gstin);
    }
    async getGSTRateForHSNSAC(hsnSacCode) {
        try {
            const hsnSac = await this.hsnSacRepo.findOne({
                where: { hsnCode: hsnSacCode },
            });
            return hsnSac?.gstRate || 18;
        }
        catch (error) {
            this.logger.error(`Error getting GST rate for HSN/SAC ${hsnSacCode}`, error);
            return 18;
        }
    }
    async getGSTRateSummary(orderId) {
        try {
            const orderItems = await this.orderItemRepo.find({
                where: { orderId: orderId },
            });
            const rateMap = new Map();
            orderItems.forEach(item => {
                const rateKey = `${item.cgstRate}-${item.sgstRate}-${item.igstRate}`;
                if (!rateMap.has(rateKey)) {
                    rateMap.set(rateKey, {
                        cgst: item.cgstRate,
                        sgst: item.sgstRate,
                        igst: item.igstRate,
                        total: item.cgstRate + item.sgstRate + item.igstRate,
                        count: 0,
                    });
                }
                const rateData = rateMap.get(rateKey);
                rateData.count += 1;
                rateMap.set(rateKey, rateData);
            });
            const summary = Array.from(rateMap.entries()).map(([key, data]) => ({
                rateKey: key,
                cgstRate: data.cgst,
                sgstRate: data.sgst,
                igstRate: data.igst,
                totalRate: data.total,
                itemCount: data.count,
            }));
            return summary;
        }
        catch (error) {
            this.logger.error(`Error getting GST rate summary for order ${orderId}`, error);
            throw error;
        }
    }
};
exports.GSTService = GSTService;
exports.GSTService = GSTService = GSTService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.OrderEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItemEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(gst_detail_entity_1.GSTDetailEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(hsn_sac_entity_1.HSNSACEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(restaurant_gst_entity_1.RestaurantGSTEntity)),
    __param(5, (0, typeorm_1.InjectRepository)(menu_item_entity_1.MenuItemEntity)),
    __param(6, (0, typeorm_1.InjectRepository)(restaurant_entity_1.RestaurantEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], GSTService);
//# sourceMappingURL=gst.service.js.map