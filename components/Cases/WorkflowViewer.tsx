
import React, { useState } from 'react';
import { WorkflowInstance, WorkflowStepDefinition } from '../../types';
import { ICONS } from '../../constants';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface WorkflowViewerProps {
  workflowStatus: WorkflowInstance;
  workflowTemplate: WorkflowStepDefinition[];
}

const WorkflowViewer: React.FC<WorkflowViewerProps> = ({ workflowStatus, workflowTemplate }) => {
    const [showHistory, setShowHistory] = useState(false);

    const getStepStatus = (stepId: string) => {
        if (workflowStatus.status !== 'Active' && workflowStatus.history.some(h => h.step_id === stepId)) {
            return 'completed';
        }
        if (workflowStatus.current_step?.id === stepId) {
            return 'current';
        }
        if (workflowStatus.history.some(h => h.step_id === stepId)) {
            return 'completed';
        }
        return 'pending';
    };

    const StatusIcon = ({ status }: { status: string }) => {
        if (status === 'current') return <ICONS.HOURGLASS className="h-6 w-6 text-orange-400" />;
        if (status === 'completed') return <ICONS.CHECK_CIRCLE className="h-6 w-6 text-green-500" />;
        return <ICONS.CHEVRON_RIGHT className="h-6 w-6 text-gray-500" />;
    };

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Workflow: {workflowStatus.workflow_template_name}</h2>
                 <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    workflowStatus.status === 'Active' ? 'bg-blue-600 text-blue-100' :
                    workflowStatus.status === 'Completed' ? 'bg-green-600 text-green-100' :
                    workflowStatus.status === 'Rejected' ? 'bg-red-600 text-red-100' : 'bg-gray-600'
                 }`}>
                    {workflowStatus.status}
                </span>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Steps Visualization */}
                <div className="w-full md:w-1/2">
                    <h3 className="font-semibold text-gray-300 mb-2">Progress</h3>
                    <div className="relative space-y-4 pl-8">
                        {/* Connecting line */}
                        <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-600"></div>

                        {workflowTemplate.map((step) => {
                            const status = getStepStatus(step.id);
                            const isCompleted = status === 'completed';
                            const isCurrent = status === 'current';
                            
                            return (
                                <div key={step.id} className="flex items-start">
                                    <div className={`absolute left-0 h-8 w-8 rounded-full flex items-center justify-center -translate-x-1/2 ${
                                        isCurrent ? 'bg-orange-900 ring-2 ring-orange-400' : isCompleted ? 'bg-green-900' : 'bg-gray-700'
                                    }`}>
                                        <StatusIcon status={status} />
                                    </div>
                                    <div className={`ml-4 p-3 rounded-lg w-full ${
                                        isCurrent ? 'bg-orange-500/10 border border-orange-500/30' : 'bg-gray-700/50'
                                    }`}>
                                        <p className={`font-bold ${isCurrent ? 'text-orange-300' : isCompleted ? 'text-green-400' : 'text-gray-300'}`}>{step.name}</p>
                                        {isCurrent && step.responsible_role && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                To: {step.responsible_role} ({step.responsible_department})
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* History */}
                <div className="w-full md:w-1/2">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-gray-300">History</h3>
                         <Button size="sm" variant="secondary" onClick={() => setShowHistory(!showHistory)}>
                            <ICONS.HISTORY className="h-4 w-4 mr-2"/>
                            {showHistory ? 'Hide' : 'Show'} ({workflowStatus.history.length})
                        </Button>
                    </div>
                    {showHistory && (
                        <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                            {workflowStatus.history.length > 0 ? [...workflowStatus.history].reverse().map((entry, index) => (
                                <div key={index} className="p-2 bg-gray-900/50 rounded-md">
                                    <p className="font-medium text-sm">
                                        {entry.step_name}: <span className="font-bold text-teal-400">{entry.action_taken}</span>
                                    </p>
                                    <p className="text-xs text-gray-400">By {entry.action_by_username} on {new Date(entry.action_at).toLocaleDateString()}</p>
                                    {entry.comments && <p className="text-xs text-gray-500 mt-1 italic">"{entry.comments}"</p>}
                                </div>
                            )) : <p className="text-sm text-gray-500">No history available.</p>}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default WorkflowViewer;
