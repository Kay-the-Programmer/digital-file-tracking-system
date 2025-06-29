import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { organizationService } from '../../services/organization';
import { PhysicalLocation } from '@/types.ts';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { ROUTES } from '../../constants';
import { useHasPermission } from '@/hooks/useHasPermission.ts';

const LocationListPage: React.FC = () => {
  const [locations, setLocations] = useState<PhysicalLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<PhysicalLocation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrgUnit, setFilterOrgUnit] = useState('all');

  const canUpdateLocation = useHasPermission('location:update');
  const canCreateLocation = useHasPermission('location:create');
  const canDeleteLocation = useHasPermission('location:delete');

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await organizationService.getAllLocations();
      setLocations(data);
    } catch (err) {
      console.error("Failed to fetch locations", err);
      setError("Failed to load locations.");
    } finally {
      setLoading(false);
    }
  };

  const uniqueOrgUnits = useMemo(() => {
    if (!locations) return [];
    const units = new Set(locations
      .filter(loc => loc.organizational_unit_name)
      .map(loc => ({ id: loc.organizational_unit_id, name: loc.organizational_unit_name }))
      .map(unit => JSON.stringify(unit)));
    return Array.from(units).map(unit => JSON.parse(unit));
  }, [locations]);

  const filteredLocations = useMemo(() => {
    if (!locations) return [];
    let filtered = locations;

    if (filterOrgUnit !== 'all') {
      filtered = filtered.filter(loc => loc.organizational_unit_id === filterOrgUnit);
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        loc =>
          loc.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          (loc.description && loc.description.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (loc.organizational_unit_name && loc.organizational_unit_name.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }
    return filtered;
  }, [locations, filterOrgUnit, searchTerm]);

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
    setDeleteError(null);
    try {
      await organizationService.deleteLocation(itemToDelete.id);
      closeDeleteModal();
      await fetchItems(); // Refresh the list
    } catch (err) {
      console.error("Failed to delete location", err);
      setDeleteError(`Failed to delete location: ${err instanceof Error ? err.message : 'Unknown error occurred'}`);
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
    if (filteredLocations.length === 0) {
      return <div className="text-center py-10 text-gray-500">No locations found matching your criteria.</div>;
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
            {filteredLocations.map(loc => (
              <tr key={loc.id} className="border-b border-gray-700 hover:bg-gray-800">
                <td className="p-4 font-medium">{loc.name}</td>
                <td className="p-4 text-gray-300">{loc.organizational_unit_name || 'N/A'}</td>
                <td className="p-4 text-gray-400">{loc.description}</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    {canUpdateLocation && (
                      <Link to={ROUTES.ADMIN_LOCATIONS_EDIT.replace(':id', loc.id)}>
                        <Button variant="secondary" size="sm">Edit</Button>
                      </Link>
                    )}
                    {canDeleteLocation && (
                      <Button variant="danger" size="sm" onClick={() => openDeleteModal(loc)}>Delete</Button>
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
        <h1 className="text-3xl font-bold">Physical Location Management</h1>
        {canCreateLocation && (
          <Link to={ROUTES.ADMIN_LOCATIONS_CREATE}>
            <Button>Create New Location</Button>
          </Link>
        )}
      </div>

      <Card>
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4 p-4 bg-gray-800 rounded-lg">
          <input
            type="text"
            placeholder="Search locations..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
          />
          {uniqueOrgUnits.length > 0 && (
            <select
              value={filterOrgUnit}
              onChange={e => setFilterOrgUnit(e.target.value)}
              className="w-full sm:w-auto bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            >
              <option value="all">All Organizational Units</option>
              {uniqueOrgUnits.map(unit => (
                <option key={unit.id} value={unit.id}>{unit.name}</option>
              ))}
            </select>
          )}
        </div>
        {renderContent()}
      </Card>

      {isModalOpen && itemToDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Delete Location</h2>
            {deleteError ? (
              <div className="bg-red-900/30 text-red-400 p-3 rounded-md mb-4">
                {deleteError}
              </div>
            ) : (
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete location <span className="font-bold">{itemToDelete.name}</span>? 
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

export default LocationListPage;
