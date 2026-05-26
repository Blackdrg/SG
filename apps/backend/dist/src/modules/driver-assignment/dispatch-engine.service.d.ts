import { Repository, DataSource } from 'typeorm';
import { DriverEntity } from '../../db/entities/driver.entity';
import { OrderEntity } from '../../db/entities/order.entity';
import { DriverAssignmentEntity } from '../../db/entities/driver-assignment.entity';
import { RestaurantBranchEntity } from '../../db/entities/restaurant-branch.entity';
import { DriverScoreEntity } from '../../db/entities/driver-score.entity';
import { DeliverySLAEntity } from '../../db/entities/delivery-sla.entity';
import { DriverFraudEntity } from '../../db/entities/driver-fraud.entity';
export declare class DispatchEngineService {
    private readonly driverRepo;
    private readonly orderRepo;
    private readonly assignmentRepo;
    private readonly branchRepo;
    private readonly scoreRepo;
    private readonly slaRepo;
    private readonly fraudRepo;
    private readonly dataSource;
    constructor(driverRepo: Repository<DriverEntity>, orderRepo: Repository<OrderEntity>, assignmentRepo: Repository<DriverAssignmentEntity>, branchRepo: Repository<RestaurantBranchEntity>, scoreRepo: Repository<DriverScoreEntity>, slaRepo: Repository<DeliverySLAEntity>, fraudRepo: Repository<DriverFraudEntity>, dataSource: DataSource);
    dispatchOrder(orderId: string): Promise<DriverAssignmentEntity>;
    private findOptimalDrivers;
    private selectBestDriver;
    private calculateDriverScore;
    private createAssignment;
    assignBatchDelivery(orderIds: string[], driverId: string): Promise<DriverAssignmentEntity[]>;
    reassignOrder(assignmentId: string, newDriverId: string, reason: string): Promise<DriverAssignmentEntity>;
}
