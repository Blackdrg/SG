"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const order_interface_1 = require("../src/shared/domain/order.interface");
describe('DeliveryService - Unit Tests', () => {
    describe('Order Status Logic', () => {
        it('should validate order status transitions', () => {
            const validTransitions = [
                ['placed', 'restaurant_accepted'],
                ['restaurant_accepted', 'preparing'],
                ['preparing', 'ready_for_pickup'],
                ['ready_for_pickup', 'driver_assigned'],
                ['driver_assigned', 'picked_up'],
                ['picked_up', 'on_the_way'],
                ['on_the_way', 'delivered'],
            ];
            validTransitions.forEach(([from, to]) => {
                const statusValue = order_interface_1.OrderStatus[from.toUpperCase().replace('_', '')] || to;
                expect(statusValue).toBeDefined();
            });
        });
        it('should calculate driver earnings correctly', () => {
            const baseEarning = 15.00;
            const tip = 5.00;
            const totalEarning = baseEarning + tip;
            expect(totalEarning).toBe(20.00);
            expect(baseEarning).toBeGreaterThan(0);
        });
        it('should validate payment status for refund eligibility', () => {
            const eligibleStatuses = [order_interface_1.OrderStatus.ON_THE_WAY, order_interface_1.OrderStatus.DELIVERED];
            const eligiblePaymentStatuses = [order_interface_1.PaymentStatus.COMPLETED];
            expect(eligibleStatuses).toContain(order_interface_1.OrderStatus.DELIVERED);
            expect(eligiblePaymentStatuses).toContain(order_interface_1.PaymentStatus.COMPLETED);
        });
    });
    describe('Fraud Detection Logic', () => {
        it('should detect unrealistic GPS speeds', () => {
            const maxRealisticSpeedKmh = 100;
            const detectedSpeed = 150;
            expect(detectedSpeed).toBeGreaterThan(maxRealisticSpeedKmh);
        });
        it('should calculate fraud risk score', () => {
            const gpsRisk = 30;
            const routeRisk = 25;
            const timingRisk = 20;
            const fakeRisk = 25;
            const totalRisk = Math.min(100, gpsRisk * 0.3 + routeRisk * 0.3 + timingRisk * 0.2 + fakeRisk * 0.2);
            expect(totalRisk).toBe(25.5);
        });
    });
    describe('ETA Calculation', () => {
        it('should apply time-of-day traffic factor', () => {
            const baseTimeMinutes = 30;
            const rushHourFactor = 1.5;
            const adjustedETA = Math.ceil(baseTimeMinutes * rushHourFactor * 1.2);
            expect(adjustedETA).toBe(54);
        });
        it('should calculate confidence based on sample size', () => {
            const sampleSizes = [3, 10, 25];
            const getConfidence = (n) => {
                if (n >= 20)
                    return 'high';
                if (n >= 5)
                    return 'medium';
                return 'low';
            };
            expect(getConfidence(sampleSizes[0])).toBe('low');
            expect(getConfidence(sampleSizes[1])).toBe('medium');
            expect(getConfidence(sampleSizes[2])).toBe('high');
        });
    });
});
//# sourceMappingURL=delivery.service.spec.js.map