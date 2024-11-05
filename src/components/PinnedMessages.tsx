import React from 'react';
import { Pin, X } from 'lucide-react';
import { useStore } from '../store/useStore';

export const PinnedMessages: React.FC = () => {
  const { messages, pinnedMessages, unpinMessage } = useStore();
  const pinnedMessagesList = messages.filter(msg => pinnedMessages.has(msg.id));

  if (pinnedMessagesList.length === 0) return null;

  return (
    <div className="glass-effect p-4 mb-4 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2 text-primary">
          <Pin className="w-4 h-4" />
          <span className="font-medium">Messages épinglés</span>
        </div>
      </div>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {pinnedMessagesList.map(msg => (
          <div key={msg.id} className="flex items-center justify-between p-2 rounded-lg bg-dark-light/30">
            <p className="text-sm text-gray-300 truncate">{msg.content}</p>
            <button
              onClick={() => unpinMessage(msg.id)}
              className="text-gray-400 hover:text-red-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}; 