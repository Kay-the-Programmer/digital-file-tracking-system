import { File, FileCreationPayload, FileUpdatePayload } from '../../types';
import { apiRequest, mockApiCall } from '../utils/apiUtils';

// File Service
export const fileService = {
    // API implementations
    getAll: () => apiRequest<File[]>('GET', '/file-management/files/'),
    getById: (id: string) => apiRequest<File>('GET', `/file-management/files/${id}/`),
    create: (payload: FileCreationPayload) => apiRequest<File>('POST', '/file-management/files/', payload),
    update: (id: string, payload: FileUpdatePayload) => apiRequest<File>('PATCH', `/file-management/files/${id}/`, payload),
    delete: (id: string) => apiRequest<void>('DELETE', `/file-management/files/${id}/`),
    movePhysicalFile: (fileId: string, newLocationId: string, reason: string) => 
        apiRequest<File>('POST', `/file-management/files/${fileId}/move/`, { new_location_id: newLocationId, reason }),
    
    // Mock implementations for development
    mockGetAll: async (): Promise<File[]> => {
        // This is just a reference to the mock implementation
        // The actual implementation will be in the mock service
        console.log('Using mock file service - getAll');
        return mockApiCall([] as File[]);
    },
    
    mockGetById: async (id: string): Promise<File | undefined> => {
        console.log('Using mock file service - getById', id);
        return mockApiCall(undefined);
    },
    
    mockCreate: async (payload: FileCreationPayload): Promise<File> => {
        console.log('Using mock file service - create', payload);
        return mockApiCall({} as File);
    },
    
    mockUpdate: async (id: string, payload: FileUpdatePayload): Promise<File> => {
        console.log('Using mock file service - update', id, payload);
        return mockApiCall({} as File);
    },
    
    mockDelete: async (id: string): Promise<void> => {
        console.log('Using mock file service - delete', id);
        return mockApiCall(undefined);
    },
    
    mockMovePhysicalFile: async (fileId: string, newLocationId: string, reason: string): Promise<File> => {
        console.log('Using mock file service - movePhysicalFile', fileId, newLocationId, reason);
        return mockApiCall({} as File);
    }
};

export default fileService;