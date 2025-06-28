
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserProfile } from '../types';
import { useNotificationStore } from './notificationStore';

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: UserProfile) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setTokens: (accessToken: string, refreshToken: string) => {
        set({ accessToken, refreshToken });
      },
      setUser: (user: UserProfile) => {
        set({ user, isAuthenticated: true });
      },
      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
        useNotificationStore.getState().clearNotifications();
      },
      hasPermission: (permission: string): boolean => {
        const user = get().user;
        if (!user || !user.roles) {
          return false;
        }
        // Create a set of all permissions for efficient lookup
        const userPermissions = new Set<string>();
        user.roles.forEach(role => {
          role.permissions.forEach(p => {
            userPermissions.add(p);
          });
        });
        return userPermissions.has(permission);
      },
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
      partialize: (state) => ({ accessToken: state.accessToken, refreshToken: state.refreshToken }),
    }
  )
);
