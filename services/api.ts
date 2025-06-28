
import { User, UserRole, File, Case, CaseStatus, Department, DigitalFileVersion, FileMovement, CaseCreationPayload, CaseUpdatePayload, WorkflowInstance, WorkflowStep, WorkflowHistoryEntry, WorkflowActionPayload, AuditLog, Notification, WorkflowTemplate, WorkflowStepDefinition, WorkflowTemplatePayload, Role, UserProfile, UserCreationPayload, UserUpdatePayload, RoleCreationPayload, RoleUpdatePayload, OrganizationalUnit, OrgUnitCreationPayload, OrgUnitUpdatePayload, PhysicalLocation, FileCreationPayload, FileUpdatePayload, LocationCreationPayload, LocationUpdatePayload, CaseType, CaseTypeCreationPayload, CaseTypeUpdatePayload } from '../types';

// MOCK DATA
const MOCK_USERS: User[] = [
  { id: 'user-1', name: 'John Doe', email: 'john.doe@dfts.com', department: 'Finance', roles: [UserRole.USER] },
  { id: 'user-2', name: 'Jane Smith', email: 'jane.smith@dfts.com', department: 'HR', roles: [UserRole.DEPARTMENT_HEAD, UserRole.USER] },
  { id: 'user-3', name: 'Alex Johnson', email: 'alex.j@dfts.com', department: 'Curriculum', roles: [UserRole.RECORDS_MANAGER, UserRole.USER] },
  { id: 'admin-1', name: 'Admin User', email: 'admin@dfts.com', department: 'IT', roles: [UserRole.ADMIN, UserRole.USER] },
  { id: 'user-current', name: 'Current User', email: 'current.user@dfts.com', department: 'IT', roles: [UserRole.USER, UserRole.ADMIN] }, // For newly created cases, also admin for testing
];

// Mock Usernames (can be derived from MOCK_USERS, but this is simpler for the mock)
const mockUsernames: Record<string, string> = MOCK_USERS.reduce((acc, user) => {
  acc[user.id] = user.name;
  return acc;
}, {} as Record<string, string>);

