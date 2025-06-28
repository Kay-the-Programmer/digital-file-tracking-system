
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import FileListPage from './pages/Files/FileListPage';
import FileDetailsPage from './pages/Files/FileDetailsPage';
import FileFormPage from './pages/Files/CreateFilePage'; // Renamed conceptually
import CaseListPage from './pages/Cases/CaseListPage';
import CaseDetailsPage from './pages/Cases/CaseDetailsPage';
import CaseFormPage from './pages/Cases/CaseFormPage';
import UserManagementPage from './pages/Admin/UserManagementPage';
import OrgChartPage from './pages/Organization/OrgChartPage';
import PrivateRoute from './components/auth/PrivateRoute';
import NotFoundPage from './pages/NotFoundPage';
import { ROUTES } from './constants';
import NotificationListPage from './pages/Notifications/NotificationListPage';
import AuditLogPage from './pages/Audit/AuditLogPage';
import WorkflowTemplateListPage from './pages/Admin/WorkflowTemplateListPage';
import WorkflowTemplateFormPage from './pages/Admin/WorkflowTemplateFormPage';
import UserFormPage from './pages/Admin/UserFormPage';
import RoleListPage from './pages/Admin/RoleListPage';
import RoleFormPage from './pages/Admin/RoleFormPage';
import PermissionGuard from './components/auth/PermissionGuard';
import ProfilePage from './pages/Profile/ProfilePage';
import OrgUnitListPage from './pages/Admin/OrgUnitListPage';
import OrgUnitFormPage from './pages/Admin/OrgUnitFormPage';
import LocationListPage from './pages/Admin/LocationListPage';
import LocationFormPage from './pages/Admin/LocationFormPage';
import CaseTypeListPage from './pages/Admin/CaseTypeListPage';
import CaseTypeFormPage from './pages/Admin/CaseTypeFormPage';
import WorkflowInstanceListPage from './pages/Admin/WorkflowInstanceListPage';


const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.DASHBOARD} element={<PrivateRoute />}>
          <Route index element={<DashboardPage />} />
          <Route path="files" element={<FileListPage />} />
          <Route path="files/create" element={<PermissionGuard permission="file:create"><FileFormPage /></PermissionGuard>} />
          <Route path="files/:id" element={<FileDetailsPage />} />
          <Route path="files/:id/edit" element={<PermissionGuard permission="file:update"><FileFormPage /></PermissionGuard>} />
          
          <Route path="cases" element={<CaseListPage />} />
          <Route path="cases/:id" element={<CaseDetailsPage />} />
          <Route path={ROUTES.CREATE_CASE.substring(1)} element={<PermissionGuard permission="case:create"><CaseFormPage /></PermissionGuard>} />
          <Route path={ROUTES.EDIT_CASE.substring(1)} element={<PermissionGuard permission="case:read"><CaseFormPage /></PermissionGuard>} />

          {/* Admin Routes */}
          <Route path="admin/users" element={<PermissionGuard permission="user:list"><UserManagementPage /></PermissionGuard>} />
          <Route path="admin/users/new" element={<PermissionGuard permission="user:create"><UserFormPage /></PermissionGuard>} />
          <Route path="admin/users/:id/edit" element={<PermissionGuard permission="user:read"><UserFormPage /></PermissionGuard>} />
          
          <Route path="admin/roles" element={<PermissionGuard permission="role:list"><RoleListPage /></PermissionGuard>} />
          <Route path="admin/roles/new" element={<PermissionGuard permission="role:create"><RoleFormPage /></PermissionGuard>} />
          <Route path="admin/roles/:id/edit" element={<PermissionGuard permission="role:read"><RoleFormPage /></PermissionGuard>} />
          
          <Route path="admin/organization/units" element={<PermissionGuard permission="org:list"><OrgUnitListPage /></PermissionGuard>} />
          <Route path="admin/organization/units/new" element={<PermissionGuard permission="org:create"><OrgUnitFormPage /></PermissionGuard>} />
          <Route path="admin/organization/units/:id/edit" element={<PermissionGuard permission="org:read"><OrgUnitFormPage /></PermissionGuard>} />
          
          <Route path="admin/locations" element={<PermissionGuard permission="location:list"><LocationListPage /></PermissionGuard>} />
          <Route path="admin/locations/new" element={<PermissionGuard permission="location:create"><LocationFormPage /></PermissionGuard>} />
          <Route path="admin/locations/:id/edit" element={<PermissionGuard permission="location:read"><LocationFormPage /></PermissionGuard>} />

          <Route path="admin/case-types" element={<PermissionGuard permission="casetype:list"><CaseTypeListPage /></PermissionGuard>} />
          <Route path="admin/case-types/new" element={<PermissionGuard permission="casetype:create"><CaseTypeFormPage /></PermissionGuard>} />
          <Route path="admin/case-types/:id/edit" element={<PermissionGuard permission="casetype:read"><CaseTypeFormPage /></PermissionGuard>} />

          <Route path="admin/audit" element={<PermissionGuard permission="audit:view"><AuditLogPage /></PermissionGuard>} />
          
          <Route path="admin/workflow-templates" element={<PermissionGuard permission="workflow:manage"><WorkflowTemplateListPage /></PermissionGuard>} />
          <Route path={ROUTES.ADMIN_WORKFLOW_TEMPLATES_CREATE.substring(1)} element={<PermissionGuard permission="workflow:manage"><WorkflowTemplateFormPage /></PermissionGuard>} />
          <Route path={ROUTES.ADMIN_WORKFLOW_TEMPLATES_EDIT.substring(1)} element={<PermissionGuard permission="workflow:manage"><WorkflowTemplateFormPage /></PermissionGuard>} />

          <Route path={ROUTES.ADMIN_WORKFLOW_INSTANCES.substring(1)} element={<PermissionGuard permission="workflow:instance:list"><WorkflowInstanceListPage /></PermissionGuard>} />
          
          <Route path="organization" element={<OrgChartPage />} />
          <Route path="notifications" element={<NotificationListPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
