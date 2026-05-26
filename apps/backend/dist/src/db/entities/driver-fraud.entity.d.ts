import { DriverEntity } from './driver.entity';
import { OrderEntity } from './order.entity';
import { RestaurantBranchEntity } from './restaurant-branch.entity';
export declare class DriverFraudEntity {
    id: string;
    driver: DriverEntity;
    order: OrderEntity;
    branch: RestaurantBranchEntity;
    fraudType: 'gps_spoofing' | 'fake_delivery' | 'late_delivery_abuse' | 'route_deviation' | 'other';
    evidence: {
        gpsData?: Array<{
            lat: number;
            lng: number;
            timestamp: Date;
            accuracy: number;
        }>;
        timestamps?: {
            expected: Date;
            actual: Date;
        };
        routeDeviation?: {
            expectedRoute: Array<{
                lat: number;
                lng: number;
            }>;
            actualRoute: Array<{
                lat: number;
                lng: number;
            }>;
        };
        witnessStatements?: string[];
        photos?: string[];
        notes?: string;
    };
    severity: 'low' | 'medium' | 'high';
    isResolved: boolean;
    resolvedAt: Date;
    resolvedBy: string;
    resolutionNotes: string;
    createdAt: Date;
    updatedAt: Date;
}
