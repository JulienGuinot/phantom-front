import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatState, AuthState } from '../types/types';

// Import des slices
import { createAuthSlice } from './slices/authSlice';
import { createConversationSlice } from './slices/conversationSlice';
import { createMessageSlice } from './slices/messageSlice';
import { createNotificationSlice } from './slices/notificationSlice';
import { createWebsocketSlice } from './slices/websocketSlice';

export const useStore = create<ChatState & AuthState>()(
  persist(
    (set, get) => ({
      // Combinaison des slices
      ...createAuthSlice(set, get),
      ...createConversationSlice(set, get),
      ...createMessageSlice(set, get),
      ...createNotificationSlice(set, get),
      ...createWebsocketSlice(set, get),

      // Fonction d'initialisation
      initialize: async () => {
        try {
          await get().fetchConversations();
          // Si vous avez une méthode pour récupérer les messages, vous pouvez l'appeler ici
          // Exemple :
          // const conversations = get().conversations;
          // for (const convo of conversations) {
          //   await get().fetchMessages(convo.id);
          // }
        } catch (error) {
          console.error("Erreur lors de l'initialisation:", error);
        }
      },

      // Définir fetchInitialData si utilisé dans d'autres slices
      fetchInitialData: async () => {
        await get().initialize();
      },

      // Autres actions globales si nécessaire
    }),
    {
      name: 'user-storage',
      partialize: (state) => {
        const { wsClient, ...persistedState } = state;
        return persistedState;
      },
    }
  )
);