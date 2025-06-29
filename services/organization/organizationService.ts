import { OrganizationalUnit, OrgUnitCreationPayload, OrgUnitUpdatePayload, PhysicalLocation, LocationCreationPayload, LocationUpdatePayload } from '../../types';
import { apiRequest, mockApiCall } from '../utils/apiUtils';

// Organization Service
export const organizationService = {
    // Organizational Unit API implementations
    getAllUnits: () => apiRequest<OrganizationalUnit[]>('GET', '/organization/units/'),
    getUnitById: (id: string) => apiRequest<OrganizationalUnit>('GET', `/organization/units/${id}/`),
    createUnit: (payload: OrgUnitCreationPayload) => apiRequest<OrganizationalUnit>('POST', '/organization/units/', payload),
    updateUnit: (id: string, payload: OrgUnitUpdatePayload) => apiRequest<OrganizationalUnit>('PATCH', `/organization/units/${id}/`, payload),
    deleteUnit: (id: string) => apiRequest<void>('DELETE', `/organization/units/${id}/`),
    getOrganizationalHierarchy: () => apiRequest<OrganizationalUnit>('GET', '/organization/hierarchy/'),
    
    // Physical Location API implementations
    getAllLocations: () => apiRequest<PhysicalLocation[]>('GET', '/file-management/locations/'),
    getLocationById: (id: string) => apiRequest<PhysicalLocation>('GET', `/file-management/locations/${id}/`),
    createLocation: (payload: LocationCreationPayload) => apiRequest<PhysicalLocation>('POST', '/file-management/locations/', payload),
    updateLocation: (id: string, payload: LocationUpdatePayload) => apiRequest<PhysicalLocation>('PATCH', `/file-management/locations/${id}/`, payload),
    deleteLocation: (id: string) => apiRequest<void>('DELETE', `/file-management/locations/${id}/`),
    
    // Mock implementations for development
    mockGetAllUnits: async (): Promise<OrganizationalUnit[]> => {
        console.log('Using mock organization service - getAllUnits');
        return mockApiCall([] as OrganizationalUnit[]);
    },
    
    mockGetUnitById: async (id: string): Promise<OrganizationalUnit | null> => {
        console.log('Using mock organization service - getUnitById', id);
        return mockApiCall(null);
    },
    
    mockCreateUnit: async (payload: OrgUnitCreationPayload): Promise<OrganizationalUnit> => {
        console.log('Using mock organization service - createUnit', payload);
        return mockApiCall({
            id: `org-${Date.now()}`,
            name: payload.name,
            unit_type: payload.unit_type,
            parent_id: payload.parent_id ?? null,
            description: payload.description,
        } as OrganizationalUnit);
    },
    
    mockUpdateUnit: async (id: string, payload: OrgUnitUpdatePayload): Promise<OrganizationalUnit> => {
        console.log('Using mock organization service - updateUnit', id, payload);
        return mockApiCall({
            id,
            ...payload,
        } as OrganizationalUnit);
    },
    
    mockDeleteUnit: async (id: string): Promise<void> => {
        console.log('Using mock organization service - deleteUnit', id);
        return mockApiCall(undefined);
    },
    
    mockGetOrganizationalHierarchy: async (): Promise<OrganizationalUnit> => {
        console.log('Using mock organization service - getOrganizationalHierarchy');
        return mockApiCall({} as OrganizationalUnit);
    },
    
    mockGetAllLocations: async (): Promise<PhysicalLocation[]> => {
        console.log('Using mock organization service - getAllLocations');
        return mockApiCall([] as PhysicalLocation[]);
    },
    
    mockGetLocationById: async (id: string): Promise<PhysicalLocation | null> => {
        console.log('Using mock organization service - getLocationById', id);
        return mockApiCall(null);
    },
    
    mockCreateLocation: async (payload: LocationCreationPayload): Promise<PhysicalLocation> => {
        console.log('Using mock organization service - createLocation', payload);
        return mockApiCall({
            id: `loc-${Date.now()}`,
            name: payload.name,
            description: payload.description,
            organizational_unit_id: payload.organizational_unit_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        } as PhysicalLocation);
    },
    
    mockUpdateLocation: async (id: string, payload: LocationUpdatePayload): Promise<PhysicalLocation> => {
        console.log('Using mock organization service - updateLocation', id, payload);
        return mockApiCall({
            id,
            ...payload,
            updated_at: new Date().toISOString()
        } as PhysicalLocation);
    },
    
    mockDeleteLocation: async (id: string): Promise<void> => {
        console.log('Using mock organization service - deleteLocation', id);
        return mockApiCall(undefined);
    }
};

export default organizationService;