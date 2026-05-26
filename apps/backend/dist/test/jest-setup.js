"use strict";
jest.mock('@nestjs/core', () => {
    return {
        Logger: class MockLogger {
            log() { }
            error() { }
            warn() { }
            debug() { }
            verbose() { }
        }
    };
});
jest.mock('@nestjs/typeorm', () => ({
    InjectRepository: () => jest.fn(),
    getRepositoryToken: (entity) => `REPOSITORY_${entity?.name || entity}`,
}));
jest.mock('typeorm', () => ({
    Entity: () => jest.fn(),
    PrimaryGeneratedColumn: () => jest.fn(),
    PrimaryColumn: () => jest.fn(),
    Column: () => jest.fn(),
    CreateDateColumn: () => jest.fn(),
    UpdateDateColumn: () => jest.fn(),
    OneToMany: () => jest.fn(),
    ManyToOne: () => jest.fn(),
    ManyToMany: () => jest.fn(),
    JoinColumn: () => jest.fn(),
    RelationId: () => jest.fn(),
    Index: () => jest.fn(),
    Unique: () => jest.fn(),
    DataSource: class MockDataSource {
    },
}));
jest.mock('@nestjs/common', () => ({
    Injectable: () => jest.fn(),
    Controller: () => jest.fn(),
    Get: () => jest.fn(),
    Post: () => jest.fn(),
    Patch: () => jest.fn(),
    Delete: () => jest.fn(),
    Put: () => jest.fn(),
    Body: () => jest.fn(),
    Param: () => jest.fn(),
    Query: () => jest.fn(),
    Headers: () => jest.fn(),
    Req: () => jest.fn(),
    BadRequestException: class BadRequestException extends Error {
        constructor(message) { super(message); this.name = 'BadRequestException'; }
    },
    NotFoundException: class NotFoundException extends Error {
        constructor(message) { super(message); this.name = 'NotFoundException'; }
    },
    ConflictException: class ConflictException extends Error {
        constructor(message) { super(message); this.name = 'ConflictException'; }
    },
    UnauthorizedException: class UnauthorizedException extends Error {
        constructor(message) { super(message); this.name = 'UnauthorizedException'; }
    },
    InternalServerErrorException: class InternalServerErrorException extends Error {
        constructor(message) { super(message); this.name = 'InternalServerErrorException'; }
    },
    Global: () => jest.fn(),
    Module: () => jest.fn(),
}));
jest.mock('@nestjs/config', () => ({
    ConfigModule: { forRoot: jest.fn().mockReturnValue({}) },
    ConfigService: jest.fn(),
}));
jest.mock('@nestjs/mongoose', () => ({
    MongooseModule: { forRoot: jest.fn().mockReturnValue({}) },
    InjectModel: () => jest.fn(),
}));
jest.mock('mongoose', () => ({
    Schema: jest.fn(),
    model: jest.fn(),
    connect: jest.fn(),
}));
jest.mock('stripe', () => {
    return jest.fn().mockImplementation(() => ({
        paymentIntents: { create: jest.fn(), retrieve: jest.fn(), confirm: jest.fn(), cancel: jest.fn() },
        refunds: { create: jest.fn() },
        webhooks: { constructEvent: jest.fn() },
    }));
});
jest.mock('crypto', () => ({
    randomUUID: () => 'mock-uuid',
}));
//# sourceMappingURL=jest-setup.js.map