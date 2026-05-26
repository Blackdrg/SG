import { Injectable } from '@nestjs/common';

@Injectable()
export class RedisAdapter {
  async connect(): Promise<void> {
    console.log('Connecting to Redis...');
  }
  async disconnect(): Promise<void> {
    console.log('Disconnecting from Redis...');
  }
  async get(key: string): Promise<string | null> {
    console.log(`Getting key from Redis: ${key}`);
    return null;
  }
  async set(key: string, value: string, ttl?: number): Promise<void> {
    console.log(`Setting key in Redis: ${key}`);
  }
  async del(key: string): Promise<void> {
    console.log(`Deleting key from Redis: ${key}`);
  }
}
