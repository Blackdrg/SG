import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../db/entities/user.entity';
import { SessionEntity } from '../../db/entities/session.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(SessionEntity)
    private readonly sessionRepo: Repository<SessionEntity>,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }

  async createSession(userId: string, deviceInfo: { name: string; type: string; ip: string }) {
    const sessionDurationDays = this.configService.get<number>('SESSION_DURATION_DAYS', 30);
    const session = this.sessionRepo.create({
      userId,
      deviceName: deviceInfo.name,
      deviceType: deviceInfo.type,
      ipAddress: deviceInfo.ip,
      expiresAt: new Date(Date.now() + sessionDurationDays * 24 * 60 * 60 * 1000),
    });
    return this.sessionRepo.save(session);
  }

  async validateUser(email: string, pass: string): Promise<any> {
    if (!email || !pass) {
      throw new UnauthorizedException('Credentials required');
    }

    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (await this.verifyPassword(pass, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }
    
    throw new UnauthorizedException('Invalid email or password');
  }

async login(user: any, deviceInfo: { name: string; type: string; ip: string }) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    
    await this.createSession(user.id, deviceInfo);

    return {
      access_token: accessToken,
      refresh_token: crypto.randomBytes(this.configService.get<number>('REFRESH_TOKEN_LENGTH', 40)).toString('hex'),
    };
  }
}
