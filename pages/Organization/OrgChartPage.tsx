
import React, { useState, useEffect } from 'react';
import { organizationService } from '../../services';
import { OrganizationalUnit } from '@/types.ts';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { ICONS } from '../../constants';

interface OrgUnitNodeProps {
  unit: OrganizationalUnit;
  level: number;
}

const OrgUnitNode: React.FC<OrgUnitNodeProps> = ({ unit, level }) => {
    const [isOpen, setIsOpen] = useState(level < 2);
    const hasChildren = unit.children && unit.children.length > 0;

    return (
        <div style={{ marginLeft: `${level * 2}rem` }}>
            <div className="flex items-center bg-gray-800 p-2 rounded-md my-1">
                {hasChildren && (
                     <button onClick={() => setIsOpen(!isOpen)} className="mr-2 p-1 rounded-full hover:bg-gray-700">
                        <ICONS.CHEVRON_RIGHT className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                    </button>
                )}
                {!hasChildren && <div className="w-8 mr-2" />}
                <div className="flex-1">
                    <p className="font-semibold">{unit.name}</p>
                    <p className="text-sm text-gray-400">Type: {unit.unit_type}</p>
                    {unit.description && <p className="text-xs text-gray-500">{unit.description}</p>}
                </div>
            </div>
            {isOpen && hasChildren && unit.children.map(child => (
                <OrgUnitNode key={child.id} unit={child} level={level + 1} />
            ))}
        </div>
    )
}

const OrgChartPage: React.FC = () => {
  const [orgChart, setOrgChart] = useState<OrganizationalUnit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await organizationService.getOrganizationalHierarchy();
        setOrgChart(data);
      } catch (error) {
        console.error("Failed to fetch organization chart", error);
        setError("Failed to load organization hierarchy. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>;
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Organization Hierarchy</h1>
      <Card>
        {orgChart ? <OrgUnitNode unit={orgChart} level={0} /> : <p>No data found.</p>}
      </Card>
    </div>
  );
};

export default OrgChartPage;
