
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { File } from '../../types';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import FileListItem from '../../components/Files/FileListItem';
import { ROUTES } from '../../constants';
import PermissionGuard from '../../components/auth/PermissionGuard';

const FileListPage: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'digital' | 'physical'>('all');
  const [fileToDelete, setFileToDelete] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.fetchFiles();
      setFiles(data);
    } catch (err) {
      console.error("Failed to fetch files", err);
      setError("Could not load files. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const openDeleteModal = (file: File) => {
    setFileToDelete(file);
    setIsModalOpen(true);
  };

  const closeDeleteModal = () => {
    setFileToDelete(null);
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    if (!fileToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteFile(fileToDelete.id);
      closeDeleteModal();
      await fetchFiles(); // Refresh the list
    } catch (err) {
      setError("Failed to delete file.");
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredFiles = useMemo(() => {
    return files
      .filter(file => filterType === 'all' || file.file_type === filterType)
      .filter(file => file.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [files, searchTerm, filterType]);

  const renderContent = () => {
    if (loading) {
        return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
    }
    if (error) {
        return <div className="text-center py-10 text-red-400 bg-red-900/30 rounded-lg">{error}</div>;
    }
    if (filteredFiles.length === 0) {
        return <div className="text-center py-10 text-gray-500">No files found matching your criteria.</div>;
    }
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
            <thead className="bg-gray-700">
                <tr>
                <th className="p-4 font-semibold">Title</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Current Location</th>
                <th className="p-4 font-semibold">Last Updated</th>
                <th className="p-4 font-semibold">Actions</th>
                </tr>
            </thead>
            <tbody>
                {filteredFiles.map(file => (
                    <FileListItem key={file.id} file={file} onDelete={() => openDeleteModal(file)} />
                ))}
            </tbody>
            </table>
        </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">File Management</h1>
        <PermissionGuard permission="file:create">
            <Link to={ROUTES.CREATE_FILE}>
                <Button>Create New File</Button>
            </Link>
        </PermissionGuard>
      </div>
      
      <Card>
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <input
            type="text"
            placeholder="Search files by title..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
          />
          <div className="flex items-center space-x-2">
            <span className="text-gray-300">Filter by type:</span>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value as 'all' | 'digital' | 'physical')}
              className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            >
              <option value="all">All</option>
              <option value="digital">Digital</option>
              <option value="physical">Physical</option>
            </select>
          </div>
        </div>
        {renderContent()}
      </Card>
      
      {isModalOpen && fileToDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Delete File</h2>
            <p className="text-gray-300 mb-6">Are you sure you want to delete file <span className="font-bold">{fileToDelete.title}</span>? This action cannot be undone.</p>
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

export default FileListPage;
