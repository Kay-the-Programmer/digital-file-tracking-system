
import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import MainLayout from '../layout/MainLayout';
import Spinner from '../ui/Spinner';
import { useNotificationStore } from '../../store/notificationStore';
import { Notification } from '../../types';

const PrivateRoute: React.FC = () => {
  const { isAuthenticated, refreshToken, setTokens, setUser, logout } = useAuthStore();
  const [isLoadingInitialAuth, setIsLoadingInitialAuth] = useState(true);
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    const validateSession = async () => {
      // If already authenticated or no refresh token, finish loading
      if (isAuthenticated || !refreshToken) {
        if (!isAuthenticated && !refreshToken) {
            // No tokens at all, ensure logged out state is clean
            logout();
        }
        setIsLoadingInitialAuth(false);
        return;
      }

      // If not authenticated but has a refresh token, try to re-authenticate
      try {
        const { accessToken, refreshToken: newRefreshToken, user } = await api.refreshAccessToken(refreshToken);
        setTokens(accessToken, newRefreshToken);
        setUser(user);
      } catch (error) {
        console.error('Failed to re-authenticate session:', error);
        logout(); // Clear tokens and state on refresh failure
      } finally {
        setIsLoadingInitialAuth(false);
      }
    };

    validateSession();
  }, [isAuthenticated, refreshToken, setUser, setTokens, logout]);

  // WebSocket Simulation
  useEffect(() => {
    let intervalId: number | undefined;

    if (isAuthenticated) {
      console.log('Simulating WebSocket connection.');
      // Simulate receiving a notification every 20 seconds
      intervalId = window.setInterval(() => {
        const newNotif: Notification = {
          id: `notif-${Date.now()}`,
          user_id: 'user-current',
          message: `A new urgent task requires your attention.`,
          type: 'system_alert',
          read_status: false,
          created_at: new Date().toISOString(),
          link: '/dashboard',
        };
        console.log('Simulating received notification:', newNotif);
        addNotification(newNotif);
      }, 20000);
    }

    return () => {
      if (intervalId) {
        console.log('Closing simulated WebSocket connection.');
        clearInterval(intervalId);
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
