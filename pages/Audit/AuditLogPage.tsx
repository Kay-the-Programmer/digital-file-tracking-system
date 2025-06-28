
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AuditLog } from '../../types';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';

const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search_term: '',
    event_type: '',
    resource_type: '',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await api.fetchAuditLogs(filters);
        setLogs(data);
      } catch (error) {
        console.error("Failed to fetch audit logs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };
  
  const uniqueEventTypes = [...new Set(logs.map(log => log.event_type))];
  const uniqueResourceTypes = [...new Set(logs.map(log => log.resource_type))];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Audit Trail</h1>
      
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <input
            type="text"
            name="search_term"
            placeholder="Search details..."
            value={filters.search_term}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
          />
          <select name="event_type" value={filters.event_type} onChange={handleFilterChange} className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 transition">
            <option value="">All Event Types</option>
            {uniqueEventTypes.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
          <select name="resource_type" value={filters.resource_type} onChange={handleFilterChange} className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 transition">
            <option value="">All Resource Types</option>
            {uniqueResourceTypes.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
          <input
            type="date"
            name="start_date"
            value={filters.start_date}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
          />
           <input
            type="date"
            name="end_date"
            value={filters.end_date}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
          />
        </div>
      </Card>
      
      <Card>
        {loading ? (
          <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-700">
                <tr>
                  <th className="p-4 font-semibold">Timestamp</th>
                  <th className="p-4 font-semibold">Actor</th>
                  <th className="p-4 font-semibold">Event Type</th>
                  <th className="p-4 font-semibold">Resource</th>
                  <th className="p-4 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="border-b border-gray-700 hover:bg-gray-800">
                    <td className="p-4 whitespace-nowrap text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="p-4">{log.actor_username || log.actor_user_id}</td>
                    <td className="p-4"><span className="font-mono text-sm bg-gray-700/50 px-2 py-1 rounded">{log.event_type}</span></td>
                    <td className="p-4">{log.resource_type}: <span className="font-mono text-sm text-teal-400">{log.resource_id}</span></td>
                    <td className="p-4"><pre className="text-xs bg-gray-900 p-2 rounded max-w-xs overflow-x-auto"><code>{JSON.stringify(log.details, null, 2)}</code></pre></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AuditLogPage;
