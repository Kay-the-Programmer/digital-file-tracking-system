import { WorkflowInstance, WorkflowActionPayload, WorkflowTemplate, WorkflowTemplatePayload } from '../../types';
import { apiRequest, mockApiCall } from '../utils/apiUtils';

// Workflow Service
export const workflowService = {
    // API implementations
    getAllInstances: () => apiRequest<WorkflowInstance[]>('GET', '/workflows/instances/'),
    getInstanceById: (id: string) => apiRequest<WorkflowInstance>('GET', `/workflows/instances/${id}/`),
    performAction: (instanceId: string, payload: WorkflowActionPayload) =>
        apiRequest<WorkflowInstance>('POST', `/workflows/instances/${instanceId}/action/`, payload),
    getAllTemplates: () => apiRequest<WorkflowTemplate[]>('GET', '/workflows/templates/'),
    getTemplateById: (id: string) => apiRequest<WorkflowTemplate>('GET', `/workflows/templates/${id}/`),
    createTemplate: (payload: WorkflowTemplatePayload) => 
        apiRequest<WorkflowTemplate>('POST', '/workflows/templates/', payload),
    updateTemplate: (id: string, payload: WorkflowTemplatePayload) => 
        apiRequest<WorkflowTemplate>('PATCH', `/workflows/templates/${id}/`, payload),
    deleteTemplate: (id: string) => apiRequest<void>('DELETE', `/workflows/templates/${id}/`),
    
    // Mock implementations for development
    mockGetAllInstances: async (): Promise<WorkflowInstance[]> => {
        console.log('Using mock workflow service - getAllInstances');
        return mockApiCall([] as WorkflowInstance[]);
    },
    
    mockGetInstanceById: async (id: string): Promise<WorkflowInstance | null> => {
        console.log('Using mock workflow service - getInstanceById', id);
        return mockApiCall(null);
    },
    
    mockPerformAction: async (instanceId: string, payload: WorkflowActionPayload): Promise<WorkflowInstance> => {
        console.log('Using mock workflow service - performAction', instanceId, payload);
        return mockApiCall({} as WorkflowInstance);
    },
    
    mockGetAllTemplates: async (): Promise<WorkflowTemplate[]> => {
        console.log('Using mock workflow service - getAllTemplates');
        return mockApiCall([] as WorkflowTemplate[]);
    },
    
    mockGetTemplateById: async (id: string): Promise<WorkflowTemplate | null> => {
        console.log('Using mock workflow service - getTemplateById', id);
        return mockApiCall(null);
    },
    
    mockCreateTemplate: async (payload: WorkflowTemplatePayload): Promise<WorkflowTemplate> => {
        console.log('Using mock workflow service - createTemplate', payload);
        return mockApiCall({
            id: `wf-temp-${Date.now()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...payload,
        } as WorkflowTemplate);
    },
    
    mockUpdateTemplate: async (id: string, payload: WorkflowTemplatePayload): Promise<WorkflowTemplate> => {
        console.log('Using mock workflow service - updateTemplate', id, payload);
        return mockApiCall({
            id,
            ...payload,
            updated_at: new Date().toISOString()
        } as WorkflowTemplate);
    },
    
    mockDeleteTemplate: async (id: string): Promise<void> => {
        console.log('Using mock workflow service - deleteTemplate', id);
        return mockApiCall(undefined);
    }
};

export default workflowService;