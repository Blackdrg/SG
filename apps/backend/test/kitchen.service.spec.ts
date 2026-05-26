import { Test, TestingModule } from '@nestjs/testing';
import { KitchenService } from '../src/modules/kitchen/kitchen.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InventoryItemEntity } from '../src/db/entities/inventory-item.entity';
import { RecipeEntity } from '../src/db/entities/recipe.entity';
import { BatchEntity } from '../src/db/entities/batch.entity';
import { FoodPrepEntity } from '../src/db/entities/food-prep.entity';
import { KitchenSLAEntity } from '../src/db/entities/kitchen-sla.entity';
import { SupplierEntity } from '../src/db/entities/supplier.entity';
import { RestaurantBranchEntity } from '../src/db/entities/restaurant-branch.entity';
import { DataSource, Repository } from 'typeorm';

describe('KitchenService', () => {
  let service: KitchenService;
  let inventoryRepo: Repository<InventoryItemEntity>;
  let recipeRepo: Repository<RecipeEntity>;
  let batchRepo: Repository<BatchEntity>;
  let foodPrepRepo: Repository<FoodPrepEntity>;
  let slaRepo: Repository<KitchenSLAEntity>;
  let supplierRepo: Repository<SupplierEntity>;
  let branchRepo: Repository<RestaurantBranchEntity>;
  let dataSource: DataSource;

  const mockBranch = {
    id: 'test-branch-id',
    name: 'Test Branch',
    address: { city: 'Test City' }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<KitchenService>(KitchenService);
    inventoryRepo = module.get<Repository<InventoryItemEntity>>(getRepositoryToken(InventoryItemEntity));
    recipeRepo = module.get<Repository<RecipeEntity>>(getRepositoryToken(RecipeEntity));
    batchRepo = module.get<Repository<BatchEntity>>(getRepositoryToken(BatchEntity));
    foodPrepRepo = module.get<Repository<FoodPrepEntity>>(getRepositoryToken(FoodPrepEntity));
    slaRepo = module.get<Repository<KitchenSLAEntity>>(getRepositoryToken(KitchenSLAEntity));
    supplierRepo = module.get<Repository<SupplierEntity>>(getRepositoryToken(SupplierEntity));
    branchRepo = module.get<Repository<RestaurantBranchEntity>>(getRepositoryToken(RestaurantBranchEntity));
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Inventory Management', () => {
    it('should create an inventory item', async () => {
      const dto = {
        name: 'Test Ingredient',
        currentStock: 10,
        unit: 'kg',
        lowStockThreshold: 5,
        branch: mockBranch
      };

      const result = await service.createInventoryItem(dto);
      expect(result).toEqual({ id: 'test-id', ...dto });
      expect(inventoryRepo.create).toHaveBeenCalledWith(dto);
      expect(inventoryRepo.save).toHaveBeenCalledWith(dto);
    });

    it('should update inventory stock', async () => {
      const mockItem = {
        id: 'test-id',
        currentStock: 10,
        lowStockThreshold: 5,
        branch: mockBranch
      };

      inventoryRepo.findOne.mockResolvedValue(mockItem);
      inventoryRepo.save.mockResolvedValue({ ...mockItem, currentStock: 15 });

      const result = await service.updateInventoryStock('test-id', 5);
      expect(result.currentStock).toBe(15);
    });

    it('should get low stock items', async () => {
      const mockItems = [
        { id: '1', name: 'Item 1', currentStock: 3, lowStockThreshold: 5, branch: mockBranch },
        { id: '2', name: 'Item 2', currentStock: 8, lowStockThreshold: 5, branch: mockBranch }
      ];

      inventoryRepo.find.mockResolvedValue(mockItems);
      
      const result = await service.getLowStockItems('test-branch-id');
      expect(result.length).toBe(1); // Only item with stock < threshold
      expect(result[0].id).toBe('1');
    });
  });

  describe('Recipe Management', () => {
    it('should create a recipe', async () => {
      const dto = {
        name: 'Test Recipe',
        prepTimeMinutes: 10,
        cookTimeMinutes: 20,
        yieldQuantity: 4,
        yieldUnit: 'servings',
        servingsNumber: 4,
        ingredients: [{ inventoryItemId: 'test-ing', quantity: 2, unit: 'cups' }],
        instructions: ['Step 1', 'Step 2'],
        branch: mockBranch
      };

      const result = await service.createRecipe(dto);
      expect(result).toEqual({ id: 'test-id', ...dto });
      expect(recipeRepo.create).toHaveBeenCalledWith(dto);
      expect(recipeRepo.save).toHaveBeenCalledWith(dto);
    });

    it('should get recipe by id', async () => {
      const mockRecipe = {
        id: 'test-id',
        name: 'Test Recipe',
        prepTimeMinutes: 10,
        cookTimeMinutes: 20,
        branch: mockBranch
      };

      recipeRepo.findOne.mockResolvedValue(mockRecipe);
      const result = await service.getRecipeById('test-id');
      expect(result).toEqual(mockRecipe);
    });
  });

  describe('Batch Management', () => {
    it('should create a batch', async () => {
      const mockRecipe = { id: 'test-recipe-id', name: 'Test Recipe' };
      const dto = {
        name: 'Morning Batch',
        recipe: mockRecipe,
        quantityPrepared: 10,
        quantityUnit: 'kg',
        branch: mockBranch
      };

      batchRepo.findOne.mockResolvedValue(mockRecipe);
      batchRepo.create.mockImplementation((dto) => dto);
      batchRepo.save.mockImplementation((entity) => Promise.resolve({ id: 'test-id', ...entity }));

      const result = await service.createBatch(dto);
      expect(result).toEqual({ id: 'test-id', ...dto });
    });

    it('should update batch status', async () => {
      const mockBatch = {
        id: 'test-id',
        status: 'preparing',
        branch: mockBranch
      };

      batchRepo.findOne.mockResolvedValue(mockBatch);
      batchRepo.save.mockResolvedValue({ ...mockBatch, status: 'ready', completedAt: new Date() });

      const result = await service.updateBatchStatus('test-id', 'ready');
      expect(result.status).toBe('ready');
      expect(result.completedAt).toBeDefined();
    });
  });

  describe('Food Preparation Tracking', () => {
    it('should log food prep', async () => {
      const mockBatch = { id: 'test-batch-id' };
      const dto = {
        batch: mockBatch,
        staffId: 'staff-123',
        status: 'completed',
        branch: mockBranch
      };

      foodPrepRepo.create.mockImplementation((dto) => dto);
      foodPrepRepo.save.mockImplementation((entity) => Promise.resolve({ id: 'test-id', ...entity }));

      const result = await service.logFoodPrep(dto);
      expect(result).toEqual({ id: 'test-id', ...dto });
    });

    it('should update food prep quality', async () => {
      const mockFoodPrep = {
        id: 'test-id',
        qualityCheck: { taste: 0, temperature: 0, appearance: 0, passed: false },
        branch: mockBranch
      };

      foodPrepRepo.findOne.mockResolvedValue(mockFoodPrep);
      foodPrepRepo.save.mockResolvedValue({ 
        ...mockFoodPrep, 
        qualityCheck: { taste: 4, temperature: 65, appearance: 5, passed: true } 
      });

      const result = await service.updateFoodPrepQuality('test-id', { 
        taste: 4, temperature: 65, appearance: 5, passed: true 
      });
      expect(result.qualityCheck.taste).toBe(4);
      expect(result.qualityCheck.passed).toBe(true);
    });
  });

  describe('SLA Monitoring', () => {
    it('should record kitchen SLA', async () => {
      const dto = {
        metricName: 'prep_delay',
        value: 15,
        unit: 'minutes',
        targetValue: 10,
        targetUnit: 'minutes',
        measurementPeriod: 'hourly',
        measuredAt: new Date(),
        branch: mockBranch
      };

      slaRepo.create.mockImplementation((dto) => dto);
      slaRepo.save.mockImplementation((entity) => Promise.resolve({ id: 'test-id', ...entity }));

      const result = await service.recordKitchenSLA(dto);
      expect(result).toEqual({ id: 'test-id', ...dto });
    });

    it('should get kitchen SLA by branch', async () => {
      const mockSLA = [
        { id: '1', metricName: 'prep_delay', value: 15, unit: 'minutes', branch: mockBranch, measuredAt: new Date() },
        { id: '2', metricName: 'food_wastage', value: 2, unit: 'kg', branch: mockBranch, measuredAt: new Date() }
      ];

      slaRepo.find.mockResolvedValue(mockSLA);
      const result = await service.getKitchenSLABranch('test-branch-id');
      expect(result.length).toBe(2);
    });
  });

  describe('Supplier Management', () => {
    it('should create a supplier', async () => {
      const dto = {
        name: 'Test Supplier',
        contactEmail: 'test@supplier.com',
        branch: mockBranch
      };

      supplierRepo.create.mockImplementation((dto) => dto);
      supplierRepo.save.mockImplementation((entity) => Promise.resolve({ id: 'test-id', ...entity }));

      const result = await service.createSupplier(dto);
      expect(result).toEqual({ id: 'test-id', ...dto });
    });

    it('should get supplier inventory', async () => {
      const mockItems = [
        { id: '1', name: 'Ingredient 1', supplier: { id: 'test-supplier-id' } },
        { id: '2', name: 'Ingredient 2', supplier: { id: 'test-supplier-id' } }
      ];

      inventoryRepo.find.mockResolvedValue(mockItems);
      const result = await service.getSupplierInventory('test-supplier-id');
      expect(result.length).toBe(2);
    });
  });

  describe('Consumption & Forecasting', () => {
    it('should get inventory consumption', async () => {
      const result = await service.getInventoryConsumption('test-branch-id', 7);
      expect(result).toHaveProperty('branchId', 'test-branch-id');
      expect(result).toHaveProperty('periodDays', 7);
      expect(Array.isArray(result.consumptionData)).toBe(true);
    });

    it('should forecast inventory needs', async () => {
      const result = await service.forecastInventoryNeeds('test-branch-id', 7);
      expect(result).toHaveProperty('branchId', 'test-branch-id');
      expect(result).toHaveProperty('forecastDays', 7);
      expect(Array.isArray(result.predictions)).toBe(true);
    });
  });
});