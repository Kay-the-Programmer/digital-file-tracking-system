import { File, FileCreationPayload, FileUpdatePayload, PhysicalLocation, DigitalFileVersion } from '@/types';
import { apiRequest, apiFileUpload } from '@/services';

// File Service
export const fileService = {
    /**
     * Fetches a list of all files.
     */
    getAll: (): Promise<File[]> => apiRequest<File[]>('GET', '/file-management/files/'),

    /**
     * Fetches a single file by its ID.
     */
    getById: (id: string): Promise<File> => apiRequest<File>('GET', `/file-management/files/${id}/`),

    /**
     * Creates new file metadata.
     */
    create: (payload: FileCreationPayload): Promise<File> => apiRequest<File>('POST', '/file-management/files/', payload),

    /**
     * Updates an existing file's metadata.
     */
    update: (id: string, payload: FileUpdatePayload): Promise<File> => apiRequest<File>('PATCH', `/file-management/files/${id}/`, payload),

    /**
     * Deletes a file record.
     */
    delete: (id: string): Promise<void> => apiRequest<void>('DELETE', `/file-management/files/${id}/`),

    /**
     * Records the movement of a physical file.
     */
    movePhysicalFile: (fileId: string, newLocationId: string, reason: string) =>
        apiRequest<File>('POST', `/file-management/files/${fileId}/move/`, { new_location_id: newLocationId, reason }),

    /**
     * Uploads a digital file and creates a new version.
     * --- FIX: Changed the type of the 'file' parameter to the browser's native File object ---
     * We use 'globalThis.File' to avoid name collision with our custom 'File' interface.
     */
    uploadDigitalFile: (fileId: string, file: globalThis.File): Promise<DigitalFileVersion> =>
        apiFileUpload<DigitalFileVersion>(`/file-management/files/${fileId}/upload/`, file),

    /**
     * Fetches all available physical locations for dropdowns.
     */
    getAllLocations: (): Promise<PhysicalLocation[]> => apiRequest<PhysicalLocation[]>('GET', '/file-management/locations/'),
};

export default fileService;
