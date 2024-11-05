import { AuthState, User } from '../../types/types';
import { api } from '../../lib/api';
import { WebSocketClient } from '../../lib/websocket';

type AuthSlice = {
  user: User | null;
  userId: string | null;
  publicKey: string | null;
  privateKey: string | null;
  signingPublicKey: string | null;
  signingPrivateKey: string | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  fetchInitialData: () => Promise<void>;
};

export const createAuthSlice = (set: any, get: any): AuthSlice => ({
  user: null,
  userId: null,
  publicKey: null,
  privateKey: null,
  signingPublicKey: null,
  signingPrivateKey: null,
  token: null,

  login: async (username: string, password: string) => {
    try {
      console.log('Tentative de connexion...');
      const response = await api.login(username, password);
      const { user, token, privateKey, signingPrivateKey } = response.data;

      console.log('Connexion réussie:', user);

      // Stocker les clés dans le localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('privateKey', privateKey);
      localStorage.setItem('signingPrivateKey', signingPrivateKey);

      // Créer et connecter le WebSocketClient avec les handlers injectés
      const ws = new WebSocketClient(import.meta.env.VITE_WS_URL!, token, {
        updateMessage: get().updateMessage,
        addMessage: get().addMessage,
        addNotification: get().addNotification,
        resendUnsentMessages: get().resendUnsentMessages,
      });
      ws.connect();

      set({
        user: {
          username: user.username,
          passwordHash: password,
        },
        userId: user.id,
        publicKey: user.publicKey,
        privateKey: privateKey,
        signingPrivateKey: signingPrivateKey,
        wsClient: ws,
        token,
      });

      await get().fetchInitialData();
      console.log('Données initiales chargées');
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  },

  register: async (username: string, password: string) => {
    try {
      const response = await api.register(username, password);
      const { user, privateKey, token, signingPrivateKey } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('privateKey', privateKey);
      localStorage.setItem('signingPrivateKey', signingPrivateKey || '');

      set({
        user: {
          username: user.username,
          passwordHash: password,
        },
        userId: user.id,
        publicKey: user.publicKey,
        privateKey,
        signingPrivateKey: signingPrivateKey || '',
        token,
      });

      // Optionnel : Connecter automatiquement l'utilisateur après l'inscription
      await get().fetchInitialData();
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      throw error;
    }
  },

  logout: () => {
    const wsClient = get().wsClient;
    if (wsClient) {
      // Envoyer le statut "offline"
      wsClient.send({
        type: 'STATUS_UPDATE',
        status: 'offline',
      });
      wsClient.disconnect();
    }
    localStorage.removeItem('token');
    localStorage.removeItem('privateKey');
    localStorage.removeItem('signingPrivateKey');
    set({
      user: null,
      wsClient: undefined,
      userId: null,
      publicKey: null,
      privateKey: null,
      signingPublicKey: null,
      signingPrivateKey: null,
      username: null,
      conversations: [],
      messages: [],
      token: null,
      typingStatuses: [],
      reactions: new Map(),
      pinnedMessages: new Set(),
      archivedChats: new Set(),
      readReceipts: new Set(),
      deletedMessages: new Set(),
      unsentMessages: [],
    });
  },

  fetchInitialData: async () => {
    await get().initialize();
  },
});
