// src/pages/CreateFilePage.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { fileService } from '../../services';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { ROUTES } from '../../constants';
import { PhysicalLocation } from '@/types';
import { useToast } from '../../context/ToastContext';

// A small helper component for form fields
const InputField = (props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
    <div>
        <label htmlFor={props.name} className="block text-sm font-medium text-gray-300 mb-1">{props.label}</label>
        <input id={props.name} {...props} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition" />
    </div>
);

const CreateFilePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        file_type: 'DIGITAL' as 'DIGITAL' | 'PHYSICAL',
        current_location: ''
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [locations, setLocations] = useState<PhysicalLocation[]>([]);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(isEditMode);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRequiredData = async () => {
            try {
                if (isEditMode && id) {
                    const fileData = await fileService.getById(id);
                    if (fileData) {
                        setFormData({
                            title: fileData.title,
                            description: fileData.description,
                            file_type: fileData.file_type.toUpperCase() as 'DIGITAL' | 'PHYSICAL',
                             // Now directly matches backend
                            current_location: fileData.current_location || ''
                        });
                        if (fileData.file_type === 'PHYSICAL') {
                            const locData = await fileService.getAllLocations();
                            setLocations(locData);
                        }
                    } else {
                        setError('File not found.');
                    }
                } else if (!isEditMode) {
                    const locData = await fileService.getAllLocations();
                    setLocations(locData);
                }
            } catch (err) {
                setError('Failed to load necessary data.');
            } finally {
                if (isEditMode) setPageLoading(false);
            }
        };
        fetchRequiredData();
    }, [id, isEditMode]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value as any}));
        if (name === 'file_type' && value === 'DIGITAL') {
            setFormData(prev => ({...prev, current_location: ''}));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        } else {
            setSelectedFile(null);
        }
    };

    const validateForm = (): boolean => {
        if (!formData.title.trim()) {
            const errorMsg = 'Title is required.';
            setError(errorMsg);
            showToast(errorMsg, 'error');
            return false;
        }
        if (formData.file_type === 'PHYSICAL' && !formData.current_location) {
            const errorMsg = 'A location is required for physical files.';
            setError(errorMsg);
            showToast(errorMsg, 'error');
            return false;
        }
        if (!isEditMode && formData.file_type === 'DIGITAL' && !selectedFile) {
            const errorMsg = 'Please select a file to upload.';
            setError(errorMsg);
            showToast(errorMsg, 'error');
            return false;
        }
        setError(null);
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);

        try {
            if (isEditMode && id) {
                await fileService.update(id, {
                    title: formData.title,
                    description: formData.description,
                    current_location: formData.current_location || null
                });
                showToast('File updated successfully!', 'success');
                navigate(ROUTES.FILES);
            } else {
                if (!user) throw new Error("Authentication error");

                const payload = {
                    title: formData.title,
                    description: formData.description,
                    file_type: formData.file_type, // No need to convert to uppercase anymore
                    created_by_user_id: user.id,
                    current_location: formData.file_type === 'PHYSICAL' ? formData.current_location : null,
                };

                const createdFile = await fileService.create(payload);

                if (formData.file_type === 'DIGITAL' && selectedFile && createdFile) {
                    try {
                        await fileService.uploadDigitalFile(createdFile.id, selectedFile);
                        showToast(`File ${selectedFile.name} uploaded successfully!`, 'success');
                    } catch (uploadErr) {
                        console.error('File upload failed:', uploadErr);
                        showToast(`File metadata created, but upload failed: ${(uploadErr as Error).message}`, 'error');
                    }
                } else {
                    showToast('Physical file record created successfully!', 'success');
                }

                navigate(ROUTES.FILES);
            }
        } catch (err) {
            const errorMessage = (err as Error).message;
            setError(errorMessage);
            showToast(`Error: ${errorMessage}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">{isEditMode ? 'Edit File' : 'Create New File'}</h1>
            <Card className="max-w-3xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <InputField label="Title" name="title" value={formData.title} onChange={handleInputChange} required />
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                        <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={4} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition" />
                    </div>
                    <div>
                        <label htmlFor="file_type" className="block text-sm font-medium text-gray-300 mb-1">File Type</label>
                        <select id="file_type" name="file_type" value={formData.file_type} onChange={handleInputChange} disabled={isEditMode} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition disabled:opacity-50">
                            <option value="DIGITAL">Digital</option>
                            <option value="PHYSICAL">Physical</option>
                        </select>
                    </div>
                    {formData.file_type === 'DIGITAL' && !isEditMode && (
                        <div>
                            <label htmlFor="file_upload" className="block text-sm font-medium text-gray-300 mb-1">Upload File</label>
                            <input
                                type="file"
                                id="file_upload"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                            />
                            <p className="mt-1 text-sm text-gray-400">Upload a digital file to create the first version.</p>
                        </div>
                    )}
                    {formData.file_type === 'PHYSICAL' && (
                        <div>
                            <label htmlFor="current_location" className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                            <select id="current_location" name="current_location" value={formData.current_location} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition">
                                <option value="">Select a location</option>
                                {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                            </select>
                        </div>
                    )}

                    {error && <p className="text-sm text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}

                    <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
                        <Button type="button" variant="secondary" onClick={() => navigate(isEditMode ? `/files/${id}` : ROUTES.FILES)}>Cancel</Button>
                        <Button type="submit" isLoading={loading}>{isEditMode ? 'Save Changes' : 'Create File'}</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default CreateFilePage;
