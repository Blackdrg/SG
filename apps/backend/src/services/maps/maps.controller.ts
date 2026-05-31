import { Controller, Get, Post, Query, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { MapsService, ETAResponse, RerouteResponse, HeatmapPoint } from './maps.service';
import { SurgeZoneEntity } from '../../db/entities/surge-zone.entity';

@Controller('maps')
export class MapsController {
  constructor(private readonly mapsService: MapsService) {}

  @Get('eta')
  async getETA(
    @Query('originLat') originLat: string,
    @Query('originLng') originLng: string,
    @Query('destLat') destLat: string,
    @Query('destLng') destLng: string
  ): Promise<ETAResponse> {
    const origin = { lat: Number(originLat), lng: Number(originLng) };
    const destination = { lat: Number(destLat), lng: Number(destLng) };
    return this.mapsService.calculateETA(origin, destination);
  }

  @Get('surge-eta')
  async getSurgeETA(
    @Query('originLat') originLat: string,
    @Query('originLng') originLng: string,
    @Query('destLat') destLat: string,
    @Query('destLng') destLng: string
  ): Promise<ETAResponse> {
    const origin = { lat: Number(originLat), lng: Number(originLng) };
    const destination = { lat: Number(destLat), lng: Number(destLng) };
    return this.mapsService.calculateSurgeETA(origin, destination);
  }

  @Post('reroute')
  async getRerouting(
    @Body() body: {
      origin: { lat: number; lng: number };
      destination: { lat: number; lng: number };
      waypoints?: { lat: number; lng: number }[];
    }
  ): Promise<RerouteResponse> {
    return this.mapsService.getReroutingOptions(body.origin, body.destination, body.waypoints);
  }

  @Get('heatmap')
  async getHeatmap(
    @Query('north') north: string,
    @Query('south') south: string,
    @Query('east') east: string,
    @Query('west') west: string,
    @Query('zoom') zoom?: string
  ): Promise<HeatmapPoint[]> {
    return this.mapsService.getHeatmapData({
      north: Number(north),
      south: Number(south),
      east: Number(east),
      west: Number(west),
    }, zoom ? Number(zoom) : 12);
  }

  @Get('surge-zones')
  async getSurgeZones(): Promise<SurgeZoneEntity[]> {
    return this.mapsService.getSurgeZones();
  }

  @Get('check-surge-zone')
  async checkSurgeZone(
    @Query('lat') lat: string,
    @Query('lng') lng: string
  ): Promise<{ inSurgeZone: boolean; multiplier?: number; zoneName?: string }> {
    return this.mapsService.isAddressInSurgeZone(Number(lat), Number(lng));
  }
}
