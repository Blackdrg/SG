export declare class SurgeZoneEntity {
    id: string;
    name: string;
    polygon: {
        lat: number;
        lng: number;
    }[];
    multiplier: number;
    isActive: boolean;
    startTime: string;
    endTime: string;
    createdAt: Date;
    updatedAt: Date;
}
