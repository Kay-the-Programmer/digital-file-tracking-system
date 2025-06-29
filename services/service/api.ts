// This file is now deprecated and will be removed in a future version.
// Please use the new modular services from the services directory instead.

// Re-export all services from the new modular services
import { 
    authService, 
    fileService, 
    caseService, 
    workflowService, 
    notificationService, 
    userService, 
    organizationService, 
    dashboardService, 
    auditService 
} from '../';

// For backward compatibility
export { 
    authService, 
    fileService, 
    caseService, 
    workflowService, 
    notificationService, 
    userService, 
    organizationService, 
    dashboardService, 
    auditService 
};

// Legacy services that don't have direct equivalents in the new structure
export const accountsService = {
    changePassword: userService.changePassword,
};

export const roleService = {
    getAll: userService.getAllRoles,
};
