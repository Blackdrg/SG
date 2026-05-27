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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreManager = void 0;
const electron_1 = require("electron");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// @ts-ignore - electron-store types may vary
const electron_store_1 = __importDefault(require("electron-store"));
class StoreManager {
    store;
    secretsPath;
    constructor() {
        this.store = new electron_store_1.default({
            name: 'launcher-config',
            defaults: {
                autoStart: false,
                minimizeToTray: true,
                theme: 'light'
            }
        });
        this.secretsPath = path.join(electron_1.app.getAppPath(), '..', '..', 'secrets');
    }
    getConfig() {
        return this.store.store;
    }
    setConfig(config) {
        this.store.set(config);
    }
    getSecrets() {
        try {
            if (!fs.existsSync(this.secretsPath)) {
                return null;
            }
            const files = fs.readdirSync(this.secretsPath);
            const secrets = {};
            for (const file of files) {
                const key = file.replace('.txt', '');
                const value = fs.readFileSync(path.join(this.secretsPath, file), 'utf-8').trim();
                if (key) {
                    secrets[key] = value;
                }
            }
            return Object.keys(secrets).length > 0 ? secrets : null;
        }
        catch {
            return null;
        }
    }
    saveSecrets(secrets) {
        if (!fs.existsSync(this.secretsPath)) {
            fs.mkdirSync(this.secretsPath, { recursive: true });
        }
        for (const [key, value] of Object.entries(secrets)) {
            fs.writeFileSync(path.join(this.secretsPath, `${key}.txt`), value);
        }
    }
}
exports.StoreManager = StoreManager;
//# sourceMappingURL=store-manager.js.map