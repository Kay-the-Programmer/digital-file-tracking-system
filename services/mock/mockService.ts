import { mockApiCall } from '../utils/apiUtils';
import { 
    MOCK_USERS, 
    mockUsernames, 
    mockRoles, 
    mockUserProfiles, 
    mockOrganizationalUnits, 
    mockOrgUnitNames, 
    mockPhysicalLocations, 
    MOCK_CASES, 
    MOCK_FILES, 
    MOCK_ORG_CHART, 
    mockWorkflowTemplatesData, 
    mockCaseTypes, 
    mockWorkflowInstances, 
    mockNotifications, 
    mockAuditEvents, 
    enhanceFileForDisplay, 
    enhanceInstanceHistory 
} from './mockData';

import { 
    LoginResponse, 
    UserProfile, 
    File, 
    Case, 
    CaseStatus, 
    CaseCreationPayload, 
    CaseUpdatePayload, 
    WorkflowInstance, 
    WorkflowActionPayload, 
    WorkflowTemplate, 
    WorkflowTemplatePayload, 
    Role, 
    RoleCreationPayload, 
    RoleUpdatePayload, 
    UserCreationPayload, 
    UserUpdatePayload, 
    OrganizationalUnit, 
    OrgUnitCreationPayload, 
    OrgUnitUpdatePayload, 
    PhysicalLocation, 
    LocationCreationPayload, 
    LocationUpdatePayload, 
    CaseType, 
    CaseTypeCreationPayload, 
    CaseTypeUpdatePayload,
    KPI,
    RecentActivity,
    AuditLog,
    Notification
} from '../../types';

// Auth Mock Service
export const mockAuthService = {
    login: (email: string, _password?: string): Promise<LoginResponse> => {
        const user = mockUserProfiles.find(u => u.email === email) || mockUserProfiles.find(u => u.username === 'current.user');
        if (user && user.is_active) {
            // Extract permissions from all user roles
            const permissions = user.roles.flatMap(role => role.permissions);
            return mockApiCall({
                user,
                access: `mock_access_token_${user.id}_${Date.now()}`,
                refresh: `mock_refresh_token_${user.id}_${Date.now()}`,
                permissions,
            });
        }
        return Promise.reject(new Error('Invalid credentials or inactive user.'));
    },

    refreshToken: (refreshToken: string): Promise<{ access: string, refresh: string, user: UserProfile, permissions: string[] }> => {
        const userId = refreshToken.split('_')[3];
        const user = mockUserProfiles.find(u => u.id === userId);
        if (user && user.is_active) {
            // Extract permissions from all user roles
            const permissions = user.roles.flatMap(role => role.permissions);
            return mockApiCall({
                access: `mock_access_token_${user.id}_${Date.now()}`,
                refresh: `mock_refresh_token_${user.id}_${Date.now()}`,
                user,
                permissions,
            });
        }
        return Promise.reject(new Error('Invalid refresh token or inactive user.'));
    },

    logout: () => {
        return Promise.resolve();
    }
};

