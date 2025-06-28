
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { PhysicalLocation } from '../../types';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { ROUTES } from '../../constants';
import PermissionGuard from '../../components/auth/PermissionGuard';

const LocationListPage: React.FC = () => {
  const [locations, setLocations] = useState<PhysicalLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<PhysicalLocation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.fetchLocations();
      setLocations(data);
    } catch (err) {
      console.error("Failed to fetch locations", err);
      setError("Failed to load locations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openDeleteModal = (loc: PhysicalLocation) => {
    setItemToDelete(loc);
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
      await api.deleteLocation(itemToDelete.id);
      closeDeleteModal();
      await fetchItems(); // Refresh the list
    } catch (err) {
      setError("Failed to delete location.");
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
    if (locations.length === 0) {
      return <div className="text-center py-10 text-gray-500">No locations found.</div>;
    }
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-4 font-semibold">Location Name</th>
              <th className="p-4 font-semibold">Organizational Unit</th>
              <th className="p-4 font-semibold">Description</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {locations.map(loc => (
              <tr key={loc.id} className="border-b border-gray-700 hover:bg-gray-800">
                <td className="p-4 font-medium">{loc.name}</td>
                <td className="p-4 text-gray-300">{loc.organizational_unit_name || 'N/A'}</td>
                <td className="p-4 text-gray-400">{loc.description}</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <PermissionGuard permission="location:update">
                        <Link to={ROUTES.ADMIN_LOCATIONS_EDIT.replace(':id', loc.id)}>
                            <Button variant="secondary" size="sm">Edit</Button>
                        </Link>
                    </PermissionGuard>
                    <PermissionGuard permission="location:delete">
                        <Button variant="danger" size="sm" onClick={() => openDeleteModal(loc)}>Delete</Button>
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
        <h1 className="text-3xl font-bold">Physical Location Management</h1>
        <PermissionGuard permission="location:create">
            <Link to={ROUTES.ADMIN_LOCATIONS_CREATE}>
                <Button>Create New Location</Button>
            </Link>
        </PermissionGuard>
      </div>

      <Card>
        {renderContent()}
      </Card>

      {isModalOpen && itemToDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Delete Location</h2>
            <p className="text-gray-300 mb-6">Are you sure you want to delete location <span className="font-bold">{itemToDelete.name}</span>? This action cannot be undone.</p>
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

export default LocationListPage;
