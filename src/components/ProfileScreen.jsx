import { useState } from 'react';
import { useUser } from '../hooks/useUser';
import clsx from 'clsx';

export function ProfileScreen({ onBack }) {
    const { user, updateProfile } = useUser();
    const [isEditing, setIsEditing] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!newUsername.trim() || newUsername === user?.username) {
            setIsEditing(false);
            return;
        }

        setSaving(true);
        const result = await updateProfile({ username: newUsername.trim() });
        setSaving(false);

        if (result.success) {
            setIsEditing(false);
        } else {
            alert('Failed to update username: ' + result.error);
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-full bg-background-dark">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background-dark">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <button onClick={onBack} className="flex items-center text-primary text-sm font-medium gap-1">
                    <span className="material-symbols-outlined text-lg">arrow_back_ios</span>
                    Back
                </button>
                <h2 className="text-white font-bold text-lg">Profile</h2>
                <div className="w-16"></div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {/* Profile Avatar */}
                <div className="flex flex-col items-center mb-8 mt-4">
                    <div className="size-24 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
                        <span className="material-symbols-outlined text-5xl text-white">person</span>
                    </div>
                    <h3 className="text-white text-2xl font-bold">{user.username}</h3>
                    <p className="text-slate-500 text-xs mt-1">User ID: {user.id.slice(0, 8)}...</p>
                </div>

                {/* Username Section */}
                <div className="bg-surface-dark rounded-xl p-4 mb-4 border border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-semibold text-sm">Username</h4>
                        {!isEditing && (
                            <button
                                onClick={() => {
                                    setNewUsername(user.username);
                                    setIsEditing(true);
                                }}
                                className="text-primary text-sm font-medium"
                            >
                                Edit
                            </button>
                        )}
                    </div>

                    {isEditing ? (
                        <div className="space-y-3">
                            <input
                                type="text"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                placeholder="Enter new username"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-primary transition-colors"
                                maxLength={20}
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className={clsx(
                                        "flex-1 py-2 rounded-lg font-medium transition-colors",
                                        saving ? "bg-slate-700 text-slate-500" : "bg-primary text-white hover:bg-primary/90"
                                    )}
                                >
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    disabled={saving}
                                    className="flex-1 py-2 rounded-lg font-medium bg-slate-800 text-white hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-slate-300">{user.username}</p>
                    )}
                </div>

                {/* Stats */}
                <div className="bg-surface-dark rounded-xl p-4 border border-slate-800">
                    <h4 className="text-white font-semibold text-sm mb-3">Stats</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-slate-400 text-sm">Shared Sounds</span>
                            <span className="text-white font-medium">0</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400 text-sm">Total Downloads</span>
                            <span className="text-white font-medium">0</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400 text-sm">Member Since</span>
                            <span className="text-white font-medium">
                                {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Today'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
