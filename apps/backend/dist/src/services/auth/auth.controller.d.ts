import { AuthService } from './auth.service';
import { Repository } from 'typeorm';
import { UserEntity } from '../../db/entities/user.entity';
import { Request } from 'express';
export declare class AuthController {
    private authService;
    private readonly userRepo;
    constructor(authService: AuthService, userRepo: Repository<UserEntity>);
    login(body: any, req: Request): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    register(body: any, req: Request): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
}
