// Mock for typeorm to avoid sql-highlight dependency issues in tests
const mockEntities = {};

class Repository {
  findOne = jest.fn();
  find = jest.fn();
  findByIds = jest.fn();
  save = jest.fn();
  update = jest.fn();
  create = jest.fn();
  delete = jest.fn();
  createQueryBuilder = jest.fn().mockReturnValue({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    getMany: jest.fn(),
  });
}

class DataSource {
  createQueryRunner = jest.fn().mockReturnValue({
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      update: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
      }),
    },
  });
}

module.exports = {
  Repository,
  DataSource,
};

module.exports.InRepository = Repository;
module.exports.LoaderRepository = Repository;
module.exports.MongoRepository = Repository;
module.exports.TreeRepository = Repository;