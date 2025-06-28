
import { create } from 'zustand';
import { Notification } from '../types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications) => {
    const unread = notifications.filter((n) => !n.read_status).length;
    set({ notifications, unreadCount: unread });
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.read_status ? 0 : 1),
    }));
  },

  markAsRead: (notificationId: string) => {
    set((state) => {
      let unreadCount = state.unreadCount;
      const updatedNotifications = state.notifications.map((n) => {
        if (n.id === notificationId && !n.read_status) {
          unreadCount--;
          return { ...n, read_status: true };
        }
        return n;
      });
      return {
        notifications: updatedNotifications,
        unreadCount: Math.max(0, unreadCount),
      };
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read_status: true })),
      unreadCount: 0,
    }));
  },

  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 });
  },
}));
