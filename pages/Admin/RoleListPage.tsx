
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../../services/users';
import { Role } from '@/types.ts';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { ROUTES } from '../../constants';
import { useHasPermission } from '@/hooks/useHasPermission.ts';

const RoleListPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Role | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const canUpdateRole = useHasPermission('role:update');
  const canCreateRole = useHasPermission('role:create');
  const canDeleteRole = useHasPermission('role:delete');

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getAllRoles();
      setRoles(data);
    } catch (err) {
      console.error("Failed to fetch roles", err);
      setError("Failed to load roles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openDeleteModal = (role: Role) => {
    setItemToDelete(role);
    setIsModalOpen(true);
  };

  const closeDeleteModal = () => {
    setItemToDelete(null);
    setIsModalOpen(false);
    setDeleteError(null);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await userService.deleteRole(itemToDelete.id);
      closeDeleteModal();
      await fetchItems(); // Refresh the list
    } catch (err) {
      console.error("Failed to delete role", err);
      setDeleteError(`Failed to delete role: ${err instanceof Error ? err.message : 'Unknown error occurred'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredRoles = useMemo(() => {
    if (!roles) return [];

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      return roles.filter(
        role =>
          role.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          (role.description && role.description.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }
    return roles;
  }, [roles, searchTerm]);

  const renderContent = () => {
    if (loading) {
      return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
    }
    if (error) {
      return <div className="text-center py-10 text-red-400 bg-red-900/30 rounded-lg">{error}</div>;
    }
    if (filteredRoles.length === 0) {
      return <div className="text-center py-10 text-gray-500">No roles found matching your criteria.</div>;
    }
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-4 font-semibold">Role Name</th>
              <th className="p-4 font-semibold">Description</th>
              <th className="p-4 font-semibold">Permissions</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRoles.map(role => (
              <tr key={role.id} className="border-b border-gray-700 hover:bg-gray-800">
                <td className="p-4 font-medium">{role.name}</td>
                <td className="p-4 text-gray-400">{role.description}</td>
                <td className="p-4">
                    <span className="text-gray-300">{role.permissions.length} assigned</span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    {canUpdateRole && (
                      <Link to={ROUTES.ADMIN_ROLES_EDIT.replace(':id', role.id)}>
                        <Button variant="secondary" size="sm">Edit</Button>
                      </Link>
                    )}
                    {canDeleteRole && (
                      <Button variant="danger" size="sm" onClick={() => openDeleteModal(role)}>Delete</Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Role Management</h1>
        {canCreateRole && (
          <Link to={ROUTES.ADMIN_ROLES_CREATE}>
            <Button>Create New Role</Button>
          </Link>
        )}
      </div>

      <Card>
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4 p-4 bg-gray-800 rounded-lg">
          <input
            type="text"
            placeholder="Search roles..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
          />
        </div>
        {renderContent()}
      </Card>

      {isModalOpen && itemToDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Delete Role</h2>
            {deleteError ? (
              <div className="bg-red-900/30 text-red-400 p-3 rounded-md mb-4">
                {deleteError}
              </div>
            ) : (
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete role <span className="font-bold">{itemToDelete.name}</span>? 
                This action cannot be undone.
              </p>
            )}
            <div className="flex justify-end space-x-4">
              <Button variant="secondary" onClick={closeDeleteModal} disabled={isDeleting}>Cancel</Button>
              <Button 
                variant="danger" 
                onClick={handleDelete} 
                isLoading={isDeleting}
                disabled={isDeleting}
              >
                {deleteError ? 'Retry' : 'Delete'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RoleListPage;
