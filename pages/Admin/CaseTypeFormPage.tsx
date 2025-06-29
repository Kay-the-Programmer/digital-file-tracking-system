
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { caseService } from '../../services/cases';
import { CaseTypeAttribute, CaseTypeCreationPayload, CaseTypeUpdatePayload } from '../../types';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { ROUTES, ICONS } from '../../constants';

const initialAttribute: CaseTypeAttribute = { name: '', label: '', type: 'text', required: false };

const CaseTypeFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        attribute_definitions: [initialAttribute]
    });

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(isEditMode);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isEditMode && id) {
            const fetchCaseType = async () => {
                try {
                    const data = await caseService.getTypeById(id);
                    if (data) {
                        setFormData({
                            name: data.name,
                            description: data.description,
                            attribute_definitions: data.attribute_definitions.length > 0 ? data.attribute_definitions : [initialAttribute],
                        });
                    } else {
                        setError('Case Type not found.');
                    }
                } catch (err) {
                    setError('Failed to load data.');
                } finally {
                    setPageLoading(false);
                }
            };
            fetchCaseType();
        } else {
            setPageLoading(false);
        }
    }, [id, isEditMode]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleAttributeChange = (index: number, field: keyof CaseTypeAttribute, value: string | boolean) => {
        const newAttributes = [...formData.attribute_definitions];
        (newAttributes[index] as any)[field] = value;
        setFormData(prev => ({ ...prev, attribute_definitions: newAttributes }));
    };

    const addAttribute = () => {
        setFormData(prev => ({ ...prev, attribute_definitions: [...prev.attribute_definitions, initialAttribute] }));
    };

    const removeAttribute = (index: number) => {
        if (formData.attribute_definitions.length > 1) {
            setFormData(prev => ({ ...prev, attribute_definitions: prev.attribute_definitions.filter((_, i) => i !== index) }));
        } else {
             setFormData(prev => ({ ...prev, attribute_definitions: [initialAttribute] }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const payload: CaseTypeCreationPayload | CaseTypeUpdatePayload = {
            name: formData.name,
            description: formData.description,
            attribute_definitions: formData.attribute_definitions.filter(attr => attr.name && attr.label), // Filter out empty attributes
        };

        try {
            if (isEditMode && id) {
                await caseService.updateType(id, payload);
            } else {
                await caseService.createType(payload as CaseTypeCreationPayload);
            }
            navigate(ROUTES.ADMIN_CASE_TYPES);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">{isEditMode ? 'Edit Case Type' : 'Create New Case Type'}</h1>
            <Card className="max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Name" name="name" value={formData.name} onChange={handleInputChange} required />
                        <div className="md:col-span-2">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
                            <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={3} className="mt-1 w-full input-field" />
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-gray-700">
                        <h2 className="text-xl font-semibold">Custom Attributes</h2>
                        {formData.attribute_definitions.map((attr, index) => (
                            <div key={index} className="p-4 bg-gray-700/50 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                <InputField label="Field Name (no spaces)" name="name" value={attr.name} onChange={e => handleAttributeChange(index, 'name', e.target.value)} placeholder="e.g., budgetCode" />
                                <InputField label="Display Label" name="label" value={attr.label} onChange={e => handleAttributeChange(index, 'label', e.target.value)} placeholder="e.g., Budget Code" />
                                <div>
                                    <label htmlFor={`type-${index}`} className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                                    <select id={`type-${index}`} value={attr.type} onChange={e => handleAttributeChange(index, 'type', e.target.value)} className="w-full input-field">
                                        <option value="text">Text</option>
                                        <option value="number">Number</option>
                                        <option value="date">Date</option>
                                    </select>
                                </div>
                                <div className="flex justify-between items-center h-full pt-6">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input type="checkbox" checked={attr.required} onChange={e => handleAttributeChange(index, 'required', e.target.checked)} className="h-4 w-4 rounded bg-gray-600 border-gray-500 text-teal-600 focus:ring-teal-500"/>
                                        <span>Required</span>
                                    </label>
                                    <button type="button" onClick={() => removeAttribute(index)} className="text-gray-400 hover:text-red-400 p-1">
                                        <ICONS.TRASH className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                         <Button type="button" variant="secondary" onClick={addAttribute} className="flex items-center gap-2">
                            <ICONS.PLUS className="h-5 w-5" /> Add Attribute
                        </Button>
                    </div>

                    {error && <p className="text-sm text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}
                    <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
                        <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.ADMIN_CASE_TYPES)}>Cancel</Button>
                        <Button type="submit" isLoading={loading}>{isEditMode ? 'Save Changes' : 'Create Case Type'}</Button>
                    </div>
                </form>
            </Card>
            <style>{`.input-field { background-color: #374151; border: 1px solid #4B5563; border-radius: 0.375rem; padding: 0.5rem 0.75rem; color: #F3F4F6; } .input-field:focus { outline: none; box-shadow: 0 0 0 2px #14B8A6; border-color: #14B8A6; }`}</style>
        </div>
    );
};

const InputField = (props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
    <div>
        <label htmlFor={props.name} className="block text-sm font-medium text-gray-300 mb-1">{props.label}</label>
        <input {...props} className="mt-1 block w-full input-field" />
    </div>
);

export default CaseTypeFormPage;
