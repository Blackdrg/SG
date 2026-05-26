"use strict";
const { Test, TestingModule } = require('@nestjs/testing');
const { KitchenService } = require('../src/modules/kitchen/kitchen.service');
const { getRepositoryToken } = require('@nestjs/typeorm');
const { InventoryItemEntity } = require('../src/db/entities/inventory-item.entity');
const { RecipeEntity } = require('../src/db/entities/recipe.entity');
const { BatchEntity } = require('../src/db/entities/batch.entity');
const { FoodPrepEntity } = require('../src/db/entities/food-prep.entity');
const { KitchenSLAEntity } = require('../src/db/entities/kitchen-sla.entity');
const { SupplierEntity } = require('../src/db/entities/supplier.entity');
const { RestaurantBranchEntity } = require('../src/db/entities/restaurant-branch.entity');
const { DataSource, Repository } = require('typeorm');
describe('KitchenService - Enhanced Features', () => {
    let service;
    let inventoryRepo;
    let recipeRepo;
    let batchRepo;
    let foodPrepRepo;
    let slaRepo;
    let supplierRepo;
    let branchRepo;
    let dataSource;
    const mockBranch = {
        id: 'test-branch-id',
        name: 'Test Branch',
        address: { city: 'Test City' }
    };
    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                KitchenService,
                {
                    provide: getRepositoryToken(InventoryItemEntity),
                    useValue: {
                        create: jest.fn().mockImplementation((dto) => dto),
                        save: jest.fn().mockImplementation((entity) => Promise.resolve({ id: 'test-id', ...entity })),
                        findOne: jest.fn(),
                        find: jest.fn(),
                    }
                },
                {
                    provide: getRepositoryToken(RecipeEntity),
                    useValue: {
                        create: jest.fn().mockImplementation((dto) => dto),
                        save: jest.fn().mockImplementation((entity) => Promise.resolve({ id: 'test-id', ...entity })),
                        findOne: jest.fn(),
                    }
                },
                {
                    provide: getRepositoryToken(BatchEntity),
                    useValue: {
                        create: jest.fn().mockImplementation((dto) => dto),
                        save: jest.fn().mockImplementation((entity) => Promise.resolve({ id: 'test-id', ...entity })),
                        findOne: jest.fn(),
                    }
                },
                {
                    provide: getRepositoryToken(FoodPrepEntity),
                    useValue: {
                        create: jest.fn().mockImplementation((dto) => dto),
                        save: jest.fn().mockImplementation((entity) => Promise.resolve({ id: 'test-id', ...entity })),
                        findOne: jest.fn(),
                    }
                },
                {
                    provide: getRepositoryToken(KitchenSLAEntity),
                    useValue: {
                        create: jest.fn().mockImplementation((dto) => dto),
                        save: jest.fn().mockImplementation((entity) => Promise.resolve({ id: 'test-id', ...entity })),
                        find: jest.fn(),
                    }
                },
                {
                    provide: getRepositoryToken(SupplierEntity),
                    useValue: {
                        create: jest.fn().mockImplementation((dto) => dto),
                        save: jest.fn().mockImplementation((entity) => Promise.resolve({ id: 'test-id', ...entity })),
                        findOne: jest.fn(),
                    }
                },
                {
                    provide: getRepositoryToken(RestaurantBranchEntity),
                    useValue: {
                        create: jest.fn().mockImplementation((dto) => dto),
                        save: jest.fn().mockImplementation((entity) => Promise.resolve({ id: 'test-id', ...entity })),
                        findOne: jest.fn(),
                    }
                },
                {
                    provide: DataSource,
                    useValue: {}
                }
            ],
        }).compile();
        service = module.get(KitchenService);
        inventoryRepo = module.get(getRepositoryToken(InventoryItemEntity));
        recipeRepo = module.get(getRepositoryToken(RecipeEntity));
        batchRepo = module.get(getRepositoryToken(BatchEntity));
        foodPrepRepo = module.get(getRepositoryToken(FoodPrepEntity));
        slaRepo = module.get(getRepositoryToken(KitchenSLAEntity));
        supplierRepo = module.get(getRepositoryToken(SupplierEntity));
        branchRepo = module.get(getRepositoryToken(RestaurantBranchEntity));
        dataSource = module.get(DataSource);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('Enhanced Inventory Management', () => {
        it('should create an inventory item with cost fields', async () => {
            const dto = {
                name: 'Test Ingredient',
                currentStock: 10,
                unit: 'kg',
                lowStockThreshold: 5,
                unitCost: 2.50,
                totalCost: 25.00,
                wastage: 0,
                wastageCost: 0,
                branch: mockBranch
            };
            const result = await service.createInventoryItem(dto);
            expect(result).toEqual({ id: 'test-id', ...dto });
            expect(inventoryRepo.create).toHaveBeenCalledWith(dto);
            expect(inventoryRepo.save).toHaveBeenCalledWith(dto);
        });
        it('should update inventory stock and recalculate total cost', async () => {
            const mockItem = {
                id: 'test-id',
                currentStock: 10,
                unitCost: 2.50,
                totalCost: 25.00,
                lowStockThreshold: 5,
                branch: mockBranch
            };
            inventoryRepo.findOne.mockResolvedValue(mockItem);
            inventoryRepo.save.mockImplementation((entity) => Promise.resolve({
                ...mockItem,
                currentStock: 15,
                totalCost: 37.50
            }));
            const result = await service.updateInventoryStock('test-id', 5);
            expect(result.currentStock).toBe(15);
            expect(result.totalCost).toBe(37.50);
        });
        it('should record wastage and update inventory accordingly', async () => {
            const mockItem = {
                id: 'test-id',
                name: 'Test Ingredient',
                currentStock: 10,
                unit: 'kg',
                lowStockThreshold: 5,
                unitCost: 2.50,
                totalCost: 25.00,
                wastage: 0,
                wastageCost: 0,
                branch: mockBranch
            };
            inventoryRepo.findOne.mockResolvedValue(mockItem);
            inventoryRepo.save.mockImplementation((entity) => Promise.resolve({
                ...mockItem,
                wastage: 2,
                wastageCost: 5.00,
                currentStock: 8,
                totalCost: 20.00
            }));
            const result = await service.recordWastage('test-id', 2, 'Spoiled');
            expect(result.wastage).toBe(2);
            expect(result.wastageCost).toBe(5.00);
            expect(result.currentStock).toBe(8);
            expect(result.totalCost).toBe(20.00);
        });
        it('should check and notify low stock items', async () => {
            const mockItems = [
                { id: '1', name: 'Item 1', currentStock: 3, lowStockThreshold: 5, unitCost: 2.00, totalCost: 6.00, wastage: 0, wastageCost: 0, branch: mockBranch },
                { id: '2', name: 'Item 2', currentStock: 8, lowStockThreshold: 5, unitCost: 3.00, totalCost: 24.00, wastage: 0, wastageCost: 0, branch: mockBranch }
            ];
            inventoryRepo.find.mockResolvedValue(mockItems);
            const result = await service.checkAndNotifyLowStock('test-branch-id');
            expect(result.lowStockItems.length).toBe(1);
            expect(result.lowStockItems[0].id).toBe('1');
            expect(result.notificationsSent).toBe(1);
        });
    });
    describe('Enhanced Recipe Management', () => {
        it('should create a recipe with cost calculation fields', async () => {
            const dto = {
                name: 'Test Recipe',
                prepTimeMinutes: 10,
                cookTimeMinutes: 20,
                yieldQuantity: 4,
                yieldUnit: 'servings',
                servingsNumber: 4,
                ingredients: [{ inventoryItemId: 'test-ing', quantity: 2, unit: 'cups' }],
                instructions: ['Step 1', 'Step 2'],
                costPerServing: 2.50,
                totalCost: 10.00,
                branch: mockBranch
            };
            const result = await service.createRecipe(dto);
            expect(result).toEqual({ id: 'test-id', ...dto });
            expect(recipeRepo.create).toHaveBeenCalledWith(dto);
            expect(recipeRepo.save).toHaveBeenCalledWith(dto);
        });
    });
    describe('Enhanced SLA Monitoring', () => {
        it('should record average prep time SLA', async () => {
            const dto = {
                branch: { id: 'test-branch-id' },
                metricName: 'avg_prep_time',
                value: 25,
                unit: 'minutes',
                targetValue: 30,
                targetUnit: 'minutes',
                measurementPeriod: 'hourly',
                measuredAt: new Date()
            };
            slaRepo.create.mockImplementation((dto) => dto);
            slaRepo.save.mockImplementation((entity) => Promise.resolve({ id: 'test-id', ...entity }));
            const result = await service.recordAvgPrepTime('test-branch-id', 25);
            expect(result).toEqual({ id: 'test-id', ...dto });
        });
        it('should record late prep percentage SLA', async () => {
            const result = await service.recordLatePrepPercentage('test-branch-id', 3);
            expect(result.metricName).toBe('late_prep_percentage');
            expect(result.value).toBe(3);
            expect(result.unit).toBe('percentage');
            expect(result.targetValue).toBe(5);
        });
        it('should record food rejection rate SLA', async () => {
            const result = await service.recordFoodRejectionRate('test-branch-id', 1.5);
            expect(result.metricName).toBe('food_rejection_rate');
            expect(result.value).toBe(1.5);
            expect(result.unit).toBe('percentage');
            expect(result.targetValue).toBe(2);
        });
        it('should record kitchen throughput SLA', async () => {
            const result = await service.recordKitchenThroughput('test-branch-id', 45);
            expect(result.metricName).toBe('kitchen_throughput');
            expect(result.value).toBe(45);
            expect(result.unit).toBe('orders_per_hour');
            expect(result.targetValue).toBe(50);
        });
        it('should get SLA summary for a branch', async () => {
            const mockSLA = [
                {
                    id: '1',
                    metricName: 'avg_prep_time',
                    value: 25,
                    unit: 'minutes',
                    targetValue: 30,
                    targetUnit: 'minutes',
                    measurementPeriod: 'daily',
                    branch: mockBranch,
                    measuredAt: new Date()
                },
                {
                    id: '2',
                    metricName: 'late_prep_percentage',
                    value: 3,
                    unit: 'percentage',
                    targetValue: 5,
                    targetUnit: 'percentage',
                    measurementPeriod: 'daily',
                    branch: mockBranch,
                    measuredAt: new Date()
                }
            ];
            slaRepo.find.mockResolvedValue(mockSLA);
            const result = await service.getKitchenSLASummary('test-branch-id', 'daily');
            expect(result).toHaveProperty('avg_prep_time');
            expect(result.avg_prep_time.value).toBe(25);
            expect(result).toHaveProperty('late_prep_percentage');
            expect(result.late_prep_percentage.value).toBe(3);
        });
    });
    describe('Enhanced Consumption & Forecasting', () => {
        it('should get inventory consumption with actual data', async () => {
            const result = await service.getInventoryConsumption('test-branch-id', 7);
            expect(result).toHaveProperty('branchId', 'test-branch-id');
            expect(result).toHaveProperty('periodDays', 7);
            expect(Array.isArray(result.consumptionData)).toBe(true);
            expect(result.consumptionData.length).toBeGreaterThan(0);
            expect(result).toHaveProperty('totalConsumptionCost');
        });
        it('should forecast inventory needs with better algorithms', async () => {
            const result = await service.forecastInventoryNeeds('test-branch-id', 7);
            expect(result).toHaveProperty('branchId', 'test-branch-id');
            expect(result).toHaveProperty('forecastDays', 7);
            expect(Array.isArray(result.predictions)).toBe(true);
            expect(result.predictions.length).toBeGreaterThan(0);
            expect(result.predictions[0]).toHaveProperty('itemId');
            expect(result.predictions[0]).toHaveProperty('predictedConsumption');
            expect(result.predictions[0]).toHaveProperty('recommendedOrderQuantity');
        });
    });
});
//# sourceMappingURL=kitchen.service.spec.js.map