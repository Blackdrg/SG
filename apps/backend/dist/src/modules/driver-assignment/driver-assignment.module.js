"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverAssignmentModule = void 0;
const common_1 = require("@nestjs/common");
const driver_assignment_service_1 = require("./driver-assignment.service");
const driver_assignment_controller_1 = require("./driver-assignment.controller");
const dispatch_engine_service_1 = require("./dispatch-engine.service");
const eta_intelligence_service_1 = require("./eta-intelligence.service");
const db_module_1 = require("../../db/db.module");
let DriverAssignmentModule = class DriverAssignmentModule {
};
exports.DriverAssignmentModule = DriverAssignmentModule;
exports.DriverAssignmentModule = DriverAssignmentModule = __decorate([
    (0, common_1.Module)({
        imports: [db_module_1.DbModule],
        controllers: [driver_assignment_controller_1.DriverAssignmentController],
        providers: [
            driver_assignment_service_1.DriverAssignmentService,
            dispatch_engine_service_1.DispatchEngineService,
            eta_intelligence_service_1.ETAIntelligenceService
        ],
    })
], DriverAssignmentModule);
//# sourceMappingURL=driver-assignment.module.js.map