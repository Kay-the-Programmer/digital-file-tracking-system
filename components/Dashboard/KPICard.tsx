import React from 'react';
import Card from '../ui/Card';

interface KPICardProps {
  label: string;
  value: number | string;
  unit?: string;
  description?: string;
  color?: string;
}

const KPICard: React.FC<KPICardProps> = ({ label, value, unit, description, color = "border-gray-700" }) => {
  return (
    <Card className={`border-l-4 transition-all duration-300 hover:shadow-teal-500/20 hover:-translate-y-1 ${color}`}>
        <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">{label}</p>
        <div className="mt-2 flex items-baseline">
            <p className="text-4xl font-bold text-white">{value}</p>
            {unit && <span className="ml-2 text-xl font-semibold text-gray-300">{unit}</span>}
        </div>
        {description && <p className="mt-2 text-sm text-gray-500">{description}</p>}
    </Card>
  );
};

export default KPICard;