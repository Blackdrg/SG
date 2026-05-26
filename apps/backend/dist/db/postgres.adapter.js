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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresAdapter = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let PostgresAdapter = class PostgresAdapter {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async connect() {
        if (!this.dataSource.isInitialized) {
            await this.dataSource.initialize();
        }
    }
    async disconnect() {
        if (this.dataSource.isInitialized) {
            await this.dataSource.destroy();
        }
    }
    async query(query, params) {
        return this.dataSource.query(query, params);
    }
    async findOne(filter) {
        return null;
    }
    async findMany(filter) { return []; }
    async create(data) { return data; }
    async update(id, data) { return data; }
    async delete(id) { return true; }
};
exports.PostgresAdapter = PostgresAdapter;
exports.PostgresAdapter = PostgresAdapter = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], PostgresAdapter);
//# sourceMappingURL=postgres.adapter.js.map