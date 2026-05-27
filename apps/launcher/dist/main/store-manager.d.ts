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
export declare class StoreManager {
    private store;
    private secretsPath;
    constructor();
    getConfig(): Record<string, unknown>;
    setConfig(config: Record<string, unknown>): void;
    getSecrets(): Secrets | null;
    saveSecrets(secrets: Secrets): void;
}
export {};
//# sourceMappingURL=store-manager.d.ts.map