import { Notification } from '../../types';
import { apiRequest, mockApiCall } from '../utils/apiUtils';

// Notification Service
export const notificationService = {
    // API implementations
    getAll: () => apiRequest<Notification[]>('GET', '/notifications/'),
    markAsRead: (id: string) => apiRequest('POST', `/notifications/${id}/mark_as_read/`),
    markAllAsRead: () => apiRequest('POST', '/notifications/mark_all_as_read/'),
    
    // Mock implementations for development
    mockGetAll: async (): Promise<Notification[]> => {
        console.log('Using mock notification service - getAll');
        return mockApiCall([] as Notification[]);
    },
    
    mockMarkAsRead: async (id: string): Promise<boolean> => {
        console.log('Using mock notification service - markAsRead', id);
        return mockApiCall(true);
    },
    
    mockMarkAllAsRead: async (): Promise<boolean> => {
        console.log('Using mock notification service - markAllAsRead');
        return mockApiCall(true);
    },
    
    // Simulated WebSocket notification
    simulateNewNotification: (callback: (notification: Notification) => void): (() => void) => {
        console.log('Setting up notification simulation');
        const intervalId = window.setInterval(() => {
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
            callback(newNotif);
        }, 20000);
        
        // Return cleanup function
        return () => {
            console.log('Cleaning up notification simulation');
            clearInterval(intervalId);
        };
    }
};

export default notificationService;