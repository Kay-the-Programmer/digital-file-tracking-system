

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Case, CaseStatus } from '../../types';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { ROUTES, ICONS } from '../../constants';
import PermissionGuard from '../../components/auth/PermissionGuard';

const getStatusColor = (status: CaseStatus) => {
    switch(status) {
        case CaseStatus.OPEN: return 'bg-blue-600 text-blue-100';
        case CaseStatus.IN_PROGRESS: return 'bg-indigo-600 text-indigo-100';
        case CaseStatus.PENDING_APPROVAL: return 'bg-yellow-600 text-yellow-100';
        case CaseStatus.APPROVED: return 'bg-green-600 text-green-100';
        case CaseStatus.REJECTED: return 'bg-red-600 text-red-100';
        case CaseStatus.CLOSED: return 'bg-gray-600 text-gray-100';
        default: return 'bg-gray-500';
    }
}

const CaseListPage: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [caseToDelete, setCaseToDelete] = useState<Case | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchCases = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.fetchCases();
      setCases(data);
    } catch (error) {
      console.error("Failed to fetch cases", error);
      setError("Failed to load cases.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);
  
  const openDeleteModal = (caseItem: Case) => {
    setCaseToDelete(caseItem);
    setIsModalOpen(true);
  };

  const closeDeleteModal = () => {
    setCaseToDelete(null);
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    if (!caseToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteCase(caseToDelete.id);
      closeDeleteModal();
      await fetchCases(); // Refresh list
    } catch (err) {
      setError("Failed to delete case.");
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };
  
  const uniqueCaseTypes = useMemo(() => {
    if (!cases) return [];
    const types = new Set(cases.map(c => c.case_type));
    return Array.from(types);
  }, [cases]);

  const filteredCases = useMemo(() => {
    if (!cases) return [];
    let filtered = cases;

    if (filterType !== 'all') {
      filtered = filtered.filter(caseItem => caseItem.case_type === filterType);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(caseItem => caseItem.status === filterStatus);
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        caseItem =>
          caseItem.title.toLowerCase().includes(lowerCaseSearchTerm) ||
          (caseItem.description && caseItem.description.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }
    return filtered;
  }, [cases, filterType, filterStatus, searchTerm]);


  const renderContent = () => {
    if (loading) {
        return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
    }
    if (error) {
        return <div className="text-center py-10 text-red-400 bg-red-900/30 rounded-lg">{error}</div>;
    }
    if (filteredCases.length === 0) {
        return <div className="text-center py-10 text-gray-500">No cases found matching your criteria.</div>;
    }
    return (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-700">
              <tr>
                <th className="p-4 font-semibold">Title</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Case Type</th>
                <th className="p-4 font-semibold">Initiated By</th>
                <th className="p-4 font-semibold">Last Updated</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map(caseItem => (
                <tr key={caseItem.id} className="border-b border-gray-700 hover:bg-gray-800">
                  <td className="p-4 font-medium">
                    <Link to={`/cases/${caseItem.id}`} className="text-teal-400 hover:underline">
                      {caseItem.title}
                    </Link>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(caseItem.status)}`}>
                        {caseItem.status}
                    </span>
                  </td>
                  <td className="p-4">{caseItem.case_type}</td>
                  <td className="p-4">{caseItem.initiated_by_username}</td>
                  <td className="p-4">{new Date(caseItem.updated_at).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                        <PermissionGuard permission="case:update">
                            <Link to={ROUTES.EDIT_CASE.replace(':id', caseItem.id)}>
                                <Button variant="secondary" size="sm">Edit</Button>
                            </Link>
                        </PermissionGuard>
                        <PermissionGuard permission="case:delete">
                            <Button variant="danger" size="sm" onClick={() => openDeleteModal(caseItem)}>Delete</Button>
                        </PermissionGuard>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Case Management</h1>
        <PermissionGuard permission="case:create">
            <Link to={ROUTES.CREATE_CASE}>
            <Button>Create New Case</Button>
            </Link>
        </PermissionGuard>
      </div>
      
      <Card>
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4 p-4 bg-gray-800 rounded-lg">
          <input
            type="text"
            placeholder="Search cases..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
          />
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="w-full sm:w-auto bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            >
              <option value="all">All Case Types</option>
              {uniqueCaseTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full sm:w-auto bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            >
              <option value="all">All Statuses</option>
              {Object.values(CaseStatus).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
        {renderContent()}
      </Card>
      
      {isModalOpen && caseToDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Delete Case</h2>
            <p className="text-gray-300 mb-6">Are you sure you want to delete case <span className="font-bold">{caseToDelete.title}</span>? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <Button variant="secondary" onClick={closeDeleteModal} disabled={isDeleting}>Cancel</Button>
              <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>Delete</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CaseListPage;