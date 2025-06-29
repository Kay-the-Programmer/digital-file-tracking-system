import { AuditLog } from '../../types';
import { apiRequest, mockApiCall } from '../utils/apiUtils';

// Audit Service
export const auditService = {
    // API implementations
    getAllEvents: (params: { [key: string]: string } = {}) => {
        const queryString = Object.entries(params)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');
        
        return apiRequest<AuditLog[]>('GET', `/audit/events/${queryString ? `?${queryString}` : ''}`);
    },
    
    getEventById: (id: string) => apiRequest<AuditLog>('GET', `/audit/events/${id}/`),
    
    // Mock implementations for development
    mockGetAllEvents: async (params: { [key: string]: string } = {}): Promise<AuditLog[]> => {
        console.log('Using mock audit service - getAllEvents', params);
        return mockApiCall([
            { 
                id: 'audit-001', 
                timestamp: '2025-06-27T10:00:00Z', 
                service_name: 'CaseManagement', 
                event_type: 'CaseCreated', 
                actor_user_id: 'user-current', 
                actor_username: 'Current User', 
                resource_type: 'Case', 
                resource_id: 'case-005', 
                details: { title: 'New Project Proposal' } 
            },
            { 
                id: 'audit-002', 
                timestamp: '2025-06-27T10:05:00Z', 
                service_name: 'Workflow', 
                event_type: 'CaseWorkflowStarted', 
                actor_user_id: 'user-current', 
                actor_username: 'Current User', 
                resource_type: 'Case', 
                resource_id: 'case-005', 
                details: { workflow: 'Project Approval' } 
            },
            { 
                id: 'audit-003', 
                timestamp: '2025-06-27T10:10:00Z', 
                service_name: 'FileManagement', 
                event_type: 'FileAccessed', 
                actor_user_id: 'user-1', 
                actor_username: 'John Doe', 
                resource_type: 'File', 
                resource_id: 'file-001', 
                details: { version: 2 } 
            },
        ]);
    },
    
    mockGetEventById: async (id: string): Promise<AuditLog | null> => {
        console.log('Using mock audit service - getEventById', id);
        return mockApiCall({
            id,
            timestamp: '2025-06-27T10:00:00Z',
            service_name: 'CaseManagement',
            event_type: 'CaseCreated',
            actor_user_id: 'user-current',
            actor_username: 'Current User',
            resource_type: 'Case',
            resource_id: 'case-005',
            details: { title: 'New Project Proposal' }
        });
    }
};

export default auditService;