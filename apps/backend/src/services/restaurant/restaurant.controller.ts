import { Controller, Get, Query, Param, Put, Body, UseGuards } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { Roles } from '../../security/roles.decorator';
import { UserRole } from '../../shared/domain/user.interface';

@Controller('restaurants')
export class RestaurantController {
  constructor(private restaurantService: RestaurantService) {}

  @Get()
  async getAll() {
    return this.restaurantService.getAllRestaurants();
  }

  @Get('search')
  async search(@Query('q') query: string) {
    return this.restaurantService.searchRestaurants(query);
  }

  @Get('nearby')
  async getNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string
  ) {
    return this.restaurantService.findNearby(Number(lat), Number(lng), radius ? Number(radius) : undefined);
  }

  @Get(':slug')
  async getDetails(@Param('slug') slug: string) {
    return this.restaurantService.getRestaurantDetails(slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT, UserRole.ADMIN)
  @Put('branch/:id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { isOnline: boolean }
  ) {
    return this.restaurantService.updateBranchStatus(id, body.isOnline);
  }
}
