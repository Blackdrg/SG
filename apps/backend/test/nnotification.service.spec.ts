import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserDeviceEntity } from '../../db/entities/user-device.entity';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

describe('NotificationService', () => {
  let service: NotificationService;
  let userDeviceRepo: Repository<UserDeviceEntity>;
  let configService: ConfigService;
  let logger: Logger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: getRepositoryToken(UserDeviceEntity),
          useClass: Repository,
        },
        ConfigService,
        Logger,
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    userDeviceRepo = module.get<Repository<UserDeviceEntity>>(getRepositoryToken(UserDeviceEntity));
    configService = module.get<ConfigService>(ConfigService);
    logger = module.get<Logger>(Logger);
  });

  describe('registerDevice', () => {
    it('should register a new device', async () => {
      const userId = 'user123';
      const fcmToken = 'fcm-token-123';
      const deviceInfo = { name: 'Test Phone', type: 'android' };
      
      jest.spyOn(userDeviceRepo, 'findOne').mockResolvedValue(null);
      jest.spyOn(userDeviceRepo, 'create').mockReturnValue({} as any);
      jest.spyOn(userDeviceRepo, 'save').mockResolvedValue({ id: 'device123', ...deviceInfo, fcmToken, userId } as any);
      
      const result = await service.registerDevice(userId, fcmToken, deviceInfo);
      
      expect(result).toHaveProperty('id', 'device123');
      expect(userDeviceRepo.save).toHaveBeenCalled();
    });

    it('should update existing device if already registered', async () => {
      const userId = 'user123';
      const fcmToken = 'fcm-token-123';
      const deviceInfo = { name: 'Test Phone', type: 'android' };
      
      const existingDevice = { id: 'device123', userId, fcmToken, isActive: false };
      
      jest.spyOn(userDeviceRepo, 'findOne').mockResolvedValue(existingDevice as any);
      jest.spyOn(userDeviceRepo, 'update').mockResolvedValue({} as any);
      
      const result = await service.registerDevice(userId, fcmToken, deviceInfo);
      
      expect(userDeviceRepo.update).toHaveBeenCalledWith('device123', { isActive: true, ...deviceInfo });
    });
  });

  describe('unregisterDevice', () => {
    it('should deactivate a device', async () => {
      const userId = 'user123';
      const fcmToken = 'fcm-token-123';
      
      jest.spyOn(userDeviceRepo, 'update').mockResolvedValue({} as any);
      
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
      
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'FCM_SERVER_KEY') return fcmKey;
        return null;
      });
      
      const mockDevices = [
        { fcmToken: 'token1' },
        { fcmToken: 'token2' }
      ];
      
      jest.spyOn(userDeviceRepo, 'find').mockResolvedValue(mockDevices as any);
      
      const fetchSpy = jest.spyOn(global, 'fetch');
      fetchSpy.mockResolvedValue({
        json: () => Promise.resolve({ success: true }),
        ok: true
      } as any);
      
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