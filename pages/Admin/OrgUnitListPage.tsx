
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { OrganizationalUnit } from '../../types';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { ROUTES } from '../../constants';
import PermissionGuard from '../../components/auth/PermissionGuard';

const OrgUnitListPage: React.FC = () => {
  const [units, setUnits] = useState<OrganizationalUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<OrganizationalUnit | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.fetchOrganizationalUnits();
      setUnits(data);
    } catch (err) {
      console.error("Failed to fetch org units", err);
      setError("Failed to load organizational units.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openDeleteModal = (unit: OrganizationalUnit) => {
    setItemToDelete(unit);
    setIsModalOpen(true);
  };

  const closeDeleteModal = () => {
    setItemToDelete(null);
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteOrganizationalUnit(itemToDelete.id);
      closeDeleteModal();
      await fetchItems(); // Refresh the list
    } catch (err) {
      setError("Failed to delete unit.");
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
    if (units.length === 0) {
      return <div className="text-center py-10 text-gray-500">No units found.</div>;
    }
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Type</th>
              <th className="p-4 font-semibold">Parent Unit</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {units.map(unit => (
              <tr key={unit.id} className="border-b border-gray-700 hover:bg-gray-800">
                <td className="p-4 font-medium">{unit.name}</td>
                <td className="p-4">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-600 text-blue-100 capitalize">
                    {unit.unit_type.replace(/_/g, ' ').toLowerCase()}
                  </span>
                </td>
                <td className="p-4 text-gray-400">{unit.parent_name || 'N/A (Top-Level)'}</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <PermissionGuard permission="org:update">
                        <Link to={ROUTES.ADMIN_ORG_UNITS_EDIT.replace(':id', unit.id)}>
                            <Button variant="secondary" size="sm">Edit</Button>
                        </Link>
                    </PermissionGuard>
                    <PermissionGuard permission="org:delete">
                        <Button variant="danger" size="sm" onClick={() => openDeleteModal(unit)}>Delete</Button>
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
        <h1 className="text-3xl font-bold">Organizational Unit Management</h1>
        <PermissionGuard permission="org:create">
            <Link to={ROUTES.ADMIN_ORG_UNITS_CREATE}>
                <Button>Create New Unit</Button>
            </Link>
        </PermissionGuard>
      </div>

      <Card>
        {renderContent()}
      </Card>

      {isModalOpen && itemToDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Delete Organizational Unit</h2>
            <p className="text-gray-300 mb-6">Are you sure you want to delete unit <span className="font-bold">{itemToDelete.name}</span>? This action cannot be undone and may affect child units.</p>
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

export default OrgUnitListPage;
