// src/lib/websocket.ts
import { WebSocketHandlers } from '../types/types';

export class WebSocketClient {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 3;
    private reconnectDelay = 2000;
    private handlers: WebSocketHandlers;
    
    constructor(private url: string, private token: string, handlers: WebSocketHandlers) {
        this.handlers = handlers;
    }
    
    connect() {
      try {
        console.log('Tentative de connexion WebSocket...');
        this.ws = new WebSocket(`${this.url}?token=${this.token}`);
        
        this.ws.onopen = this.handleOpen;
        this.ws.onmessage = this.handleMessage;
        this.ws.onclose = this.handleClose;
        this.ws.onerror = this.handleError;
      } catch (error) {
        console.error('Erreur lors de la connexion WebSocket:', error);
        this.handleError();
      }
    }
    
    private handleOpen = () => {
      console.log('Connexion WebSocket établie');
      this.reconnectAttempts = 0;
    };
    
    disconnect() {
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }
    }
    
    private handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'NEW_MESSAGE':
          const existingTempMessage = undefined; // Ajuster selon vos besoins

          if (existingTempMessage) {
            this.handlers.updateMessage(existingTempMessage.id, data.message);
          } else {
            this.handlers.addMessage(data.message);
            // Ajouter une notification
            this.handlers.addNotification({
              id: generateIdentifier(),
              type: 'new_message',
              message: `Nouveau message de ${data.message.sender.id}`,
            });
          }
          break;
          
        case 'MESSAGE_REACTION':
          // Implémenter selon vos besoins
          break;
          
        case 'MESSAGE_PIN_STATUS':
          // Implémenter selon vos besoins
          break;
          
        case 'TYPING':
          // Implémenter selon vos besoins
          break;
          
        case 'READ_RECEIPT':
          // Implémenter selon vos besoins
          break;
          
        default:
          console.warn(`Type de message inconnu: ${data.type}`);
      }
    };
    
    private handleClose = () => {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        console.log(`Tentative de reconnexion ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts}`);
        setTimeout(() => {
          this.reconnectAttempts++;
          this.connect();
        }, this.reconnectDelay);
      } else {
        console.error('Nombre maximum de tentatives de reconnexion atteint');
        // Réessayer d'envoyer les messages en attente
        this.handlers.resendUnsentMessages();
      }
    };
    
    private handleError = () => {
      console.error('Erreur WebSocket');
      this.ws?.close();
    };
    
    send(data: any) {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(data));
      }
    }
  }

function generateIdentifier(): string {
  return 'id-' + Math.random().toString(36).substr(2, 9);
}