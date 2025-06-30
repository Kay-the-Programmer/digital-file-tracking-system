import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fileService } from '../../services';
import { File as FileType, DigitalFileVersion, FileMovement, PhysicalLocation } from '../../types';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { ROUTES } from '../../constants';
import PermissionGuard from '../../components/auth/PermissionGuard';
import { useToast } from '../../context/ToastContext';

const DetailItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="font-semibold text-gray-100">{value}</p>
    </div>
);

const DigitalVersionHistory: React.FC<{ versions: DigitalFileVersion[] }> = ({ versions }) => {
    return (
        <Card>
            <h2 className="text-xl font-semibold mb-4 text-white">Version History</h2>
            <div className="space-y-4">
                {versions.map((v, index) => (
                    <div key={v.id} className="p-3 bg-gray-700/50 rounded-lg flex justify-between items-center">
                        <div>
                            <p className="font-bold">
                                Version {v.version_number}
                                {index === 0 && <span className="ml-2 text-xs font-normal text-teal-400 bg-teal-900/50 px-2 py-1 rounded-full">Latest</span>}
                            </p>
                            <p className="text-sm text-gray-400">Uploaded by: {v.uploaded_by_email}</p>
                            <p className="text-xs text-gray-500 mt-1">{(v.file_size / 1024 / 1024).toFixed(2)} MB - {v.mime_type}</p>
                        </div>
                        <PermissionGuard permission="file:download">
                            <a href={v.storage_path} download>
                                <Button size="sm">Download</Button>
                            </a>
                        </PermissionGuard>
                    </div>
                ))}
            </div>
        </Card>
    );
};

