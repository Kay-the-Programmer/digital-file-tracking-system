export enum UserRole {
  USER = 'User',
  DEPARTMENT_HEAD = 'DepartmentHead',
  RECORDS_MANAGER = 'RecordsManager',
  ADMIN = 'Admin',
}

export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  roles: UserRole[];
}

export interface DigitalFileVersion {
  id: string;
  file_id: string;
  version_number: number;
  storage_path: string; // URL or key in object storage
  mime_type: string;
  file_size: number; // in bytes
  uploaded_by_user_id: string;
  uploaded_at: string; // ISO string
  uploaded_by_username?: string; // For display
}

export interface FileMovement {
  id: string;
  file_id: string;
  from_location_id: string;
  to_location_id: string;
  moved_by_user_id: string;
  moved_at: string; // ISO string
  reason: string;
  from_location_name?: string; // For display
  to_location_name?: string; // For display
  moved_by_username?: string; // For display
}

export interface File {
  id: string;
  title: string;
  description: string;
  file_type: 'digital' | 'physical';
  current_location_id: string | null; // ID of PhysicalLocation
  created_by_user_id: string;
  created_at: string; // ISO string
  updated_at: string; // ISO string
  current_case_id: string | null; // ID of associated Case

  // Frontend-only properties for detailed view
  digital_file_versions?: DigitalFileVersion[];
  file_movements?: FileMovement[];
  current_location_name?: string; // For display
  created_by_username?: string; // For display
}


export enum CaseStatus {
  OPEN = 'Open',
  IN_PROGRESS = 'In Progress',
  PENDING_APPROVAL = 'Pending Approval',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  CLOSED = 'Closed',
}

export interface Case {
  id: string;
  case_type: string;
  title: string;
  description: string;
  status: CaseStatus;
  initiated_by_user_id: string;
  current_workflow_step_id: string | null;
  created_at: string; // ISO string
  updated_at: string; // ISO string
  associated_file_ids: string[]; // Array of file IDs
  attributes: Record<string, any>; // Flexible attributes for case-specific data
  // Frontend-only properties for display
  initiated_by_username?: string;
  associated_files_details?: File[]; // Details of associated files
}

export interface CaseCreationPayload {
  case_type: string;
  title: string;
  description: string;
  initiated_by_user_id: string;
  associated_file_ids?: string[];
  attributes?: Record<string, any>;
}

export interface CaseUpdatePayload {
  title?: string;
  description?: string;
  status?: CaseStatus;
  associated_file_ids?: string[];
  attributes?: Record<string, any>;
}

export interface WorkflowActionPayload {
  case_id: string;
  action: string;
  comments?: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  responsible_role?: string;
  responsible_department?: string;
  actions: string[];
}

export interface WorkflowHistoryEntry {
  step_id: string;
  step_name: string;
  action_taken: string;
  action_by_user_id: string;
  action_by_username?: string;
  action_at: string;
  comments?: string;
}

export interface WorkflowInstance { // Renamed from WorkflowStatus for clarity
  id: string;
  case_id: string;
  workflow_template_name: string;
  current_step: WorkflowStep | null;
  status: 'Active' | 'Completed' | 'Rejected' | 'Aborted';
  history: WorkflowHistoryEntry[];
  created_at: string;
  updated_at: string;
}


// Department interface removed as it's been replaced by OrganizationalUnit

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

export interface AuditLog {
  id: string;
  timestamp: string; // ISO string
  service_name: string;
  event_type: string; // e.g., 'CaseCreated', 'FileAccessed', 'UserLoginSuccess'
  actor_user_id: string;
  actor_username?: string; // Frontend-only
  actor_role?: string;
  resource_type: string; // e.g., 'Case', 'File', 'User'
  resource_id: string;
  details: Record<string, any>; // JSON object for event-specific details
  correlation_id?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  type: 'case_update' | 'file_movement' | 'system_alert' | 'user_action';
  read_status: boolean;
  created_at: string; // ISO string
  link?: string; // Optional link to relevant page
}

// --- New Interfaces for Workflow Template Management ---
export interface WorkflowStepDefinition {
  id: string;
  name: string;
  responsible_role: string;
  responsible_department: string;
  actions: string[];
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  case_type: string;
  definition_json: WorkflowStepDefinition[];
  created_at: string;
  updated_at: string;
}

export interface WorkflowTemplatePayload {
  name: string;
  description: string;
  case_type: string;
  definition_json: WorkflowStepDefinition[];
}

// --- New Interfaces for User & Role Management ---
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // Array of permission strings
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: UserProfile;
  permissions: string[];
}

export interface UserProfile {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  department?: string; // Link to OrganizationalUnit
  is_active: boolean;
  roles: Role[]; // Full role objects
  created_at: string;
  updated_at: string;
}

export interface UserCreationPayload {
  username: string;
  password?: string; // Only for creation
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  department_id?: string;
  role_ids?: string[]; // Array of role IDs
}

export interface UserUpdatePayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  department_id?: string;
  is_active?: boolean;
  role_ids?: string[]; // Array of role IDs
}

export interface RoleCreationPayload {
  name: string;
  description: string;
  permissions: string[];
}

export interface RoleUpdatePayload {
  name?: string;
  description?: string;
  permissions?: string[];
}

// --- New Interfaces for Organization Unit Management ---
export interface OrganizationalUnit {
  id: string;
  name: string;
  unit_type: 'MINISTRY' | 'MINISTER_OFFICE' | 'PS_OFFICE' | 'DIRECTORATE' | 'DEPARTMENT';
  parent_id: string | null;
  description?: string;
  // Frontend-only properties
  parent_name?: string;
  children?: OrganizationalUnit[]; // For tree rendering
}

export interface OrgUnitCreationPayload {
  name: string;
  unit_type: OrganizationalUnit['unit_type'];
  parent_id?: string | null;
  description?: string;
}

export interface OrgUnitUpdatePayload {
  name?: string;
  unit_type?: OrganizationalUnit['unit_type'];
  parent_id?: string | null;
  description?: string;
}

// --- New Interfaces for File & Location Management ---
export interface FileCreationPayload {
  title: string;
  description: string;
  file_type: 'digital' | 'physical';
  current_location_id?: string | null;
  created_by_user_id: string;
  current_case_id?: string | null;
}

export interface FileUpdatePayload {
  title?: string;
  description?: string;
  current_location_id?: string | null;
  current_case_id?: string | null;
}

export interface PhysicalLocation {
  id: string;
  name: string;
  description?: string;
  organizational_unit_id?: string;
  created_at: string;
  updated_at: string;
  organizational_unit_name?: string; // Frontend-only
}

export interface LocationCreationPayload {
  name: string;
  description?: string;
  organizational_unit_id?: string;
}

export interface LocationUpdatePayload {
  name?: string;
  description?: string;
  organizational_unit_id?: string;
}

// --- New Interfaces for Case Type Management ---
export interface CaseTypeAttribute {
  name: string; // e.g., 'amount', 'start_date'
  label: string; // e.g., 'Amount Required', 'Start Date'
  type: 'text' | 'number' | 'date';
  required: boolean;
}

export interface CaseType {
  id: string;
  name: string;
  description: string;
  attribute_definitions: CaseTypeAttribute[];
  created_at: string;
  updated_at: string;
}

export interface CaseTypeCreationPayload {
  name: string;
  description: string;
  attribute_definitions: CaseTypeAttribute[];
}

export interface CaseTypeUpdatePayload {
  name?: string;
  description?: string;
  attribute_definitions?: CaseTypeAttribute[];
}
