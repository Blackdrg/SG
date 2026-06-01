import { io, Socket } from 'socket.io-client';

interface MessageEnvelope {
  id: string;
  event: string;
  data: any;
  timestamp: number;
  requiresAck?: boolean;
}

interface AcknowledgementCallback {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  timeout: NodeJS.Timeout;
}

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private messageQueue: MessageEnvelope[] = [];
  private pendingAcks = new Map<string, AcknowledgementCallback>();
  private subscriptions = new Map<string, (data: any) => void>();
  private isConnected = false;
  private currentOrderId: string | null = null;

  constructor() {
    this.initialize();
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateBackoff(attempt: number): number {
    const baseDelay = this.reconnectDelay;
    const maxDelay = 30000;
    const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
    const jitter = delay * 0.1 * Math.random();
    return Math.floor(delay + jitter);
  }

  private initialize() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    this.socket = io(backendUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: 10000,
      pingInterval: 10000,
      pingTimeout: 20000,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('WebSocket connected:', this.socket?.id);
      this.flushMessageQueue();
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      console.log('WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.attemptReconnect();
    });

    this.socket.on('ack', (data: { messageId: string }) => {
      const pending = this.pendingAcks.get(data.messageId);
      if (pending) {
        clearTimeout(pending.timeout);
        pending.resolve({ status: 'acknowledged' });
        this.pendingAcks.delete(data.messageId);
      }
    });

    this.socket.on('message', (data: MessageEnvelope) => {
      this.handleIncomingMessage(data);
    });

    this.socket.io.on('reconnect_attempt', (_attempt) => {
      this.reconnectAttempts++;
    });

    this.socket.io.on('reconnect', (_attempt) => {
      this.reconnectAttempts = 0;
      this.flushMessageQueue();
    });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = this.calculateBackoff(this.reconnectAttempts + 1);
      setTimeout(() => {
        if (this.socket) {
          this.socket.connect();
        }
      }, delay);
    }
  }

  private handleIncomingMessage(data: MessageEnvelope) {
    if (data.requiresAck) {
      this.socket?.emit('ack', { messageId: data.id });
    }

    const handler = this.subscriptions.get(data.event);
    if (handler) {
      handler(data.data);
    }
  }

  private flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const msg = this.messageQueue.shift();
      if (msg) {
        this.sendMessage(msg);
      }
    }
  }

  async connect() {
    if (!this.socket?.connected) {
      this.socket?.connect();
    }
    return new Promise((resolve) => {
      if (this.isConnected) {
        resolve(true);
      } else {
        this.socket?.once('connect', () => resolve(true));
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
    this.isConnected = false;
  }

  subscribe(event: string, callback: (data: any) => void) {
    this.subscriptions.set(event, callback);
    
    this.socket?.on(event, callback);

    return () => {
      this.subscriptions.delete(event);
      this.socket?.off(event, callback);
    };
  }

  unsubscribe(event: string) {
    const handler = this.subscriptions.get(event);
    if (handler) {
      this.socket?.off(event, handler);
      this.subscriptions.delete(event);
    }
  }

  sendMessage(data: MessageEnvelope): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        this.messageQueue.push(data);
        resolve({ status: 'queued', message: 'Message queued for delivery when online' });
        return;
      }

      if (data.requiresAck) {
        this.pendingAcks.set(data.id, {
          resolve,
          reject,
          timeout: setTimeout(() => {
            this.pendingAcks.delete(data.id);
            reject(new Error('Acknowledgement timeout'));
          }, 5000),
        });
      } else {
        resolve({ status: 'sent' });
      }

      this.socket?.emit('message', data);
    });
  }

  async joinRoom(room: string) {
    return this.sendMessage({
      id: this.generateMessageId(),
      event: 'join',
      data: { room },
      timestamp: Date.now(),
    });
  }

  async sendAcknowledgement(messageId: string) {
    return this.sendMessage({
      id: this.generateMessageId(),
      event: 'ack',
      data: { messageId },
      timestamp: Date.now(),
    });
  }

  isSocketConnected(): boolean {
    return this.isConnected;
  }

  getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }

  getQueueLength(): number {
    return this.messageQueue.length;
  }
}

export const wsService = new WebSocketService();
export default WebSocketService;