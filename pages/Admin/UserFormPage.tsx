
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService } from '../../services/users';
import { organizationService } from '../../services/organization';
import { Role, UserCreationPayload, UserUpdatePayload, OrganizationalUnit } from '../../types';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { ROUTES } from '../../constants';

const UserFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    department_id: '',
    is_active: true,
    role_ids: [] as string[],
  });

  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<OrganizationalUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [rolesData, departmentsData] = await Promise.all([
          userService.getAllRoles(),
          organizationService.getAllUnits()
        ]);

        setAllRoles(rolesData);
        setDepartments(departmentsData);

        if (isEditMode && id) {
          const userData = await userService.getUserById(id);
          if (userData) {
            setFormData({
              username: userData.username,
              password: '',
              first_name: userData.first_name,
              last_name: userData.last_name,
              email: userData.email,
              phone_number: userData.phone_number || '',
              department_id: userData.department_id || '',
              is_active: userData.is_active,
              role_ids: userData.roles.map(role => role.id),
            });
          } else {
            setError('User not found.');
          }
        }
      } catch (err) {
        setError('Failed to load initial data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [id, isEditMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleRoleChange = (roleId: string) => {
    setFormData(prev => {
      const newRoleIds = prev.role_ids.includes(roleId)
        ? prev.role_ids.filter(id => id !== roleId)
        : [...prev.role_ids, roleId];
      return { ...prev, role_ids: newRoleIds };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditMode && id) {
        const payload: UserUpdatePayload = {
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            phone_number: formData.phone_number,
            department_id: formData.department_id || undefined,
            is_active: formData.is_active,
            role_ids: formData.role_ids,
        };
        await userService.updateUser(id, payload);
      } else {
        const payload: UserCreationPayload = {
            username: formData.username,
            password: formData.password,
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            phone_number: formData.phone_number || undefined,
            department_id: formData.department_id || undefined,
            role_ids: formData.role_ids,
        };
        await userService.createUser(payload);
      }
      navigate(ROUTES.ADMIN_USERS);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.username) {
    return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{isEditMode ? 'Edit User' : 'Create New User'}</h1>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Username" name="username" value={formData.username} onChange={handleInputChange} required readOnly={isEditMode} />
            {!isEditMode && <InputField label="Password" name="password" type="password" value={formData.password} onChange={handleInputChange} required />}
            <InputField label="First Name" name="first_name" value={formData.first_name} onChange={handleInputChange} required />
            <InputField label="Last Name" name="last_name" value={formData.last_name} onChange={handleInputChange} required />
            <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
            <InputField label="Phone Number" name="phone_number" value={formData.phone_number} onChange={handleInputChange} />

            <div>
              <label htmlFor="department_id" className="block text-sm font-medium text-gray-300 mb-1">Department</label>
              <select
                id="department_id"
                name="department_id"
                value={formData.department_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
              >
                <option value="">Select a department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Roles</label>
              <div className="p-4 bg-gray-700/50 rounded-lg grid grid-cols-2 md:grid-cols-3 gap-4">
                  {allRoles.map(role => (
                      <label key={role.id} className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" checked={formData.role_ids.includes(role.id)} onChange={() => handleRoleChange(role.id)} className="h-4 w-4 rounded bg-gray-600 border-gray-500 text-teal-600 focus:ring-teal-500"/>
                          <span>{role.name}</span>
                      </label>
                  ))}
              </div>
          </div>

          {isEditMode && (
            <div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleCheckboxChange} className="h-4 w-4 rounded bg-gray-600 border-gray-500 text-teal-600 focus:ring-teal-500"/>
                <span>Account is Active</span>
              </label>
            </div>
          )}

          {error && <p className="text-sm text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
            <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.ADMIN_USERS)}>Cancel</Button>
            <Button type="submit" isLoading={loading}>{isEditMode ? 'Save Changes' : 'Create User'}</Button>
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


export default UserFormPage;
