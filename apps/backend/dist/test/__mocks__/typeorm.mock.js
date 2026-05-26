"use strict";
jest.mock('typeorm', () => ({
    Entity: () => jest.fn(),
    PrimaryGeneratedColumn: () => jest.fn(),
    Column: () => jest.fn(),
    CreateDateColumn: () => jest.fn(),
    UpdateDateColumn: () => jest.fn(),
    OneToMany: () => jest.fn(),
    ManyToOne: () => jest.fn(),
    Repository: jest.fn().mockImplementation(() => ({
        findOne: jest.fn(),
        find: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        createQueryBuilder: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            leftJoin: jest.fn().mockReturnThis(),
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            getOne: jest.fn(),
            getMany: jest.fn(),
        }),
    })),
    DataSource: jest.fn(),
    In: class {
    },
}));
jest.mock('@nestjs/typeorm', () => ({
    InjectRepository: () => jest.fn(),
    getRepositoryToken: (entity) => `REPOSITORY_${entity.name}`,
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
    BadRequestException: class extends Error {
        constructor(message) { super(message); this.name = 'BadRequestException'; }
    },
    NotFoundException: class extends Error {
        constructor(message) { super(message); this.name = 'NotFoundException'; }
    },
    ConflictException: class extends Error {
        constructor(message) { super(message); this.name = 'ConflictException'; }
    },
    UnauthorizedException: class extends Error {
        constructor(message) { super(message); this.name = 'UnauthorizedException'; }
    },
    InternalServerErrorException: class extends Error {
        constructor(message) { super(message); this.name = 'InternalServerErrorException'; }
    },
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
        paymentIntents: {
            create: jest.fn(),
            retrieve: jest.fn(),
            confirm: jest.fn(),
            cancel: jest.fn(),
        },
        refunds: {
            create: jest.fn(),
        },
        webhooks: {
            constructEvent: jest.fn(),
        },
    }));
});
//# sourceMappingURL=typeorm.mock.js.map