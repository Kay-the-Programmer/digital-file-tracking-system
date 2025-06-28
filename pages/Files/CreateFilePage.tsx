
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { ROUTES } from '../../constants';
import { PhysicalLocation } from '../../types';

const FileFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file_type: 'digital' as 'digital' | 'physical',
    current_location_id: ''
  });
  
  const [locations, setLocations] = useState<PhysicalLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequiredData = async () => {
      try {
        if (isEditMode && id) {
          const fileData = await api.fetchFileById(id);
          if (fileData) {
            setFormData({
              title: fileData.title,
              description: fileData.description,
              file_type: fileData.file_type,
              current_location_id: fileData.current_location_id || ''
            });
            if (fileData.file_type === 'physical') {
                const locData = await api.fetchLocations();
                setLocations(locData);
            }
          } else {
            setError('File not found.');
          }
        } else if (!isEditMode) {
            // For create mode, we might need locations if user selects 'physical'
            const locData = await api.fetchLocations();
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
    setFormData(prev => ({...prev, [name]: value}));
    if (name === 'file_type' && value === 'digital') {
        setFormData(prev => ({...prev, current_location_id: ''}));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
        setError('Title is required.');
        return false;
    }
    if (formData.file_type === 'physical' && !formData.current_location_id) {
        setError('A location is required for physical files.');
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
            await api.updateFile(id, {
                title: formData.title,
                description: formData.description,
                current_location_id: formData.current_location_id || null
            });
        } else {
            if (!user) throw new Error("Authentication error");
            await api.createFile({
                ...formData,
                created_by_user_id: user.id,
                current_location_id: formData.current_location_id || null,
            });
        }
        navigate(ROUTES.FILES);
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
      <h1 className="text-3xl font-bold mb-6">{isEditMode ? 'Edit File' : 'Create New File'}</h1>
      <Card className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField label="Title" name="title" value={formData.title} onChange={handleInputChange} required />
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={4} className="mt-1 block w-full input-field" />
          </div>
          <div>
            <label htmlFor="file_type" className="block text-sm font-medium text-gray-300">File Type</label>
            <select id="file_type" name="file_type" value={formData.file_type} onChange={handleInputChange} disabled={isEditMode} className="mt-1 block w-full input-field disabled:opacity-50">
                <option value="digital">Digital</option>
                <option value="physical">Physical</option>
            </select>
          </div>
          {formData.file_type === 'physical' && (
            <div>
              <label htmlFor="current_location_id" className="block text-sm font-medium text-gray-300">Location</label>
              <select id="current_location_id" name="current_location_id" value={formData.current_location_id} onChange={handleInputChange} className="mt-1 block w-full input-field">
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
      <style>{`.input-field { background-color: #374151; border: 1px solid #4B5563; border-radius: 0.375rem; padding: 0.5rem 0.75rem; color: #F3F4F6; } .input-field:focus { outline: none; box-shadow: 0 0 0 2px #14B8A6; border-color: #14B8A6; }`}</style>
    </div>
  );
};

const InputField = (props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
    <div>
        <label htmlFor={props.name} className="block text-sm font-medium text-gray-300 mb-1">{props.label}</label>
        <input id={props.name} {...props} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition" />
    </div>
);


export default FileFormPage;
