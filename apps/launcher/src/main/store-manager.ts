import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
// @ts-ignore - electron-store types may vary
import Store from 'electron-store';

interface Secrets {
  jwtSecret: string;
  encryptionSecret: string;
  dbPassword: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  opensearchPassword: string;
  grafanaPassword: string;
  sentrySecret: string;
  sentryDsn: string;
  sentryDbPassword: string;
}

export class StoreManager {
  private store: any;
  private secretsPath: string;

  constructor() {
    this.store = new Store({
      name: 'launcher-config',
      defaults: {
        autoStart: false,
        minimizeToTray: true,
        theme: 'light'
      }
    });
    this.secretsPath = path.join(app.getAppPath(), '..', '..', 'secrets');
  }

  getConfig(): Record<string, unknown> {
    return this.store.store;
  }

  setConfig(config: Record<string, unknown>): void {
    this.store.set(config);
  }

  getSecrets(): Secrets | null {
    try {
      if (!fs.existsSync(this.secretsPath)) {
        return null;
      }
      const files = fs.readdirSync(this.secretsPath);
      const secrets: Secrets = {} as Secrets;

      for (const file of files) {
        const key = file.replace('.txt', '') as keyof Secrets;
        const value = fs.readFileSync(path.join(this.secretsPath, file), 'utf-8').trim();
        if (key) {
          secrets[key] = value;
        }
      }

      return Object.keys(secrets).length > 0 ? secrets : null;
    } catch {
      return null;
    }
  }

  saveSecrets(secrets: Secrets): void {
    if (!fs.existsSync(this.secretsPath)) {
      fs.mkdirSync(this.secretsPath, { recursive: true });
    }

    for (const [key, value] of Object.entries(secrets)) {
      fs.writeFileSync(path.join(this.secretsPath, `${key}.txt`), value);
    }
  }
}