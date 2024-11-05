import React, { useState } from 'react';
import { Users, MessageSquarePlus } from 'lucide-react';
import { useStore } from '../store/useStore';
import { NewConversationModal } from './NewConversationModal';

interface SidebarProps {
  onSelectContact: React.Dispatch<React.SetStateAction<string | undefined>>;
  selectedContact: string | undefined;
}

export const Sidebar: React.FC<SidebarProps> = ({ onSelectContact, selectedContact }) => {
  const [showNewConversation, setShowNewConversation] = useState(false);
  const { conversations, username, userId, createConversation, currentConversation } = useStore();

  const handleNewConversation = async (username: string) => {
    try {
      await createConversation(username);
      console.log('Création d\'une nouvelle conversation pour:', username);
      setShowNewConversation(false);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div className="w-80 border-r border-white/10 bg-dark-light/30 flex flex-col">
      <div className="p-4">
        {username && (
          <div className="glass-effect rounded-xl p-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full glass-effect flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">{username}</h3>
                <div className="flex items-center space-x-1 text-xs text-primary">
                  <Lock className="w-3 h-3" />
                  <span>En ligne</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <button
          onClick={() => setShowNewConversation(true)}
          className="w-full flex items-center justify-center space-x-2 bg-primary hover:bg-primary-dark text-white rounded-xl px-4 py-3 transition-colors duration-200"
        >
          <MessageSquarePlus className="w-5 h-5" />
          <span>Nouvelle conversation</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.map(conversation => {
          const otherParticipant = conversation.participants.find(p => p.id !== userId);
          if (!otherParticipant) return null;

          return (
            <button
              key={conversation.id}
              onClick={() => {
                useStore.setState({ currentConversation: conversation.id });
                onSelectContact(otherParticipant.username);
              }}
              className={`w-full p-4 hover:bg-white/5 transition-colors ${
                conversation.id === currentConversation ? 'bg-white/10' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full glass-effect flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  {otherParticipant.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-dark" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{otherParticipant.username}</h3>
                  {conversation.lastMessage && (
                    <p className="text-sm text-gray-400 truncate">
                      {conversation.lastMessage.content}
                    </p>
                  )}
                </div>
                {conversation.lastMessage && (
                  <div className="text-xs text-gray-500">
                    {new Date(conversation.lastMessage.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {showNewConversation && (
        <NewConversationModal
          onClose={() => setShowNewConversation(false)}
          onSubmit={handleNewConversation}
        />
      )}
    </div>
  );
};