import type { Conversation } from '../types/types';

export const mapConversation = (conversation: any): Conversation => ({
  id: conversation._id,
  participants: conversation.participants.map((p: any) => ({
    id: p._id,
    username: p.username,
    online: p.online || false,
    lastSeen: p.lastSeen || 0,
  })),
  createdAt: conversation.createdAt,
  updatedAt: conversation.updatedAt,
  lastMessage: conversation.lastMessage
    ? {
        content: conversation.lastMessage.content,
        timestamp: conversation.lastMessage.timestamp,
        senderId: conversation.lastMessage.senderId,
      }
    : undefined,
}); 