import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SessionEntity } from '../../db/entities/session.entity';
import { Repository } from 'typeorm';
export declare class AuthService {
    private readonly jwtService;
    private readonly configService;
    private readonly sessionRepo;
    constructor(jwtService: JwtService, configService: ConfigService, sessionRepo: Repository<SessionEntity>);
    hashPassword(password: string): Promise<string>;
    verifyPassword(password: string, hash: string): Promise<boolean>;
    createSession(userId: string, deviceInfo: {
        name: string;
        type: string;
        ip: string;
    }): Promise<SessionEntity>;
    validateUser(email: string, pass: string): Promise<any>;
    login(user: any, deviceInfo: {
        name: string;
        type: string;
        ip: string;
    }): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
}
