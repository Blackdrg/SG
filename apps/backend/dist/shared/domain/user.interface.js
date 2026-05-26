"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["CUSTOMER"] = "customer";
    UserRole["RESTAURANT"] = "restaurant";
    UserRole["KITCHEN_STAFF"] = "kitchen_staff";
    UserRole["DELIVERY_PARTNER"] = "delivery_partner";
    UserRole["ADMIN"] = "admin";
    UserRole["SUPER_ADMIN"] = "super_admin";
    UserRole["SUPPORT_STAFF"] = "support_staff";
    UserRole["FINANCE_STAFF"] = "finance_staff";
})(UserRole || (exports.UserRole = UserRole = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "active";
    UserStatus["INACTIVE"] = "inactive";
    UserStatus["SUSPENDED"] = "suspended";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
//# sourceMappingURL=user.interface.js.map