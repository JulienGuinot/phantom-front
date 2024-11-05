import { WebSocketClient } from '../../lib/websocket';

type WebsocketSlice = {
  wsClient?: WebSocketClient;
  initializeWebSocket: () => void;
};

export const createWebsocketSlice = (set: any, get: any): WebsocketSlice => ({
  wsClient: undefined,

  initializeWebSocket: () => {
    const token = get().token;
    if (!token) {
      console.error('Token manquant pour initialiser le WebSocket');
      return;
    }

    if (!get().wsClient) {
      const ws = new WebSocketClient(import.meta.env.VITE_WS_URL!, token, {
        updateMessage: get().updateMessage,
        addMessage: get().addMessage,
        addNotification: get().addNotification,
        resendUnsentMessages: get().resendUnsentMessages,
      });
      ws.connect();
      set({ wsClient: ws });
    }
  },
});
