import { ChatState } from '../../types/types';

type StatusSlice = {
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
  setConnectionStatus: (status: 'connected' | 'disconnected' | 'reconnecting') => void;
};

export const createStatusSlice = (set: any): StatusSlice => ({
  connectionStatus: 'disconnected',

  setConnectionStatus: (status: 'connected' | 'disconnected' | 'reconnecting') => {
    set({ connectionStatus: status });
  },
});
