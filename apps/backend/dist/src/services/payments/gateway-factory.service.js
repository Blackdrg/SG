"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PaymentGatewayFactory_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentGatewayFactory = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_gateway_service_1 = require("./gateways/stripe-gateway.service");
const razorpay_gateway_service_1 = require("./gateways/razorpay-gateway.service");
let PaymentGatewayFactory = PaymentGatewayFactory_1 = class PaymentGatewayFactory {
    constructor(configService, stripeGatewayInstance, razorpayGatewayInstance) {
        this.configService = configService;
        this.stripeGatewayInstance = stripeGatewayInstance;
        this.razorpayGatewayInstance = razorpayGatewayInstance;
        this.logger = new common_1.Logger(PaymentGatewayFactory_1.name);
        this.stripeGateway = this.stripeGatewayInstance;
        this.razorpayGateway = this.razorpayGatewayInstance;
        const primaryGateway = this.configService.get('PAYMENT_PRIMARY_GATEWAY', 'stripe');
        this.defaultGateway = primaryGateway === 'razorpay' ? this.razorpayGateway : this.stripeGateway;
        this.logger.log(`Payment gateway factory initialized with default gateway: ${this.defaultGateway.getGatewayName()}`);
    }
    getGateway(gatewayName) {
        if (!gatewayName) {
            return this.defaultGateway;
        }
        switch (gatewayName.toLowerCase()) {
            case 'stripe':
                return this.stripeGateway;
            case 'razorpay':
                return this.razorpayGateway;
            default:
                this.logger.warn(Unknown, payment, gateway, falling, back, to);
            default:
                ;
                return this.defaultGateway;
        }
    }
    getAvailableGateways() {
        return ['stripe', 'razorpay'];
    }
};
exports.PaymentGatewayFactory = PaymentGatewayFactory;
exports.PaymentGatewayFactory = PaymentGatewayFactory = PaymentGatewayFactory_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        stripe_gateway_service_1.StripeGateway,
        razorpay_gateway_service_1.RazorpayGateway])
], PaymentGatewayFactory);
//# sourceMappingURL=gateway-factory.service.js.map