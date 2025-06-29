
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../../services';
import { UserProfile } from '@/types.ts';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { ROUTES } from '../../constants';
import PermissionGuard from '../../components/auth/PermissionGuard';

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
      setError("Failed to load user profiles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openDeleteModal = (user: UserProfile) => {
    setUserToDelete(user);
    setIsModalOpen(true);
  };

  const closeDeleteModal = () => {
    setUserToDelete(null);
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await userService.deleteUser(userToDelete.id);
      closeDeleteModal();
      await fetchUsers(); // Refresh the list
    } catch (err) {
      setError("Failed to delete user.");
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
    }
    if (error) {
      return <div className="text-center py-10 text-red-400 bg-red-900/30 rounded-lg">{error}</div>;
    }
    if (users.length === 0) {
      return <div className="text-center py-10 text-gray-500">No users found.</div>;
    }
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-4 font-semibold">Username</th>
              <th className="p-4 font-semibold">Full Name</th>
              <th className="p-4 font-semibold">Email</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Roles</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-800">
                <td className="p-4 font-medium">{user.username}</td>
                <td className="p-4">{user.first_name} {user.last_name}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.is_active ? 'bg-green-600 text-green-100' : 'bg-red-600 text-red-100'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td className="p-4">{user.roles.map(r => r.name).join(', ')}</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <PermissionGuard permission="user:update">
                      <Link to={ROUTES.ADMIN_USERS_EDIT.replace(':id', user.id)}>
                          <Button variant="secondary" size="sm">Edit</Button>
                      </Link>
                    </PermissionGuard>
                    <PermissionGuard permission="user:delete">
                      <Button variant="danger" size="sm" onClick={() => openDeleteModal(user)}>Delete</Button>
                    </PermissionGuard>
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <PermissionGuard permission="user:create">
            <Link to={ROUTES.ADMIN_USERS_CREATE}>
                <Button>Add New User</Button>
            </Link>
        </PermissionGuard>
      </div>

      <Card>
        {renderContent()}
      </Card>

      {isModalOpen && userToDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Delete User</h2>
            <p className="text-gray-300 mb-6">Are you sure you want to delete user <span className="font-bold">{userToDelete.username}</span>? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <Button variant="secondary" onClick={closeDeleteModal} disabled={isDeleting}>Cancel</Button>
              <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>Delete</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
