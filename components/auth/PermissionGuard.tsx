
import React from 'react';
import { useHasPermission } from '../../hooks/useHasPermission';

interface PermissionGuardProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({ permission, children, fallback = null }) => {
  const hasPermission = useHasPermission(permission);

  if (hasPermission) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

export default PermissionGuard;
