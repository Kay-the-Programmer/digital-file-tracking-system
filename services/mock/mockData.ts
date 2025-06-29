import { User, UserRole, File, Case, CaseStatus, Department, DigitalFileVersion, FileMovement, CaseCreationPayload, CaseUpdatePayload, WorkflowInstance, WorkflowStep, WorkflowHistoryEntry, WorkflowActionPayload, AuditLog, Notification, WorkflowTemplate, WorkflowStepDefinition, WorkflowTemplatePayload, Role, UserProfile, UserCreationPayload, UserUpdatePayload, RoleCreationPayload, RoleUpdatePayload, OrganizationalUnit, OrgUnitCreationPayload, OrgUnitUpdatePayload, PhysicalLocation, FileCreationPayload, FileUpdatePayload, LocationCreationPayload, LocationUpdatePayload, CaseType, CaseTypeCreationPayload, CaseTypeUpdatePayload } from '../../types';

// MOCK DATA
export const MOCK_USERS: User[] = [
  { id: 'user-1', name: 'John Doe', email: 'john.doe@dfts.com', department: 'Finance', roles: [UserRole.USER] },
  { id: 'user-2', name: 'Jane Smith', email: 'jane.smith@dfts.com', department: 'HR', roles: [UserRole.DEPARTMENT_HEAD, UserRole.USER] },
  { id: 'user-3', name: 'Alex Johnson', email: 'alex.j@dfts.com', department: 'Curriculum', roles: [UserRole.RECORDS_MANAGER, UserRole.USER] },
  { id: 'admin-1', name: 'Admin User', email: 'admin@dfts.com', department: 'IT', roles: [UserRole.ADMIN, UserRole.USER] },
  { id: 'user-current', name: 'Current User', email: 'current.user@dfts.com', department: 'IT', roles: [UserRole.USER, UserRole.ADMIN] }, // For newly created cases, also admin for testing
];

// Mock Usernames (can be derived from MOCK_USERS, but this is simpler for the mock)
export const mockUsernames: Record<string, string> = MOCK_USERS.reduce((acc, user) => {
  acc[user.id] = user.name;
  return acc;
}, {} as Record<string, string>);

