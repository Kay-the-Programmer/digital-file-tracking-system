
import React from 'react';
import { Link } from 'react-router-dom';
import { File } from '../../types';
import { ICONS, ROUTES } from '../../constants';
import PermissionGuard from '../auth/PermissionGuard';
import Button from '../ui/Button';

interface FileListItemProps {
  file: File;
  onDelete: (file: File) => void;
}

const FileListItem: React.FC<FileListItemProps> = ({ file, onDelete }) => {
  const isDigital = file.file_type === 'DIGITAL';

  return (
    <tr className="border-b border-gray-700 hover:bg-gray-800 transition-colors duration-200">
      <td className="p-4">
        <div className="flex items-center">
            {isDigital ? <ICONS.FILES className="h-5 w-5 mr-3 text-blue-400" /> : <ICONS.PHYSICAL_FILE className="h-5 w-5 mr-3 text-orange-400" />}
            <Link to={`/files/${file.id}`} className="font-medium text-teal-400 hover:underline">
              {file.title}
            </Link>
        </div>
      </td>
      <td className="p-4">
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
            isDigital ? 'bg-blue-600 text-blue-100' : 'bg-orange-600 text-orange-100'
        }`}>
            {file.file_type}
        </span>
      </td>
      <td className="p-4 text-gray-300">
        {file.current_location_name || 'N/A'}
      </td>
      <td className="p-4 text-gray-400">
        {new Date(file.updated_at).toLocaleString()}
      </td>
      <td className="p-4 text-right">
        <div className="flex items-center justify-end space-x-2">
            <PermissionGuard permission="file:update">
                <Link to={ROUTES.EDIT_FILE.replace(':id', file.id)}>
                    <Button variant="secondary" size="sm">Edit</Button>
                </Link>
            </PermissionGuard>
            <PermissionGuard permission="file:delete">
                <Button variant="danger" size="sm" onClick={() => onDelete(file)}>Delete</Button>
            </PermissionGuard>
        </div>
      </td>
    </tr>
  );
};

export default FileListItem;
