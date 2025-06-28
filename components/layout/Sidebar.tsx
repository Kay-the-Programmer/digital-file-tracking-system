
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ROUTES, ICONS } from '../../constants';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';

const NavItem = ({ to, icon, label, isExpanded }: { to: string; icon: React.FC<any>; label: string; isExpanded: boolean; }) => {
  const Icon = icon;
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex items-center h-12 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200 overflow-hidden ${
          isActive ? 'bg-gray-700 text-white' : ''
        }`
      }
    >
      <div className={`flex items-center w-full ${isExpanded ? 'px-4' : 'justify-center'}`}>
        <Icon className="h-6 w-6 shrink-0" />
        <span
          className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? 'ml-3 max-w-xs opacity-100' : 'max-w-0 opacity-0'
          }`}
        >
          {label}
        </span>
      </div>
    </NavLink>
  );
};

const Sidebar: React.FC = () => {
    const { isSidebarOpen, toggleSidebar } = useUIStore();
    const [isHovered, setIsHovered] = useState(false);
    const { hasPermission } = useAuthStore();
    
    // The sidebar is visually expanded if it's pinned open OR the user is hovering over it
    const isExpanded = isSidebarOpen || isHovered;
    
    const showAdminSection = 
        hasPermission('user:list') || 
        hasPermission('role:list') || 
        hasPermission('workflow:manage') || 
        hasPermission('audit:view') ||
        hasPermission('org:list') ||
        hasPermission('location:list') ||
        hasPermission('casetype:list') ||
        hasPermission('workflow:instance:list');

    return (
      <div 
          className={`bg-gray-800 border-r border-gray-700 flex flex-col relative transition-all duration-300 ease-in-out ${isExpanded ? 'w-64' : 'w-20'}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
      >
          <div className="flex items-center justify-center h-20 border-b border-gray-700 flex-shrink-0 px-4 overflow-hidden">
              <ICONS.BRIEFCASE className="h-8 w-8 text-teal-400 shrink-0" />
              <h1 className={`text-2xl font-bold text-teal-400 overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${isExpanded ? 'ml-2 max-w-full' : 'max-w-0'}`}>
                DFTS
              </h1>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto sidebar-scroll-container">
              <NavItem to={ROUTES.DASHBOARD} icon={ICONS.DASHBOARD} label="Dashboard" isExpanded={isExpanded} />
              <NavItem to={ROUTES.FILES} icon={ICONS.FILES} label="Files" isExpanded={isExpanded} />
              <NavItem to={ROUTES.CASES} icon={ICONS.CASES} label="Cases" isExpanded={isExpanded} />
              <NavItem to={ROUTES.ORGANIZATION} icon={ICONS.ORGANIZATION} label="Organization" isExpanded={isExpanded} />
              
              {showAdminSection && (
                <div className="pt-4 space-y-2">
                  <div className={`h-8 flex items-center transition-all duration-300 ${isExpanded ? 'px-4' : 'justify-center'}`}>
                    <div className={`transition-all duration-300 ${isExpanded ? 'w-full opacity-100' : 'w-0 opacity-0'}`}>
                        <p className="text-xs font-semibold tracking-wider uppercase text-gray-500">Admin</p>
                    </div>
                    {!isExpanded && <div className="w-8 h-px bg-gray-600"></div>}
                  </div>
                  {hasPermission('user:list') && <NavItem to={ROUTES.ADMIN_USERS} icon={ICONS.ADMIN} label="User Management" isExpanded={isExpanded} />}
                  {hasPermission('role:list') && <NavItem to={ROUTES.ADMIN_ROLES} icon={ICONS.SHIELD} label="Role Management" isExpanded={isExpanded} />}
                  {hasPermission('org:list') && <NavItem to={ROUTES.ADMIN_ORG_UNITS} icon={ICONS.ORGANIZATION} label="Org. Management" isExpanded={isExpanded} />}
                  {hasPermission('location:list') && <NavItem to={ROUTES.ADMIN_LOCATIONS} icon={ICONS.LOCATION} label="Location Mgt" isExpanded={isExpanded} />}
                  {hasPermission('casetype:list') && <NavItem to={ROUTES.ADMIN_CASE_TYPES} icon={ICONS.BRIEFCASE} label="Case Type Mgt" isExpanded={isExpanded} />}
                  {hasPermission('workflow:manage') && <NavItem to={ROUTES.ADMIN_WORKFLOW_TEMPLATES} icon={ICONS.WORKFLOW} label="Workflow Templates" isExpanded={isExpanded} />}
                  {hasPermission('workflow:instance:list') && <NavItem to={ROUTES.ADMIN_WORKFLOW_INSTANCES} icon={ICONS.WORKFLOW} label="Workflow Instances" isExpanded={isExpanded} />}
                  {hasPermission('audit:view') && <NavItem to={ROUTES.ADMIN_AUDIT} icon={ICONS.HISTORY} label="Audit Log" isExpanded={isExpanded} />}
                </div>
              )}
          </nav>

          <div className="px-2 py-4 mt-auto border-t border-gray-700">
              <button
                  onClick={toggleSidebar}
                  className="w-full flex items-center h-12 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200 overflow-hidden"
                  aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              >
                  <div className={`flex items-center w-full ${isExpanded ? 'px-4' : 'justify-center'}`}>
                      <div className="shrink-0">
                        {isSidebarOpen 
                            ? <ICONS.CHEVRON_DOUBLE_LEFT className="w-6 h-6"/>
                            : <ICONS.CHEVRON_DOUBLE_RIGHT className="w-6 h-6"/>
                        }
                      </div>
                      <span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'ml-3 max-w-xs opacity-100' : 'max-w-0 opacity-0'}`}>
                          {isSidebarOpen ? 'Collapse' : 'Expand'}
                      </span>
                  </div>
              </button>
          </div>
      </div>
    );
};

export default Sidebar;
