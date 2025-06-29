
import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authService, notificationService } from '../../services';
import MainLayout from '../layout/MainLayout';
import Spinner from '../ui/Spinner';
import { useNotificationStore } from '../../store/notificationStore';
import { Notification } from '../../types';

const PrivateRoute: React.FC = () => {
  const { isAuthenticated, refreshToken, setAuth, logout } = useAuthStore();
  const [isLoadingInitialAuth, setIsLoadingInitialAuth] = useState(true);
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    const validateSession = async () => {
      // If already authenticated or no refresh token, finish loading
      if (isAuthenticated || !refreshToken) {
        if (!isAuthenticated && !refreshToken) {
            // No tokens at all, just ensure the state is clean without API call
            // We don't need to call logout() here as there are no tokens to invalidate
            useAuthStore.setState({ 
              user: null, 
              accessToken: null, 
              refreshToken: null, 
              permissions: [],
              isAuthenticated: false 
            });
        }
        setIsLoadingInitialAuth(false);
        return;
      }

      // If not authenticated but has a refresh token, try to re-authenticate
      try {
        const { access, refresh, user } = await authService.refreshToken(refreshToken);

        // Extract permissions from user roles
        const permissions: string[] = [];
        user.roles.forEach(role => {
          if (role && role.permissions) {
            role.permissions.forEach(permission => {
              if (!permissions.includes(permission)) {
                permissions.push(permission);
              }
            });
          }
        });

        // Use setAuth to store user, tokens, and permissions
        setAuth(user, access, refresh, permissions);
      } catch (error) {
        console.error('Failed to re-authenticate session:', error);
        // Just clear the state without making API calls
        useAuthStore.setState({ 
          user: null, 
          accessToken: null, 
          refreshToken: null, 
          permissions: [],
          isAuthenticated: false 
        });
      } finally {
        setIsLoadingInitialAuth(false);
      }
    };

    validateSession();
  }, [isAuthenticated, refreshToken, setAuth, logout]);

  // WebSocket Simulation
  useEffect(() => {
    let cleanupFn: (() => void) | undefined;

    if (isAuthenticated) {
      console.log('Setting up notification simulation via service.');
      cleanupFn = notificationService.simulateNewNotification(addNotification);
    }

    return () => {
      if (cleanupFn) {
        cleanupFn();
      }
    };
  }, [isAuthenticated, addNotification]);

  if (isLoadingInitialAuth) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <Spinner size="lg" />
      </div>
    );
  }

  // After initial loading, if not authenticated, redirect to login
  return useAuthStore.getState().isAuthenticated ? (
    <MainLayout>
      <Outlet />
    </MainLayout>
  ) : (
    <Navigate to="/login" replace />
  );
};

export default PrivateRoute;
