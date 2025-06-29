
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { organizationService } from '../../services/organization';
import { OrganizationalUnit, LocationCreationPayload, LocationUpdatePayload } from '../../types';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { ROUTES } from '../../constants';

const LocationFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    organizational_unit_id: '',
  });

  const [allOrgUnits, setAllOrgUnits] = useState<OrganizationalUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const orgUnitsData = await organizationService.getAllUnits();
        setAllOrgUnits(orgUnitsData);

        if (isEditMode && id) {
          const locationData = await organizationService.getLocationById(id);
          if (locationData) {
            setFormData({
                name: locationData.name,
                description: locationData.description || '',
                organizational_unit_id: locationData.organizational_unit_id || ''
            });
          } else {
            setError('Location not found.');
          }
        }
      } catch (err) {
        setError('Failed to load initial data.');
        console.error(err);
      } finally {
        setLoading(false);
        setPageLoading(false);
      }
    };
    fetchInitialData();
  }, [id, isEditMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload: LocationCreationPayload | LocationUpdatePayload = {
        name: formData.name,
        description: formData.description,
        organizational_unit_id: formData.organizational_unit_id || undefined,
    };

    try {
      if (isEditMode && id) {
        await organizationService.updateLocation(id, payload);
      } else {
        await organizationService.createLocation(payload as LocationCreationPayload);
      }
      navigate(ROUTES.ADMIN_LOCATIONS);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading && !formData.name) {
    return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{isEditMode ? `Edit Location: ${formData.name}` : 'Create New Location'}</h1>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField label="Location Name" name="name" value={formData.name} onChange={handleInputChange} required />
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={3}
                className="w-full input-field" />
          </div>
          <div>
            <label htmlFor="organizational_unit_id" className="block text-sm font-medium text-gray-300 mb-1">Organizational Unit (Optional)</label>
            <select id="organizational_unit_id" name="organizational_unit_id" value={formData.organizational_unit_id} onChange={handleInputChange}
              className="w-full input-field">
              <option value="">None</option>
              {allOrgUnits.map(unit => (
                <option key={unit.id} value={unit.id}>{unit.name}</option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
            <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.ADMIN_LOCATIONS)}>Cancel</Button>
            <Button type="submit" isLoading={loading}>{isEditMode ? 'Save Changes' : 'Create Location'}</Button>
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
        <input
            id={props.name}
            {...props}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition disabled:opacity-50"
        />
    </div>
);

export default LocationFormPage;
