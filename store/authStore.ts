import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserProfile } from '../types';
import { useNotificationStore } from './notificationStore';
// Import both user service and auth service
import { userService, authService } from '../services/service/api';

interface AuthState {
    user: UserProfile | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    permissions: string[];
    setTokens: (accessToken: string, refreshToken: string) => void;
    setUser: (user: UserProfile) => void;
    setAuth: (user: UserProfile, access: string, refresh: string, perms: string[]) => void;
    logout: () => Promise<void>;
    hasPermission: (permission: string) => boolean;
    checkAuth: () => Promise<void>; // New function to validate session
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            permissions: [],
            setTokens: (accessToken: string, refreshToken: string) => {
                // Store tokens in localStorage for direct access by apiUtils
                localStorage.setItem('access_token', accessToken);
                localStorage.setItem('refresh_token', refreshToken);
                set({ accessToken, refreshToken });
            },
            setUser: (user: UserProfile) => {
                set({ user, isAuthenticated: true });
            },
            setAuth: (user: UserProfile, access: string, refresh: string, perms: string[]) => {
                // Store tokens in localStorage for direct access by apiUtils
                localStorage.setItem('access_token', access);
                localStorage.setItem('refresh_token', refresh);
                set({ 
                    user, 
                    accessToken: access, 
                    refreshToken: refresh, 
                    permissions: perms,
                    isAuthenticated: true 
                });
            },
            logout: async () => {
                try {
                    // First, get the current tokens from localStorage directly
                    // to avoid any potential state inconsistencies
                    const accessToken = localStorage.getItem('access_token');
                    const refreshToken = localStorage.getItem('refresh_token');

                    // Clear tokens from localStorage immediately to prevent any retry attempts
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');

                    // Clear the state before making API call to ensure UI updates immediately
                    set({ user: null, accessToken: null, refreshToken: null, permissions: [], isAuthenticated: false });

                    // Optionally clear other stores on logout
                    useNotificationStore.getState().clearNotifications();

                    // Only call the logout endpoint if we have both tokens
                    if (accessToken && refreshToken) {
                        // Use a try/catch inside to prevent any errors from affecting the UI state
                        try {
                            await authService.logout();
                        } catch (apiError) {
                            // Just log the error, state is already cleared
                            console.warn('API logout failed, but local state is cleared:', apiError);
                        }
                    }
                } catch (error) {
                    console.error('Error during logout:', error);
                    // Ensure state is cleared even if something unexpected happens
                    set({ user: null, accessToken: null, refreshToken: null, permissions: [], isAuthenticated: false });
                }
            },
            hasPermission: (permission: string): boolean => {
                const { permissions } = get();
                return permissions.includes(permission);
            },
            // New function to check auth status on app load
            checkAuth: async () => {
                const { accessToken } = get();
                if (accessToken) {
                    try {
                        // If we have a token, assume we are authenticated and fetch the user
                        // The apiRequest handler will automatically use the refresh token if the access token is expired
                        const user = await userService.getById('me'); // Assuming you have an endpoint like /users/me/
                        set({ user, isAuthenticated: true });
                    } catch (error) {
                        console.error('Session expired, logging out.', error);
                        // If fetching the user fails, the token is invalid, so log out
                        get().logout();
                    }
                }
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            // Persist user object along with tokens
            partialize: (state) => ({
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                user: state.user, // Persist user
                permissions: state.permissions, // Persist permissions
                isAuthenticated: state.isAuthenticated // Persist auth status
            }),
        }
    )
);
