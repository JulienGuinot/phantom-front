import { Notification, ChatState } from '../../types/types';


type NotificationSlice = {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
};

export const createNotificationSlice = (set: any): NotificationSlice => ({
  notifications: [],

  addNotification: (notification: Notification) => {
    set((state: ChatState) => ({
      notifications: [...state.notifications, notification],
    }));
  },
});
