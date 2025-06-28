
import React from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { WorkflowInstance } from '../../types';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { ROUTES } from '../../constants';

const WorkflowInstanceListPage: React.FC = () => {
  const [instances, setInstances] = React.useState<WorkflowInstance[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchInstances = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.fetchWorkflowInstances();
        setInstances(data);
      } catch (err) {
        setError('Failed to load workflow instances.');
      } finally {
        setLoading(false);
      }
    };
    fetchInstances();
  }, []);

  const getStatusColor = (status: WorkflowInstance['status']) => {
    switch (status) {
      case 'Active': return 'bg-blue-600 text-blue-100';
      case 'Completed': return 'bg-green-600 text-green-100';
      case 'Rejected': return 'bg-red-600 text-red-100';
      case 'Aborted': return 'bg-gray-600 text-gray-100';
      default: return 'bg-gray-500';
    }
  };

  const renderContent = () => {
    if (loading) {
      return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
    }
    if (error) {
      return <div className="text-center py-10 text-red-400 bg-red-900/30 rounded-lg">{error}</div>;
    }
    if (instances.length === 0) {
      return <div className="text-center py-10 text-gray-500">No workflow instances found.</div>;
    }
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-4 font-semibold">Instance ID</th>
              <th className="p-4 font-semibold">Case ID</th>
              <th className="p-4 font-semibold">Template</th>
              <th className="p-4 font-semibold">Current Step</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {instances.map((instance) => (
              <tr key={instance.id} className="border-b border-gray-700 hover:bg-gray-800">
                <td className="p-4 font-mono text-sm">{instance.id}</td>
                <td className="p-4">
                  <Link to={ROUTES.CASE_DETAILS.replace(':id', instance.case_id)} className="text-teal-400 hover:underline font-medium">
                    {instance.case_id}
                  </Link>
                </td>
                <td className="p-4">{instance.workflow_template_name}</td>
                <td className="p-4">{instance.current_step?.name || 'N/A'}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(instance.status)}`}>
                    {instance.status}
                  </span>
                </td>
                <td className="p-4 text-gray-400">{new Date(instance.updated_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Workflow Instances</h1>
      <Card>
        {renderContent()}
      </Card>
    </div>
  );
};

export default WorkflowInstanceListPage;