// --- New mock data for User and Role Management ---
let mockRoles: Role[] = [
  { id: 'role-admin', name: 'SystemAdmin', description: 'Full administrative access', permissions: ['user:list', 'user:create', 'user:read', 'user:update', 'user:delete', 'role:list', 'role:create', 'role:read', 'role:update', 'role:delete', 'workflow:manage', 'workflow:instance:list', 'workflow:instance:read', 'audit:view', 'case:create', 'case:read', 'case:update', 'case:delete', 'case:approve', 'file:list', 'file:create', 'file:read', 'file:update', 'file:delete', 'file:download', 'file:move', 'org:list', 'org:create', 'org:read', 'org:update', 'org:delete', 'location:list', 'location:create', 'location:read', 'location:update', 'location:delete', 'casetype:list', 'casetype:create', 'casetype:read', 'casetype:update', 'casetype:delete'], created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 'role-clerk', name: 'Clerk', description: 'Basic user, can create files and cases', permissions: ['case:create', 'file:create', 'file:download', 'file:list', 'file:read'], created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 'role-dept-head', name: 'DepartmentHead', description: 'Can approve cases within their department', permissions: ['case:approve', 'case:read', 'file:read'], created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 'role-audit', name: 'AuditOfficer', description: 'Can view audit logs', permissions: ['audit:view'], created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
];

let mockUserProfiles: UserProfile[] = [
  { id: 'user-current', username: 'current.user', first_name: 'Current', last_name: 'User', email: 'current.user@dfts.com', is_active: true, roles: [mockRoles[0]], created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 'admin-1', username: 'admin.user', first_name: 'Admin', last_name: 'User', email: 'admin@dfts.com', is_active: true, roles: [mockRoles[0]], created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 'user-1', username: 'john.doe', first_name: 'John', last_name: 'Doe', email: 'john.doe@dfts.com', phone_number: '123-456-7890', department_id: 'finance', is_active: true, roles: [mockRoles[1]], created_at: '2024-01-05T00:00:00Z', updated_at: '2024-06-01T00:00:00Z' },
  { id: 'user-2', username: 'jane.smith', first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@dfts.com', department_id: 'hr_admin', is_active: true, roles: [mockRoles[2]], created_at: '2024-02-10T00:00:00Z', updated_at: '2024-06-15T00:00:00Z' },
  { id: 'user-3', username: 'alex.j', first_name: 'Alex', last_name: 'Johnson', email: 'alex.j@dfts.com', is_active: false, roles: [mockRoles[1], mockRoles[3]], created_at: '2024-03-20T00:00:00Z', updated_at: '2024-03-20T00:00:00Z' },
];

let mockOrganizationalUnits: OrganizationalUnit[] = [
    { id: 'moe', name: 'Ministry of Education', unit_type: 'MINISTRY', parent_id: null },
    { id: 'minister', name: 'Minister', unit_type: 'MINISTER_OFFICE', parent_id: 'moe' },
    { id: 'ps_admin', name: 'Permanent Secretary (Administration)', unit_type: 'PS_OFFICE', parent_id: 'minister' },
    { id: 'ps_edu_services', name: 'Permanent Secretary (Educational Services)', unit_type: 'PS_OFFICE', parent_id: 'minister' },
    { id: 'hr_admin', name: 'HR Management & Administration', unit_type: 'DIRECTORATE', parent_id: 'ps_admin' },
    { id: 'planning', name: 'Planning', unit_type: 'DIRECTORATE', parent_id: 'ps_admin' },
    { id: 'finance', name: 'Finance', unit_type: 'DIRECTORATE', parent_id: 'ps_admin' },
    { id: 'curriculum_dev', name: 'Curriculum Development', unit_type: 'DIRECTORATE', parent_id: 'ps_edu_services' },
];

const mockOrgUnitNames: Record<string, string> = mockOrganizationalUnits.reduce((acc, unit) => {
    acc[unit.id] = unit.name;
    return acc;
}, {} as Record<string, string>);

let mockPhysicalLocations: PhysicalLocation[] = [
  { id: 'loc-hr', name: 'HR Department - Cabinet A', description: 'Main cabinet for HR files', organizational_unit_id: 'hr_admin', created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z' },
  { id: 'loc-finance', name: 'Finance Department - Vault 3', description: 'Secure vault for financial records', organizational_unit_id: 'finance', created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z' },
  { id: 'loc-curriculum', name: 'Curriculum Dev. - Shelf B2', description: 'Shelving for curriculum documents', organizational_unit_id: 'curriculum_dev', created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z' },
  { id: 'loc-archives', name: 'Central Archives - Room 101', description: 'Main archive room', organizational_unit_id: 'ps_admin', created_at: '2022-01-01T00:00:00Z', updated_at: '2022-01-01T00:00:00Z' },
];


let MOCK_CASES: Case[] = [
  {
    id: 'case-001',
    case_type: 'Fund Request',
    title: 'Q3 Budget Allocation for Primary Schools',
    description: 'Request for funds to support primary school educational materials for Q3.',
    status: CaseStatus.IN_PROGRESS,
    initiated_by_user_id: 'user-1',
    current_workflow_step_id: 'step-finance-review',
    created_at: '2025-06-01T10:00:00Z',
    updated_at: '2025-06-20T14:30:00Z',
    associated_file_ids: ['file-001'],
    attributes: { amount: 500000, budget_code: 'EDU-PRI-Q3-25' },
  },
  {
    id: 'case-002',
    case_type: 'Curriculum Approval',
    title: 'New Math Curriculum Review',
    description: 'Review and approval process for the proposed new mathematics curriculum for Grade 7.',
    status: CaseStatus.OPEN,
    initiated_by_user_id: 'user-3',
    current_workflow_step_id: 'step-initial-review',
    created_at: '2025-06-15T09:00:00Z',
    updated_at: '2025-06-15T09:00:00Z',
    associated_file_ids: ['file-003'],
    attributes: { subject: 'Mathematics', grade: 7 },
  },
  {
    id: 'case-003',
    case_type: 'Leave Approval',
    title: 'Annual Leave Request - Jane Smith',
    description: 'Request for annual leave from July 1st to July 15th.',
    status: CaseStatus.APPROVED,
    initiated_by_user_id: 'user-2',
    current_workflow_step_id: 'step-final-approval',
    created_at: '2025-05-20T11:00:00Z',
    updated_at: '2025-05-25T10:00:00Z',
    associated_file_ids: [],
    attributes: { start_date: '2025-07-01', end_date: '2025-07-15' },
  },
  {
    id: 'case-004',
    case_type: 'Procurement Request',
    title: 'New IT Equipment for Data Management Directorate',
    description: 'Request to procure 10 new high-performance workstations.',
    status: CaseStatus.CLOSED,
    initiated_by_user_id: 'user-1',
    current_workflow_step_id: 'step-procurement-complete',
    created_at: '2025-04-01T14:00:00Z',
    updated_at: '2025-04-20T16:00:00Z',
    associated_file_ids: [],
    attributes: { budget: 150000, department: 'Data Management & Information' },
  },
];

let MOCK_FILES: File[] = [
  {
    id: 'file-001',
    title: 'Annual Budget Proposal 2025',
    description: 'Detailed financial plan for the upcoming fiscal year.',
    file_type: 'digital',
    current_location_id: null,
    created_by_user_id: 'user-1',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2025-06-20T14:30:00Z',
    current_case_id: 'case-001',
    digital_file_versions: [
      {
        id: 'ver-001-v1', file_id: 'file-001', version_number: 1, storage_path: '/digital/budget_v1.pdf', mime_type: 'application/pdf', file_size: 1234567, uploaded_by_user_id: 'user-1', uploaded_at: '2024-01-15T10:00:00Z'
      },
      {
        id: 'ver-001-v2', file_id: 'file-001', version_number: 2, storage_path: '/digital/budget_v2.pdf', mime_type: 'application/pdf', file_size: 1500000, uploaded_by_user_id: 'user-2', uploaded_at: '2025-06-20T14:30:00Z'
      },
    ],
  },
  {
    id: 'file-002',
    title: 'Teacher Recruitment Policy',
    description: 'Official policy document for teacher hiring and selection.',
    file_type: 'physical',
    current_location_id: 'loc-hr',
    created_by_user_id: 'user-2',
    created_at: '2023-09-01T09:00:00Z',
    updated_at: '2025-06-10T11:00:00Z',
    current_case_id: null,
    file_movements: [
      { id: 'mov-002-1', file_id: 'file-002', from_location_id: 'loc-archives', to_location_id: 'loc-hr', moved_by_user_id: 'user-3', moved_at: '2025-06-10T11:00:00Z', reason: 'Policy review' },
    ],
  },
  {
    id: 'file-003',
    title: 'Curriculum Development Plan - Primary',
    description: 'Plan for updating primary school curriculum.',
    file_type: 'digital',
    current_location_id: null,
    created_by_user_id: 'user-3',
    created_at: '2025-03-01T15:00:00Z',
    updated_at: '2025-03-01T15:00:00Z',
    current_case_id: 'case-002',
    digital_file_versions: [
      { id: 'ver-003-v1', file_id: 'file-003', version_number: 1, storage_path: '/digital/curriculum_primary_v1.docx', mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', file_size: 800000, uploaded_by_user_id: 'user-3', uploaded_at: '2025-03-01T15:00:00Z' },
    ],
  },
  {
    id: 'file-004',
    title: 'Student Enrollment Records 2024',
    description: 'Physical records of student enrollments for 2024 academic year.',
    file_type: 'physical',
    current_location_id: 'loc-archives',
    created_by_user_id: 'user-1',
    created_at: '2024-12-01T08:00:00Z',
    updated_at: '2024-12-01T08:00:00Z',
    current_case_id: null,
    file_movements: [],
  },
];


const MOCK_ORG_CHART: Department = {
    id: 'd1', name: 'CEO Office', head: 'Super Admin',
    subUnits: [
        { id: 'd2', name: 'Human Resources', head: 'Jane Smith', subUnits: [] },
        { id: 'd3', name: 'Finance', head: 'John Doe', subUnits: [
            {id: 'd4', name: 'Accounts Payable', head: 'Finance Lead', subUnits: [] }
        ]},
        { id: 'd5', name: 'IT', head: 'Admin User', subUnits: [] },
        { id: 'd6', name: 'Curriculum', head: 'Alex Johnson', subUnits: [] }
    ]
}

export interface KPI {
  id: string;
  label: string;
  value: number;
  unit?: string;
  description?: string;
  color?: string;
}

export interface RecentActivity {
  id: string;
  timestamp: string;
  description: string;
  type: 'case' | 'file' | 'user' | 'system';
  link?: string;
}

// Mock data for workflow templates
let mockWorkflowTemplatesData: WorkflowTemplate[] = [
  {
    id: 'wf-temp-fund-request',
    name: 'Fund Request Workflow',
    description: 'Standard workflow for all fund allocation requests.',
    case_type: 'Fund Request',
    definition_json: [
      { id: 'step-initiation', name: 'Initiation', responsible_role: 'Clerk', responsible_department: 'Initiating Department', actions: ['Submit'] },
      { id: 'step-dept-review', name: 'Department Review', responsible_role: 'Department Head', responsible_department: 'Initiating Department', actions: ['Approve', 'Reject', 'Forward to Finance'] },
      { id: 'step-finance-review', name: 'Finance Review', responsible_role: 'Director of Finance', responsible_department: 'Finance Directorate', actions: ['Approve', 'Reject', 'Request Clarification'] },
      { id: 'step-ps-approval', name: 'Permanent Secretary Approval', responsible_role: 'Permanent Secretary', responsible_department: 'PS (Administration) Office', actions: ['Approve', 'Reject'] },
      { id: 'step-completed', name: 'Completed', responsible_role: '', responsible_department: '', actions: [] },
    ],
    created_at: '2024-01-01T08:00:00Z',
    updated_at: '2024-05-10T11:00:00Z',
  },
  {
    id: 'wf-temp-curriculum-approval',
    name: 'Curriculum Approval Workflow',
    description: 'Process for reviewing and approving new curriculum proposals.',
    case_type: 'Curriculum Approval',
    definition_json: [
      { id: 'step-initial-review', name: 'Initial Review', responsible_role: 'Curriculum Officer', responsible_department: 'Curriculum Development', actions: ['Approve', 'Request Revisions'] },
      { id: 'step-standards-review', name: 'Standards & Evaluation Review', responsible_role: 'Director of Standards', responsible_department: 'Standards & Evaluation', actions: ['Approve', 'Reject'] },
      { id: 'step-final-approval', name: 'Final Approval', responsible_role: 'Permanent Secretary', responsible_department: 'PS (Educational Services) Office', actions: ['Approve', 'Reject'] },
      { id: 'step-completed', name: 'Completed', responsible_role: '', responsible_department: '', actions: [] },
    ],
    created_at: '2024-02-10T09:00:00Z',
    updated_at: '2024-06-01T10:00:00Z',
  },
];

let mockCaseTypes: CaseType[] = [
  {
    id: 'ct-fund-req',
    name: 'Fund Request',
    description: 'Process for requesting financial resources.',
    attribute_definitions: [
      { name: 'amount', label: 'Amount', type: 'number', required: true },
      { name: 'budget_code', label: 'Budget Code', type: 'text', required: true },
    ],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ct-curriculum-app',
    name: 'Curriculum Approval',
    description: 'Review and approval for new educational curricula.',
    attribute_definitions: [
      { name: 'subject', label: 'Subject', type: 'text', required: true },
      { name: 'grade', label: 'Grade Level', type: 'number', required: true },
    ],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ct-leave-app',
    name: 'Leave Approval',
    description: 'Request for employee leave.',
    attribute_definitions: [
      { name: 'start_date', label: 'Start Date', type: 'date', required: true },
      { name: 'end_date', label: 'End Date', type: 'date', required: true },
    ],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ct-procurement-req',
    name: 'Procurement Request',
    description: 'Request to procure goods or services.',
    attribute_definitions: [],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ct-other',
    name: 'Other',
    description: 'General purpose case type.',
    attribute_definitions: [],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];


// Mock workflow instances (simulates backend state)
let mockWorkflowInstances: WorkflowInstance[] = [
  {
    id: 'wf-inst-001',
    case_id: 'case-001',
    workflow_template_name: 'Fund Request',
    current_step: { id: 'step-finance-review', name: 'Finance Review', responsible_role: 'Director of Finance', responsible_department: 'Finance Directorate', actions: ['Approve', 'Reject', 'Request Clarification'] },
    status: 'Active',
    history: [
      { step_id: 'step-initiation', step_name: 'Initiation', action_taken: 'Submit', action_by_user_id: 'user-1', action_at: '2025-06-01T10:05:00Z' },
      { step_id: 'step-dept-review', step_name: 'Department Review', action_taken: 'Forward to Finance', action_by_user_id: 'user-2', action_at: '2025-06-05T11:20:00Z' },
    ],
    created_at: '2025-06-01T10:00:00Z',
    updated_at: '2025-06-20T14:30:00Z',
  },
  {
    id: 'wf-inst-002',
    case_id: 'case-002',
    workflow_template_name: 'Curriculum Approval',
    current_step: { id: 'step-initial-review', name: 'Initial Review', responsible_role: 'Curriculum Officer', responsible_department: 'Curriculum Development', actions: ['Approve', 'Request Revisions'] },
    status: 'Active',
    history: [],
    created_at: '2025-06-15T09:00:00Z',
    updated_at: '2025-06-15T09:00:00Z',
  },
  {
    id: 'wf-inst-003',
    case_id: 'case-003',
    workflow_template_name: 'Leave Approval', // Assuming a simple 2-step approval
    current_step: null,
    status: 'Completed',
    history: [
        { step_id: 'step-initiation', step_name: 'Initiation', action_taken: 'Submit', action_by_user_id: 'user-2', action_at: '2025-05-20T11:05:00Z' },
        { step_id: 'step-final-approval', step_name: 'Final Approval', action_taken: 'Approve', action_by_user_id: 'user-2', action_at: '2025-05-21T10:00:00Z' }
    ],
    created_at: '2025-05-20T11:00:00Z',
    updated_at: '2025-05-25T10:00:00Z',
  },
  {
    id: 'wf-inst-004',
    case_id: 'case-004',
    workflow_template_name: 'Procurement Request',
    current_step: null, // No current step as it's completed
    status: 'Completed',
    history: [
        { step_id: 'step-initiation', step_name: 'Initiation', action_taken: 'Submit', action_by_user_id: 'user-1', action_at: '2025-04-01T14:05:00Z' },
        { step_id: 'step-dept-review', step_name: 'Department Review', action_taken: 'Approve', action_by_user_id: 'user-3', action_at: '2025-04-05T10:00:00Z' },
        { step_id: 'step-finance-approval', step_name: 'Finance Approval', action_taken: 'Approve', action_by_user_id: 'user-1', action_at: '2025-04-10T15:00:00Z' },
        { step_id: 'step-procurement-complete', step_name: 'Procurement Complete', action_taken: 'Complete', action_by_user_id: 'user-1', action_at: '2025-04-20T16:00:00Z' },
    ],
    created_at: '2025-04-01T14:00:00Z',
    updated_at: '2025-04-20T16:00:00Z',
  },
];

const mockNotifications: Notification[] = [
  { id: 'notif-001', user_id: 'user-current', message: 'Case #case-001 "Fund Request" moved to Finance for review.', type: 'case_update', read_status: false, created_at: '2025-06-27T10:00:00Z', link: '/cases/case-001' },
  { id: 'notif-002', user_id: 'user-current', message: 'Digital file "Annual Report.pdf" was accessed by John Doe.', type: 'file_movement', read_status: false, created_at: '2025-06-27T10:15:00Z', link: '/files/file-001' },
  { id: 'notif-003', user_id: 'user-current', message: 'Your leave request (Case #case-003) has been approved.', type: 'case_update', read_status: true, created_at: '2025-06-25T14:00:00Z', link: '/cases/case-003' },
  { id: 'notif-004', user_id: 'user-current', message: 'System maintenance scheduled for July 1st, 2025.', type: 'system_alert', read_status: true, created_at: '2025-06-20T09:00:00Z' },
];

const mockAuditEvents: AuditLog[] = [
  { id: 'audit-001', timestamp: '2025-06-27T10:00:00Z', service_name: 'CaseManagement', event_type: 'CaseCreated', actor_user_id: 'user-current', actor_username: 'Current User', resource_type: 'Case', resource_id: 'case-005', details: { title: 'New Project Proposal' } },
  { id: 'audit-002', timestamp: '2025-06-27T10:05:00Z', service_name: 'Workflow', event_type: 'CaseWorkflowStarted', actor_user_id: 'user-current', actor_username: 'Current User', resource_type: 'Case', resource_id: 'case-005', details: { workflow: 'Project Approval' } },
  { id: 'audit-003', timestamp: '2025-06-27T10:10:00Z', service_name: 'FileManagement', event_type: 'FileAccessed', actor_user_id: 'user-1', actor_username: 'John Doe', resource_type: 'File', resource_id: 'file-001', details: { version: 2 } },
  { id: 'audit-004', timestamp: '2025-06-26T15:00:00Z', service_name: 'Auth', event_type: 'UserLoginSuccess', actor_user_id: 'user-2', actor_username: 'Jane Smith', resource_type: 'User', resource_id: 'user-2', details: { ip: '192.168.1.100' } },
  { id: 'audit-005', timestamp: '2025-06-26T16:00:00Z', service_name: 'FileManagement', event_type: 'FileMoved', actor_user_id: 'user-3', actor_username: 'Alex Johnson', resource_type: 'File', resource_id: 'file-002', details: { from: 'loc-finance', to: 'loc-hr' } },
  { id: 'audit-006', timestamp: '2025-06-26T18:00:00Z', service_name: 'Admin', event_type: 'UserRoleUpdated', actor_user_id: 'admin-1', actor_username: 'Admin User', resource_type: 'User', resource_id: 'user-1', details: { oldRole: 'User', newRole: 'DepartmentHead' } },
];


const mockApiCall = <T,>(data: T, delay = 500): Promise<T> => {
  return new Promise(resolve => {
    setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), delay);
  });
};

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

const enhanceFileForDisplay = (file: File): File => {
  const enhancedFile: File = {
      ...file,
      current_location_name: file.current_location_id ? mockPhysicalLocations.find(l => l.id === file.current_location_id)?.name || 'Unknown Location' : undefined,
      created_by_username: mockUsernames[file.created_by_user_id] || 'Unknown User',
      digital_file_versions: file.digital_file_versions?.map(v => ({
          ...v,
          uploaded_by_username: mockUsernames[v.uploaded_by_user_id] || 'Unknown User',
      })),
      file_movements: file.file_movements?.map(m => ({
          ...m,
          from_location_name: mockPhysicalLocations.find(l => l.id === m.from_location_id)?.name || 'Unknown Location',
          to_location_name: mockPhysicalLocations.find(l => l.id === m.to_location_id)?.name || 'Unknown Location',
          moved_by_username: mockUsernames[m.moved_by_user_id] || 'Unknown User',
      })),
  };
  return enhancedFile;
};

// Helper to enhance history with usernames
const enhanceInstanceHistory = (instance: WorkflowInstance): WorkflowInstance => ({
    ...instance,
    history: instance.history.map(entry => ({
        ...entry,
        action_by_username: mockUsernames[entry.action_by_user_id] || 'Unknown User',
    })),
});


export const api = {
  login: (email: string, _password?: string): Promise<LoginResponse> => {
    const user = mockUserProfiles.find(u => u.email === email) || mockUserProfiles.find(u => u.username === 'current.user');
    if (user && user.is_active) {
      return mockApiCall({
        user,
        accessToken: `mock_access_token_${user.id}_${Date.now()}`,
        refreshToken: `mock_refresh_token_${user.id}_${Date.now()}`,
      });
    }
    return Promise.reject(new Error('Invalid credentials or inactive user.'));
  },

  refreshAccessToken: (refreshToken: string): Promise<{ accessToken: string, refreshToken: string, user: UserProfile }> => {
    const userId = refreshToken.split('_')[3];
    const user = mockUserProfiles.find(u => u.id === userId);
    if (user && user.is_active) {
        return mockApiCall({
            accessToken: `mock_access_token_${user.id}_${Date.now()}`,
            refreshToken: `mock_refresh_token_${user.id}_${Date.now()}`,
            user,
        });
    }
    return Promise.reject(new Error('Invalid refresh token or inactive user.'));
  },

  fetchDashboardKPIs: async (): Promise<KPI[]> => {
      return mockApiCall([
            { id: 'open_cases', label: 'My Open Cases', value: 7, unit: '', description: 'Cases awaiting your action', color: 'border-orange-500' },
            { id: 'pending_approvals', label: 'Pending Approvals', value: 3, unit: '', description: 'Cases requiring your approval', color: 'border-red-500' },
            { id: 'files_in_dept', label: 'Files in My Dept', value: 124, unit: '', description: 'Digital & physical files in your department', color: 'border-blue-500' },
            { id: 'completed_this_month', label: 'Completed This Month', value: 28, unit: '', description: 'Cases you completed this month', color: 'border-green-500' },
          ], 500);
    },

  fetchRecentActivities: async (): Promise<RecentActivity[]> => {
      return mockApiCall([
            { id: 'act1', timestamp: '2025-06-26T10:00:00Z', description: 'Case #case-001 "Q1 2025 Financial Audit" moved to Finance.', type: 'case', link: '/cases/case-001' },
            { id: 'act2', timestamp: '2025-06-26T09:30:00Z', description: 'Digital file "Annual Budget Proposal 2025" accessed.', type: 'file', link: '/files/file-001' },
            { id: 'act3', timestamp: '2025-06-25T16:45:00Z', description: 'Case #case-002 "Curriculum Update for Grade 5" approved.', type: 'case', link: '/cases/case-002' },
            { id: 'act4', timestamp: '2025-06-25T11:20:00Z', description: 'Physical file "Teacher Recruitment Policy" moved to HR office.', type: 'file', link: '/files/file-002' },
            { id: 'act5', timestamp: '2025-06-24T14:00:00Z', description: 'New user "Admin User" logged in.', type: 'user' },
          ], 700);
    },

  // --- File Management ---
  fetchFiles: (): Promise<File[]> => {
      return mockApiCall(MOCK_FILES.map(enhanceFileForDisplay), 700);
  },
  fetchFileById: (id: string): Promise<File | undefined> => {
      const file = MOCK_FILES.find(f => f.id === id);
      if (file) {
        return mockApiCall(enhanceFileForDisplay(file), 500);
      }
      return mockApiCall(undefined, 500);
  },
  createFile: (payload: FileCreationPayload): Promise<File> => {
    return new Promise(resolve => setTimeout(() => {
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
        resolve(enhanceFileForDisplay(newFile));
    }, 800));
  },
  updateFile: (id: string, payload: FileUpdatePayload): Promise<File> => {
      return new Promise((resolve, reject) => setTimeout(() => {
          const index = MOCK_FILES.findIndex(f => f.id === id);
          if (index !== -1) {
              const updatedFile = { ...MOCK_FILES[index], ...payload, updated_at: new Date().toISOString() };
              MOCK_FILES[index] = updatedFile;
              resolve(enhanceFileForDisplay(updatedFile));
          } else {
              reject(new Error('File not found for update.'));
          }
      }, 800));
  },
  deleteFile: (id: string): Promise<void> => {
      return new Promise((resolve, reject) => setTimeout(() => {
          const initialLength = MOCK_FILES.length;
          MOCK_FILES = MOCK_FILES.filter(f => f.id !== id);
          if (MOCK_FILES.length < initialLength) {
              resolve();
          } else {
              reject(new Error('File not found for deletion.'));
          }
      }, 500));
  },
  movePhysicalFile: async (fileId: string, newLocationId: string, reason: string): Promise<File> => {
    return new Promise(async (resolve, reject) => {
        setTimeout(() => {
            const fileIndex = MOCK_FILES.findIndex(f => f.id === fileId);
            if (fileIndex === -1 || MOCK_FILES[fileIndex].file_type !== 'physical') {
                return reject(new Error('Physical file not found.'));
            }

            const oldLocationId = MOCK_FILES[fileIndex].current_location_id;
            const newLocation = mockPhysicalLocations.find(loc => loc.id === newLocationId);

            if (!newLocation) {
                return reject(new Error('New location not found.'));
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
            resolve(enhanceFileForDisplay(updatedFile));
        }, 800);
    });
  },
  
  // --- Case Management ---
  fetchCases: (): Promise<Case[]> => mockApiCall(MOCK_CASES.map(c => ({
      ...c,
      initiated_by_username: mockUsernames[c.initiated_by_user_id] || 'Unknown User',
  }))),
  
  fetchCaseById: async (id: string): Promise<Case | null> => {
    const caseItem = MOCK_CASES.find(c => c.id === id);
    if (caseItem) {
        const associated_files_details: File[] = [];
        for (const fileId of caseItem.associated_file_ids) {
            const fileDetail = await api.fetchFileById(fileId);
            if (fileDetail) {
                associated_files_details.push(fileDetail);
            }
        }

        const enhancedCase: Case = {
            ...caseItem,
            initiated_by_username: mockUsernames[caseItem.initiated_by_user_id] || 'Unknown User',
            associated_files_details,
        };
        return mockApiCall(enhancedCase);
    }
    return mockApiCall(null);
  },
  
  createCase: async (payload: CaseCreationPayload): Promise<Case> => {
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
  
  updateCase: (id: string, payload: CaseUpdatePayload): Promise<Case> => {
    return new Promise((resolve, reject) => setTimeout(async () => {
        const index = MOCK_CASES.findIndex(c => c.id === id);
        if (index !== -1) {
            const updatedCase = {
                ...MOCK_CASES[index],
                ...payload,
                updated_at: new Date().toISOString()
            };
            MOCK_CASES[index] = updatedCase;
            const enhancedCase = await api.fetchCaseById(id);
            resolve(enhancedCase!);
        } else {
            reject(new Error('Case not found for update.'));
        }
    }, 800));
  },

  deleteCase: (id: string): Promise<void> => {
      return new Promise((resolve, reject) => setTimeout(() => {
          const initialLength = MOCK_CASES.length;
          MOCK_CASES = MOCK_CASES.filter(c => c.id !== id);
          if (MOCK_CASES.length < initialLength) {
              resolve();
          } else {
              reject(new Error('Case not found for deletion.'));
          }
      }, 500));
  },

  fetchWorkflowInstances: async (): Promise<WorkflowInstance[]> => {
    // Maps to: GET /api/v1/workflows/instances/
    return mockApiCall(mockWorkflowInstances.map(enhanceInstanceHistory), 500);
  },

  fetchWorkflowInstanceById: async (id: string): Promise<WorkflowInstance | null> => {
    // Maps to: GET /api/v1/workflows/instances/{id}/
    // For the mock, this can find by instance ID or case ID for convenience.
    return new Promise((resolve) => {
      setTimeout(() => {
        const instance = mockWorkflowInstances.find(i => i.id === id || i.case_id === id);
        resolve(instance ? enhanceInstanceHistory(instance) : null);
      }, 300);
    });
  },

  performWorkflowAction: async (payload: WorkflowActionPayload): Promise<WorkflowInstance> => {
    // Maps to: POST /api/v1/workflows/instances/{instance_id}/action/
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const instanceIndex = mockWorkflowInstances.findIndex(i => i.case_id === payload.case_id);
        if (instanceIndex === -1) {
          return reject(new Error('Case workflow instance not found.'));
        }
        let currentInstance = mockWorkflowInstances[instanceIndex];

        const template = mockWorkflowTemplatesData.find(t => t.name === currentInstance.workflow_template_name);
        const templateSteps = template?.definition_json;
        if (!templateSteps) {
            return reject(new Error('Workflow template not found for this case type.'));
        }

        const currentStepIndex = templateSteps.findIndex(s => s.id === currentInstance.current_step?.id);
        if (currentStepIndex === -1 && currentInstance.status === 'Active') {
            return reject(new Error('Current workflow step not found.'));
        }
        
        const currentStepDef = currentInstance.current_step ? templateSteps.find(s => s.id === currentInstance.current_step?.id) : null;

        if (currentStepDef && !currentStepDef.actions.includes(payload.action)) {
            return reject(new Error(`Action '${payload.action}' not allowed at current step '${currentStepDef.name}'.`));
        }

        let nextStep: WorkflowStep | null = null;
        let newStatus: WorkflowInstance['status'] = 'Active';

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


        const updatedHistory: WorkflowHistoryEntry[] = [
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
        resolve(updatedInstance);
      }, 800);
    });
  },

  fetchUsers: (): Promise<User[]> => mockApiCall(MOCK_USERS),
  
  fetchOrgChart: (): Promise<Department> => mockApiCall(MOCK_ORG_CHART),

  fetchNotifications: async (): Promise<Notification[]> => {
    return mockApiCall(mockNotifications.filter(n => n.user_id === 'user-current'));
  },

  markNotificationAsRead: async (notificationId: string): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
          const notification = mockNotifications.find(n => n.id === notificationId);
          if (notification) {
            notification.read_status = true;
            resolve(true);
          } else {
            resolve(false);
          }
        }, 200);
      });
  },

  fetchAuditLogs: async (params: { [key: string]: string } = {}): Promise<AuditLog[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
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
    
          resolve(logsWithUsernames);
        }, 800);
      });
  },

  // --- Workflow Template Management API ---

  fetchWorkflowTemplates: async (): Promise<WorkflowTemplate[]> => {
    return mockApiCall(mockWorkflowTemplatesData, 500);
  },

  fetchWorkflowTemplateById: async (id: string): Promise<WorkflowTemplate | null> => {
    const template = mockWorkflowTemplatesData.find(t => t.id === id) || null;
    return mockApiCall(template, 300);
  },

  createWorkflowTemplate: async (payload: WorkflowTemplatePayload): Promise<WorkflowTemplate> => {
    const newTemplate: WorkflowTemplate = {
      id: `wf-temp-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...payload,
    };
    mockWorkflowTemplatesData.push(newTemplate);
    return mockApiCall(newTemplate, 1000);
  },

  updateWorkflowTemplate: async (id: string, payload: WorkflowTemplatePayload): Promise<WorkflowTemplate> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockWorkflowTemplatesData.findIndex(t => t.id === id);
        if (index !== -1) {
          const updatedTemplate: WorkflowTemplate = {
            ...mockWorkflowTemplatesData[index],
            ...payload,
            updated_at: new Date().toISOString(),
          };
          mockWorkflowTemplatesData[index] = updatedTemplate;
          resolve(updatedTemplate);
        } else {
          reject(new Error('Workflow template not found for update.'));
        }
      }, 1000);
    });
  },

  // --- User Profile Endpoints ---
  fetchUserProfiles: async (): Promise<UserProfile[]> => {
    return mockApiCall(mockUserProfiles, 500);
  },

  fetchUserByIdProfile: async (id: string): Promise<UserProfile | null> => {
    return mockApiCall(mockUserProfiles.find(u => u.id === id) || null, 300);
  },

  createUser: async (payload: UserCreationPayload): Promise<UserProfile> => {
    return new Promise(resolve => setTimeout(() => {
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
      resolve(newUser);
    }, 800));
  },

  updateUser: async (id: string, payload: UserUpdatePayload): Promise<UserProfile> => {
    return new Promise((resolve, reject) => setTimeout(() => {
      const index = mockUserProfiles.findIndex(u => u.id === id);
      if (index !== -1) {
        const updatedUser: UserProfile = {
          ...mockUserProfiles[index],
          ...payload,
          updated_at: new Date().toISOString(),
          roles: payload.role_ids ? mockRoles.filter(r => payload.role_ids!.includes(r.id)) : mockUserProfiles[index].roles,
        };
        mockUserProfiles[index] = updatedUser;
        resolve(updatedUser);
      } else {
        reject(new Error('User not found.'));
      }
    }, 800));
  },

  deleteUser: async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => setTimeout(() => {
      const index = mockUserProfiles.findIndex(u => u.id === id);
      if (index > -1) {
        mockUserProfiles.splice(index, 1);
        resolve();
      } else {
        reject(new Error('User not found.'));
      }
    }, 500));
  },

  // --- Role Endpoints ---
  fetchRoles: async (): Promise<Role[]> => {
    return mockApiCall(mockRoles, 400);
  },

  fetchRoleById: async (id: string): Promise<Role | null> => {
    return mockApiCall(mockRoles.find(r => r.id === id) || null, 300);
  },

  createRole: async (payload: RoleCreationPayload): Promise<Role> => {
    return new Promise(resolve => setTimeout(() => {
      const newRole: Role = {
        id: `role-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...payload,
      };
      mockRoles.push(newRole);
      resolve(newRole);
    }, 700));
  },

  updateRole: async (id: string, payload: RoleUpdatePayload): Promise<Role> => {
    return new Promise((resolve, reject) => setTimeout(() => {
      const index = mockRoles.findIndex(r => r.id === id);
      if (index !== -1) {
        const updatedRole: Role = {
          ...mockRoles[index],
          ...payload,
          updated_at: new Date().toISOString(),
        };
        mockRoles[index] = updatedRole;
        resolve(updatedRole);
      } else {
        reject(new Error('Role not found.'));
      }
    }, 700));
  },

  deleteRole: async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => setTimeout(() => {
      const index = mockRoles.findIndex(r => r.id === id);
      if (index > -1) {
        mockRoles.splice(index, 1);
        resolve();
      } else {
        reject(new Error('Role not found.'));
      }
    }, 400));
  },

  changePassword: async (userId: string, oldPass: string, newPass: string): Promise<{ message: string }> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const user = mockUserProfiles.find(u => u.id === userId);
            if (!user) {
                return reject(new Error("User not found"));
            }
            // In a real app, you would verify the old password is correct
            console.log(`Password changed for user ${userId}. (Old: ${oldPass}, New: ${newPass})`);
            resolve({ message: 'Password updated successfully.' });
        }, 800);
    });
  },

  // --- Organization Unit Endpoints ---
  fetchOrganizationalUnits: async (): Promise<OrganizationalUnit[]> => {
    const units = JSON.parse(JSON.stringify(mockOrganizationalUnits));
    const unitsWithParentNames = units.map((unit: OrganizationalUnit) => ({
        ...unit,
        parent_name: unit.parent_id ? units.find((p: OrganizationalUnit) => p.id === unit.parent_id)?.name || 'Unknown' : undefined
    }));
    return mockApiCall(unitsWithParentNames, 500);
  },
  
  fetchOrganizationalUnitById: async (id: string): Promise<OrganizationalUnit | null> => {
    const unit = mockOrganizationalUnits.find(u => u.id === id) || null;
    return mockApiCall(unit, 300);
  },
  
  fetchOrganizationalHierarchy: async (): Promise<OrganizationalUnit> => {
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

    return mockApiCall(root!, 800);
  },

  createOrganizationalUnit: async (payload: OrgUnitCreationPayload): Promise<OrganizationalUnit> => {
    return new Promise(resolve => setTimeout(() => {
        const newUnit: OrganizationalUnit = {
            id: `org-${Date.now()}`,
            name: payload.name,
            unit_type: payload.unit_type,
            parent_id: payload.parent_id ?? null,
            description: payload.description,
        };
        mockOrganizationalUnits.push(newUnit);
        resolve(newUnit);
    }, 800));
  },

  updateOrganizationalUnit: async (id: string, payload: OrgUnitUpdatePayload): Promise<OrganizationalUnit> => {
    return new Promise((resolve, reject) => setTimeout(() => {
        const index = mockOrganizationalUnits.findIndex(u => u.id === id);
        if (index > -1) {
            const currentUnit = mockOrganizationalUnits[index];
            const updatedUnit: OrganizationalUnit = {
                ...currentUnit,
                ...payload,
                parent_id: 'parent_id' in payload ? payload.parent_id ?? null : currentUnit.parent_id,
            };
            mockOrganizationalUnits[index] = updatedUnit;
            resolve(updatedUnit);
        } else {
            reject(new Error('Unit not found'));
        }
    }, 800));
  },

  deleteOrganizationalUnit: async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => setTimeout(() => {
        const index = mockOrganizationalUnits.findIndex(u => u.id === id);
        if (index > -1) {
            mockOrganizationalUnits.splice(index, 1);
            // In a real scenario, the backend should handle cascading deletes or prevent deletion of units with children.
            // For the mock, we can simulate this by filtering out children.
            mockOrganizationalUnits = mockOrganizationalUnits.filter(u => u.parent_id !== id);
            resolve();
        } else {
            reject(new Error('Unit not found'));
        }
    }, 500));
  },

  // --- Physical Location Endpoints ---
  fetchLocations: async (): Promise<PhysicalLocation[]> => {
    return mockApiCall(mockPhysicalLocations.map(loc => ({
        ...loc,
        organizational_unit_name: loc.organizational_unit_id ? mockOrgUnitNames[loc.organizational_unit_id] : 'N/A'
    })), 400);
  },
  fetchLocationById: async(id: string): Promise<PhysicalLocation | null> => {
    return mockApiCall(mockPhysicalLocations.find(l => l.id === id) || null, 300);
  },
  createLocation: async (payload: LocationCreationPayload): Promise<PhysicalLocation> => {
    return new Promise(resolve => setTimeout(() => {
        const newLocation: PhysicalLocation = {
            id: `loc-${Date.now()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...payload,
        };
        mockPhysicalLocations.push(newLocation);
        resolve(newLocation);
    }, 700));
  },
  updateLocation: async (id: string, payload: LocationUpdatePayload): Promise<PhysicalLocation> => {
    return new Promise((resolve, reject) => setTimeout(() => {
        const index = mockPhysicalLocations.findIndex(l => l.id === id);
        if (index > -1) {
            const updatedLocation = { ...mockPhysicalLocations[index], ...payload, updated_at: new Date().toISOString() };
            mockPhysicalLocations[index] = updatedLocation;
            resolve(updatedLocation);
        } else {
            reject(new Error('Location not found.'));
        }
    }, 700));
  },
  deleteLocation: async(id: string): Promise<void> => {
    return new Promise((resolve, reject) => setTimeout(() => {
        const initialLength = mockPhysicalLocations.length;
        mockPhysicalLocations = mockPhysicalLocations.filter(l => l.id !== id);
        if (mockPhysicalLocations.length < initialLength) {
            resolve();
        } else {
            reject(new Error('Location not found.'));
        }
    }, 400));
  },
    // --- Case Type Management ---
  fetchCaseTypes: async (): Promise<CaseType[]> => {
    return mockApiCall(mockCaseTypes, 400);
  },
  fetchCaseTypeById: async(id: string): Promise<CaseType | null> => {
    return mockApiCall(mockCaseTypes.find(ct => ct.id === id) || null, 300);
  },
  createCaseType: async (payload: CaseTypeCreationPayload): Promise<CaseType> => {
    return new Promise(resolve => setTimeout(() => {
        const newCaseType: CaseType = {
            id: `ct-${Date.now()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...payload,
        };
        mockCaseTypes.push(newCaseType);
        resolve(newCaseType);
    }, 700));
  },
  updateCaseType: async (id: string, payload: CaseTypeUpdatePayload): Promise<CaseType> => {
    return new Promise((resolve, reject) => setTimeout(() => {
        const index = mockCaseTypes.findIndex(l => l.id === id);
        if (index > -1) {
            const updatedCaseType = { ...mockCaseTypes[index], ...payload, updated_at: new Date().toISOString() };
            mockCaseTypes[index] = updatedCaseType;
            resolve(updatedCaseType);
        } else {
            reject(new Error('Case Type not found.'));
        }
    }, 700));
  },
  deleteCaseType: async(id: string): Promise<void> => {
    return new Promise((resolve, reject) => setTimeout(() => {
        const initialLength = mockCaseTypes.length;
        mockCaseTypes = mockCaseTypes.filter(l => l.id !== id);
        if (mockCaseTypes.length < initialLength) {
            resolve();
        } else {
            reject(new Error('Case Type not found.'));
        }
    }, 400));
  }
};
