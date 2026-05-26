// Mock for typeorm decorators for tests
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
  In: class {},
}));

// Mock for @nestjs/typeorm
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => jest.fn(),
  getRepositoryToken: (entity: any) => `REPOSITORY_${entity.name}`,
}));

// Mock for @nestjs/common
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
  BadRequestException: class extends Error { constructor(message?: string) { super(message); this.name = 'BadRequestException'; } },
  NotFoundException: class extends Error { constructor(message?: string) { super(message); this.name = 'NotFoundException'; } },
  ConflictException: class extends Error { constructor(message?: string) { super(message); this.name = 'ConflictException'; } },
  UnauthorizedException: class extends Error { constructor(message?: string) { super(message); this.name = 'UnauthorizedException'; } },
  InternalServerErrorException: class extends Error { constructor(message?: string) { super(message); this.name = 'InternalServerErrorException'; } },
}));

// Mock for @nestjs/config
jest.mock('@nestjs/config', () => ({
  ConfigModule: { forRoot: jest.fn().mockReturnValue({}) },
  ConfigService: jest.fn(),
}));

// Mock for @nestjs/mongoose
jest.mock('@nestjs/mongoose', () => ({
  MongooseModule: { forRoot: jest.fn().mockReturnValue({}) },
  InjectModel: () => jest.fn(),
}));

// Mock for mongoose
jest.mock('mongoose', () => ({
  Schema: jest.fn(),
  model: jest.fn(),
  connect: jest.fn(),
}));

// Mock for stripe
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