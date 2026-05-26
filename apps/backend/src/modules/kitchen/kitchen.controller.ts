import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { KitchenService } from './kitchen.service';
import { InventoryItemEntity } from '../../db/entities/inventory-item.entity';
import { RecipeEntity } from '../../db/entities/recipe.entity';
import { BatchEntity } from '../../db/entities/batch.entity';
import { FoodPrepEntity } from '../../db/entities/food-prep.entity';
import { KitchenSLAEntity } from '../../db/entities/kitchen-sla.entity';
import { SupplierEntity } from '../../db/entities/supplier.entity';

@Controller('kitchen')
export class KitchenController {
  constructor(private readonly kitchenService: KitchenService) {}

  // Inventory Management Endpoints
  @Post('inventory')
  async createInventoryItem(@Body() data: Partial<InventoryItemEntity>) {
    return this.kitchenService.createInventoryItem(data);
  }

  @Put('inventory/:id/stock')
  async updateInventoryStock(
    @Param('id') id: string,
    @Body('quantityChange') quantityChange: number
  ) {
    return this.kitchenService.updateInventoryStock(id, quantityChange);
  }

  @Get('inventory/low-stock/:branchId')
  async getLowStockItems(@Param('branchId') branchId: string) {
    return this.kitchenService.getLowStockItems(branchId);
  }

  // Recipe Management Endpoints
  @Post('recipes')
  async createRecipe(@Body() data: Partial<RecipeEntity>) {
    return this.kitchenService.createRecipe(data);
  }

  @Get('recipes/:id')
  async getRecipeById(@Param('id') id: string) {
    return this.kitchenService.getRecipeById(id);
  }

  // Batch Management Endpoints
  @Post('batches')
  async createBatch(@Body() data: Partial<BatchEntity>) {
    return this.kitchenService.createBatch(data);
  }

  @Put('batches/:id/status')
  async updateBatchStatus(
    @Param('id') id: string,
    @Body('status') status: BatchEntity['status']
  ) {
    return this.kitchenService.updateBatchStatus(id, status);
  }

  // Food Preparation Endpoints
  @Post('food-prep')
  async logFoodPrep(@Body() data: Partial<FoodPrepEntity>) {
    return this.kitchenService.logFoodPrep(data);
  }

  @Put('food-prep/:id/quality')
  async updateFoodPrepQuality(
    @Param('id') id: string,
    @Body() qualityData: Partial<FoodPrepEntity['qualityCheck']>
  ) {
    return this.kitchenService.updateFoodPrepQuality(id, qualityData);
  }

  // SLA Monitoring Endpoints
  @Post('sla')
  async recordKitchenSLA(@Body() data: Partial<KitchenSLAEntity>) {
    return this.kitchenService.recordKitchenSLA(data);
  }

  @Get('sla/branch/:branchId')
  async getKitchenSLABranch(
    @Param('branchId') branchId: string,
    @Query('metricName') metricName?: string,
    @Query('limit') limit: number = 100
  ) {
    return this.kitchenService.getKitchenSLABranch(branchId, metricName, limit);
  }

  // Supplier Management Endpoints
  @Post('suppliers')
  async createSupplier(@Body() data: Partial<SupplierEntity>) {
    return this.kitchenService.createSupplier(data);
  }

  @Get('suppliers/:id/inventory')
  async getSupplierInventory(@Param('id') supplierId: string) {
    return this.kitchenService.getSupplierInventory(supplierId);
  }

  // Consumption & Forecasting Endpoints
  @Get('inventory/consumption/:branchId')
  async getInventoryConsumption(
    @Param('branchId') branchId: string,
    @Query('days') days: number = 7
  ) {
    return this.kitchenService.getInventoryConsumption(branchId, days);
  }

  @Get('inventory/forecast/:branchId')
  async forecastInventoryNeeds(
    @Param('branchId') branchId: string,
    @Query('daysAhead') daysAhead: number = 7
  ) {
    return this.kitchenService.forecastInventoryNeeds(branchId, daysAhead);
  }
}