// --- New mock data for User and Role Management ---
export let mockRoles: Role[] = [
  { id: 'role-admin', name: 'SystemAdmin', description: 'Full administrative access', permissions: ['user:list', 'user:create', 'user:read', 'user:update', 'user:delete', 'role:list', 'role:create', 'role:read', 'role:update', 'role:delete', 'workflow:manage', 'workflow:instance:list', 'workflow:instance:read', 'audit:view', 'case:create', 'case:read', 'case:update', 'case:delete', 'case:approve', 'file:list', 'file:create', 'file:read', 'file:update', 'file:delete', 'file:download', 'file:move', 'org:list', 'org:create', 'org:read', 'org:update', 'org:delete', 'location:list', 'location:create', 'location:read', 'location:update', 'location:delete', 'casetype:list', 'casetype:create', 'casetype:read', 'casetype:update', 'casetype:delete'], created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 'role-clerk', name: 'Clerk', description: 'Basic user, can create files and cases', permissions: ['case:create', 'file:create', 'file:download', 'file:list', 'file:read'], created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 'role-dept-head', name: 'DepartmentHead', description: 'Can approve cases within their department', permissions: ['case:approve', 'case:read', 'file:read'], created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 'role-audit', name: 'AuditOfficer', description: 'Can view audit logs', permissions: ['audit:view'], created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
];

export let mockUserProfiles: UserProfile[] = [
  { id: 'user-current', username: 'current.user', first_name: 'Current', last_name: 'User', email: 'current.user@dfts.com', is_active: true, roles: [mockRoles[0]], created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 'admin-1', username: 'admin.user', first_name: 'Admin', last_name: 'User', email: 'admin@dfts.com', is_active: true, roles: [mockRoles[0]], created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 'user-1', username: 'john.doe', first_name: 'John', last_name: 'Doe', email: 'john.doe@dfts.com', phone_number: '123-456-7890', department_id: 'finance', is_active: true, roles: [mockRoles[1]], created_at: '2024-01-05T00:00:00Z', updated_at: '2024-06-01T00:00:00Z' },
  { id: 'user-2', username: 'jane.smith', first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@dfts.com', department_id: 'hr_admin', is_active: true, roles: [mockRoles[2]], created_at: '2024-02-10T00:00:00Z', updated_at: '2024-06-15T00:00:00Z' },
  { id: 'user-3', username: 'alex.j', first_name: 'Alex', last_name: 'Johnson', email: 'alex.j@dfts.com', is_active: false, roles: [mockRoles[1], mockRoles[3]], created_at: '2024-03-20T00:00:00Z', updated_at: '2024-03-20T00:00:00Z' },
];

export let mockOrganizationalUnits: OrganizationalUnit[] = [
    { id: 'moe', name: 'Ministry of Education', unit_type: 'MINISTRY', parent_id: null },
    { id: 'minister', name: 'Minister', unit_type: 'MINISTER_OFFICE', parent_id: 'moe' },
    { id: 'ps_admin', name: 'Permanent Secretary (Administration)', unit_type: 'PS_OFFICE', parent_id: 'minister' },
    { id: 'ps_edu_services', name: 'Permanent Secretary (Educational Services)', unit_type: 'PS_OFFICE', parent_id: 'minister' },
    { id: 'hr_admin', name: 'HR Management & Administration', unit_type: 'DIRECTORATE', parent_id: 'ps_admin' },
    { id: 'planning', name: 'Planning', unit_type: 'DIRECTORATE', parent_id: 'ps_admin' },
    { id: 'finance', name: 'Finance', unit_type: 'DIRECTORATE', parent_id: 'ps_admin' },
    { id: 'curriculum_dev', name: 'Curriculum Development', unit_type: 'DIRECTORATE', parent_id: 'ps_edu_services' },
];

export const mockOrgUnitNames: Record<string, string> = mockOrganizationalUnits.reduce((acc, unit) => {
    acc[unit.id] = unit.name;
    return acc;
}, {} as Record<string, string>);

export let mockPhysicalLocations: PhysicalLocation[] = [
  { id: 'loc-hr', name: 'HR Department - Cabinet A', description: 'Main cabinet for HR files', organizational_unit_id: 'hr_admin', created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z' },
  { id: 'loc-finance', name: 'Finance Department - Vault 3', description: 'Secure vault for financial records', organizational_unit_id: 'finance', created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z' },
  { id: 'loc-curriculum', name: 'Curriculum Dev. - Shelf B2', description: 'Shelving for curriculum documents', organizational_unit_id: 'curriculum_dev', created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z' },
  { id: 'loc-archives', name: 'Central Archives - Room 101', description: 'Main archive room', organizational_unit_id: 'ps_admin', created_at: '2022-01-01T00:00:00Z', updated_at: '2022-01-01T00:00:00Z' },
];

export let MOCK_CASES: Case[] = [
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

export let MOCK_FILES: File[] = [
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

export const MOCK_ORG_CHART: Department = {
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

// Mock data for workflow templates
export let mockWorkflowTemplatesData: WorkflowTemplate[] = [
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

export let mockCaseTypes: CaseType[] = [
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
export let mockWorkflowInstances: WorkflowInstance[] = [
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

export const mockNotifications: Notification[] = [
  { id: 'notif-001', user_id: 'user-current', message: 'Case #case-001 "Fund Request" moved to Finance for review.', type: 'case_update', read_status: false, created_at: '2025-06-27T10:00:00Z', link: '/cases/case-001' },
  { id: 'notif-002', user_id: 'user-current', message: 'Digital file "Annual Report.pdf" was accessed by John Doe.', type: 'file_movement', read_status: false, created_at: '2025-06-27T10:15:00Z', link: '/files/file-001' },
  { id: 'notif-003', user_id: 'user-current', message: 'Your leave request (Case #case-003) has been approved.', type: 'case_update', read_status: true, created_at: '2025-06-25T14:00:00Z', link: '/cases/case-003' },
  { id: 'notif-004', user_id: 'user-current', message: 'System maintenance scheduled for July 1st, 2025.', type: 'system_alert', read_status: true, created_at: '2025-06-20T09:00:00Z' },
];

export const mockAuditEvents: AuditLog[] = [
  { id: 'audit-001', timestamp: '2025-06-27T10:00:00Z', service_name: 'CaseManagement', event_type: 'CaseCreated', actor_user_id: 'user-current', actor_username: 'Current User', resource_type: 'Case', resource_id: 'case-005', details: { title: 'New Project Proposal' } },
  { id: 'audit-002', timestamp: '2025-06-27T10:05:00Z', service_name: 'Workflow', event_type: 'CaseWorkflowStarted', actor_user_id: 'user-current', actor_username: 'Current User', resource_type: 'Case', resource_id: 'case-005', details: { workflow: 'Project Approval' } },
  { id: 'audit-003', timestamp: '2025-06-27T10:10:00Z', service_name: 'FileManagement', event_type: 'FileAccessed', actor_user_id: 'user-1', actor_username: 'John Doe', resource_type: 'File', resource_id: 'file-001', details: { version: 2 } },
  { id: 'audit-004', timestamp: '2025-06-26T15:00:00Z', service_name: 'Auth', event_type: 'UserLoginSuccess', actor_user_id: 'user-2', actor_username: 'Jane Smith', resource_type: 'User', resource_id: 'user-2', details: { ip: '192.168.1.100' } },
  { id: 'audit-005', timestamp: '2025-06-26T16:00:00Z', service_name: 'FileManagement', event_type: 'FileMoved', actor_user_id: 'user-3', actor_username: 'Alex Johnson', resource_type: 'File', resource_id: 'file-002', details: { from: 'loc-finance', to: 'loc-hr' } },
  { id: 'audit-006', timestamp: '2025-06-26T18:00:00Z', service_name: 'Admin', event_type: 'UserRoleUpdated', actor_user_id: 'admin-1', actor_username: 'Admin User', resource_type: 'User', resource_id: 'user-1', details: { oldRole: 'User', newRole: 'DepartmentHead' } },
];

// Helper functions
export const enhanceFileForDisplay = (file: File): File => {
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
export const enhanceInstanceHistory = (instance: WorkflowInstance): WorkflowInstance => ({
    ...instance,
    history: instance.history.map(entry => ({
        ...entry,
        action_by_username: mockUsernames[entry.action_by_user_id] || 'Unknown User',
    })),
});