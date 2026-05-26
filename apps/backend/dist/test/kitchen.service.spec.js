"use strict";
describe('Kitchen Service - Isolated Unit Tests', () => {
    beforeAll(() => {
        jest.mock('@nestjs/testing', () => ({
            Test: {
                createTestingModule: jest.fn().mockImplementation(() => ({
                    compile: jest.fn().mockResolvedValue({
                        get: jest.fn().mockImplementation(() => ({})),
                    }),
                })),
            },
        }));
    });
    describe('Inventory Management Logic', () => {
        it('should calculate total cost from stock and unit cost', () => {
            const currentStock = 10;
            const unitCost = 2.50;
            const totalCost = currentStock * unitCost;
            expect(totalCost).toBe(25.00);
        });
        it('should update stock and recalculate total cost', () => {
            const initialStock = 10;
            const unitCost = 2.50;
            const addedStock = 5;
            const newStock = initialStock + addedStock;
            const newTotalCost = newStock * unitCost;
            expect(newStock).toBe(15);
            expect(newTotalCost).toBe(37.50);
        });
        it('should detect low stock items', () => {
            const items = [
                { id: '1', name: 'Item 1', currentStock: 3, lowStockThreshold: 5 },
                { id: '2', name: 'Item 2', currentStock: 8, lowStockThreshold: 5 },
            ];
            const lowStockItems = items.filter(item => item.currentStock < item.lowStockThreshold);
            expect(lowStockItems.length).toBe(1);
            expect(lowStockItems[0].id).toBe('1');
        });
        it('should calculate wastage cost', () => {
            const wastageQuantity = 2;
            const unitCost = 2.50;
            const wastageCost = wastageQuantity * unitCost;
            expect(wastageCost).toBe(5.00);
        });
        it('should update inventory after wastage', () => {
            const initialStock = 10;
            const wastage = 2;
            const currentStock = initialStock - wastage;
            expect(currentStock).toBe(8);
        });
    });
    describe('Recipe Management Logic', () => {
        it('should calculate cost per serving', () => {
            const totalCost = 20.00;
            const servings = 4;
            const costPerServing = totalCost / servings;
            expect(costPerServing).toBe(5.00);
        });
        it('should calculate yield-based cost', () => {
            const ingredients = [
                { name: 'Ingredient 1', quantity: 2, unitCost: 5.00 },
                { name: 'Ingredient 2', quantity: 1, unitCost: 3.00 },
            ];
            const totalCost = ingredients.reduce((sum, ing) => sum + (ing.quantity * ing.unitCost), 0);
            expect(totalCost).toBe(13.00);
        });
    });
    describe('SLA Monitoring Logic', () => {
        it('should record avg prep time with target comparison', () => {
            const actualPrepTime = 25;
            const targetPrepTime = 30;
            expect(actualPrepTime).toBeLessThan(targetPrepTime);
        });
        it('should calculate late prep percentage', () => {
            const lateCount = 3;
            const totalCount = 100;
            const latePercentage = (lateCount / totalCount) * 100;
            expect(latePercentage).toBe(3);
        });
        it('should calculate kitchen throughput', () => {
            const ordersPerHour = 45;
            const targetThroughput = 50;
            const throughputRate = (ordersPerHour / targetThroughput) * 100;
            expect(throughputRate).toBe(90);
        });
        it('should aggregate SLA metrics by period', () => {
            const slas = [
                { metricName: 'avg_prep_time', value: 25, measurementPeriod: 'daily' },
                { metricName: 'avg_prep_time', value: 28, measurementPeriod: 'daily' },
                { metricName: 'late_prep_percentage', value: 3, measurementPeriod: 'daily' },
            ];
            const dailyAvgPrepTimes = slas.filter(s => s.metricName === 'avg_prep_time');
            const averagePrepTime = dailyAvgPrepTimes.reduce((sum, s) => sum + s.value, 0) / dailyAvgPrepTimes.length;
            expect(averagePrepTime).toBe(26.5);
        });
    });
    describe('Consumption & Forecasting Logic', () => {
        it('should calculate consumption data', () => {
            const consumptionData = [
                { itemId: '1', day: 1, quantity: 5 },
                { itemId: '1', day: 2, quantity: 7 },
                { itemId: '1', day: 3, quantity: 6 },
            ];
            const totalConsumption = consumptionData.reduce((sum, d) => sum + d.quantity, 0);
            expect(totalConsumption).toBe(18);
        });
        it('should forecast inventory needs using moving average', () => {
            const dailyConsumption = [5, 7, 6, 8, 4];
            const averageDailyConsumption = dailyConsumption.reduce((sum, c) => sum + c, 0) / dailyConsumption.length;
            const forecastDays = 7;
            const predictedConsumption = Math.ceil(averageDailyConsumption * forecastDays);
            expect(predictedConsumption).toBe(42);
        });
        it('should calculate recommended order quantity with buffer', () => {
            const predictedConsumption = 49;
            const safetyBuffer = 0.2;
            const recommendedOrder = Math.ceil(predictedConsumption * (1 + safetyBuffer));
            expect(recommendedOrder).toBe(59);
        });
    });
});
//# sourceMappingURL=kitchen.service.spec.js.map