import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../../db/entities/user.entity';
import { SessionEntity } from '../../db/entities/session.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepo: Repository<UserEntity>;
  let sessionRepo: Repository<SessionEntity>;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(UserEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(SessionEntity),
          useClass: Repository,
        },
        JwtService,
        ConfigService,
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepo = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    sessionRepo = module.get<Repository<SessionEntity>>(getRepositoryToken(SessionEntity));
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('hashPassword', () => {
    it('should hash a password correctly', async () => {
      const password = 'testPassword123';
      const hashedPassword = await authService.hashPassword(password);
      
      expect(hashedPassword).not.toBe(password);
      expect(await argon2.verify(hashedPassword, password)).toBe(true);
    });
  });

  describe('verifyPassword', () => {
    it('should verify a correct password', async () => {
      const password = 'testPassword123';
      const hashedPassword = await argon2.hash(password);
      
      const result = await authService.verifyPassword(password, hashedPassword);
      expect(result).toBe(true);
    });

    it('should reject an incorrect password', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword';
      const hashedPassword = await argon2.hash(password);
      
      const result = await authService.verifyPassword(wrongPassword, hashedPassword);
      expect(result).toBe(false);
    });
  });

  describe('validateUser', () => {
    it('should validate a user with correct credentials', async () => {
      const userData = {
        id: '1',
        email: 'test@example.com',
        passwordHash: await argon2.hash('password123'),
        fullName: 'Test User',
        role: 'CUSTOMER',
        status: 'ACTIVE'
      };
      
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(userData as any);
      
      const result = await authService.validateUser('test@example.com', 'password123');
      expect(result).toMatchObject({
        id: '1',
        email: 'test@example.com',
        fullName: 'Test User'
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(null);
      
      await expect(authService.validateUser('nonexistent@example.com', 'password'))
        .rejects
        .toThrowError(/Invalid email or password/);
    });
  });

  describe('login', () => {
    it('should create a session and return tokens', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        role: 'CUSTOMER'
      };
      
      const deviceInfo = {
        name: 'Test Device',
        type: 'mobile',
        ip: '127.0.0.1'
      };
      
      jest.spyOn(sessionRepo, 'create').mockReturnValue({} as any);
      jest.spyOn(sessionRepo, 'save').mockResolvedValue({} as any);
      jest.spyOn(jwtService, 'sign').mockReturnValue('fake-jwt-token');
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'REFRESH_TOKEN_LENGTH') return 40;
        return null;
      });
      jest.spyOn(crypto, 'randomBytes').mockReturnValue({ toString: () => 'fake-refresh-token' } as any);
      
      const result = await authService.login(user, deviceInfo);
      
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(sessionRepo.save).toHaveBeenCalled();
    });
  });
});