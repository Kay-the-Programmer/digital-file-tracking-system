
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { caseService } from '../../services/cases';
import { CaseType } from '@/types.ts';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { ROUTES } from '../../constants';
import { useHasPermission } from '@/hooks/useHasPermission.ts';

const CaseTypeListPage: React.FC = () => {
  const [caseTypes, setCaseTypes] = useState<CaseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<CaseType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canCreateCaseType = useHasPermission('casetype:create');
  const canUpdateCaseType = useHasPermission('casetype:update');
  const canDeleteCaseType = useHasPermission('casetype:delete');

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await caseService.getAllTypes();
      setCaseTypes(data);
    } catch (err) {
      console.error("Failed to fetch case types", err);
      setError("Failed to load case types.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openDeleteModal = (loc: CaseType) => {
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
      await caseService.deleteType(itemToDelete.id);
      closeDeleteModal();
      await fetchItems(); // Refresh the list
    } catch (err) {
      setError("Failed to delete case type.");
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
    if (caseTypes.length === 0) {
      return <div className="text-center py-10 text-gray-500">No case types found.</div>;
    }
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Description</th>
              <th className="p-4 font-semibold"># Attributes</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {caseTypes.map(ct => (
              <tr key={ct.id} className="border-b border-gray-700 hover:bg-gray-800">
                <td className="p-4 font-medium">{ct.name}</td>
                <td className="p-4 text-gray-400">{ct.description}</td>
                <td className="p-4 text-gray-300">{ct.attribute_definitions.length}</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    {canUpdateCaseType && (
                        <Link to={ROUTES.ADMIN_CASE_TYPES_EDIT.replace(':id', ct.id)}>
                            <Button variant="secondary" size="sm">Edit</Button>
                        </Link>
                    )}
                    {canDeleteCaseType && (
                        <Button variant="danger" size="sm" onClick={() => openDeleteModal(ct)}>Delete</Button>
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Case Type Management</h1>
        {canCreateCaseType && (
            <Link to={ROUTES.ADMIN_CASE_TYPES_CREATE}>
                <Button>Create New Case Type</Button>
            </Link>
        )}
      </div>

      <Card>
        {renderContent()}
      </Card>

      {isModalOpen && itemToDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Delete Case Type</h2>
            <p className="text-gray-300 mb-6">Are you sure you want to delete case type <span className="font-bold">{itemToDelete.name}</span>? This action cannot be undone.</p>
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

export default CaseTypeListPage;
