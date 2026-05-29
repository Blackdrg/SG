"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModule = void 0;
const module_1 = require();
const module_2 = require();
const module_3 = require();
const module_4 = require();
const module_5 = require();
const module_6 = require();
const module_7 = require();
const module_8 = require();
let NotificationModule = class NotificationModule {
};
exports.NotificationModule = NotificationModule;
exports.NotificationModule = NotificationModule = __decorate([
    (0, module_1.Global)(),
    (0, module_2.Module)({
        imports: [
            module_3.TypeOrmModule.forFeature([module_6.UserDeviceEntity, module_7.NotificationEntity]),
            module_8.NotificationQueueModule,
        ],
        providers: [module_4.NotificationService, module_5.ProductionNotificationService],
        exports: [module_4.NotificationService, module_5.ProductionNotificationService],
    })
], NotificationModule);
//# sourceMappingURL=notification.module.js.map