const PhysicalMovementHistory: React.FC<{ movements: FileMovement[] }> = ({ movements }) => (
    <Card>
        <h2 className="text-xl font-semibold mb-4 text-white">Movement History</h2>
        {movements.length > 0 ? (
            <div className="space-y-4">
                {movements.map(m => (
                    <div key={m.id} className="p-3 bg-gray-700/50 rounded-lg">
                        <p className="font-semibold">Moved from <span className="text-orange-400">{m.from_location_name}</span> to <span className="text-green-400">{m.to_location_name}</span></p>
                        <p className="text-sm text-gray-400">By: {m.moved_by_username} on {new Date(m.moved_at).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-500 mt-1">Reason: {m.reason}</p>
                    </div>
                ))}
            </div>
        ) : <p className="text-gray-500">No movement history recorded.</p>}
    </Card>
);

const FileDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [file, setFile] = useState<FileType | null>(null);
    const [locations, setLocations] = useState<PhysicalLocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isMoveModalOpen, setMoveModalOpen] = useState(false);
    const [isUploadConfirmModalOpen, setUploadConfirmModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<globalThis.File | null>(null);

    const [newLocationId, setNewLocationId] = useState('');
    const [moveReason, setMoveReason] = useState('');

    // --- FIX: Add a ref for the file input element ---
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchData = async () => {
        if (id) {
            try {
                setLoading(true);
                setError(null);
                const data = await fileService.getById(id);
                if (data) {
                    setFile(data);
                    if (data.file_type === 'PHYSICAL') {
                        const locData = await fileService.getAllLocations();
                        setLocations(locData);
                    }
                } else {
                    setError("File not found.");
                }
            } catch (err) {
                console.error("Failed to fetch file details", err);
                setError("Failed to load file details.");
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleDelete = async () => {
        if (!file) return;
        setIsProcessing(true);
        try {
            await fileService.delete(file.id);
            setDeleteModalOpen(false);
            navigate(ROUTES.FILES);
        } catch(err) {
            setError("Failed to delete file.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleMoveFile = async () => {
        if (!file || !newLocationId || !moveReason) {
            setError("Please select a location and provide a reason.");
            return;
        }
        setIsProcessing(true);
        setError(null);
        try {
            await fileService.movePhysicalFile(file.id, newLocationId, moveReason);
            setMoveModalOpen(false);
            setNewLocationId('');
            setMoveReason('');
            await fetchData(); // Refresh data
        } catch(err) {
            setError((err as Error).message);
        } finally {
            setIsProcessing(false);
        }
    };

    const confirmUpload = async () => {
        if (!file || !selectedFile) return;

        setIsUploading(true);
        setUploadError(null);
        setUploadConfirmModalOpen(false);

        try {
            await fileService.uploadDigitalFile(file.id, selectedFile);
            await fetchData(); // Refresh the file data to show the new version

            // Reset the file input value after successful upload
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            // Clear the selected file
            setSelectedFile(null);

            // Show success toast notification
            showToast(`New version of ${file.title} uploaded successfully!`, 'success');
        } catch (err) {
            console.error('Failed to upload new version:', err);
            const errorMessage = (err as Error).message || 'Failed to upload new version';
            setUploadError(errorMessage);

            // Show error toast notification
            showToast(`Upload failed: ${errorMessage}`, 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileSelected = (file: globalThis.File) => {
        setSelectedFile(file);
        setUploadConfirmModalOpen(true);
    };


    if (loading) {
        return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>;
    }

    if (error || !file) {
        return <div className="text-center text-xl text-red-400">{error || 'File not found.'}</div>;
    }

    const isDigital = file.file_type === 'DIGITAL';

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold truncate">{file.title}</h1>
                <div className="flex items-center space-x-2">
                    <PermissionGuard permission="file:update">
                        <Link to={ROUTES.EDIT_FILE.replace(':id', file.id)}>
                            <Button variant="secondary">Edit</Button>
                        </Link>
                    </PermissionGuard>
                    <PermissionGuard permission="file:delete">
                        <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>Delete</Button>
                    </PermissionGuard>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-semibold mb-2 text-white">File Details</h2>
                                <p className="text-gray-400 mb-4">{file.description}</p>
                            </div>
                            <span className={`px-3 py-1 text-sm font-semibold rounded-full whitespace-nowrap ${
                                isDigital ? 'bg-blue-600 text-blue-100' : 'bg-orange-600 text-orange-100'
                            }`}>
                      {file.file_type}
                    </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 border-t border-gray-700 pt-4">
                            <DetailItem label="File ID" value={<span className="font-mono text-sm">{file.id}</span>} />
                            <DetailItem label="Created By" value={file.created_by_email} />
                            <DetailItem label="Created At" value={new Date(file.created_at).toLocaleString()} />
                            <DetailItem label="Last Updated" value={new Date(file.updated_at).toLocaleString()} />
                            {file.file_type === 'PHYSICAL' && (
                                <DetailItem label="Current Location" value={file.current_location_name || 'N/A'} />
                            )}
                            <DetailItem
                                label="Associated Case"
                                value={file.current_case ? <Link to={`/cases/${file.current_case}`} className="text-teal-400 hover:underline font-mono text-sm">{file.current_case}</Link> : 'N/A'}
                            />
                        </div>
                    </Card>

                    {isDigital && file.versions && file.versions.length > 0 && <DigitalVersionHistory versions={file.versions} />}
                    {file.file_type === 'PHYSICAL' && file.file_movements && <PhysicalMovementHistory movements={file.file_movements} />}
                </div>

                <div className="space-y-6">
                    <Card>
                        <h2 className="text-xl font-semibold mb-4">Actions</h2>
                        <div className="space-y-3">
                            <PermissionGuard permission="file:move">
                                <Button variant="secondary" size="md" className="w-full mb-2" disabled={isDigital} onClick={() => setMoveModalOpen(true)}>Log Physical Move</Button>
                            </PermissionGuard>
                            {isDigital && (
                                <PermissionGuard permission="file:update">
                                    {uploadError && (
                                        <div className="text-sm text-red-400 bg-red-900/50 p-2 rounded-md mb-2">
                                            {uploadError}
                                        </div>
                                    )}
                                    {/* --- FIX: Use a ref to programmatically trigger the click --- */}
                                    <input
                                        type="file"
                                        id="file-upload"
                                        ref={fileInputRef} // Attach the ref
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                handleFileSelected(e.target.files[0]);
                                            }
                                        }}
                                        disabled={isUploading}
                                    />
                                    {/* Remove the label and add an onClick to the button */}
                                    <Button
                                        variant="primary"
                                        className="w-full"
                                        isLoading={isUploading}
                                        disabled={isUploading}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {isUploading ? 'Uploading...' : 'Upload New Version'}
                                    </Button>
                                </PermissionGuard>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Delete File</h2>
                        <p className="text-gray-300 mb-6">Are you sure you want to delete file <span className="font-bold">{file.title}</span>? This action cannot be undone.</p>
                        <div className="flex justify-end space-x-4">
                            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)} disabled={isProcessing}>Cancel</Button>
                            <Button variant="danger" onClick={handleDelete} isLoading={isProcessing}>Delete</Button>
                        </div>
                    </Card>
                </div>
            )}

            {isMoveModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-lg">
                        <h2 className="text-xl font-bold mb-4">Move Physical File</h2>
                        {error && <p className="text-sm text-red-400 bg-red-900/50 p-3 rounded-md mb-4">{error}</p>}
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="new_location" className="block text-sm font-medium text-gray-300 mb-1">New Location</label>
                                <select id="new_location" value={newLocationId} onChange={e => setNewLocationId(e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
                                    <option value="" disabled>Select a location</option>
                                    {locations.filter(l => l.id !== file.current_location).map(loc => (
                                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="move_reason" className="block text-sm font-medium text-gray-300 mb-1">Reason for Move</label>
                                <textarea id="move_reason" value={moveReason} onChange={e => setMoveReason(e.target.value)} rows={3}
                                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"/>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-4 mt-6">
                            <Button variant="secondary" onClick={() => setMoveModalOpen(false)} disabled={isProcessing}>Cancel</Button>
                            <Button onClick={handleMoveFile} isLoading={isProcessing}>Confirm Move</Button>
                        </div>
                    </Card>
                </div>
            )}

            {isUploadConfirmModalOpen && selectedFile && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Upload New Version</h2>
                        <p className="text-gray-300 mb-6">
                            Are you sure you want to upload <span className="font-bold">{selectedFile.name}</span> as a new version of this file?
                        </p>
                        <div className="flex justify-end space-x-4">
                            <Button 
                                variant="secondary" 
                                onClick={() => {
                                    setUploadConfirmModalOpen(false);
                                    setSelectedFile(null);
                                    if (fileInputRef.current) {
                                        fileInputRef.current.value = '';
                                    }
                                }} 
                                disabled={isUploading}
                            >
                                Cancel
                            </Button>
                            <Button 
                                variant="primary" 
                                onClick={confirmUpload} 
                                isLoading={isUploading}
                            >
                                Upload
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default FileDetailsPage;
