import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SessionEntity } from '../../db/entities/session.entity';
import { UserEntity } from '../../db/entities/user.entity';
import { SecurityModule } from '../../security/security.module';

@Module({
  imports: [
    PassportModule,
    SecurityModule,
    TypeOrmModule.forFeature([SessionEntity, UserEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret || secret.includes('CHANGE_ME') || secret.includes('secret')) {
          throw new Error('JWT_SECRET not configured. Generate secure random secret before production.');
        }
        return {
          secret,
          signOptions: { expiresIn: '60m' },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthServiceModule {}
