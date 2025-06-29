import { UserProfile, UserCreationPayload, UserUpdatePayload, Role, RoleCreationPayload, RoleUpdatePayload } from '../../types';
import { apiRequest, mockApiCall } from '@/services';

// User Service
export const userService = {
    // User API implementations
    getAllUsers: () => apiRequest<UserProfile[]>('GET', '/users/profiles/'),
    getUserById: (id: string) => apiRequest<UserProfile>('GET', `/users/profiles/${id}/`),
    createUser: (payload: UserCreationPayload) => apiRequest<UserProfile>('POST', '/users/profiles/', payload),
    updateUser: (id: string, payload: UserUpdatePayload) => apiRequest<UserProfile>('PATCH', `/users/profiles/${id}/`, payload),
    deleteUser: (id: string) => apiRequest<void>('DELETE', `/users/profiles/${id}/`),
    
    // Role API implementations
    getAllRoles: () => apiRequest<Role[]>('GET', '/users/roles/'),
    getRoleById: (id: string) => apiRequest<Role>('GET', `/users/roles/${id}/`),
    createRole: (payload: RoleCreationPayload) => apiRequest<Role>('POST', '/users/roles/', payload),
    updateRole: (id: string, payload: RoleUpdatePayload) => apiRequest<Role>('PATCH', `/users/roles/${id}/`, payload),
    deleteRole: (id: string) => apiRequest<void>('DELETE', `/users/roles/${id}/`),
    
    // Account operations
    changePassword: (userId: string, oldPassword: string, newPassword: string) => 
        apiRequest<{ message: string }>('POST', '/accounts/change-password/', { 
            user_id: userId, 
            old_password: oldPassword, 
            new_password: newPassword 
        }),
    
    // Mock implementations for development
    mockGetAllUsers: async (): Promise<UserProfile[]> => {
        console.log('Using mock user service - getAllUsers');
        return mockApiCall([] as UserProfile[]);
    },
    
    mockGetUserById: async (id: string): Promise<UserProfile | null> => {
        console.log('Using mock user service - getUserById', id);
        return mockApiCall(null);
    },
    
    mockCreateUser: async (payload: UserCreationPayload): Promise<UserProfile> => {
        console.log('Using mock user service - createUser', payload);
        return mockApiCall({
            id: `user-${Date.now()}`,
            username: payload.username,
            first_name: payload.first_name,
            last_name: payload.last_name,
            email: payload.email,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            roles: [],
        } as UserProfile);
    },
    
    mockUpdateUser: async (id: string, payload: UserUpdatePayload): Promise<UserProfile> => {
        console.log('Using mock user service - updateUser', id, payload);
        return mockApiCall({
            id,
            ...payload,
            updated_at: new Date().toISOString()
        } as UserProfile);
    },
    
    mockDeleteUser: async (id: string): Promise<void> => {
        console.log('Using mock user service - deleteUser', id);
        return mockApiCall(undefined);
    },
    
    mockGetAllRoles: async (): Promise<Role[]> => {
        console.log('Using mock user service - getAllRoles');
        return mockApiCall([] as Role[]);
    },
    
    mockGetRoleById: async (id: string): Promise<Role | null> => {
        console.log('Using mock user service - getRoleById', id);
        return mockApiCall(null);
    },
    
    mockCreateRole: async (payload: RoleCreationPayload): Promise<Role> => {
        console.log('Using mock user service - createRole', payload);
        return mockApiCall({
            id: `role-${Date.now()}`,
            name: payload.name,
            description: payload.description,
            permissions: payload.permissions || [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        } as Role);
    },
    
    mockUpdateRole: async (id: string, payload: RoleUpdatePayload): Promise<Role> => {
        console.log('Using mock user service - updateRole', id, payload);
        return mockApiCall({
            id,
            ...payload,
            updated_at: new Date().toISOString()
        } as Role);
    },
    
    mockDeleteRole: async (id: string): Promise<void> => {
        console.log('Using mock user service - deleteRole', id);
        return mockApiCall(undefined);
    },
    
    mockChangePassword: async (userId: string, oldPassword: string, newPassword: string): Promise<{ message: string }> => {
        console.log('Using mock user service - changePassword', userId, oldPassword, newPassword);
        return mockApiCall({ message: 'Password updated successfully.' });
    }
};

export default userService;