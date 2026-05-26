// Jest setup file for mocking modules - must be loaded before test files

// Mock @nestjs/core logger first
jest.mock('@nestjs/core', () => {
  return {
    Logger: class MockLogger {
      log() {}
      error() {}
      warn() {}
      debug() {}
      verbose() {}
    }
  };
});

// Mock @nestjs/typeorm
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => jest.fn(),
  getRepositoryToken: (entity: any) => `REPOSITORY_${entity?.name || entity}`,
}));

// Mock typeorm
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
  DataSource: class MockDataSource {},
}));

// Mock @nestjs/common
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
  BadRequestException: class BadRequestException extends Error { constructor(message?: string) { super(message); this.name = 'BadRequestException'; } },
  NotFoundException: class NotFoundException extends Error { constructor(message?: string) { super(message); this.name = 'NotFoundException'; } },
  ConflictException: class ConflictException extends Error { constructor(message?: string) { super(message); this.name = 'ConflictException'; } },
  UnauthorizedException: class UnauthorizedException extends Error { constructor(message?: string) { super(message); this.name = 'UnauthorizedException'; } },
  InternalServerErrorException: class InternalServerErrorException extends Error { constructor(message?: string) { super(message); this.name = 'InternalServerErrorException'; } },
  Global: () => jest.fn(),
  Module: () => jest.fn(),
}));

// Mock @nestjs/config
jest.mock('@nestjs/config', () => ({
  ConfigModule: { forRoot: jest.fn().mockReturnValue({}) },
  ConfigService: jest.fn(),
}));

// Mock @nestjs/mongoose
jest.mock('@nestjs/mongoose', () => ({
  MongooseModule: { forRoot: jest.fn().mockReturnValue({}) },
  InjectModel: () => jest.fn(),
}));

// Mock mongoose
jest.mock('mongoose', () => ({
  Schema: jest.fn(),
  model: jest.fn(),
  connect: jest.fn(),
}));

// Mock stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: { create: jest.fn(), retrieve: jest.fn(), confirm: jest.fn(), cancel: jest.fn() },
    refunds: { create: jest.fn() },
    webhooks: { constructEvent: jest.fn() },
  }));
});

// Mock crypto
jest.mock('crypto', () => ({
  randomUUID: () => 'mock-uuid',
}));