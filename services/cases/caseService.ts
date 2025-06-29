import { Case, CaseCreationPayload, CaseUpdatePayload, CaseType, CaseTypeCreationPayload, CaseTypeUpdatePayload } from '../../types';
import { apiRequest, mockApiCall } from '../utils/apiUtils';

// Case Service
export const caseService = {
    // API implementations
    getAll: () => apiRequest<Case[]>('GET', '/case-management/cases/'),
    getById: (id: string) => apiRequest<Case>('GET', `/case-management/cases/${id}/`),
    create: (payload: CaseCreationPayload) => apiRequest<Case>('POST', '/case-management/cases/', payload),
    update: (id: string, payload: CaseUpdatePayload) => apiRequest<Case>('PATCH', `/case-management/cases/${id}/`, payload),
    delete: (id: string) => apiRequest<void>('DELETE', `/case-management/cases/${id}/`),

    // Case Type API implementations
    getAllTypes: () => apiRequest<CaseType[]>('GET', '/case-management/types/'),
    getTypeById: (id: string) => apiRequest<CaseType>('GET', `/case-management/types/${id}/`),
    createType: (payload: CaseTypeCreationPayload) => apiRequest<CaseType>('POST', '/case-management/types/', payload),
    updateType: (id: string, payload: CaseTypeUpdatePayload) => apiRequest<CaseType>('PATCH', `/case-management/types/${id}/`, payload),
    deleteType: (id: string) => apiRequest<void>('DELETE', `/case-management/types/${id}/`),

    // Mock implementations for development
    mockGetAll: async (): Promise<Case[]> => {
        console.log('Using mock case service - getAll');
        return mockApiCall([] as Case[]);
    },

    mockGetById: async (id: string): Promise<Case | null> => {
        console.log('Using mock case service - getById', id);
        return mockApiCall(null);
    },

    mockCreate: async (payload: CaseCreationPayload): Promise<Case> => {
        console.log('Using mock case service - create', payload);
        return mockApiCall({
            id: `case-${Date.now()}`,
            title: payload.title,
            description: payload.description,
            case_type: payload.case_type,
            status: 'OPEN',
            initiated_by_user_id: payload.initiated_by_user_id,
            current_workflow_step_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            associated_file_ids: payload.associated_file_ids || [],
            attributes: payload.attributes || {},
        } as Case);
    },

    mockUpdate: async (id: string, payload: CaseUpdatePayload): Promise<Case> => {
        console.log('Using mock case service - update', id, payload);
        return mockApiCall({
            id,
            ...payload,
            updated_at: new Date().toISOString()
        } as Case);
    },

    mockDelete: async (id: string): Promise<void> => {
        console.log('Using mock case service - delete', id);
        return mockApiCall(undefined);
    },

    mockGetAllTypes: async (): Promise<CaseType[]> => {
        console.log('Using mock case service - getAllTypes');
        return mockApiCall([] as CaseType[]);
    }
};

export default caseService;
