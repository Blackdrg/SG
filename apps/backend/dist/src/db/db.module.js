"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const mongoose_1 = require("@nestjs/mongoose");
const config_1 = require("@nestjs/config");
const user_entity_1 = require("./entities/user.entity");
const order_entity_1 = require("./entities/order.entity");
const session_entity_1 = require("./entities/session.entity");
const audit_log_entity_1 = require("./entities/audit-log.entity");
const restaurant_entity_1 = require("./entities/restaurant.entity");
const restaurant_branch_entity_1 = require("./entities/restaurant-branch.entity");
const module_1 = require();
const module_2 = require();
const module_3 = require();
const module_4 = require();
const module_5 = require();
const module_6 = require();
const module_7 = require();
const module_8 = require();
const module_9 = require();
const module_10 = require();
const module_11 = require();
const module_12 = require();
const module_13 = require();
const module_14 = require();
const module_15 = require();
const module_16 = require();
const module_17 = require();
const module_18 = require();
const module_19 = require();
const module_20 = require();
const module_21 = require();
const module_22 = require();
const module_23 = require();
const module_24 = require();
const module_25 = require();
const module_26 = require();
const module_27 = require();
let DbModule = class DbModule {
};
exports.DbModule = DbModule;
exports.DbModule = DbModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: "postgres",
                    host: configService.get("DB_HOST", "localhost"),
                    port: configService.get("DB_PORT", 5432),
                    username: configService.get("DB_USER", "postgres"),
                    password: configService.get("DB_PASS", "postgres"),
                    database: configService.get("DB_NAME", "spicegarden"),
                    entities: [
                        user_entity_1.UserEntity,
                        order_entity_1.OrderEntity,
                        session_entity_1.SessionEntity,
                        audit_log_entity_1.AuditLogEntity,
                        restaurant_entity_1.RestaurantEntity,
                        restaurant_branch_entity_1.RestaurantBranchEntity,
                        module_1.MenuCategoryEntity,
                        module_2.MenuItemEntity,
                        module_3.InventoryItemEntity,
                        module_4.DriverEntity,
                        module_5.WalletEntity,
                        module_6.WalletTransactionEntity,
                        module_7.AddressEntity,
                        module_8.MenuVariantEntity,
                        module_9.MenuAddonEntity,
                        module_10.OrderItemEntity,
                        module_11.SubscriptionEntity,
                        module_12.OtpEntity,
                        module_13.DeviceFingerprintEntity,
                        module_14.RecipeEntity,
                        module_15.BatchEntity,
                        module_16.FoodPrepEntity,
                        module_17.KitchenSLAEntity,
                        module_18.SupplierEntity,
                        module_19.DriverAssignmentEntity,
                        module_20.DriverScoreEntity,
                        module_21.DeliverySLAEntity,
                        module_22.DriverFraudEntity,
                        module_27.StripeWebhookEntity,
                    ],
                    synchronize: true,
                }),
                inject: [config_1.ConfigService],
            }),
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    uri: configService.get("MONGO_URI", "mongodb://localhost:27017/spicegarden"),
                }),
                inject: [config_1.ConfigService],
            }),
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.UserEntity,
                order_entity_1.OrderEntity,
                session_entity_1.SessionEntity,
                audit_log_entity_1.AuditLogEntity,
                restaurant_entity_1.RestaurantEntity,
                restaurant_branch_entity_1.RestaurantBranchEntity,
                module_1.MenuCategoryEntity,
                module_2.MenuItemEntity,
                module_3.InventoryItemEntity,
                module_4.DriverEntity,
                module_5.WalletEntity,
                module_6.WalletTransactionEntity,
                module_7.AddressEntity,
                module_8.MenuVariantEntity,
                module_9.MenuAddonEntity,
                module_10.OrderItemEntity,
                module_11.SubscriptionEntity,
                module_12.OtpEntity,
                module_13.DeviceFingerprintEntity,
                module_14.RecipeEntity,
                module_15.BatchEntity,
                module_16.FoodPrepEntity,
                module_17.KitchenSLAEntity,
                module_18.SupplierEntity,
                module_19.DriverAssignmentEntity,
                module_20.DriverScoreEntity,
                module_21.DeliverySLAEntity,
                module_22.DriverFraudEntity,
                module_27.StripeWebhookEntity,
            ]),
            mongoose_1.MongooseModule.forFeature([{ name: module_23.ReviewDocument.name, schema: module_23.ReviewSchema }]),
        ],
        providers: [module_24.PostgresAdapter, module_25.MongoAdapter, module_26.RedisAdapter],
        exports: [module_24.PostgresAdapter, module_25.MongoAdapter, module_26.RedisAdapter, typeorm_1.TypeOrmModule, mongoose_1.MongooseModule],
    })
], DbModule);
//# sourceMappingURL=db.module.js.map