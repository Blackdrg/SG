import * as fs from 'fs';
import * as path from 'path';
import { StoreManager } from './store-manager';
import * as crypto from 'crypto';
import * as child_process from 'child_process';

interface Prerequisites {
  dockerInstalled: boolean;
  dockerRunning: boolean;
  nodeVersion: string;
  nodeSatisfies: boolean;
  portsAvailable: { port: number; available: boolean }[];
  envExists: boolean;
  missingDependencies: string[];
}

interface PortConfig {
  port: number;
  service: string;
}

export class EnvironmentManager {
  private storeManager: StoreManager;
  private ports: PortConfig[] = [
    { port: 3001, service: 'Backend API' },
    { port: 5432, service: 'PostgreSQL' },
    { port: 6379, service: 'Redis' },
    { port: 27017, service: 'MongoDB' },
    { port: 9200, service: 'OpenSearch' },
    { port: 9090, service: 'Prometheus' },
    { port: 3000, service: 'Grafana' },
    { port: 5601, service: 'OpenSearch Dashboards' },
    { port: 9093, service: 'AlertManager' },
    { port: 3001, service: 'Customer Web' },
    { port: 3002, service: 'Restaurant Dashboard' },
    { port: 3003, service: 'Admin Dashboard' }
  ];

  constructor(storeManager: StoreManager) {
    this.storeManager = storeManager;
  }

  async checkPrerequisites(): Promise<Prerequisites> {
    const checks: Prerequisites = {
      dockerInstalled: false,
      dockerRunning: false,
      nodeVersion: process.versions.node,
      nodeSatisfies: false,
      portsAvailable: [],
      envExists: false,
      missingDependencies: []
    };

    checks.dockerInstalled = await this.checkDockerInstalled();
    checks.dockerRunning = await this.checkDockerRunning();
    checks.nodeSatisfies = this.checkNodeVersion();
    checks.portsAvailable = await this.checkPorts();
    checks.envExists = fs.existsSync(path.join(process.cwd(), '.env'));

    const nodeModulesPaths = ['apps/backend', 'apps/customer-web', 'apps/restaurant-dashboard', 'apps/super-admin'];
    for (const modulePath of nodeModulesPaths) {
      if (!fs.existsSync(path.join(process.cwd(), modulePath, 'node_modules'))) {
        checks.missingDependencies.push(modulePath);
      }
    }

    return checks;
  }

   private checkDockerInstalled(): Promise<boolean> {
     return new Promise((resolve) => {
       const proc = child_process.spawn('docker', ['--version'], { shell: true });
       proc.on('close', (code: number) => resolve(code === 0));
       proc.on('error', () => resolve(false));
     });
   }

   private checkDockerRunning(): Promise<boolean> {
     return new Promise((resolve) => {
       const proc = child_process.spawn('docker', ['info'], { shell: true });
       proc.on('close', (code: number) => resolve(code === 0));
       proc.on('error', () => resolve(false));
     });
   }

  private checkNodeVersion(): boolean {
    const major = parseInt(process.versions.node.split('.')[0]);
    return major >= 18;
  }

  async checkPorts(): Promise<{ port: number; available: boolean }[]> {
    const results: { port: number; available: boolean }[] = [];
    
    for (const { port } of this.ports) {
      results.push({ port, available: await this.isPortAvailable(port) });
    }

    return results;
  }

   private isPortAvailable(port: number): Promise<boolean> {
     return new Promise((resolve) => {
       const proc = child_process.spawn('netstat', ['-an'], { shell: true });
       let output = '';
       proc.stdout.on('data', (data: Buffer) => (output += data.toString()));
       proc.on('close', () => {
         resolve(!output.includes(`:${port}`));
       });
       proc.on('error', () => resolve(true));
     });
   }

  checkAndGenerateEnv(): void {
    const envPath = path.join(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) {
      this.generateEnv();
    }
  }

   async generateEnv(): Promise<{ success: boolean; path: string }> {
     let secrets = this.storeManager.getSecrets();
     if (!secrets) {
       this.generateSecrets();
       secrets = this.storeManager.getSecrets();
     }

     const envContent = this.buildEnvContent(secrets);
     const envPath = path.join(process.cwd(), '.env');
     fs.writeFileSync(envPath, envContent);

     const secretsPath = path.join(process.cwd(), 'secrets');
     if (!fs.existsSync(secretsPath)) {
       fs.mkdirSync(secretsPath, { recursive: true });
     }

     return { success: true, path: envPath };
   }

  private generateSecrets(): void {
    const secretsDir = path.join(process.cwd(), 'secrets');
    if (!fs.existsSync(secretsDir)) {
      fs.mkdirSync(secretsDir, { recursive: true });
    }

    const secrets = {
      jwtSecret: crypto.randomBytes(64).toString('hex'),
      encryptionSecret: crypto.randomBytes(32).toString('hex'),
      dbPassword: crypto.randomBytes(24).toString('base64'),
      stripeSecretKey: 'sk_test_' + crypto.randomBytes(24).toString('hex'),
      stripeWebhookSecret: 'whsec_' + crypto.randomBytes(24).toString('hex'),
      opensearchPassword: [...Array(24)].map(() => crypto.randomInt(36).toString(36)).join(''),
      grafanaPassword: [...Array(20)].map(() => crypto.randomInt(36).toString(36)).join(''),
      sentrySecret: crypto.randomBytes(32).toString('hex'),
      sentryDsn: 'http://localhost:9000/1',
      sentryDbPassword: crypto.randomBytes(24).toString('base64')
    };

    for (const [key, value] of Object.entries(secrets)) {
      fs.writeFileSync(path.join(secretsDir, `${key}.txt`), value);
    }

    this.storeManager.saveSecrets(secrets);
  }

   private buildEnvContent(secrets: Record<string, string>): string {
    return `# SpiceGarden Environment Configuration - Auto Generated
# Generated on ${new Date().toISOString()}

# Application
NODE_ENV=development
PORT=3001
SESSION_DURATION_DAYS=30
REFRESH_TOKEN_LENGTH=40

# Database - PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=spicegarden
DB_PASS=${secrets.dbPassword}
DB_NAME=spicegarden

# Database - MongoDB
MONGO_URI=mongodb://localhost:27017/spicegarden

# Database - Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=${secrets.jwtSecret}
JWT_EXPIRES_IN=7d
ENCRYPTION_SECRET=${secrets.encryptionSecret}

# Stripe
STRIPE_SECRET_KEY=${secrets.stripeSecretKey}
STRIPE_WEBHOOK_SECRET=${secrets.stripeWebhookSecret}

# Sentry
SENTRY_DSN=${secrets.sentryDsn}

# OpenSearch
OPENSEARCH_URL=http://localhost:9200

# Monitoring
METRICS_ENABLED=true

# Email
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@spicegarden.com

# SMS & FCM
TWILIO_ACCOUNT_SID=
TWILIO_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=+15555555555
TWILIO_PHONE=+15555555555
FCM_SERVER_KEY=
FCM_SENDER_ID=

# Wallet Configuration
WALLET_DEFAULT_CURRENCY=INR
WALLET_NOTIFICATION_THRESHOLD=100
WALLET_LOW_BALANCE_THRESHOLD=50

# External APIs
GOOGLE_MAPS_API_KEY=
SENDGRID_API_KEY=

# Payment Limits
PAYMENT_MAX_SINGLE_AMOUNT=10000
PAYMENT_DAILY_LIMIT_PER_USER=50000

# AlertManager
SLACK_WEBHOOK_URL=
PAGERDUTY_ROUTING_KEY=`;
  }
}