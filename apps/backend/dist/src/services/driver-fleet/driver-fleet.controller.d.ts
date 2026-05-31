import { DriverFleetService } from './driver-fleet.service';
export declare class DriverFleetController {
    private readonly fleetService;
    constructor(fleetService: DriverFleetService);
    startShift(driverId: string): Promise<import("../../db/entities/driver-shift.entity").DriverShiftEntity>;
    endShift(driverId: string, shiftId: string): Promise<import("../../db/entities/driver-shift.entity").DriverShiftEntity>;
    getShifts(driverId: string): Promise<import("../../db/entities/driver-shift.entity").DriverShiftEntity[]>;
    getEarnings(body: {
        driverId: string;
        start: string;
        end: string;
    }): Promise<any>;
    calculateIncentives(driverId: string): Promise<any>;
    issuePenalty(body: any): Promise<import("../../db/entities/driver-penalty.entity").DriverPenaltyEntity>;
    getPerformance(driverId?: string): Promise<any>;
    getSchedule(driverId: string): Promise<any>;
    approvePenalty(id: string, approvedBy: string): Promise<import("../../db/entities/driver-penalty.entity").DriverPenaltyEntity>;
    waivePenalty(id: string, body: {
        waivedBy: string;
        reason: string;
    }): Promise<import("../../db/entities/driver-penalty.entity").DriverPenaltyEntity>;
}
