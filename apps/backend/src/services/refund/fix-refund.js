const fs = require('fs');
const file = 'C:/Users/mehta/Desktop/SpiceGarden/apps/backend/src/services/refund/refund.service.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/throw new BadRequestException\(Order is not eligible for refund\);/g, "throw new BadRequestException('Order is not eligible for refund');");
content = content.replace(/throw new BadRequestException\(Order has already been refunded\);/g, "throw new BadRequestException('Order has already been refunded');");
content = content.replace(/throw new BadRequestException\(There is already a pending refund request for this order\);/g, "throw new BadRequestException('There is already a pending refund request for this order');");
content = content.replace(/this.logger.log\(Created refund request  for order \);/g, "this.logger.log(`Created refund request for order ${order.id}`);");
content = content.replace(/throw new NotFoundException\(Refund approval not found: \);/g, "throw new NotFoundException('Refund approval not found');");
content = content.replace(/throw new NotFoundException\(Approver not found: \);/g, "throw new NotFoundException('Approver not found');");
content = content.replace(/throw new BadRequestException\(Refund request is already \);/g, "throw new BadRequestException('Refund request is already processed');");
content = content.replace(/this.logger.log\(Approved refund request  by \);/g, "this.logger.log('Approved refund request');");
content = content.replace(/this.logger.log\(Rejected refund request  by \);/g, "this.logger.log('Rejected refund request');");
content = content.replace(/throw new NotFoundException\(Processor not found: \);/g, "throw new NotFoundException('Processor not found');");
content = content.replace(/throw new BadRequestException\(Refund request is not approved \\(current status: \\)\);/g, "throw new BadRequestException('Refund request is not approved');");
content = content.replace(/throw new BadRequestException\(Refund request has already been processed\);/g, "throw new BadRequestException('Refund request has already been processed');");
content = content.replace(/throw new NotFoundException\(Order not found: \);/g, "throw new NotFoundException('Order not found');");
content = content.replace(/Refund processed for order , reason:  \/\/ description/g, "`Refund processed for order ${order.id}, reason: ${approval.reason}` // description");
content = content.replace(/this.logger.log\(Processed refund  for order \);/g, "this.logger.log('Processed refund for order');");
content = content.replace(/this.logger.error\(Failed to process refund for approval :, error\);/g, "this.logger.error('Failed to process refund for approval', error);");
content = content.replace(/message: New refund request of \{approval.refundAmount\} for order #\. Reason: ,/g, "message: `New refund request of ${approval.refundAmount} for order #${approval.orderId}. Reason: ${approval.reason}`,");
content = content.replace(/message: Refund request approved for \{approval.refundAmount\} for order #,/g, "message: `Refund request approved for ${approval.refundAmount} for order #${approval.orderId}`,");
content = content.replace(/message: Your refund request for order # has been rejected\. Reason: ,/g, "message: `Your refund request for order #${approval.orderId} has been rejected. Reason: ${approval.rejectionReason}`,");
content = content.replace(/message: Your refund of \{refund.amount\} for order # has been processed\.,/g, "message: `Your refund of ${refund.amount} for order #${order.id} has been processed.`,");

fs.writeFileSync(file, content);
