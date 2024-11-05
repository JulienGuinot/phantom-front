import { ExtendedMessage, ChatState } from '../../types/types';
import { api } from '../../lib/api';
import { encryptMessage } from '../../lib/crypto';
import { Conversation, Contact } from '../../types/types';

type MessageSlice = {
  messages: ExtendedMessage[];
  unsentMessages: ExtendedMessage[];
  sendMessage: (content: string) => Promise<void>;
  addMessage: (message: ExtendedMessage) => void;
  updateMessage: (messageId: string, updatedMessage: Partial<ExtendedMessage>) => void;
  deleteMessage: (messageId: string) => void;
  markAsRead: (messageId: string) => void;
  addUnsentMessage: (message: ExtendedMessage) => void;
  resendUnsentMessages: () => Promise<void>;
  searchMessages: (query: string) => ExtendedMessage[];
  pinMessage: (messageId: string) => void;
  unpinMessage: (messageId: string) => void;
  updateMessageStatus: (messageId: string, status: 'sent' | 'delivered' | 'read') => void;
};

export const createMessageSlice = (set: any, get: any): MessageSlice => ({
  messages: [],
  unsentMessages: [],

  sendMessage: async (content: string) => {
    const { privateKey, signingPrivateKey, token, currentConversation, conversations, decryptMessage, userId } = get();

    if (!privateKey || !signingPrivateKey || !token || !currentConversation) {
      console.error('Informations manquantes pour l\'envoi du message');
      return;
    }

    const conversation = conversations.find((c: Conversation) => c.id === currentConversation);
    if (!conversation) return;

    try {
      const recipient = conversation.participants.find((p: Contact) => p.id !== userId);
      if (!recipient) return;

      // Chiffrer le message avant de l'envoyer
      const encrypted = encryptMessage(
        content,
        recipient.publicKey,
        privateKey,
        signingPrivateKey
      );

      // Créer un message temporaire
      const tempId = 'temp-' + Date.now();
      const newMessage: ExtendedMessage = {
        id: tempId,
        conversationId: currentConversation,
        senderId: userId!,
        content: encrypted.encrypted,
        decryptedContent: content, // Optimistic UI
        timestamp: Date.now(),
        encrypted,
        status: 'sent',
        isSending: true,
      };

      // Ajout optimiste du message
      set((state: ChatState) => ({
        messages: [...state.messages, newMessage],
      }));

      // Envoyer le message au backend
      const responseMessage = await api.sendMessage(
        currentConversation,
        encrypted,
        token
      );

      // Déchiffrer le message reçu du backend
      const decryptedContent = await decryptMessage(responseMessage);

      // Remplacer le message temporaire par le message réel
      set((state: ChatState) => ({
        messages: state.messages.map(msg =>
          msg.id === tempId ? { ...responseMessage, decryptedContent, isSending: false } : msg
        ),
      }));
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      // Marquer le message comme ayant échoué
      set((state: ChatState) => ({
        messages: state.messages.map(msg =>
          msg.id === tempId ? { ...msg, failed: true, isSending: false } : msg
        ),
      }));
    }
  },

  addMessage: (message: ExtendedMessage) => {
    set((state: ChatState) => ({
      messages: [...state.messages, message],
    }));
  },

  updateMessage: (messageId: string, updatedMessage: Partial<ExtendedMessage>) => {
    set((state: ChatState) => ({
      messages: state.messages.map(msg =>
        msg.id === messageId ? { ...msg, ...updatedMessage } : msg
      ),
    }));
  },

  deleteMessage: (messageId: string) => {
    set((state: ChatState) => ({
      messages: state.messages.filter(msg => msg.id !== messageId),
    }));
  },

  markAsRead: (messageId: string) => {
    set((state: ChatState) => {
      const readReceipts = new Set(state.readReceipts);
      readReceipts.add(messageId);
      return { readReceipts };
    });
  },

  addUnsentMessage: (message: ExtendedMessage) => {
    set((state: ChatState) => ({
      unsentMessages: [...state.unsentMessages, message],
    }));
  },

  resendUnsentMessages: async () => {
    const { unsentMessages, sendMessage } = get();
    for (const msg of unsentMessages) {
      try {
        await sendMessage(msg.content);
        // Retirer le message de unsentMessages après envoi réussi
        set((state: ChatState) => ({
          unsentMessages: state.unsentMessages.filter(m => m.id !== msg.id),
        }));
      } catch (error) {
        console.error('Erreur lors de l\'envoi des messages en attente:', error);
      }
    }
  },

  searchMessages: (query: string): ExtendedMessage[] => {
    return get().messages.filter((msg: ExtendedMessage) => msg.decryptedContent?.toLowerCase().includes(query.toLowerCase()));
  },

  pinMessage: (messageId: string) => {
    set((state: ChatState) => {
      const pinnedMessages = new Set(state.pinnedMessages);
      pinnedMessages.add(messageId);
      return { pinnedMessages };
    });
  },

  unpinMessage: (messageId: string) => {
    set((state: ChatState) => {
      const pinnedMessages = new Set(state.pinnedMessages);
      pinnedMessages.delete(messageId);
      return { pinnedMessages };
    });
  },

  updateMessageStatus: (messageId: string, status: 'sent' | 'delivered' | 'read') => {
    set((state: ChatState) => ({
      messages: state.messages.map(msg =>
        msg.id === messageId ? { ...msg, status } : msg
      ),
    }));
  },
});
