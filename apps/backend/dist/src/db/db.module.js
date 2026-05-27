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
const menu_category_entity_1 = require("./entities/menu-category.entity");
const menu_item_entity_1 = require("./entities/menu-item.entity");
const inventory_item_entity_1 = require("./entities/inventory-item.entity");
const driver_entity_1 = require("./entities/driver.entity");
const wallet_entity_1 = require("./entities/wallet.entity");
const wallet_transaction_entity_1 = require("./entities/wallet-transaction.entity");
const address_entity_1 = require("./entities/address.entity");
const menu_variant_entity_1 = require("./entities/menu-variant.entity");
const menu_addon_entity_1 = require("./entities/menu-addon.entity");
const order_item_entity_1 = require("./entities/order-item.entity");
const subscription_entity_1 = require("./entities/subscription.entity");
const otp_entity_1 = require("./entities/otp.entity");
const device_fingerprint_entity_1 = require("./entities/device-fingerprint.entity");
const recipe_entity_1 = require("./entities/recipe.entity");
const batch_entity_1 = require("./entities/batch.entity");
const food_prep_entity_1 = require("./entities/food-prep.entity");
const kitchen_sla_entity_1 = require("./entities/kitchen-sla.entity");
const supplier_entity_1 = require("./entities/supplier.entity");
const driver_assignment_entity_1 = require("./entities/driver-assignment.entity");
const driver_score_entity_1 = require("./entities/driver-score.entity");
const delivery_sla_entity_1 = require("./entities/delivery-sla.entity");
const driver_fraud_entity_1 = require("./entities/driver-fraud.entity");
const stripe_webhook_entity_1 = require("./entities/stripe-webhook.entity");
const idempotency_entity_1 = require("../services/payments/idempotency.entity");
const payment_validation_entity_1 = require("../services/payments/payment-validation.entity");
const payment_fraud_entity_1 = require("../services/payments/payment-fraud.entity");
const payment_event_entity_1 = require("../services/payments/payment-event.entity");
const review_schema_1 = require("./schemas/review.schema");
const postgres_adapter_1 = require("./postgres.adapter");
const mongo_adapter_1 = require("./mongo.adapter");
const redis_adapter_1 = require("./redis.adapter");
const entities = [
    user_entity_1.UserEntity,
    order_entity_1.OrderEntity,
    session_entity_1.SessionEntity,
    audit_log_entity_1.AuditLogEntity,
    restaurant_entity_1.RestaurantEntity,
    restaurant_branch_entity_1.RestaurantBranchEntity,
    menu_category_entity_1.MenuCategoryEntity,
    menu_item_entity_1.MenuItemEntity,
    inventory_item_entity_1.InventoryItemEntity,
    driver_entity_1.DriverEntity,
    wallet_entity_1.WalletEntity,
    wallet_transaction_entity_1.WalletTransactionEntity,
    address_entity_1.AddressEntity,
    menu_variant_entity_1.MenuVariantEntity,
    menu_addon_entity_1.MenuAddonEntity,
    order_item_entity_1.OrderItemEntity,
    subscription_entity_1.SubscriptionEntity,
    otp_entity_1.OtpEntity,
    device_fingerprint_entity_1.DeviceFingerprintEntity,
    recipe_entity_1.RecipeEntity,
    batch_entity_1.BatchEntity,
    food_prep_entity_1.FoodPrepEntity,
    kitchen_sla_entity_1.KitchenSLAEntity,
    supplier_entity_1.SupplierEntity,
    driver_assignment_entity_1.DriverAssignmentEntity,
    driver_score_entity_1.DriverScoreEntity,
    delivery_sla_entity_1.DeliverySLAEntity,
    driver_fraud_entity_1.DriverFraudEntity,
    stripe_webhook_entity_1.StripeWebhookEntity,
    idempotency_entity_1.IdempotencyEntity,
    payment_validation_entity_1.PaymentValidationEventEntity,
    payment_fraud_entity_1.PaymentFraudFlagEntity,
    payment_event_entity_1.PaymentEventEntity,
];
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
                    host: "localhost",
                    port: 5432,
                    username: "spicegarden",
                    password: "nkYD5s1HBlr8VpyB42btP1On32kBMg4PWy/fRH5zgZ8=",
                    database: "spicegarden",
                    entities,
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
            typeorm_1.TypeOrmModule.forFeature(entities),
            mongoose_1.MongooseModule.forFeature([{ name: review_schema_1.ReviewDocument.name, schema: review_schema_1.ReviewSchema }]),
        ],
        providers: [postgres_adapter_1.PostgresAdapter, mongo_adapter_1.MongoAdapter, redis_adapter_1.RedisAdapter],
        exports: [postgres_adapter_1.PostgresAdapter, mongo_adapter_1.MongoAdapter, redis_adapter_1.RedisAdapter, typeorm_1.TypeOrmModule, mongoose_1.MongooseModule],
    })
], DbModule);
//# sourceMappingURL=db.module.js.map