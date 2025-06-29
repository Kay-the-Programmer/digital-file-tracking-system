import { LoginResponse, UserProfile } from '../../types';
import { apiRequest } from '../utils/apiUtils';

// Authentication Service
export const authService = {
    login: (credentials: { email: string; password: string }) =>
        apiRequest<LoginResponse>('POST', '/auth/token/', credentials),

    logout: () => {
        const refresh_token = localStorage.getItem('refresh_token');
        // Only make the API call if we have a refresh token
        if (refresh_token) {
            return apiRequest('POST', '/auth/logout/', { refresh: refresh_token });
        } else {
            // If no refresh token, just return a resolved promise
            return Promise.resolve();
        }
    },

    refreshToken: (refresh_token: string) => 
        apiRequest<{ access: string, refresh: string, user: UserProfile }>('POST', '/auth/token/refresh/', { refresh: refresh_token }),

    // Mock implementation for development
    mockLogin: (email: string, _password?: string) => {
        // This is just a reference to the mock implementation
        // The actual implementation will be in the mock service
        console.log('Using mock login service');
        return Promise.resolve({} as LoginResponse);
    }
};

export default authService;
