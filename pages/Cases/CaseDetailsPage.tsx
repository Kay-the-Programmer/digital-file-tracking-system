
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Case as CaseType, WorkflowInstance, File, CaseStatus, WorkflowTemplate, WorkflowStepDefinition } from '../../types';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { ROUTES, ICONS } from '../../constants';
import WorkflowViewer from '../../components/Cases/WorkflowViewer';
import PermissionGuard from '../../components/auth/PermissionGuard';

const DetailItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="font-semibold text-gray-100">{value}</p>
    </div>
);

const ActionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (comments: string) => void;
  action: string | null;
  isLoading: boolean;
}> = ({ isOpen, onClose, onConfirm, action, isLoading }) => {
  const [comments, setComments] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Confirm Action: {action}</h2>
        <p className="text-gray-400 mb-4">Are you sure you want to perform this action?</p>
        <div>
          <label htmlFor="comments" className="block text-sm font-medium text-gray-300 mb-1">
            Comments (optional)
          </label>
          <textarea
            id="comments"
            rows={3}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button onClick={() => onConfirm(comments)} isLoading={isLoading}>Confirm</Button>
        </div>
      </Card>
    </div>
  );
};


const CaseDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseItem, setCaseItem] = useState<CaseType | null>(null);
  const [workflowInstance, setWorkflowInstance] = useState<WorkflowInstance | null>(null);
  const [workflowTemplate, setWorkflowTemplate] = useState<WorkflowTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [actionToPerform, setActionToPerform] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    if (id) {
      try {
        setLoading(true);
        setError(null);
        const caseData = await api.fetchCaseById(id);

        if (caseData) {
            setCaseItem(caseData);
            const instanceData = await api.fetchWorkflowInstanceById(id);
            if (instanceData) {
                setWorkflowInstance(instanceData);
                const templates = await api.fetchWorkflowTemplates();
                const matchingTemplate = templates.find(t => t.name === instanceData.workflow_template_name);
                if(matchingTemplate) {
                  setWorkflowTemplate(matchingTemplate);
                }
            }
        } else {
            setError("Case not found.");
        }
      } catch (err) {
        console.error("Failed to fetch case details", err);
        setError("Failed to load case details.");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleActionClick = (action: string) => {
    setActionToPerform(action);
    setIsActionModalOpen(true);
  };
  
  const handleConfirmAction = async (comments: string) => {
    if (id && actionToPerform) {
      setActionLoading(true);
      try {
        await api.performWorkflowAction({ case_id: id, action: actionToPerform, comments });
        await fetchData(); // Refetch data
      } catch(err) {
        setError((err as Error).message || "Failed to perform action.");
      } finally {
        setActionLoading(false);
        setIsActionModalOpen(false);
        setActionToPerform(null);
      }
    }
  };

  const handleDelete = async () => {
    if (!caseItem) return;
    setActionLoading(true);
    try {
        await api.deleteCase(caseItem.id);
        setIsDeleteModalOpen(false);
        navigate(ROUTES.CASES);
    } catch(err) {
        setError("Failed to delete case.");
    } finally {
        setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>;
  }

  if (error || !caseItem) {
    return <div className="text-center text-xl text-red-400">{error || 'Case not found.'}</div>;
  }
  
  const getStatusColor = (status: CaseType['status']) => {
    switch(status) {
        case CaseStatus.OPEN: return 'bg-blue-600/50 text-blue-200 border border-blue-500';
        case CaseStatus.IN_PROGRESS: return 'bg-indigo-600/50 text-indigo-200 border border-indigo-500';
        case CaseStatus.PENDING_APPROVAL: return 'bg-yellow-600/50 text-yellow-200 border border-yellow-500';
        case CaseStatus.APPROVED: return 'bg-green-600/50 text-green-200 border border-green-500';
        case CaseStatus.REJECTED: return 'bg-red-600/50 text-red-200 border border-red-500';
        case CaseStatus.CLOSED: return 'bg-gray-600/50 text-gray-200 border border-gray-500';
        default: return 'bg-gray-500';
    }
  }

  return (
    <div>
        <ActionModal 
            isOpen={isActionModalOpen}
            onClose={() => setIsActionModalOpen(false)}
            onConfirm={handleConfirmAction}
            action={actionToPerform}
            isLoading={actionLoading}
        />
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
            <h1 className="text-3xl font-bold truncate">Case: {caseItem.title}</h1>
            <div className="flex items-center space-x-2 flex-shrink-0">
                <PermissionGuard permission="case:update">
                    <Link to={ROUTES.EDIT_CASE.replace(':id', caseItem.id)}>
                        <Button variant="secondary">Edit Case</Button>
                    </Link>
                </PermissionGuard>
                <PermissionGuard permission="case:delete">
                    <Button variant="danger" onClick={() => setIsDeleteModalOpen(true)}>Delete Case</Button>
                </PermissionGuard>
            </div>
        </div>

        <div className="space-y-6">
            <Card>
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-semibold text-white">{caseItem.title}</h2>
                     <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(caseItem.status)}`}>
                        {caseItem.status}
                    </span>
                </div>
                <p className="text-gray-400 mb-6">{caseItem.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-gray-700 pt-6">
                    <DetailItem label="Case ID" value={caseItem.id} />
                    <DetailItem label="Case Type" value={caseItem.case_type} />
                    <DetailItem label="Initiated By" value={caseItem.initiated_by_username} />
                    <DetailItem label="Created At" value={new Date(caseItem.created_at).toLocaleString()} />
                    <DetailItem label="Last Updated" value={new Date(caseItem.updated_at).toLocaleString()} />
                </div>
            </Card>

            {workflowInstance && workflowTemplate && (
                <WorkflowViewer workflowStatus={workflowInstance} workflowTemplate={workflowTemplate.definition_json} />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {caseItem.associated_files_details && caseItem.associated_files_details.length > 0 && (
                        <Card>
                            <h2 className="text-xl font-semibold mb-4">Associated Files</h2>
                            <ul className="space-y-2">
                                {caseItem.associated_files_details.map(file => (
                                    <li key={file.id} className="flex items-center">
                                        <ICONS.FILES className="h-5 w-5 mr-3 text-blue-400" />
                                        <Link to={`/files/${file.id}`} className="text-teal-400 hover:underline">{file.title}</Link>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    {workflowInstance?.status === 'Active' && workflowInstance.current_step?.actions && workflowInstance.current_step.actions.length > 0 && (
                        <Card>
                            <h2 className="text-xl font-semibold mb-4">Workflow Actions</h2>
                            <div className="space-y-3">
                                {workflowInstance.current_step.actions.map(action => (
                                    <Button key={action} className="w-full" onClick={() => handleActionClick(action)}
                                    variant={action.toLowerCase().includes('reject') ? 'danger' : 'primary'}>
                                        {action}
                                    </Button>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>

        {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Delete Case</h2>
            <p className="text-gray-300 mb-6">Are you sure you want to delete case <span className="font-bold">{caseItem.title}</span>? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)} disabled={actionLoading}>Cancel</Button>
              <Button variant="danger" onClick={handleDelete} isLoading={actionLoading}>Delete</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CaseDetailsPage;
