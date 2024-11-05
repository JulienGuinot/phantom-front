import React from 'react';
import { Trash2, Check, Edit2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Message } from '../store/useStore';

interface MessageControlsProps {
  message: Message;
  isOwn: boolean;
}

export const MessageControls: React.FC<MessageControlsProps> = ({ message, isOwn }) => {
  const { deleteMessage, markAsRead } = useStore();

  return (
    <div className="absolute bottom-full mb-2 right-0 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
      {isOwn && (
        <button
          onClick={() => deleteMessage(message.id)}
          className="p-1 rounded-full hover:bg-red-500/10 text-red-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
      
      {!isOwn && !message.readReceipt && (
        <button
          onClick={() => markAsRead(message.id)}
          className="p-1 rounded-full hover:bg-green-500/10 text-green-500 transition-colors"
        >
          <Check className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};