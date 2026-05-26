import { Controller, Post, Body, UnauthorizedException, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../db/entities/user.entity';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  @Post('login')
  async login(@Body() body: any, @Req() req: Request) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException();
    }
    
    const deviceInfo = {
      name: body.deviceName || 'Unknown Device',
      type: body.deviceType || 'Unknown Type',
      ip: req.ip || '0.0.0.0',
    };

    return this.authService.login(user, deviceInfo);
  }

  @Post('register')
  async register(@Body() body: any, @Req() req: Request) {
    const existing = await this.userRepo.findOne({ where: { email: body.email } });
    if (existing) {
      throw new UnauthorizedException('Email already registered');
    }

    const passwordHash = await this.authService.hashPassword(body.password);
    const user = this.userRepo.create({
      email: body.email,
      phone: body.phone,
      fullName: body.fullName,
      passwordHash,
    });
    await this.userRepo.save(user);

    const deviceInfo = {
      name: body.deviceName || 'Unknown Device',
      type: body.deviceType || 'Unknown Type',
      ip: req.ip || '0.0.0.0',
    };

    return this.authService.login(user, deviceInfo);
  }
}
