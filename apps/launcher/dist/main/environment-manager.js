"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvironmentManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
class EnvironmentManager {
    storeManager;
    ports = [
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
    constructor(storeManager) {
        this.storeManager = storeManager;
    }
    async checkPrerequisites() {
        const checks = {
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
    checkDockerInstalled() {
        return new Promise((resolve) => {
            const proc = require('child_process').spawn('docker', ['--version'], { shell: true });
            proc.on('close', (code) => resolve(code === 0));
            proc.on('error', () => resolve(false));
        });
    }
    checkDockerRunning() {
        return new Promise((resolve) => {
            const proc = require('child_process').spawn('docker', ['info'], { shell: true });
            proc.on('close', (code) => resolve(code === 0));
            proc.on('error', () => resolve(false));
        });
    }
    checkNodeVersion() {
        const major = parseInt(process.versions.node.split('.')[0]);
        return major >= 18;
    }
    async checkPorts() {
        const results = [];
        for (const { port } of this.ports) {
            results.push({ port, available: await this.isPortAvailable(port) });
        }
        return results;
    }
    isPortAvailable(port) {
        return new Promise((resolve) => {
            const proc = require('child_process').spawn('netstat', ['-an'], { shell: true });
            let output = '';
            proc.stdout.on('data', (data) => (output += data.toString()));
            proc.on('close', () => {
                resolve(!output.includes(`:${port}`));
            });
            proc.on('error', () => resolve(true));
        });
    }
    checkAndGenerateEnv() {
        const envPath = path.join(process.cwd(), '.env');
        if (!fs.existsSync(envPath)) {
            this.generateEnv();
        }
    }
    async generateEnv() {
        const secrets = this.storeManager.getSecrets();
        if (!secrets) {
            this.generateSecrets();
        }
        const envContent = this.buildEnvContent(secrets || this.storeManager.getSecrets());
        const envPath = path.join(process.cwd(), '.env');
        fs.writeFileSync(envPath, envContent);
        const secretsPath = path.join(process.cwd(), 'secrets');
        if (!fs.existsSync(secretsPath)) {
            fs.mkdirSync(secretsPath, { recursive: true });
        }
        return { success: true, path: envPath };
    }
    generateSecrets() {
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
    buildEnvContent(secrets) {
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
exports.EnvironmentManager = EnvironmentManager;
//# sourceMappingURL=environment-manager.js.map