// File Mock Service
export const mockFileService = {
    getAll: (): Promise<File[]> => {
        return mockApiCall(MOCK_FILES.map(file => enhanceFileForDisplay(file)));
    },

    getById: (id: string): Promise<File | undefined> => {
        const file = MOCK_FILES.find(f => f.id === id);
        return mockApiCall(file ? enhanceFileForDisplay(file) : undefined);
    },

    create: (payload: any): Promise<File> => {
        const newFile: File = {
            id: `file-${Date.now()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            digital_file_versions: payload.file_type === 'digital' ? [] : undefined,
            file_movements: payload.file_type === 'physical' ? [] : undefined,
            ...payload,
            current_location_id: payload.current_location_id ?? null,
            current_case_id: payload.current_case_id ?? null,
        };
        MOCK_FILES.push(newFile);
        return mockApiCall(enhanceFileForDisplay(newFile));
    },

    update: (id: string, payload: any): Promise<File> => {
        const index = MOCK_FILES.findIndex(f => f.id === id);
        if (index !== -1) {
            const updatedFile = { ...MOCK_FILES[index], ...payload, updated_at: new Date().toISOString() };
            MOCK_FILES[index] = updatedFile;
            return mockApiCall(enhanceFileForDisplay(updatedFile));
        }
        return Promise.reject(new Error('File not found for update.'));
    },

    delete: (id: string): Promise<void> => {
        const initialLength = MOCK_FILES.length;
        MOCK_FILES = MOCK_FILES.filter(f => f.id !== id);
        if (MOCK_FILES.length < initialLength) {
            return mockApiCall(undefined);
        }
        return Promise.reject(new Error('File not found for deletion.'));
    },

    movePhysicalFile: (fileId: string, newLocationId: string, reason: string): Promise<File> => {
        const fileIndex = MOCK_FILES.findIndex(f => f.id === fileId);
        if (fileIndex === -1 || MOCK_FILES[fileIndex].file_type !== 'physical') {
            return Promise.reject(new Error('Physical file not found.'));
        }

        const oldLocationId = MOCK_FILES[fileIndex].current_location_id;
        const newLocation = mockPhysicalLocations.find(loc => loc.id === newLocationId);

        if (!newLocation) {
            return Promise.reject(new Error('New location not found.'));
        }

        const updatedFile = {
            ...MOCK_FILES[fileIndex],
            current_location_id: newLocationId,
            updated_at: new Date().toISOString(),
            file_movements: [
                ...(MOCK_FILES[fileIndex].file_movements || []),
                {
                    id: `mov-${Date.now()}`,
                    file_id: fileId,
                    from_location_id: oldLocationId || 'unknown',
                    to_location_id: newLocationId,
                    moved_by_user_id: 'user-current',
                    moved_at: new Date().toISOString(),
                    reason: reason,
                }
            ]
        };
        MOCK_FILES[fileIndex] = updatedFile;
        return mockApiCall(enhanceFileForDisplay(updatedFile));
    }
};

// Case Mock Service
export const mockCaseService = {
    getAll: (): Promise<Case[]> => {
        return mockApiCall(MOCK_CASES.map(c => ({
            ...c,
            initiated_by_username: mockUsernames[c.initiated_by_user_id] || "Unknown User"
        })));
    },

    getById: (id: string): Promise<Case | null> => {
        const targetCase = MOCK_CASES.find(c => c.id === id);
        if (!targetCase) return mockApiCall(null);

        return mockApiCall({
            ...targetCase,
            initiated_by_username: mockUsernames[targetCase.initiated_by_user_id] || "Unknown User"
        });
    },

    create: (payload: CaseCreationPayload): Promise<Case> => {
        const newCase: Case = {
            id: `case-${Date.now()}`,
            status: CaseStatus.OPEN,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            initiated_by_user_id: payload.initiated_by_user_id,
            current_workflow_step_id: null,
            description: payload.description,
            case_type: payload.case_type,
            title: payload.title,
            associated_file_ids: payload.associated_file_ids || [],
            attributes: payload.attributes || {},
            initiated_by_username: mockUsernames[payload.initiated_by_user_id] || "Unknown User",
        };
        MOCK_CASES.push(newCase);
        return mockApiCall(newCase);
    },

    update: (id: string, payload: CaseUpdatePayload): Promise<Case> => {
        const index = MOCK_CASES.findIndex(c => c.id === id);
        if (index !== -1) {
            const updatedCase = {
                ...MOCK_CASES[index],
                ...payload,
                updated_at: new Date().toISOString(),
                initiated_by_username: mockUsernames[MOCK_CASES[index].initiated_by_user_id] || "Unknown User"
            };
            MOCK_CASES[index] = updatedCase;
            return mockApiCall(updatedCase);
        }
        return Promise.reject(new Error('Case not found for update.'));
    },

    delete: (id: string): Promise<void> => {
        const initialLength = MOCK_CASES.length;
        MOCK_CASES = MOCK_CASES.filter(c => c.id !== id);
        if (MOCK_CASES.length < initialLength) {
            return mockApiCall(undefined);
        }
        return Promise.reject(new Error('Case not found for deletion.'));
    },

    getAllTypes: (): Promise<CaseType[]> => {
        return mockApiCall(mockCaseTypes);
    }
};

// Workflow Mock Service
export const mockWorkflowService = {
    getAllInstances: (): Promise<WorkflowInstance[]> => {
        return mockApiCall(mockWorkflowInstances.map(instance => enhanceInstanceHistory(instance)));
    },

    getInstanceById: (id: string): Promise<WorkflowInstance | null> => {
        const instance = mockWorkflowInstances.find(i => i.id === id || i.case_id === id);
        return mockApiCall(instance ? enhanceInstanceHistory(instance) : null);
    },

    performAction: (payload: WorkflowActionPayload): Promise<WorkflowInstance> => {
        const instanceIndex = mockWorkflowInstances.findIndex(i => i.case_id === payload.case_id);
        if (instanceIndex === -1) {
            return Promise.reject(new Error('Case workflow instance not found.'));
        }
        let currentInstance = mockWorkflowInstances[instanceIndex];

        const template = mockWorkflowTemplatesData.find(t => t.name === currentInstance.workflow_template_name);
        const templateSteps = template?.definition_json;
        if (!templateSteps) {
            return Promise.reject(new Error('Workflow template not found for this case type.'));
        }

        const currentStepIndex = templateSteps.findIndex(s => s.id === currentInstance.current_step?.id);
        if (currentStepIndex === -1 && currentInstance.status === 'Active') {
            return Promise.reject(new Error('Current workflow step not found.'));
        }

        const currentStepDef = currentInstance.current_step ? templateSteps.find(s => s.id === currentInstance.current_step?.id) : null;

        if (currentStepDef && !currentStepDef.actions.includes(payload.action)) {
            return Promise.reject(new Error(`Action '${payload.action}' not allowed at current step '${currentStepDef.name}'.`));
        }

        let nextStep = null;
        let newStatus = 'Active';

        if (payload.action.toLowerCase().includes('approve') || payload.action.toLowerCase().includes('forward')) {
            const nextStepIndex = currentStepIndex + 1;
            if (nextStepIndex < templateSteps.length && templateSteps[nextStepIndex].name !== 'Completed') {
                nextStep = templateSteps[nextStepIndex];
            } else {
                newStatus = 'Completed';
                nextStep = null;
            }
        } else if (payload.action.toLowerCase().includes('reject')) {
            newStatus = 'Rejected';
            nextStep = null;
        } else if (payload.action.toLowerCase().includes('clarification') || payload.action.toLowerCase().includes('revisions')) {
            nextStep = templateSteps[0];
        } else if (payload.action.toLowerCase() === 'complete') {
            newStatus = 'Completed';
            nextStep = null;
        }

        const updatedHistory = [
            ...currentInstance.history,
            {
                step_id: currentStepDef?.id || 'action',
                step_name: currentStepDef?.name || 'Action',
                action_taken: payload.action,
                action_by_user_id: 'user-current',
                action_by_username: mockUsernames['user-current'],
                action_at: new Date().toISOString(),
                comments: payload.comments,
            },
        ];

        const updatedInstance: WorkflowInstance = {
            ...currentInstance,
            current_step: nextStep,
            status: newStatus,
            history: updatedHistory,
            updated_at: new Date().toISOString(),
        };

        mockWorkflowInstances[instanceIndex] = updatedInstance;
        const targetCase = MOCK_CASES.find(c => c.id === payload.case_id);
        if(targetCase) {
            if(newStatus === 'Completed') targetCase.status = CaseStatus.APPROVED; // simplified logic
            if(newStatus === 'Rejected') targetCase.status = CaseStatus.REJECTED;
        }
        return mockApiCall(updatedInstance);
    },

    getAllTemplates: (): Promise<WorkflowTemplate[]> => {
        return mockApiCall(mockWorkflowTemplatesData);
    },

    getTemplateById: (id: string): Promise<WorkflowTemplate | null> => {
        const template = mockWorkflowTemplatesData.find(t => t.id === id) || null;
        return mockApiCall(template);
    },

    createTemplate: (payload: WorkflowTemplatePayload): Promise<WorkflowTemplate> => {
        const newTemplate: WorkflowTemplate = {
            id: `wf-temp-${Date.now()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...payload,
        };
        mockWorkflowTemplatesData.push(newTemplate);
        return mockApiCall(newTemplate);
    },

    updateTemplate: (id: string, payload: WorkflowTemplatePayload): Promise<WorkflowTemplate> => {
        const index = mockWorkflowTemplatesData.findIndex(t => t.id === id);
        if (index !== -1) {
            const updatedTemplate: WorkflowTemplate = {
                ...mockWorkflowTemplatesData[index],
                ...payload,
                updated_at: new Date().toISOString(),
            };
            mockWorkflowTemplatesData[index] = updatedTemplate;
            return mockApiCall(updatedTemplate);
        }
        return Promise.reject(new Error('Workflow template not found for update.'));
    },

    deleteTemplate: (id: string): Promise<void> => {
        const initialLength = mockWorkflowTemplatesData.length;
        mockWorkflowTemplatesData = mockWorkflowTemplatesData.filter(t => t.id !== id);
        if (mockWorkflowTemplatesData.length < initialLength) {
            return mockApiCall(undefined);
        }
        return Promise.reject(new Error('Workflow template not found for deletion.'));
    }
};

// User Mock Service
export const mockUserService = {
    getAllUsers: (): Promise<UserProfile[]> => {
        return mockApiCall(mockUserProfiles);
    },

    getUserById: (id: string): Promise<UserProfile | null> => {
        return mockApiCall(mockUserProfiles.find(u => u.id === id) || null);
    },

    createUser: (payload: UserCreationPayload): Promise<UserProfile> => {
        const newUser: UserProfile = {
            id: `user-${Date.now()}`,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            roles: payload.role_ids ? mockRoles.filter(r => payload.role_ids?.includes(r.id)) : [],
            username: payload.username,
            first_name: payload.first_name,
            last_name: payload.last_name,
            email: payload.email,
            phone_number: payload.phone_number,
            department_id: payload.department_id,
        };
        mockUserProfiles.push(newUser);
        return mockApiCall(newUser);
    },

    updateUser: (id: string, payload: UserUpdatePayload): Promise<UserProfile> => {
        const index = mockUserProfiles.findIndex(u => u.id === id);
        if (index !== -1) {
            const updatedUser: UserProfile = {
                ...mockUserProfiles[index],
                ...payload,
                updated_at: new Date().toISOString(),
                roles: payload.role_ids ? mockRoles.filter(r => payload.role_ids!.includes(r.id)) : mockUserProfiles[index].roles,
            };
            mockUserProfiles[index] = updatedUser;
            return mockApiCall(updatedUser);
        }
        return Promise.reject(new Error('User not found.'));
    },

    deleteUser: (id: string): Promise<void> => {
        const index = mockUserProfiles.findIndex(u => u.id === id);
        if (index > -1) {
            mockUserProfiles.splice(index, 1);
            return mockApiCall(undefined);
        }
        return Promise.reject(new Error('User not found.'));
    },

    getAllRoles: (): Promise<Role[]> => {
        return mockApiCall(mockRoles);
    },

    getRoleById: (id: string): Promise<Role | null> => {
        return mockApiCall(mockRoles.find(r => r.id === id) || null);
    },

    createRole: (payload: RoleCreationPayload): Promise<Role> => {
        const newRole: Role = {
            id: `role-${Date.now()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...payload,
        };
        mockRoles.push(newRole);
        return mockApiCall(newRole);
    },

    updateRole: (id: string, payload: RoleUpdatePayload): Promise<Role> => {
        const index = mockRoles.findIndex(r => r.id === id);
        if (index !== -1) {
            const updatedRole: Role = {
                ...mockRoles[index],
                ...payload,
                updated_at: new Date().toISOString(),
            };
            mockRoles[index] = updatedRole;
            return mockApiCall(updatedRole);
        }
        return Promise.reject(new Error('Role not found.'));
    },

    deleteRole: (id: string): Promise<void> => {
        const index = mockRoles.findIndex(r => r.id === id);
        if (index > -1) {
            mockRoles.splice(index, 1);
            return mockApiCall(undefined);
        }
        return Promise.reject(new Error('Role not found.'));
    },

    changePassword: (userId: string, oldPass: string, newPass: string): Promise<{ message: string }> => {
        const user = mockUserProfiles.find(u => u.id === userId);
        if (!user) {
            return Promise.reject(new Error("User not found"));
        }
        console.log(`Password changed for user ${userId}. (Old: ${oldPass}, New: ${newPass})`);
        return mockApiCall({ message: 'Password updated successfully.' });
    }
};

// Organization Mock Service
export const mockOrganizationService = {
    getAllUnits: (): Promise<OrganizationalUnit[]> => {
        const units = JSON.parse(JSON.stringify(mockOrganizationalUnits));
        const unitsWithParentNames = units.map((unit: OrganizationalUnit) => ({
            ...unit,
            parent_name: unit.parent_id ? units.find((p: OrganizationalUnit) => p.id === unit.parent_id)?.name || 'Unknown' : undefined
        }));
        return mockApiCall(unitsWithParentNames);
    },

    getUnitById: (id: string): Promise<OrganizationalUnit | null> => {
        const unit = mockOrganizationalUnits.find(u => u.id === id) || null;
        return mockApiCall(unit);
    },

    getOrganizationalHierarchy: (): Promise<OrganizationalUnit> => {
        const units = JSON.parse(JSON.stringify(mockOrganizationalUnits));
        const unitMap: { [key: string]: OrganizationalUnit } = {};
        units.forEach((unit: OrganizationalUnit) => {
            unit.children = [];
            unitMap[unit.id] = unit;
        });

        let root: OrganizationalUnit | null = null;
        units.forEach((unit: OrganizationalUnit) => {
            if (unit.parent_id) {
                unitMap[unit.parent_id]?.children?.push(unit);
            } else {
                root = unit;
            }
        });

        return mockApiCall(root!);
    },

    createUnit: (payload: OrgUnitCreationPayload): Promise<OrganizationalUnit> => {
        const newUnit: OrganizationalUnit = {
            id: `org-${Date.now()}`,
            name: payload.name,
            unit_type: payload.unit_type,
            parent_id: payload.parent_id ?? null,
            description: payload.description,
        };
        mockOrganizationalUnits.push(newUnit);
        return mockApiCall(newUnit);
    },

    updateUnit: (id: string, payload: OrgUnitUpdatePayload): Promise<OrganizationalUnit> => {
        const index = mockOrganizationalUnits.findIndex(u => u.id === id);
        if (index > -1) {
            const currentUnit = mockOrganizationalUnits[index];
            const updatedUnit: OrganizationalUnit = {
                ...currentUnit,
                ...payload,
                parent_id: 'parent_id' in payload ? payload.parent_id ?? null : currentUnit.parent_id,
            };
            mockOrganizationalUnits[index] = updatedUnit;
            return mockApiCall(updatedUnit);
        }
        return Promise.reject(new Error('Unit not found'));
    },

    deleteUnit: (id: string): Promise<void> => {
        const index = mockOrganizationalUnits.findIndex(u => u.id === id);
        if (index > -1) {
            mockOrganizationalUnits.splice(index, 1);
            // In a real scenario, the backend should handle cascading deletes or prevent deletion of units with children.
            // For the mock, we can simulate this by filtering out children.
            mockOrganizationalUnits = mockOrganizationalUnits.filter(u => u.parent_id !== id);
            return mockApiCall(undefined);
        }
        return Promise.reject(new Error('Unit not found'));
    },

    getAllLocations: (): Promise<PhysicalLocation[]> => {
        return mockApiCall(mockPhysicalLocations.map(loc => ({
            ...loc,
            organizational_unit_name: loc.organizational_unit_id ? mockOrgUnitNames[loc.organizational_unit_id] : 'N/A'
        })));
    },

    getLocationById: (id: string): Promise<PhysicalLocation | null> => {
        return mockApiCall(mockPhysicalLocations.find(l => l.id === id) || null);
    },

    createLocation: (payload: LocationCreationPayload): Promise<PhysicalLocation> => {
        const newLocation: PhysicalLocation = {
            id: `loc-${Date.now()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...payload,
        };
        mockPhysicalLocations.push(newLocation);
        return mockApiCall(newLocation);
    },

    updateLocation: (id: string, payload: LocationUpdatePayload): Promise<PhysicalLocation> => {
        const index = mockPhysicalLocations.findIndex(l => l.id === id);
        if (index > -1) {
            const updatedLocation = { ...mockPhysicalLocations[index], ...payload, updated_at: new Date().toISOString() };
            mockPhysicalLocations[index] = updatedLocation;
            return mockApiCall(updatedLocation);
        }
        return Promise.reject(new Error('Location not found.'));
    },

    deleteLocation: (id: string): Promise<void> => {
        const initialLength = mockPhysicalLocations.length;
        mockPhysicalLocations = mockPhysicalLocations.filter(l => l.id !== id);
        if (mockPhysicalLocations.length < initialLength) {
            return mockApiCall(undefined);
        }
        return Promise.reject(new Error('Location not found.'));
    }
};

// Dashboard Mock Service
export const mockDashboardService = {
    getKPIs: (): Promise<KPI[]> => {
        return mockApiCall([
            { id: 'my_open_cases', label: 'My Open Cases', value: 0, description: 'Cases you initiated that are still active', color: 'border-orange-500' },
            { id: 'pending_approvals', label: 'Pending My Approval', value: 0, description: 'Cases awaiting your action', color: 'border-red-500' },
            { id: 'files_in_dept', label: 'Files in My Dept', value: 0, description: 'Files within your organizational unit', color: 'border-blue-500' },
            { id: 'completed_this_month', label: 'Completed This Month', value: 0, description: 'Cases you completed this month', color: 'border-green-500' },
        ]);
    },

    getRecentActivity: (): Promise<RecentActivity[]> => {
        return mockApiCall([
            { id: 'act1', timestamp: '2025-06-26T10:00:00Z', description: 'Case #case-001 "Q1 2025 Financial Audit" moved to Finance.', type: 'case', link: '/cases/case-001' },
            { id: 'act2', timestamp: '2025-06-26T09:30:00Z', description: 'Digital file "Annual Budget Proposal 2025" accessed.', type: 'file', link: '/files/file-001' },
            { id: 'act3', timestamp: '2025-06-25T16:45:00Z', description: 'Case #case-002 "Curriculum Update for Grade 5" approved.', type: 'case', link: '/cases/case-002' },
            { id: 'act4', timestamp: '2025-06-25T11:20:00Z', description: 'Physical file "Teacher Recruitment Policy" moved to HR office.', type: 'file', link: '/files/file-002' },
            { id: 'act5', timestamp: '2025-06-24T14:00:00Z', description: 'New user "Admin User" logged in.', type: 'user' },
        ]);
    }
};

// Notification Mock Service
export const mockNotificationService = {
    getAll: (): Promise<Notification[]> => {
        return mockApiCall(mockNotifications.filter(n => n.user_id === 'user-current'));
    },

    markAsRead: (notificationId: string): Promise<boolean> => {
        const notification = mockNotifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read_status = true;
            return mockApiCall(true);
        }
        return mockApiCall(false);
    },

    markAllAsRead: (): Promise<boolean> => {
        mockNotifications.forEach(n => {
            if (n.user_id === 'user-current') {
                n.read_status = true;
            }
        });
        return mockApiCall(true);
    }
};

// Audit Mock Service
export const mockAuditService = {
    getAllEvents: (params: { [key: string]: string } = {}): Promise<AuditLog[]> => {
        let filteredLogs = mockAuditEvents;

        if (params.user_id) {
            filteredLogs = filteredLogs.filter(log => log.actor_user_id === params.user_id);
        }
        if (params.event_type) {
            filteredLogs = filteredLogs.filter(log => log.event_type === params.event_type);
        }
        if (params.resource_type) {
            filteredLogs = filteredLogs.filter(log => log.resource_type === params.resource_type);
        }
        if (params.start_date) {
            filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= new Date(params.start_date!));
        }
        if (params.end_date) {
            filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= new Date(params.end_date!));
        }
        if (params.search_term) {
            const term = params.search_term.toLowerCase();
            filteredLogs = filteredLogs.filter(log =>
                log.event_type.toLowerCase().includes(term) ||
                log.resource_id.toLowerCase().includes(term) ||
                JSON.stringify(log.details).toLowerCase().includes(term)
            );
        }

        const logsWithUsernames = filteredLogs.map(log => ({
            ...log,
            actor_username: mockUsernames[log.actor_user_id] || 'Unknown User',
        })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return mockApiCall(logsWithUsernames);
    },

    getEventById: (id: string): Promise<AuditLog | null> => {
        const event = mockAuditEvents.find(e => e.id === id);
        return mockApiCall(event || null);
    }
};

