import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return { status: 'ok', service: 'spicegarden-api', timestamp: new Date().toISOString() };
  }
}
