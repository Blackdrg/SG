"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverFleetModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const driver_fleet_service_1 = require("./driver-fleet.service");
const driver_fleet_controller_1 = require("./driver-fleet.controller");
const driver_entity_1 = require("../../db/entities/driver.entity");
const driver_shift_entity_1 = require("../../db/entities/driver-shift.entity");
const driver_score_entity_1 = require("../../db/entities/driver-score.entity");
const driver_penalty_entity_1 = require("../../db/entities/driver-penalty.entity");
const driver_incentive_entity_1 = require("../../db/entities/driver-incentive.entity");
const order_entity_1 = require("../../db/entities/order.entity");
const driver_assignment_entity_1 = require("../../db/entities/driver-assignment.entity");
let DriverFleetModule = class DriverFleetModule {
};
exports.DriverFleetModule = DriverFleetModule;
exports.DriverFleetModule = DriverFleetModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                driver_entity_1.DriverEntity,
                driver_shift_entity_1.DriverShiftEntity,
                driver_score_entity_1.DriverScoreEntity,
                driver_penalty_entity_1.DriverPenaltyEntity,
                driver_incentive_entity_1.DriverIncentiveEntity,
                order_entity_1.OrderEntity,
                driver_assignment_entity_1.DriverAssignmentEntity,
            ]),
        ],
        providers: [driver_fleet_service_1.DriverFleetService],
        controllers: [driver_fleet_controller_1.DriverFleetController],
        exports: [driver_fleet_service_1.DriverFleetService],
    })
], DriverFleetModule);
//# sourceMappingURL=driver-fleet.module.js.map