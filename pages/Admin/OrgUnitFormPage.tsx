
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { OrgUnitCreationPayload, OrgUnitUpdatePayload, OrganizationalUnit } from '../../types';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { ROUTES } from '../../constants';

const UNIT_TYPES: OrganizationalUnit['unit_type'][] = [
  'MINISTRY',
  'MINISTER_OFFICE',
  'PS_OFFICE',
  'DIRECTORATE',
  'DEPARTMENT',
];

const OrgUnitFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    unit_type: 'DEPARTMENT' as OrganizationalUnit['unit_type'],
    description: '',
    parent_id: '',
  });
  
  const [allUnits, setAllUnits] = useState<OrganizationalUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const unitsData = await api.fetchOrganizationalUnits();
        setAllUnits(unitsData);

        if (isEditMode && id) {
          const unitData = await api.fetchOrganizationalUnitById(id);
          if (unitData) {
            setFormData({
              name: unitData.name,
              unit_type: unitData.unit_type,
              description: unitData.description || '',
              parent_id: unitData.parent_id || '',
            });
          } else {
            setError('Organizational Unit not found.');
          }
        }
      } catch (err) {
        setError('Failed to load initial data.');
        console.error(err);
      } finally {
        setLoading(false);
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

    const payload: OrgUnitCreationPayload | OrgUnitUpdatePayload = {
        name: formData.name,
        unit_type: formData.unit_type,
        description: formData.description,
        parent_id: formData.parent_id || null,
    };

    try {
      if (isEditMode && id) {
        await api.updateOrganizationalUnit(id, payload);
      } else {
        await api.createOrganizationalUnit(payload as OrgUnitCreationPayload);
      }
      navigate(ROUTES.ADMIN_ORG_UNITS);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const parentOptions = useMemo(() => {
    if (!isEditMode) return allUnits;
    
    // To prevent circular dependencies, filter out the current unit and all its descendants.
    const descendantIds = new Set<string>([id!]);
    const findDescendants = (parentId: string) => {
        const children = allUnits.filter(u => u.parent_id === parentId);
        for (const child of children) {
            descendantIds.add(child.id);
            findDescendants(child.id);
        }
    }
    findDescendants(id!);

    return allUnits.filter(u => !descendantIds.has(u.id));
  }, [allUnits, isEditMode, id]);

  if (loading && !formData.name) {
    return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{isEditMode ? `Edit Unit: ${formData.name}` : 'Create New Organizational Unit'}</h1>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Unit Name" name="name" value={formData.name} onChange={handleInputChange} required />
            <div>
              <label htmlFor="unit_type" className="block text-sm font-medium text-gray-300 mb-1">Unit Type</label>
              <select id="unit_type" name="unit_type" value={formData.unit_type} onChange={handleInputChange} required className="w-full input-field">
                {UNIT_TYPES.map(type => (
                  <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="parent_id" className="block text-sm font-medium text-gray-300 mb-1">Parent Unit</label>
              <select id="parent_id" name="parent_id" value={formData.parent_id} onChange={handleInputChange} className="w-full input-field">
                <option value="">None (Top-Level Unit)</option>
                {parentOptions.map(unit => (
                  <option key={unit.id} value={unit.id}>{unit.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={3}
                className="w-full input-field" />
            </div>
          </div>
          
          {error && <p className="text-sm text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}
          
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
            <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.ADMIN_ORG_UNITS)}>Cancel</Button>
            <Button type="submit" isLoading={loading}>{isEditMode ? 'Save Changes' : 'Create Unit'}</Button>
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

export default OrgUnitFormPage;
