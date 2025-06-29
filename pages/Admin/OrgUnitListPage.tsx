
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { organizationService } from '../../services/organization';
import { OrganizationalUnit } from '@/types.ts';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { ROUTES } from '../../constants';
import { useHasPermission } from '@/hooks/useHasPermission.ts';

const OrgUnitListPage: React.FC = () => {
  const [units, setUnits] = useState<OrganizationalUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<OrganizationalUnit | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUnitType, setFilterUnitType] = useState('all');

  const canUpdateUnit = useHasPermission('org:update');
  const canCreateUnit = useHasPermission('org:create');
  const canDeleteUnit = useHasPermission('org:delete');

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await organizationService.getAllUnits();
      setUnits(data);
    } catch (err) {
      console.error("Failed to fetch org units", err);
      setError("Failed to load organizational units.");
    } finally {
      setLoading(false);
    }
  };

  const uniqueUnitTypes = useMemo(() => {
    if (!units) return [];
    const types = new Set(units.map(unit => unit.unit_type));
    return Array.from(types);
  }, [units]);

  const filteredUnits = useMemo(() => {
    if (!units) return [];
    let filtered = units;

    if (filterUnitType !== 'all') {
      filtered = filtered.filter(unit => unit.unit_type === filterUnitType);
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        unit =>
          unit.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          (unit.description && unit.description.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }
    return filtered;
  }, [units, filterUnitType, searchTerm]);

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
    setDeleteError(null);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await organizationService.deleteUnit(itemToDelete.id);
      closeDeleteModal();
      await fetchItems(); // Refresh the list
    } catch (err) {
      console.error("Failed to delete unit", err);
      setDeleteError(`Failed to delete unit: ${err instanceof Error ? err.message : 'Unknown error occurred'}`);
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
    if (filteredUnits.length === 0) {
      return <div className="text-center py-10 text-gray-500">No units found matching your criteria.</div>;
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
            {filteredUnits.map(unit => (
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
                    {canUpdateUnit && (
                      <Link to={ROUTES.ADMIN_ORG_UNITS_EDIT.replace(':id', unit.id)}>
                        <Button variant="secondary" size="sm">Edit</Button>
                      </Link>
                    )}
                    {canDeleteUnit && (
                      <Button variant="danger" size="sm" onClick={() => openDeleteModal(unit)}>Delete</Button>
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
        <h1 className="text-3xl font-bold">Organizational Unit Management</h1>
        {canCreateUnit && (
          <Link to={ROUTES.ADMIN_ORG_UNITS_CREATE}>
            <Button>Create New Unit</Button>
          </Link>
        )}
      </div>

      <Card>
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4 p-4 bg-gray-800 rounded-lg">
          <input
            type="text"
            placeholder="Search units..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
          />
          {uniqueUnitTypes.length > 0 && (
            <select
              value={filterUnitType}
              onChange={e => setFilterUnitType(e.target.value)}
              className="w-full sm:w-auto bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            >
              <option value="all">All Unit Types</option>
              {uniqueUnitTypes.map(type => (
                <option key={type} value={type}>{type.replace(/_/g, ' ').toLowerCase()}</option>
              ))}
            </select>
          )}
        </div>
        {renderContent()}
      </Card>

      {isModalOpen && itemToDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Delete Organizational Unit</h2>
            {deleteError ? (
              <div className="bg-red-900/30 text-red-400 p-3 rounded-md mb-4">
                {deleteError}
              </div>
            ) : (
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete unit <span className="font-bold">{itemToDelete.name}</span>? 
                This action cannot be undone and may affect child units.
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

export default OrgUnitListPage;
