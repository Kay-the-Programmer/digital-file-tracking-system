
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { workflowService } from '../../services/workflows';
import { WorkflowInstance } from '@/types.ts';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { ROUTES } from '../../constants';
import { useHasPermission } from '@/hooks/useHasPermission.ts';

const WorkflowInstanceListPage: React.FC = () => {
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const canViewWorkflowDetails = useHasPermission('workflow:view');

  const fetchInstances = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await workflowService.getAllInstances();
      setInstances(data);
    } catch (err) {
      console.error("Failed to fetch workflow instances", err);
      setError('Failed to load workflow instances.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  // Filter instances based on search term and status filter
  const filteredInstances = useMemo(() => {
    if (!instances) return [];
    let filtered = instances;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(instance => instance.status === filterStatus);
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        instance =>
          instance.id.toLowerCase().includes(lowerCaseSearchTerm) ||
          instance.case_id.toLowerCase().includes(lowerCaseSearchTerm) ||
          instance.workflow_template_name.toLowerCase().includes(lowerCaseSearchTerm) ||
          (instance.current_step?.name && instance.current_step.name.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }
    return filtered;
  }, [instances, filterStatus, searchTerm]);

  // Get unique statuses for filter dropdown
  const uniqueStatuses = useMemo(() => {
    if (!instances) return [];
    const statuses = new Set(instances.map(i => i.status));
    return Array.from(statuses);
  }, [instances]);

  const renderContent = () => {
    if (loading) {
      return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
    }
    if (error) {
      return <div className="text-center py-10 text-red-400 bg-red-900/30 rounded-lg">{error}</div>;
    }
    if (filteredInstances.length === 0) {
      return <div className="text-center py-10 text-gray-500">No workflow instances found matching your criteria.</div>;
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
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInstances.map((instance) => (
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
                <td className="p-4 text-right">
                  {canViewWorkflowDetails && (
                    <Link to={ROUTES.CASE_DETAILS.replace(':id', instance.case_id)}>
                      <Button variant="secondary" size="sm">View Details</Button>
                    </Link>
                  )}
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
        <h1 className="text-3xl font-bold">Workflow Instances</h1>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4 p-4 bg-gray-800 rounded-lg">
          <input
            type="text"
            placeholder="Search instances..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
          />
          {uniqueStatuses.length > 0 && (
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full sm:w-auto bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            >
              <option value="all">All Statuses</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          )}
          <Button onClick={fetchInstances} variant="secondary" size="sm">Refresh</Button>
        </div>
        {renderContent()}
      </Card>
    </div>
  );
};

export default WorkflowInstanceListPage;
