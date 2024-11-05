import React from 'react';
import { Pin, Trash2, Reply, Copy, Forward } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Message } from '../store/useStore';

interface MessageContextMenuProps {
  message: Message;
  onClose: () => void;
  position: { x: number; y: number };
}

export const MessageContextMenu: React.FC<MessageContextMenuProps> = ({
  message,
  onClose,
  position
}) => {
  const { pinMessage, deleteMessage, pinnedMessages } = useStore();

  const menuItems = [
    {
      icon: <Reply className="w-4 h-4" />,
      label: 'Répondre',
      action: () => {/* TODO */}
    },
    {
      icon: <Pin className="w-4 h-4" />,
      label: pinnedMessages.has(message.id) ? 'Désépingler' : 'Épingler',
      action: () => pinMessage(message.id)
    },
    {
      icon: <Copy className="w-4 h-4" />,
      label: 'Copier',
      action: () => navigator.clipboard.writeText(message.content)
    },
    {
      icon: <Forward className="w-4 h-4" />,
      label: 'Transférer',
      action: () => {/* TODO */}
    },
    {
      icon: <Trash2 className="w-4 h-4" />,
      label: 'Supprimer',
      action: () => deleteMessage(message.id),
      className: 'text-red-500 hover:bg-red-500/10'
    }
  ];

  return (
    <div
      className="fixed z-50 w-48 py-2 bg-dark-light rounded-xl shadow-lg glass-effect"
      style={{ top: position.y, left: position.x }}
    >
      {menuItems.map((item, index) => (
        <button
          key={index}
          onClick={() => {
            item.action();
            onClose();
          }}
          className={`w-full px-4 py-2 text-sm flex items-center space-x-2 hover:bg-white/5 transition-colors ${item.className || ''}`}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}; 