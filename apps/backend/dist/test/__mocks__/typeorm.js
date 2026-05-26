"use strict";
const mockEntities = {};
class Repository {
    constructor() {
        this.findOne = jest.fn();
        this.find = jest.fn();
        this.findByIds = jest.fn();
        this.save = jest.fn();
        this.update = jest.fn();
        this.create = jest.fn();
        this.delete = jest.fn();
        this.createQueryBuilder = jest.fn().mockReturnValue({
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            leftJoin: jest.fn().mockReturnThis(),
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            getOne: jest.fn(),
            getMany: jest.fn(),
        });
    }
}
class DataSource {
    constructor() {
        this.createQueryRunner = jest.fn().mockReturnValue({
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
}
module.exports = {
    Repository,
    DataSource,
};
module.exports.InRepository = Repository;
module.exports.LoaderRepository = Repository;
module.exports.MongoRepository = Repository;
module.exports.TreeRepository = Repository;
//# sourceMappingURL=typeorm.js.map