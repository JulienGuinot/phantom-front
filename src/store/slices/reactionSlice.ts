import { ChatState } from '../../types/types';

type ReactionSlice = {
  reactions: Map<string, Map<string, number>>;
  addReaction: (messageId: string, emoji: string) => void;
  removeReaction: (messageId: string, emoji: string) => void;
};

export const createReactionSlice = (set: any): ReactionSlice => ({
  reactions: new Map(),

  addReaction: (messageId: string, emoji: string) => {
    set((state: ChatState) => {
      const messageReactions = state.reactions.get(messageId) || new Map();
      const count = messageReactions.get(emoji) || 0;
      messageReactions.set(emoji, count + 1);
      return {
        reactions: new Map(state.reactions).set(messageId, messageReactions),
      };
    });
  },

  removeReaction: (messageId: string, emoji: string) => {
    set((state: ChatState) => {
      const messageReactions = state.reactions.get(messageId);
      if (messageReactions) {
        const count = messageReactions.get(emoji);
        if (count) {
          if (count > 1) {
            messageReactions.set(emoji, count - 1);
          } else {
            messageReactions.delete(emoji);
          }
          return {
            reactions: new Map(state.reactions).set(messageId, messageReactions),
          };
        }
      }
      return {};
    });
  },
});
