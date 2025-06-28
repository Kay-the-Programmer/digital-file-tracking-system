
import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { UserUpdatePayload } from '../../types';

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

const ProfilePage: React.FC = () => {
    const { user, setUser } = useAuthStore();
    
    // State for profile details form
    const [profileData, setProfileData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        phone_number: user?.phone_number || '',
    });
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // State for password change form
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: '',
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    if (!user) {
        return <div className="text-center text-red-400">Could not load user profile.</div>;
    }
    
    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileMessage(null);
        try {
            const payload: UserUpdatePayload = {
                first_name: profileData.first_name,
                last_name: profileData.last_name,
                phone_number: profileData.phone_number,
            };
            const updatedUser = await api.updateUser(user.id, payload);
            setUser(updatedUser); // Update user in the store
            setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            setProfileMessage({ type: 'error', text: (err as Error).message });
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordLoading(true);
        setPasswordMessage(null);

        if (passwordData.new_password.length < 6) {
            setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
            setPasswordLoading(false);
            return;
        }

        if (passwordData.new_password !== passwordData.confirm_password) {
            setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
            setPasswordLoading(false);
            return;
        }

        try {
            const response = await api.changePassword(user.id, passwordData.current_password, passwordData.new_password);
            setPasswordMessage({ type: 'success', text: response.message });
            setPasswordData({ current_password: '', new_password: '', confirm_password: '' }); // Clear fields
        } catch (err) {
            setPasswordMessage({ type: 'error', text: (err as Error).message });
        } finally {
            setPasswordLoading(false);
        }
    };
    
    const allPermissions: Set<string> = new Set(user.roles.flatMap(role => role.permissions));

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">My Profile</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile & Password */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Profile Details Card */}
                    <Card>
                        <h2 className="text-xl font-semibold mb-4 text-white">Profile Details</h2>
                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField label="First Name" name="first_name" value={profileData.first_name} onChange={handleProfileChange} />
                                <InputField label="Last Name" name="last_name" value={profileData.last_name} onChange={handleProfileChange} />
                                <InputField label="Username (read-only)" name="username" value={user.username} readOnly />
                                <InputField label="Email (read-only)" name="email" value={user.email} readOnly />
                                <InputField label="Phone Number" name="phone_number" placeholder="Optional" value={profileData.phone_number} onChange={handleProfileChange} />
                            </div>

                            {profileMessage && (
                                <p className={`text-sm p-2 rounded-md ${profileMessage.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                                    {profileMessage.text}
                                </p>
                            )}

                            <div className="text-right pt-2">
                                <Button type="submit" isLoading={profileLoading}>Save Changes</Button>
                            </div>
                        </form>
                    </Card>

                    {/* Change Password Card */}
                    <Card>
                        <h2 className="text-xl font-semibold mb-4 text-white">Change Password</h2>
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                             <InputField label="Current Password" name="current_password" type="password" value={passwordData.current_password} onChange={handlePasswordChange} required />
                             <InputField label="New Password" name="new_password" type="password" value={passwordData.new_password} onChange={handlePasswordChange} required />
                             <InputField label="Confirm New Password" name="confirm_password" type="password" value={passwordData.confirm_password} onChange={handlePasswordChange} required />

                            {passwordMessage && (
                                <p className={`text-sm p-2 rounded-md ${passwordMessage.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                                    {passwordMessage.text}
                                </p>
                            )}

                            <div className="text-right pt-2">
                                <Button type="submit" isLoading={passwordLoading}>Update Password</Button>
                            </div>
                        </form>
                    </Card>
                </div>

                {/* Right Column: Roles & Permissions */}
                <div className="lg:col-span-1">
                    <Card>
                        <h2 className="text-xl font-semibold mb-4 text-white">Roles & Permissions</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-gray-300 mb-2">Assigned Roles</h3>
                                <div className="flex flex-wrap gap-2">
                                    {user.roles.length > 0 ? user.roles.map(role => (
                                        <span key={role.id} className="px-3 py-1 text-sm font-medium rounded-full bg-teal-600 text-teal-100">{role.name}</span>
                                    )) : <p className="text-gray-400 text-sm">No roles assigned.</p>}
                                </div>
                            </div>
                            
                            <div className="border-t border-gray-700 pt-4">
                                <h3 className="font-semibold text-gray-300 mb-2">Effective Permissions ({allPermissions.size})</h3>
                                <div className="max-h-[30rem] overflow-y-auto space-y-1 pr-2">
                                    {Array.from(allPermissions).sort().map(permission => (
                                        <div key={permission} className="px-2 py-1 bg-gray-700/50 rounded">
                                            <p className="font-mono text-xs text-gray-300">{permission}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
