import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from '../../db/entities/order.entity';
import { OrderItemEntity } from '../../db/entities/order-item.entity';
import { GSTDetailEntity } from '../../db/entities/gst-detail.entity';
import { HSNSACEntity } from '../../db/entities/hsn-sac.entity';
import { RestaurantGSTEntity } from '../../db/entities/restaurant-gst.entity';
import { MenuItemEntity } from '../../db/entities/menu-item.entity';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';

@Injectable()
export class GSTService {
  private readonly logger = new Logger(GSTService.name);

  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepo: Repository<OrderItemEntity>,
    @InjectRepository(GSTDetailEntity)
    private readonly gstDetailRepo: Repository<GSTDetailEntity>,
    @InjectRepository(HSNSACEntity)
    private readonly hsnSacRepo: Repository<HSNSACEntity>,
    @InjectRepository(RestaurantGSTEntity)
    private readonly restaurantGstRepo: Repository<RestaurantGSTEntity>,
    @InjectRepository(MenuItemEntity)
    private readonly menuItemRepo: Repository<MenuItemEntity>,
    @InjectRepository(RestaurantEntity)
    private readonly restaurantRepo: Repository<RestaurantEntity>,
  ) {}

  /**
   * Calculate GST for an order based on items and restaurant location
   */
  async calculateGSTForOrder(orderId: string): Promise<GSTDetailEntity> {
    try {
      this.logger.log(`Calculating GST for order ${orderId}`);

      // Get order with items
      const order = await this.orderRepo.findOne({
        where: { id: orderId },
        relations: ['items', 'items.menuItem', 'items.menuItem.hsnSac'],
      });

      if (!order) {
        throw new Error(`Order not found: ${orderId}`);
      }

      // Get restaurant GST details
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

      // Calculate taxable value and GST breakdown
      let totalTaxableValue = 0;
      let totalCGST = 0;
      let totalSGST = 0;
      let totalIGST = 0;

      // Process each order item
      for (const item of order.items) {
        const itemTotal = item.unitPrice * item.quantity;
        totalTaxableValue += itemTotal;

        // Determine GST rates based on HSN/SAC and location
        let cgstRate = 0;
        let sgstRate = 0;
        let igstRate = 0;

        // Get GST rate from HSN/SAC or use default
        const gstRate = item.hsnSac?.gstRate || 18; // Default to 18% if not specified

        // Determine if it's intra-state or inter-state supply
        // For simplicity, we're assuming all supplies are intra-state
        // In a real implementation, you'd compare restaurant state with delivery state
        const isIntraState = true; // This should be based on actual logic

        if (isIntraState) {
          // Intra-state supply: CGST + SGST
          cgstRate = gstRate / 2;
          sgstRate = gstRate / 2;
          igstRate = 0;
        } else {
          // Inter-state supply: IGST
          cgstRate = 0;
          sgstRate = 0;
          igstRate = gstRate;
        }

        // Calculate tax amounts
        const cgstAmount = (itemTotal * cgstRate) / 100;
        const sgstAmount = (itemTotal * sgstRate) / 100;
        const igstAmount = (itemTotal * igstRate) / 100;

        // Update item with tax details
        item.cgstRate = cgstRate;
        item.sgstRate = sgstRate;
        item.igstRate = igstRate;
        item.cgstAmount = cgstAmount;
        item.sgstAmount = sgstAmount;
        item.igstAmount = igstAmount;
        item.totalTax = cgstAmount + sgstAmount + igstAmount;
        item.totalAmount = itemTotal + item.totalTax;

        // Save updated item
        await this.orderItemRepo.save(item);

        // Accumulate totals
        totalCGST += cgstAmount;
        totalSGST += sgstAmount;
        totalIGST += igstAmount;
      }

      const totalGstAmount = totalCGST + totalSGST + totalIGST;
      const totalAmount = totalTaxableValue + totalGstAmount;

      // Create or update GST detail record
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
      gstDetail.placeOfSupply = restaurantGST.stateCode; // Simplified
      gstDetail.reverseChargeApplicable = false; // Standard supply

      // Update order with total tax (for backward compatibility)
      order.tax = totalGstAmount;
      order.grandTotal = totalAmount;

      // Save entities
      await this.gstDetailRepo.save(gstDetail);
      await this.orderRepo.save(order);

      this.logger.log(`GST calculated for order ${orderId}: Total GST = ${totalGstAmount}`);
      return gstDetail;
    } catch (error) {
      this.logger.error(`Error calculating GST for order ${orderId}`, error);
      throw error;
    }
  }

  /**
   * Generate GST invoice data for an order
   */
  async generateGSTInvoice(orderId: string): Promise<any> {
    try {
      this.logger.log(`Generating GST invoice for order ${orderId}`);

      // Get order with all related data
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
        // Calculate GST if not already done
        await this.calculateGSTForOrder(orderId);
        // Reload order with GST detail
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

      // Get restaurant GST details
      const restaurant = await this.restaurantRepo.findOne({
        where: { id: order.restaurantId },
        relations: ['gstDetail'],
      });

      if (!restaurant || !restaurant.gstDetail) {
        throw new Error(`GST details not found for restaurant: ${order.restaurantId}`);
      }

      const gstDetail = order.gstDetail;
      const restaurantGST = restaurant.gstDetail;

      // Generate invoice number (in real implementation, this would be more sophisticated)
      const invoiceNumber = `INV-${order.id}-${Date.now()}`;

      // Prepare invoice data
      const invoiceData = {
        invoiceNumber,
        invoiceDate: new Date(),
        orderId: order.id,
        orderNumber: order.orderNumber,
        
        // Supplier details (Restaurant)
        supplier: {
          gstin: restaurantGST.gstin,
          legalName: restaurantGST.legalNameOfBusiness,
          tradeName: restaurantGST.tradeName,
          address: restaurantGST.address,
          stateCode: restaurantGST.stateCode,
          state: restaurantGST.state,
        },
        
        // Customer details (would come from user/address in real implementation)
        customer: {
          // In a real implementation, you'd fetch customer details and GSTIN if registered
          name: 'Customer Name', // Placeholder
          address: 'Customer Address', // Placeholder
          // gstin: customerGSTIN, // Only if customer is GST registered
          stateCode: 'XX', // Placeholder - should be based on delivery address
          state: 'State Name', // Placeholder
        },
        
        // Invoice details
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
        
        // Tax summary
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
        
        // Additional fields
        placeOfSupply: gstDetail.placeOfSupply,
        reverseChargeApplicable: gstDetail.reverseChargeApplicable || false,
        
        // Totals
        subtotal: order.subtotal,
        discount: order.discount,
        tax: order.tax, // For backward compatibility
        deliveryFee: order.deliveryFee,
        tip: order.tip,
        grandTotal: order.grandTotal,
      };

      this.logger.log(`GST invoice generated for order ${orderId}`);
      return invoiceData;
    } catch (error) {
      this.logger.error(`Error generating GST invoice for order ${orderId}`, error);
      throw error;
    }
  }

  /**
   * Validate GSTIN format
   */
  validateGSTIN(gstin: string): boolean {
    if (!gstin || gstin.length !== 15) {
      return false;
    }

    // Basic GSTIN format validation
    // Format: 2 digits state code + 10 chars PAN + 1 digit entity code + 1 digit alphabet + 1 digit checksum
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin);
  }

  /**
   * Get GST rates for a given HSN/SAC code
   */
  async getGSTRateForHSNSAC(hsnSacCode: string): Promise<number> {
    try {
      const hsnSac = await this.hsnSacRepo.findOne({
        where: { hsnCode: hsnSacCode },
      });

      return hsnSac?.gstRate || 18; // Default to 18% if not found
    } catch (error) {
      this.logger.error(`Error getting GST rate for HSN/SAC ${hsnSacCode}`, error);
      return 18; // Default fallback
    }
  }

  /**
   * Get all unique GST rates used in an order
   */
  async getGSTRateSummary(orderId: string): Promise<any> {
    try {
      const orderItems = await this.orderItemRepo.find({
        where: { orderId: orderId },
      });

      const rateMap = new Map<string, { cgst: number; sgst: number; igst: number; total: number; count: number }>();

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
    } catch (error) {
      this.logger.error(`Error getting GST rate summary for order ${orderId}`, error);
      throw error;
    }
  }
}