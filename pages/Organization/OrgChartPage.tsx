
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Department } from '../../types';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { ICONS } from '../../constants';

interface DepartmentNodeProps {
  department: Department;
  level: number;
}

const DepartmentNode: React.FC<DepartmentNodeProps> = ({ department, level }) => {
    const [isOpen, setIsOpen] = useState(level < 2);

    return (
        <div style={{ marginLeft: `${level * 2}rem` }}>
            <div className="flex items-center bg-gray-800 p-2 rounded-md my-1">
                {department.subUnits.length > 0 && (
                     <button onClick={() => setIsOpen(!isOpen)} className="mr-2 p-1 rounded-full hover:bg-gray-700">
                        <ICONS.CHEVRON_RIGHT className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                    </button>
                )}
                 {!department.subUnits.length && <div className="w-8 mr-2" />}
                <div className="flex-1">
                    <p className="font-semibold">{department.name}</p>
                    <p className="text-sm text-gray-400">Head: {department.head}</p>
                </div>
            </div>
            {isOpen && department.subUnits.map(sub => (
                <DepartmentNode key={sub.id} department={sub} level={level + 1} />
            ))}
        </div>
    )
}

const OrgChartPage: React.FC = () => {
  const [orgChart, setOrgChart] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await api.fetchOrgChart();
        setOrgChart(data);
      } catch (error) {
        console.error("Failed to fetch organization chart", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Organization Hierarchy</h1>
      <Card>
        {orgChart ? <DepartmentNode department={orgChart} level={0} /> : <p>No data found.</p>}
      </Card>
    </div>
  );
};

export default OrgChartPage;
