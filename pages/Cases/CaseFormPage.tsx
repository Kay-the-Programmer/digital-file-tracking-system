import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore.ts';
import { useHasPermission } from '@/hooks/useHasPermission.ts';
import { caseService, fileService } from '../../services';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { ROUTES } from '../../constants';
import { File as FileType, CaseStatus, CaseCreationPayload, CaseUpdatePayload, CaseType, CaseTypeAttribute } from '../../types';
import PermissionGuard from '../../components/auth/PermissionGuard';

const AttributeInput: React.FC<{
    attribute: CaseTypeAttribute;
    value: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ attribute, value, onChange }) => {
    const { name, label, type, required } = attribute;
    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
            <input
                id={name}
                name={name}
                type={type}
                value={value || ''}
                onChange={onChange}
                required={required}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition disabled:opacity-50"
            />
        </div>
    );
};

const CaseFormPage: React.FC = () => {
    const { id: caseId } = useParams<{ id: string }>();
    const isEditMode = !!caseId;
    const navigate = useNavigate();
    const { user } = useAuthStore();
    useHasPermission('case:update');
    useHasPermission('case:create');
    const [formData, setFormData] = useState({
        title: '',
        case_type: '',
        description: '',
        associated_file_ids: [] as string[],
        attributes: {} as Record<string, any>,
        status: CaseStatus.OPEN,
    });

    const [allCaseTypes, setAllCaseTypes] = useState<CaseType[]>([]);
    const [availableFiles, setAvailableFiles] = useState<FileType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [filesData, caseTypesData] = await Promise.all([
                    fileService.getAll(),
                    caseService.getAllTypes()
                ]);
                setAvailableFiles(filesData);
                setAllCaseTypes(caseTypesData);

                if (!isEditMode && caseTypesData.length > 0) {
                    setFormData(prev => ({ ...prev, case_type: caseTypesData[0].name }));
                }

                if (isEditMode && caseId) {
                    const caseData = await caseService.getById(caseId);
                    if (caseData) {
                        setFormData({
                            title: caseData.title,
                            case_type: caseData.case_type,
                            description: caseData.description,
                            associated_file_ids: caseData.associated_file_ids,
                            attributes: caseData.attributes || {},
                            status: caseData.status,
                        });
                    } else {
                        setError('Case not found.');
                    }
                }
            } catch (err) {
                setError('Failed to load required data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [caseId, isEditMode]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAttributeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            attributes: {
                ...prev.attributes,
                [name]: type === 'number' ? Number(value) : value,
            }
        }));
    };

    const handleFileAssociationChange = (fileId: string) => {
        setFormData(prev => {
            const newFileIds = prev.associated_file_ids.includes(fileId)
                ? prev.associated_file_ids.filter(id => id !== fileId)
                : [...prev.associated_file_ids, fileId];
            return { ...prev, associated_file_ids: newFileIds };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setError('You must be logged in.');
            return;
        }
        setIsSubmitting(true);
        setError(null);

        try {
            if (isEditMode && caseId) {
                const payload: CaseUpdatePayload = {
                    title: formData.title,
                    description: formData.description,
                    associated_file_ids: formData.associated_file_ids,
                    attributes: formData.attributes,
                    status: formData.status,
                };
                const updatedCase = await caseService.update(caseId, payload);
                navigate(`/cases/${updatedCase.id}`);
            } else {
                const payload: CaseCreationPayload = {
                    title: formData.title,
                    case_type: formData.case_type,
                    description: formData.description,
                    associated_file_ids: formData.associated_file_ids,
                    attributes: formData.attributes,
                    initiated_by_user_id: user.id,
                };
                const newCase = await caseService.create(payload);
                navigate(`/cases/${newCase.id}`);
            }
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedCaseTypeDefinition = allCaseTypes.find(ct => ct.name === formData.case_type);

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>;
    }

    // We're using PermissionGuard component which already uses useHasPermission internally

    return (
        <PermissionGuard permission={isEditMode ? 'case:read' : 'case:create'}>
            <div>
                <h1 className="text-3xl font-bold mb-6">{isEditMode ? `Edit Case: ${formData.title}` : 'Create New Case'}</h1>
                <p className="text-lg text-gray-400 mb-8 max-w-4xl mx-auto text-center">
                  {isEditMode ? 'Update the details for this case.' : 'Fill in the details below to initiate a new case and start its workflow.'}
                </p>
                <Card className="max-w-4xl mx-auto">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <InputField label="Case Title" name="title" value={formData.title} onChange={handleInputChange} required />

                        <div>
                            <label htmlFor="case_type" className="block text-sm font-medium text-gray-300">Case Type</label>
                            <select id="case_type" name="case_type" value={formData.case_type} onChange={handleInputChange} required disabled={isEditMode}
                                className="mt-1 block w-full input-field disabled:opacity-50">
                                {allCaseTypes.map(ct => (
                                    <option key={ct.id} value={ct.name}>{ct.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
                            <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={4} required className="mt-1 block w-full input-field" />
                        </div>

                        {/* Dynamic attributes */}
                        {selectedCaseTypeDefinition && selectedCaseTypeDefinition.attribute_definitions.length > 0 && (
                             <div className="p-4 bg-gray-700/50 rounded-lg space-y-4">
                                <h3 className="font-semibold">{selectedCaseTypeDefinition.name} Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {selectedCaseTypeDefinition.attribute_definitions.map(attr => (
                                    <AttributeInput
                                        key={attr.name}
                                        attribute={attr}
                                        value={formData.attributes[attr.name]}
                                        onChange={handleAttributeChange}
                                    />
                                ))}
                                </div>
                            </div>
                        )}


                        {/* File association */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Associate Files (Optional)</label>
                            <div className="p-4 bg-gray-700/50 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                                {availableFiles.length > 0 ? availableFiles.map(file => (
                                    <label key={file.id} className="flex items-center space-x-2 cursor-pointer">
                                        <input type="checkbox" checked={formData.associated_file_ids.includes(file.id)} onChange={() => handleFileAssociationChange(file.id)}
                                            className="h-4 w-4 rounded bg-gray-600 border-gray-500 text-teal-600 focus:ring-teal-500"/>
                                        <span>{file.title} ({file.file_type})</span>
                                    </label>
                                )) : <p className="text-gray-400">No files available to associate.</p>}
                            </div>
                        </div>

                        {isEditMode && (
                            <PermissionGuard permission="case:update">
                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-300">Status (Admin Only)</label>
                                    <select id="status" name="status" value={formData.status} onChange={handleInputChange} className="mt-1 block w-full input-field">
                                        {Object.values(CaseStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </PermissionGuard>
                        )}

                        {error && <p className="text-sm text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}

                        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
                            <Button type="button" variant="secondary" onClick={() => navigate(isEditMode ? `/cases/${caseId}` : ROUTES.CASES)}>Cancel</Button>
                            <PermissionGuard permission={isEditMode ? 'case:update' : 'case:create'}>
                                <Button type="submit" isLoading={isSubmitting}>{isEditMode ? 'Save Changes' : 'Create Case'}</Button>
                            </PermissionGuard>
                        </div>
                    </form>
                </Card>
                <style>{`.input-field { background-color: #374151; border: 1px solid #4B5563; border-radius: 0.375rem; padding: 0.5rem 0.75rem; color: #F3F4F6; } .input-field:focus { outline: none; box-shadow: 0 0 0 2px #14B8A6; border-color: #14B8A6; }`}</style>
            </div>
        </PermissionGuard>
    );
};

const InputField = (props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
    <div>
        <label htmlFor={props.name} className="block text-sm font-medium text-gray-300 mb-1">{props.label}</label>
        <input id={props.name} {...props} className="mt-1 block w-full input-field" />
    </div>
);

export default CaseFormPage;
