import { Conversation, ChatState } from '../../types/types';
import { mapConversation } from '../../utils/mapConversation';
import { api } from '../../lib/api';

type ConversationSlice = {
  conversations: Conversation[];
  currentConversation: string | null;
  fetchConversations: () => Promise<void>;
  createConversation: (username: string) => Promise<Conversation | undefined>;
  deleteChat: (contactId: string) => void;
  archiveChat: (contactId: string) => void;
};

export const createConversationSlice = (set: any, get: any): ConversationSlice => ({
  conversations: [],
  currentConversation: null,

  fetchConversations: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const conversationsData = await api.getConversations(token);
      const mappedConversations = conversationsData.map(mapConversation);

      set({ conversations: mappedConversations });
    } catch (error) {
      console.error('Erreur:', error);
    }
  },

  createConversation: async (username: string): Promise<Conversation | undefined> => {
    const token = get().token;
    if (!token) {
      console.error('Token manquant');
      throw new Error('Veuillez vous reconnecter');
    }

    try {
      const conversationData = await api.createConversation(username, token);
      const mappedConversation = mapConversation(conversationData);
      console.log('Conversation mappée:', mappedConversation);

      set((state: ChatState) => ({
        conversations: [...state.conversations, mappedConversation],
        currentConversation: mappedConversation.id,
      }));

      return mappedConversation;
    } catch (error) {
      console.error('Erreur dans createConversation:', error);
      throw error;
    }
  },

  deleteChat: (contactId: string) => {
    set((state: ChatState) => ({
      conversations: state.conversations.filter(c => c.id !== contactId),
    }));
  },

  archiveChat: (contactId: string) => {
    set((state: ChatState) => {
      const archivedChats = new Set(state.archivedChats);
      archivedChats.add(contactId);
      return { archivedChats };
    });
  },
});
