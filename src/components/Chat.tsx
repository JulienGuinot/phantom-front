import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Send } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Users } from 'lucide-react';


export const Chat: React.FC<{ selectedContact?: string }> = () => {
  const [message, setMessage] = useState('');
  const { messages, conversations, currentConversation, sendMessage, userId, wsClient, pinnedMessages, pinMessage, unpinMessage } = useStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const chatMessages = useMemo(() => {
    if (!currentConversation) return [];
    return messages
      .filter(m => m.conversationId === currentConversation)
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
  }, [messages, currentConversation]);

  useEffect(() => {
    if (chatMessages.length > 0) {
      scrollToBottom();
    }
  }, [chatMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentConversation) return;
    
    try {
      await sendMessage(message);
      setMessage('');
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
    }
  };

  // Débounce pour éviter d'envoyer trop d'événements
  useEffect(() => {
    if (message.trim() && currentConversation && wsClient) {
      const timeout = setTimeout(() => {
        wsClient.send({
          type: 'TYPING',
          conversationId: currentConversation,
        });
      }, 300);

      return () => clearTimeout(timeout);
    }
  }, [message, currentConversation, wsClient]);

  useEffect(() => {
    const markMessagesAsRead = () => {
      const unreadMessages = messages.filter(msg => 
        msg.conversationId === currentConversation && !msg.readReceipt && msg.senderId !== userId
      );
      
      unreadMessages.forEach(msg => {
        useStore.getState().markAsRead(msg.id);
        if (wsClient) {
          wsClient.send({
            type: 'READ_RECEIPT',
            messageId: msg.id,
          });
        }
      });
    };

    markMessagesAsRead();
  }, [messages, currentConversation, userId, wsClient]);

  // Si aucune conversation n'est sélectionnée
  if (!currentConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-dark p-4">
        <p className="text-gray-400">Sélectionnez une conversation pour commencer</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-dark">
      {/* Zone des messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.length > 0 ? (
          chatMessages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.senderId === userId ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] rounded-lg p-3 ${
                msg.senderId === userId ? 'bg-primary' : 'glass-effect'
              }`}>
                <p className="break-words">{msg.decryptedContent || msg.content}</p>
                {pinnedMessages.has(msg.id) && (
                  <span className="text-xs text-yellow-500">📌 Épinglé</span>
                )}
                <span className="text-xs text-gray-400 mt-1 block">
                  {new Date(msg.timestamp || Date.now()).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400">Aucun message dans cette conversation</p>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Zone de saisie du message */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Écrivez votre message..."
            className="flex-1 bg-dark-light/30 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="bg-primary hover:bg-primary-dark text-white rounded-xl p-3 transition-colors disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};