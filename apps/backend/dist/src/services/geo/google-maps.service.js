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
var GoogleMapsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleMapsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let GoogleMapsService = GoogleMapsService_1 = class GoogleMapsService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(GoogleMapsService_1.name);
        this.baseUrl = 'https://maps.googleapis.com/maps/api';
        this.apiKey = this.configService.get('GOOGLE_MAPS_API_KEY') || '';
    }
    async fetchFromGoogle(endpoint, params) {
        if (!this.apiKey) {
            this.logger.warn('Google Maps API key not configured, returning simulated data');
            return null;
        }
        const url = new URL(`${this.baseUrl}/${endpoint}`);
        url.searchParams.set('key', this.apiKey);
        for (const [key, value] of Object.entries(params)) {
            url.searchParams.set(key, value);
        }
        try {
            const response = await fetch(url.toString(), { method: 'GET' });
            if (!response.ok) {
                throw new Error(`Google Maps API error: ${response.status}`);
            }
            return response.json();
        }
        catch (error) {
            this.logger.error(`Google Maps API request failed:`, error);
            return null;
        }
    }
    async getDirections(origin, destination, waypoints = []) {
        const params = {
            origin: `${origin.lat},${origin.lng}`,
            destination: `${destination.lat},${destination.lng}`,
            mode: 'driving',
        };
        if (waypoints.length > 0) {
            params.waypoints = waypoints.map(wp => `${wp.lat},${wp.lng}`).join('|');
        }
        return this.fetchFromGoogle('directions/json', params);
    }
    async getDistanceMatrix(origins, destinations, mode = 'driving') {
        const params = {
            origins: origins.map(o => `${o.lat},${o.lng}`).join('|'),
            destinations: destinations.map(d => `${d.lat},${d.lng}`).join('|'),
            mode,
            departure_time: 'now',
        };
        return this.fetchFromGoogle('distancematrix/json', params);
    }
    async getTrafficConditions(start, end) {
        const matrix = await this.getDistanceMatrix([start], [end]);
        if (!matrix?.rows?.[0]?.elements?.[0]) {
            return this.simulateTraffic(start, end);
        }
        const element = matrix.rows[0].elements[0];
        const duration = element.duration.value / 60;
        const durationInTraffic = element.duration_in_traffic?.value / 60 || duration;
        const delayMinutes = Math.max(0, durationInTraffic - duration);
        const distanceKm = element.distance.value / 1000;
        let congestionLevel = 'low';
        if (delayMinutes > 15)
            congestionLevel = 'severe';
        else if (delayMinutes > 10)
            congestionLevel = 'high';
        else if (delayMinutes > 5)
            congestionLevel = 'medium';
        return [{
                segment: { start, end },
                congestionLevel,
                speedKmh: distanceKm / (durationInTraffic / 60) || 30,
                delayMinutes,
            }];
    }
    async calculateETAWithLiveTraffic(origin, destination, driverSpeedKmh) {
        const matrix = await this.getDistanceMatrix([origin], [destination]);
        if (!matrix?.rows?.[0]?.elements?.[0]) {
            return this.simulateETA(origin, destination, driverSpeedKmh);
        }
        const element = matrix.rows[0].elements[0];
        const distanceKm = element.distance.value / 1000;
        const durationMinutes = element.duration.value / 60;
        const durationInTraffic = element.duration_in_traffic?.value / 60 || durationMinutes;
        const delayMinutes = Math.max(0, durationInTraffic - durationMinutes);
        let congestionLevel = 'low';
        if (delayMinutes > 10)
            congestionLevel = 'high';
        else if (delayMinutes > 5)
            congestionLevel = 'medium';
        const trafficConditions = [{
                segment: { start: origin, end: destination },
                congestionLevel,
                speedKmh: element.speed?.value || driverSpeedKmh || 30,
                delayMinutes,
            }];
        const buffer = durationInTraffic * 0.2;
        const etaMinutes = Math.ceil(durationInTraffic + buffer);
        return {
            etaMinutes,
            distanceKm,
            durationMinutes: Math.ceil(durationInTraffic),
            trafficConditions,
        };
    }
    async checkRouteDeviation(expectedPath, actualPath, thresholdKm = 0.5) {
        if (!expectedPath || expectedPath.length < 2 || !actualPath || actualPath.length < 2) {
            return {
                isDeviation: false,
                deviationDistanceKm: 0,
                expectedRouteDistanceKm: 0,
                actualRouteDistanceKm: 0,
                severity: 'low',
            };
        }
        const expectedDistance = this.calculatePathDistance(expectedPath);
        let actualDistance = 0;
        const deviations = [];
        for (const actualPoint of actualPath) {
            let minDistance = Infinity;
            for (const expectedPoint of expectedPath) {
                const distance = this.haversineDistance(actualPoint, expectedPoint);
                minDistance = Math.min(minDistance, distance);
            }
            if (minDistance > thresholdKm) {
                deviations.push(minDistance);
            }
            if (actualPath.indexOf(actualPoint) > 0) {
                actualDistance += this.haversineDistance(actualPath[actualPath.indexOf(actualPoint) - 1], actualPoint);
            }
        }
        const totalDeviation = deviations.reduce((sum, d) => sum + d, 0);
        const isDeviation = totalDeviation > thresholdKm;
        let severity = 'low';
        if (totalDeviation > 2)
            severity = 'high';
        else if (totalDeviation > 1)
            severity = 'medium';
        return {
            isDeviation,
            deviationDistanceKm: totalDeviation,
            expectedRouteDistanceKm: expectedDistance,
            actualRouteDistanceKm: actualDistance,
            severity,
        };
    }
    async rerouteDriver(currentLocation, destination, waypoints = []) {
        const directions = await this.getDirections(currentLocation, destination, waypoints);
        if (!directions?.routes?.[0]) {
            return {
                success: true,
                routes: [{
                        overview_polyline: { points: '' },
                        legs: [{
                                distance: { value: 0, text: '0 km' },
                                duration: { value: 0, text: '0 mins' },
                            }],
                    }],
                status: 'OK',
            };
        }
        return directions;
    }
    haversineDistance(point1, point2) {
        const R = 6371;
        const dLat = this.toRadians(point2.lat - point1.lat);
        const dLng = this.toRadians(point2.lng - point1.lng);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(point1.lat)) * Math.cos(this.toRadians(point2.lat)) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    calculatePathDistance(points) {
        let total = 0;
        for (let i = 0; i < points.length - 1; i++) {
            total += this.haversineDistance(points[i], points[i + 1]);
        }
        return total;
    }
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    simulateTraffic(start, end) {
        const distance = this.haversineDistance(start, end);
        if (distance > 10) {
            return [{
                    segment: { start, end },
                    congestionLevel: 'medium',
                    speedKmh: 25,
                    delayMinutes: Math.ceil(distance / 5),
                }];
        }
        return [];
    }
    simulateETA(start, end, driverSpeedKmh) {
        const distanceKm = this.haversineDistance(start, end);
        const speed = driverSpeedKmh || 30;
        const durationMinutes = Math.ceil((distanceKm / speed) * 60);
        const buffer = durationMinutes * 0.2;
        return {
            etaMinutes: Math.ceil(durationMinutes + buffer),
            distanceKm,
            durationMinutes,
            trafficConditions: this.simulateTraffic(start, end),
        };
    }
};
exports.GoogleMapsService = GoogleMapsService;
exports.GoogleMapsService = GoogleMapsService = GoogleMapsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GoogleMapsService);
//# sourceMappingURL=google-maps.service.js.map