
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { fileService, organizationService } from '../../services';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { ROUTES } from '../../constants';
import { PhysicalLocation } from '../../types';

const CreateFilePage: React.FC = () => {
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
              file_type: fileData.file_type,
              current_location_id: fileData.current_location_id || ''
            });
            if (fileData.file_type === 'physical') {
                const locData = await organizationService.getAllLocations();
                setLocations(locData);
            }
          } else {
            setError('File not found.');
          }
        } else if (!isEditMode) {
            // For create mode, we might need locations if user selects 'physical'
            const locData = await organizationService.getAllLocations();
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    } else {
      setSelectedFile(null);
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
    if (!isEditMode && formData.file_type === 'digital' && !selectedFile) {
        setError('Please select a file to upload.');
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
                current_location_id: formData.current_location_id || null
            });
            navigate(ROUTES.FILES);
        } else {
            if (!user) throw new Error("Authentication error");

            // Create the file metadata first
            const createdFile = await fileService.create({
                ...formData,
                created_by_user_id: user.id,
                current_location_id: formData.current_location_id || null,
            });

            // If it's a digital file, upload the file content
            if (formData.file_type === 'digital' && selectedFile && createdFile) {
                try {
                    // Note: This is a placeholder for the actual file upload implementation
                    // In a real application, you would use a FormData object to upload the file
                    // to an endpoint that handles file uploads

                    // Example implementation (commented out as it's not implemented in the backend):
                    /*
                    const formData = new FormData();
                    formData.append('file', selectedFile);
                    formData.append('file_id', createdFile.id);
                    formData.append('uploaded_by_user_id', user.id);

                    await fetch('/api/file-management/files/upload/', {
                        method: 'POST',
                        body: formData,
                    });
                    */

                    // For now, we'll just show a success message
                    console.log(`File ${selectedFile.name} would be uploaded for file ID: ${createdFile.id}`);
                    alert(`File created successfully. In a real application, ${selectedFile.name} would be uploaded.`);
                } catch (uploadErr) {
                    console.error('Error uploading file:', uploadErr);
                    setError('File metadata created, but file upload failed. Please try uploading the file later.');
                    // Navigate to the file details page anyway
                    navigate(`/files/${createdFile.id}`);
                    return;
                }
            }

            navigate(ROUTES.FILES);
        }
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
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={4} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition" />
          </div>
          <div>
            <label htmlFor="file_type" className="block text-sm font-medium text-gray-300 mb-1">File Type</label>
            <select id="file_type" name="file_type" value={formData.file_type} onChange={handleInputChange} disabled={isEditMode} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition disabled:opacity-50">
                <option value="digital">Digital</option>
                <option value="physical">Physical</option>
            </select>
          </div>
          {formData.file_type === 'digital' && !isEditMode && (
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
          {formData.file_type === 'physical' && (
            <div>
              <label htmlFor="current_location_id" className="block text-sm font-medium text-gray-300 mb-1">Location</label>
              <select id="current_location_id" name="current_location_id" value={formData.current_location_id} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition">
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

const InputField = (props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
    <div>
        <label htmlFor={props.name} className="block text-sm font-medium text-gray-300 mb-1">{props.label}</label>
        <input id={props.name} {...props} className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition" />
    </div>
);


export default CreateFilePage;