// Case Type Mock Service
export const mockCaseTypeService = {
    getAll: (): Promise<CaseType[]> => {
        return mockApiCall(mockCaseTypes);
    },

    getById: (id: string): Promise<CaseType | null> => {
        return mockApiCall(mockCaseTypes.find(ct => ct.id === id) || null);
    },

    create: (payload: CaseTypeCreationPayload): Promise<CaseType> => {
        const newCaseType: CaseType = {
            id: `ct-${Date.now()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...payload,
        };
        mockCaseTypes.push(newCaseType);
        return mockApiCall(newCaseType);
    },

    update: (id: string, payload: CaseTypeUpdatePayload): Promise<CaseType> => {
        const index = mockCaseTypes.findIndex(l => l.id === id);
        if (index > -1) {
            const updatedCaseType = { ...mockCaseTypes[index], ...payload, updated_at: new Date().toISOString() };
            mockCaseTypes[index] = updatedCaseType;
            return mockApiCall(updatedCaseType);
        }
        return Promise.reject(new Error('Case Type not found.'));
    },

    delete: (id: string): Promise<void> => {
        const initialLength = mockCaseTypes.length;
        mockCaseTypes = mockCaseTypes.filter(l => l.id !== id);
        if (mockCaseTypes.length < initialLength) {
            return mockApiCall(undefined);
        }
        return Promise.reject(new Error('Case Type not found.'));
    }
};

// Export all mock services
export const mockServices = {
    auth: mockAuthService,
    file: mockFileService,
    case: mockCaseService,
    workflow: mockWorkflowService,
    user: mockUserService,
    organization: mockOrganizationService,
    dashboard: mockDashboardService,
    notification: mockNotificationService,
    audit: mockAuditService,
    caseType: mockCaseTypeService
};

export default mockServices;
