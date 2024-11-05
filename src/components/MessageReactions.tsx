import React, { useState } from 'react';
import { Smile, Heart, ThumbsUp, Star, Plus } from 'lucide-react';
import { useStore } from '../store/useStore';

const REACTIONS = [
  { emoji: '❤️', icon: Heart },
  { emoji: '👍', icon: ThumbsUp },
  { emoji: '⭐', icon: Star },
  { emoji: '😊', icon: Smile },
];

interface MessageReactionsProps {
  messageId: string;
}

export const MessageReactions: React.FC<MessageReactionsProps> = ({ messageId }) => {
  const [showPicker, setShowPicker] = useState(false);
  const { addReaction, reactions } = useStore();
  const messageReactions = reactions.get(messageId) || new Map();

  return (
    <div className="relative">
      <div className="flex items-center space-x-1">
        {Array.from(messageReactions.entries()).map(([emoji, count]) => (
          <button
            key={emoji}
            onClick={() => addReaction(messageId, emoji)}
            className="px-2 py-1 rounded-full glass-effect text-xs hover:bg-primary/10 transition-colors"
          >
            {emoji} {count}
          </button>
        ))}
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="p-1 rounded-full hover:bg-primary/10 transition-colors"
        >
          <Plus className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {showPicker && (
        <div className="absolute bottom-full mb-2 p-2 rounded-xl glass-effect grid grid-cols-4 gap-2">
          {REACTIONS.map(({ emoji, icon: Icon }) => (
            <button
              key={emoji}
              onClick={() => {
                addReaction(messageId, emoji);
                setShowPicker(false);
              }}
              className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}; 