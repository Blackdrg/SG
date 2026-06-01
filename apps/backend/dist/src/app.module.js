"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const db_module_1 = require("./db/db.module");
const security_module_1 = require("./security/security.module");
const logging_module_1 = require("./logging/logging.module");
const queue_module_1 = require("./infra/queue/queue.module");
const tracking_module_1 = require("./infra/tracking/tracking.module");
const auth_module_1 = require("./services/auth/auth.module");
const order_module_1 = require("./services/order/order.module");
const payments_module_1 = require("./services/payments/payments.module");
const restaurant_module_1 = require("./services/restaurant/restaurant.module");
const search_module_1 = require("./services/search/search.module");
const delivery_module_1 = require("./services/delivery/delivery.module");
const driver_ops_module_1 = require("./services/delivery/driver-ops.module");
const admin_module_1 = require("./services/admin/admin.module");
const notification_module_1 = require("./services/notifications/notification.module");
const kitchen_module_1 = require("./modules/kitchen/kitchen.module");
const driver_assignment_module_1 = require("./modules/driver-assignment/driver-assignment.module");
const metrics_module_1 = require("./metrics/metrics.module");
const compliance_module_1 = require("./compliance/compliance.module");
const audit_module_1 = require("./audit/audit.module");
const wallet_module_1 = require("./services/wallet/wallet.module");
const gst_module_1 = require("./services/gst/gst.module");
const finance_module_1 = require("./services/finance/finance.module");
const support_module_1 = require("./services/support/support.module");
const refund_module_1 = require("./services/refund/refund.module");
const loyalty_module_1 = require("./services/loyalty/loyalty.module");
const driver_fleet_module_1 = require("./services/driver-fleet/driver-fleet.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
            }),
            db_module_1.DbModule,
            security_module_1.SecurityModule,
            logging_module_1.LoggingModule,
            queue_module_1.QueueModule,
            tracking_module_1.TrackingModule,
            auth_module_1.AuthServiceModule,
            order_module_1.OrderServiceModule,
            payments_module_1.PaymentServiceModule,
            restaurant_module_1.RestaurantServiceModule,
            search_module_1.SearchServiceModule,
            delivery_module_1.DeliveryServiceModule,
            driver_ops_module_1.DriverOpsModule,
            admin_module_1.AdminServiceModule,
            notification_module_1.NotificationModule,
            kitchen_module_1.KitchenModule,
            driver_assignment_module_1.DriverAssignmentModule,
            metrics_module_1.MetricsModule,
            compliance_module_1.ComplianceModule,
            audit_module_1.AuditModule,
            wallet_module_1.WalletModule,
            gst_module_1.GSTModule,
            finance_module_1.FinanceModule,
            support_module_1.SupportModule,
            refund_module_1.RefundModule,
            loyalty_module_1.LoyaltyModule,
            driver_fleet_module_1.DriverFleetModule,
            analytics_module_1.AnalyticsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map