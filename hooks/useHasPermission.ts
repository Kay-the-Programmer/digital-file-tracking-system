import { useAuthStore } from '../store/authStore';

export const useHasPermission = (requiredPermission: string): boolean => {
  const permissions = useAuthStore((state) => state.permissions);
  return permissions.includes(requiredPermission);
};