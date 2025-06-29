
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { workflowService } from '../../services/workflows';
import { WorkflowTemplate } from '@/types.ts';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { ROUTES } from '../../constants';
import {useHasPermission} from '@/hooks/useHasPermission.ts';

const WorkflowTemplateListPage: React.FC = () => {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<WorkflowTemplate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCaseType, setFilterCaseType] = useState('all');

  const canUpdateTemplate = useHasPermission('workflow:update');
  const canCreateTemplate = useHasPermission('workflow:create');
  const canDeleteTemplate = useHasPermission('workflow:delete');

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await workflowService.getAllTemplates();
      setTemplates(data);
    } catch (err) {
      console.error("Failed to fetch workflow templates", err);
      setError("Could not load templates. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const openDeleteModal = (template: WorkflowTemplate) => {
    setTemplateToDelete(template);
    setIsModalOpen(true);
  };

  const closeDeleteModal = () => {
    setTemplateToDelete(null);
    setIsModalOpen(false);
    setDeleteError(null);
  };

  const handleDelete = async () => {
    if (!templateToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await workflowService.deleteTemplate(templateToDelete.id);
      closeDeleteModal();
      await fetchTemplates(); // Refresh list
    } catch (err) {
      console.error("Failed to delete template", err);
      setDeleteError(`Failed to delete template: ${err instanceof Error ? err.message : 'Unknown error occurred'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const uniqueCaseTypes = useMemo(() => {
    if (!templates) return [];
    const types = new Set(templates.map(t => t.case_type));
    return Array.from(types);
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    if (!templates) return [];
    let filtered = templates;

    if (filterCaseType !== 'all') {
      filtered = filtered.filter(template => template.case_type === filterCaseType);
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        template =>
          template.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          (template.description && template.description.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }
    return filtered;
  }, [templates, filterCaseType, searchTerm]);

  const renderContent = () => {
    if (loading) {
      return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
    }
    if (error) {
      return <div className="text-center py-10 text-red-400 bg-red-900/30 rounded-lg">{error}</div>;
    }
    if (filteredTemplates.length === 0) {
      return <div className="text-center py-10 text-gray-500">No workflow templates found matching your criteria.</div>;
    }
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-4 font-semibold">Template Name</th>
              <th className="p-4 font-semibold">Case Type</th>
              <th className="p-4 font-semibold">Description</th>
              <th className="p-4 font-semibold">Last Updated</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTemplates.map(template => (
              <tr key={template.id} className="border-b border-gray-700 hover:bg-gray-800">
                <td className="p-4 font-medium text-teal-400">{template.name}</td>
                <td className="p-4">{template.case_type}</td>
                <td className="p-4 text-gray-400">{template.description}</td>
                <td className="p-4 text-gray-400">{new Date(template.updated_at).toLocaleDateString()}</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    {canUpdateTemplate && (
                      <Link to={ROUTES.ADMIN_WORKFLOW_TEMPLATES_EDIT.replace(':id', template.id)}>
                        <Button variant="secondary" size="sm">Edit</Button>
                      </Link>
                    )}
                    {canDeleteTemplate && (
                      <Button variant="danger" size="sm" onClick={() => openDeleteModal(template)}>Delete</Button>
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
        <h1 className="text-3xl font-bold">Workflow Templates</h1>
        {canCreateTemplate && (
          <Link to={ROUTES.ADMIN_WORKFLOW_TEMPLATES_CREATE}>
            <Button>Create New Template</Button>
          </Link>
        )}
      </div>

      <Card>
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4 p-4 bg-gray-800 rounded-lg">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
          />
          {uniqueCaseTypes.length > 0 && (
            <select
              value={filterCaseType}
              onChange={e => setFilterCaseType(e.target.value)}
              className="w-full sm:w-auto bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            >
              <option value="all">All Case Types</option>
              {uniqueCaseTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          )}
        </div>
        {renderContent()}
      </Card>

      {isModalOpen && templateToDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Delete Template</h2>
            {deleteError ? (
              <div className="bg-red-900/30 text-red-400 p-3 rounded-md mb-4">
                {deleteError}
              </div>
            ) : (
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete template <span className="font-bold">{templateToDelete.name}</span>? 
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

export default WorkflowTemplateListPage;
