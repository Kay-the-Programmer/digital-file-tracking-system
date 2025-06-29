
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService } from '../../services/users';
import { RoleCreationPayload, RoleUpdatePayload } from '../../types';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { ROUTES } from '../../constants';

const ALL_PERMISSIONS = [
  'user:list', 'user:create', 'user:read', 'user:update', 'user:delete',
  'role:list', 'role:create', 'role:read', 'role:update', 'role:delete',
  'org:list', 'org:create', 'org:read', 'org:update', 'org:delete',
  'location:list', 'location:create', 'location:read', 'location:update', 'location:delete',
  'workflow:manage', 'audit:view',
  'case:create', 'case:read', 'case:update', 'case:delete', 'case:approve', 'case:reject',
  'file:list', 'file:create', 'file:read', 'file:update', 'file:delete', 'file:download', 'file:move',
];

const RoleFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode && id) {
      const fetchRole = async () => {
        setLoading(true);
        try {
          const roleData = await userService.getRoleById(id);
          if (roleData) {
            setFormData(roleData);
          } else {
            setError('Role not found.');
          }
        } catch (err) {
          setError('Failed to load role data.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchRole();
    }
  }, [id, isEditMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePermissionChange = (permission: string) => {
    setFormData(prev => {
      const newPermissions = prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission];
      return { ...prev, permissions: newPermissions };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
        name: formData.name,
        description: formData.description,
        permissions: formData.permissions
    };

    try {
      if (isEditMode && id) {
        await userService.updateRole(id, payload);
      } else {
        await userService.createRole(payload);
      }
      navigate(ROUTES.ADMIN_ROLES);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{isEditMode ? 'Edit Role' : 'Create New Role'}</h1>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
            <InputField label="Role Name" name="name" value={formData.name} onChange={handleInputChange} required />
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={3}
                 className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Permissions</label>
              <div className="p-4 bg-gray-700/50 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                  {ALL_PERMISSIONS.map(permission => (
                      <label key={permission} className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" checked={formData.permissions.includes(permission)} onChange={() => handlePermissionChange(permission)} className="h-4 w-4 rounded bg-gray-600 border-gray-500 text-teal-600 focus:ring-teal-500"/>
                          <span className="font-mono text-sm">{permission}</span>
                      </label>
                  ))}
              </div>
          </div>

          {error && <p className="text-sm text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
            <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.ADMIN_ROLES)}>Cancel</Button>
            <Button type="submit" isLoading={loading}>{isEditMode ? 'Save Changes' : 'Create Role'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

const InputField = (props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
    <div>
        <label htmlFor={props.name} className="block text-sm font-medium text-gray-300 mb-1">{props.label}</label>
        <input
            id={props.name}
            {...props}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition disabled:opacity-50"
        />
    </div>
);


export default RoleFormPage;
