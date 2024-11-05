// src/lib/api.ts
import { Conversation, EncryptedMessage, EncryptedFile, Message } from '../types/types';

const API_URL = 'http://localhost:3000/api';

export interface LoginResponse {
  status: string;
  data: {
    user: {
      id: string;
      username: string;
      publicKey: string;
    };
    token: string;
    privateKey: string;
    signingPrivateKey: string;
  };
}

export interface RegisterResponse extends LoginResponse {
  data: LoginResponse['data'] & {
    privateKey: string;
  };
}

export interface MeResponse {
  status: string;
  data: {
    user: {
      id: string;
      username: string;
      publicKey: string;
    };
  };
}

export interface SearchUsersResponse {
  status: string;
  data: {
    users: Array<{
      id: string;
      username: string;
      publicKey: string;
    }>;
  };
}

export interface SendMessageResponse extends Message {}

export const api = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) {
      throw new Error('Échec de la connexion');
    }
    
    return response.json();
  },

  register: async (username: string, password: string): Promise<RegisterResponse> => {
    const response = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) {
      throw new Error("Échec de l'inscription");
    }
    
    return response.json();
  },

  getMe: async (token: string): Promise<MeResponse> => {
    const response = await fetch(`${API_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Échec de la récupération du profil');
    }
    
    return response.json();
  },

  createConversation: async (username: string, token: string): Promise<Conversation> => {
    try {
      const response = await fetch(`${API_URL}/conversations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de la création de la conversation');
      }

      const conversationData: Conversation = await response.json();
      console.log('Conversation créée:', conversationData);
      return conversationData;
    } catch (error) {
      console.error('Erreur dans createConversation:', error);
      throw error;
    }
  },

  sendMessage: async (conversationId: string, content: string, token: string): Promise<SendMessageResponse> => {
    try {
      const response = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content,
          encrypted: true
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Échec de l'envoi du message");
      }

      const data = await response.json();
      return {
        id: data._id,
        conversationId: data.conversation,
        content: data.content,
        senderId: data.sender._id,
        timestamp: new Date(data.createdAt).getTime(),
        attachments: data.attachments || [],
        reactions: data.reactions || [],
        isPinned: data.isPinned || false,
        status: 'sent',
        encrypted: data.encrypted
      };
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      throw error;
    }
  },

  addContact: async (userId: string, token: string): Promise<void> => {
    const response = await fetch(`${API_URL}/contacts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    
    if (!response.ok) {
      throw new Error("Échec de l'ajout du contact");
    }
  },

  getConversations: async (token: string): Promise<Conversation[]> => {
    const response = await fetch(`${API_URL}/conversations`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Échec de la récupération des conversations');
    }
    
    return response.json();
  },

  getMessages: async (conversationId: string, token: string): Promise<Message[]> => {
    try {
      const response = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Échec de la récupération des messages');
      }
      
      const responseData = await response.json();
      
      if (!responseData || !responseData.data || !Array.isArray(responseData.data)) {
        console.warn('Format de réponse invalide pour les messages:', responseData);
        return [];
      }
      
      // Transformer les messages du format API vers le format attendu
      return responseData.data.map((msg: any) => ({
        id: msg._id,
        conversationId: msg.conversation,
        senderId: msg.sender._id,
        timestamp: new Date(msg.createdAt).getTime(),
        attachments: msg.attachments || [],
        reactions: msg.reactions || [],
        isPinned: msg.isPinned || false,
        status: 'received',
        encrypted: {
          encrypted: msg.encrypted, // Assurez-vous que ce champ existe dans la réponse API
          nonce: msg.nonce, // Assurez-vous que ce champ existe dans la réponse API
          ephemeralPublicKey: msg.ephemeralPublicKey // Assurez-vous que ce champ existe dans la réponse API
        }
      }));
      
    } catch (error) {
      console.error('Erreur API getMessages:', error);
      return [];
    }
  },

  addReaction: async (messageId: string, type: string, token: string): Promise<void> => {
    const response = await fetch(`${API_URL}/messages/${messageId}/reactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type }),
    });
    
    if (!response.ok) {
      throw new Error("Échec de l'ajout de la réaction");
    }
  },

  searchUsers: async (searchQuery: string, token: string): Promise<SearchUsersResponse> => {
    const response = await fetch(`${API_URL}/users/search?query=${encodeURIComponent(searchQuery)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Échec de la recherche des utilisateurs");
    }

    return response.json();
  },
};