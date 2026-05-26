import { UserEntity } from './user.entity';
export declare class DriverEntity {
    id: string;
    userId: string;
    user: UserEntity;
    licenseNumber: string;
    vehicleNumber: string;
    vehicleType: string;
    kycStatus: string;
    isOnline: boolean;
    rating: number;
    currentLocation: {
        lat: number;
        lng: number;
    };
    totalDeliveries: number;
    totalDistance: number;
    averageSpeed: number;
    fraudScore: number;
    isFraudSuspicious: boolean;
    lastFraudCheck: Date;
    fraudFlags: {
        gpsSpoofingRisk: number;
        routeDeviationRisk: number;
        timingAbuseRisk: number;
        fakeDeliveryRisk: number;
    };
    createdAt: Date;
    updatedAt: Date;
}
