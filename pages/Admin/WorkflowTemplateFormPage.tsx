
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { WorkflowTemplatePayload, WorkflowStepDefinition } from '../../types';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { ROUTES, ICONS } from '../../constants';

const initialStep: Omit<WorkflowStepDefinition, 'id'> = {
  name: '',
  responsible_role: '',
  responsible_department: '',
  actions: [],
};

const WorkflowTemplateFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [caseType, setCaseType] = useState('Fund Request');
  const [steps, setSteps] = useState<(Omit<WorkflowStepDefinition, 'id'> & { id?: string, actions_str: string })[]>([{ ...initialStep, actions_str: '' }]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode) {
      const fetchTemplate = async () => {
        setLoading(true);
        try {
          const template = await api.fetchWorkflowTemplateById(id);
          if (template) {
            setName(template.name);
            setDescription(template.description);
            setCaseType(template.case_type);
            setSteps(template.definition_json.map(step => ({...step, actions_str: step.actions.join(', ')})));
          } else {
            setError('Template not found.');
          }
        } catch (err) {
          setError('Failed to load template data.');
        } finally {
          setLoading(false);
        }
      };
      fetchTemplate();
    }
  }, [id, isEditMode]);

  const handleStepChange = (index: number, field: string, value: string) => {
    const newSteps = [...steps];
    (newSteps[index] as any)[field] = value;
    setSteps(newSteps);
  };

  const addStep = () => {
    setSteps([...steps, { ...initialStep, actions_str: '' }]);
  };

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload: WorkflowTemplatePayload = {
      name,
      description,
      case_type: caseType,
      definition_json: steps.map((step, index) => ({
        id: step.id || `step-${Date.now()}-${index}`,
        name: step.name,
        responsible_role: step.responsible_role,
        responsible_department: step.responsible_department,
        actions: step.actions_str.split(',').map(a => a.trim()).filter(Boolean),
      })),
    };

    try {
      if (isEditMode) {
        await api.updateWorkflowTemplate(id, payload);
      } else {
        await api.createWorkflowTemplate(payload);
      }
      navigate(ROUTES.ADMIN_WORKFLOW_TEMPLATES);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>;
  }
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{isEditMode ? 'Edit' : 'Create'} Workflow Template</h1>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Template Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">Template Name</label>
              <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 w-full input-field" />
            </div>
            <div>
              <label htmlFor="caseType" className="block text-sm font-medium text-gray-300">Case Type</label>
              <select id="caseType" value={caseType} onChange={e => setCaseType(e.target.value)} required className="mt-1 w-full input-field">
                <option>Fund Request</option>
                <option>Curriculum Approval</option>
                <option>Leave Approval</option>
                <option>Procurement Request</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
              <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 w-full input-field" />
            </div>
          </div>

          {/* Steps Editor */}
          <div className="space-y-4 pt-4 border-t border-gray-700">
            <h2 className="text-xl font-semibold">Workflow Steps</h2>
            {steps.map((step, index) => (
              <div key={index} className="p-4 bg-gray-700/50 rounded-lg space-y-4 relative">
                <h3 className="font-semibold text-gray-200">Step {index + 1}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={`step-name-${index}`} className="block text-xs font-medium text-gray-400">Step Name</label>
                    <input id={`step-name-${index}`} type="text" value={step.name} onChange={e => handleStepChange(index, 'name', e.target.value)} required className="mt-1 w-full input-field-sm" />
                  </div>
                  <div>
                    <label htmlFor={`step-actions-${index}`} className="block text-xs font-medium text-gray-400">Actions (comma-separated)</label>
                    <input id={`step-actions-${index}`} type="text" value={step.actions_str} onChange={e => handleStepChange(index, 'actions_str', e.target.value)} required placeholder="e.g. Approve, Reject" className="mt-1 w-full input-field-sm" />
                  </div>
                  <div>
                    <label htmlFor={`step-role-${index}`} className="block text-xs font-medium text-gray-400">Responsible Role</label>
                    <input id={`step-role-${index}`} type="text" value={step.responsible_role} onChange={e => handleStepChange(index, 'responsible_role', e.target.value)} required className="mt-1 w-full input-field-sm" />
                  </div>
                  <div>
                    <label htmlFor={`step-dept-${index}`} className="block text-xs font-medium text-gray-400">Responsible Department</label>
                    <input id={`step-dept-${index}`} type="text" value={step.responsible_department} onChange={e => handleStepChange(index, 'responsible_department', e.target.value)} required className="mt-1 w-full input-field-sm" />
                  </div>
                </div>
                {steps.length > 1 && (
                  <button type="button" onClick={() => removeStep(index)} className="absolute top-3 right-3 text-gray-400 hover:text-red-400">
                    <ICONS.TRASH className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={addStep} className="flex items-center gap-2">
              <ICONS.PLUS className="h-5 w-5" /> Add Step
            </Button>
          </div>

          {error && <p className="text-sm text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}
          
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
            <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.ADMIN_WORKFLOW_TEMPLATES)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading}>
              {isEditMode ? 'Save Changes' : 'Create Template'}
            </Button>
          </div>
        </form>
      </Card>
      <style>{`
        .input-field {
            background-color: #374151; /* gray-700 */
            border: 1px solid #4B5563; /* gray-600 */
            border-radius: 0.375rem;
            padding: 0.5rem 0.75rem;
            color: #F3F4F6; /* gray-100 */
        }
        .input-field:focus {
            outline: none;
            box-shadow: 0 0 0 2px #14B8A6; /* teal-500 */
            border-color: #14B8A6;
        }
        .input-field-sm {
            background-color: #4B5563; /* gray-600 */
            border: 1px solid #374151; /* gray-700 */
            border-radius: 0.375rem;
            padding: 0.25rem 0.5rem;
            font-size: 0.875rem;
            color: #F3F4F6; /* gray-100 */
        }
        .input-field-sm:focus {
            outline: none;
            box-shadow: 0 0 0 2px #14B8A6; /* teal-500 */
            border-color: #14B8A6;
        }
      `}</style>
    </div>
  );
};

export default WorkflowTemplateFormPage;
