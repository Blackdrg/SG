declare const mockEntities: {};
declare class Repository {
    findOne: jest.Mock<any, any, any>;
    find: jest.Mock<any, any, any>;
    findByIds: jest.Mock<any, any, any>;
    save: jest.Mock<any, any, any>;
    update: jest.Mock<any, any, any>;
    create: jest.Mock<any, any, any>;
    delete: jest.Mock<any, any, any>;
    createQueryBuilder: jest.Mock<any, any, any>;
}
declare class DataSource {
    createQueryRunner: jest.Mock<any, any, any>;
}
