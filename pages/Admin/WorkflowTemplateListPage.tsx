
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { WorkflowTemplate } from '../../types';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { ROUTES } from '../../constants';

const WorkflowTemplateListPage: React.FC = () => {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.fetchWorkflowTemplates();
        setTemplates(data);
      } catch (err) {
        console.error("Failed to fetch workflow templates", err);
        setError("Could not load templates. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const renderContent = () => {
    if (loading) {
      return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
    }
    if (error) {
      return <div className="text-center py-10 text-red-400 bg-red-900/30 rounded-lg">{error}</div>;
    }
    if (templates.length === 0) {
      return <div className="text-center py-10 text-gray-500">No workflow templates found.</div>;
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
              <th className="p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {templates.map(template => (
              <tr key={template.id} className="border-b border-gray-700 hover:bg-gray-800">
                <td className="p-4 font-medium text-teal-400">{template.name}</td>
                <td className="p-4">{template.case_type}</td>
                <td className="p-4 text-gray-400">{template.description}</td>
                <td className="p-4 text-gray-400">{new Date(template.updated_at).toLocaleDateString()}</td>
                <td className="p-4">
                  <Link to={`/admin/workflow-templates/${template.id}/edit`}>
                    <Button variant="secondary" size="sm">Edit</Button>
                  </Link>
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
        <h1 className="text-3xl font-bold">Workflow Templates</h1>
        <Link to={ROUTES.ADMIN_WORKFLOW_TEMPLATES_CREATE}>
          <Button>Create New Template</Button>
        </Link>
      </div>

      <Card>
        {renderContent()}
      </Card>
    </div>
  );
};

export default WorkflowTemplateListPage;
