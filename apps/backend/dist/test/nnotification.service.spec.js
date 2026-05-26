"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const notification_service_1 = require("./notification.service");
const typeorm_1 = require("@nestjs/typeorm");
const user_device_entity_1 = require("../../db/entities/user-device.entity");
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
describe('NotificationService', () => {
    let service;
    let userDeviceRepo;
    let configService;
    let logger;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                notification_service_1.NotificationService,
                {
                    provide: (0, typeorm_1.getRepositoryToken)(user_device_entity_1.UserDeviceEntity),
                    useClass: Repository,
                },
                config_1.ConfigService,
                common_1.Logger,
            ],
        }).compile();
        service = module.get(notification_service_1.NotificationService);
        userDeviceRepo = module.get((0, typeorm_1.getRepositoryToken)(user_device_entity_1.UserDeviceEntity));
        configService = module.get(config_1.ConfigService);
        logger = module.get(common_1.Logger);
    });
    describe('registerDevice', () => {
        it('should register a new device', async () => {
            const userId = 'user123';
            const fcmToken = 'fcm-token-123';
            const deviceInfo = { name: 'Test Phone', type: 'android' };
            jest.spyOn(userDeviceRepo, 'findOne').mockResolvedValue(null);
            jest.spyOn(userDeviceRepo, 'create').mockReturnValue({});
            jest.spyOn(userDeviceRepo, 'save').mockResolvedValue({ id: 'device123', ...deviceInfo, fcmToken, userId });
            const result = await service.registerDevice(userId, fcmToken, deviceInfo);
            expect(result).toHaveProperty('id', 'device123');
            expect(userDeviceRepo.save).toHaveBeenCalled();
        });
        it('should update existing device if already registered', async () => {
            const userId = 'user123';
            const fcmToken = 'fcm-token-123';
            const deviceInfo = { name: 'Test Phone', type: 'android' };
            const existingDevice = { id: 'device123', userId, fcmToken, isActive: false };
            jest.spyOn(userDeviceRepo, 'findOne').mockResolvedValue(existingDevice);
            jest.spyOn(userDeviceRepo, 'update').mockResolvedValue({});
            const result = await service.registerDevice(userId, fcmToken, deviceInfo);
            expect(userDeviceRepo.update).toHaveBeenCalledWith('device123', { isActive: true, ...deviceInfo });
        });
    });
    describe('unregisterDevice', () => {
        it('should deactivate a device', async () => {
            const userId = 'user123';
            const fcmToken = 'fcm-token-123';
            jest.spyOn(userDeviceRepo, 'update').mockResolvedValue({});
            await service.unregisterDevice(userId, fcmToken);
            expect(userDeviceRepo.update).toHaveBeenCalledWith({ userId, fcmToken }, { isActive: false });
        });
    });
    describe('sendPush', () => {
        it('should send push notification when FCM is configured', async () => {
            const userId = 'user123';
            const title = 'Test Title';
            const body = 'Test Body';
            const fcmKey = 'fake-fcm-key';
            jest.spyOn(configService, 'get').mockImplementation((key) => {
                if (key === 'FCM_SERVER_KEY')
                    return fcmKey;
                return null;
            });
            const mockDevices = [
                { fcmToken: 'token1' },
                { fcmToken: 'token2' }
            ];
            jest.spyOn(userDeviceRepo, 'find').mockResolvedValue(mockDevices);
            const fetchSpy = jest.spyOn(global, 'fetch');
            fetchSpy.mockResolvedValue({
                json: () => Promise.resolve({ success: true }),
                ok: true
            });
            const result = await service.sendPush(userId, title, body);
            expect(result).toEqual({ success: true, result: { success: true } });
            expect(fetchSpy).toHaveBeenCalledWith('https://fcm.googleapis.com/fcm/send', expect.any(Object));
        });
        it('should return error when FCM is not configured', async () => {
            jest.spyOn(configService, 'get').mockReturnValue(null);
            const result = await service.sendPush('user123', 'Test', 'Body');
            expect(result).toEqual({ success: false, reason: 'FCM not configured' });
        });
    });
});
//# sourceMappingURL=nnotification.service.spec.js.map