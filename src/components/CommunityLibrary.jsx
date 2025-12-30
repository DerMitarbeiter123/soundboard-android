import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '../hooks/useUser';
import { useSoundStore } from '../hooks/useSoundStore';
import { ConfirmDialog } from './ConfirmDialog';
import clsx from 'clsx';

export function CommunityLibrary({ onBack }) {
    const { user } = useUser();
    const { addSound } = useSoundStore();
    const [sounds, setSounds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'newest'
    const [searchQuery, setSearchQuery] = useState('');
    const [playingId, setPlayingId] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const audioRef = useRef(null);

    useEffect(() => {
        loadSounds();
    }, [sortBy]);

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const loadSounds = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('shared_sounds')
                .select(`
                    *,
                    profiles (username)
                `);

            // Apply sorting
            if (sortBy === 'popular') {
                query = query.order('download_count', { ascending: false });
            } else {
                query = query.order('created_at', { ascending: false });
            }

            const { data, error } = await query.limit(50);

            if (error) throw error;
            setSounds(data || []);
        } catch (err) {
            console.error('Error loading sounds:', err);
            setSounds([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePreview = async (sound) => {
        // Stop currently playing audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        // If clicking the same sound, just stop
        if (playingId === sound.id) {
            setPlayingId(null);
            return;
        }

        try {
            // Get public URL for streaming
            const { data } = supabase.storage
                .from('shared-sounds')
                .getPublicUrl(sound.file_path);

            if (!data?.publicUrl) {
                throw new Error('Could not get public URL');
            }

            const audio = new Audio(data.publicUrl);
            audio.onended = () => {
                setPlayingId(null);
                audioRef.current = null;
            };
            audio.onerror = () => {
                console.error('Audio playback error');
                setPlayingId(null);
                audioRef.current = null;
            };

            audioRef.current = audio;
            await audio.play();
            setPlayingId(sound.id);
        } catch (err) {
            console.error('Preview error:', err);
            alert('Failed to preview sound');
        }
    };

    const handleDownload = async (sound) => {
        try {
            // Download the audio file
            const { data: fileData, error: downloadError } = await supabase
                .storage
                .from('shared-sounds')
                .download(sound.file_path);

            if (downloadError) throw downloadError;

            // Add to personal library
            await addSound({
                name: sound.name,
                color: sound.color || '#2b8cee',
                icon: sound.icon || 'campaign',
                duration: sound.duration || 0
            }, fileData);

            // Increment download count
            await supabase
                .from('shared_sounds')
                .update({ download_count: (sound.download_count || 0) + 1 })
                .eq('id', sound.id);

            // Reload to show updated count
            loadSounds();

            alert('Sound added to your library!');
        } catch (err) {
            console.error('Download error:', err);
            alert('Failed to download sound: ' + err.message);
        }
    };

    const handleDeleteShared = async (sound) => {
        try {
            // Delete from storage
            const { error: storageError } = await supabase.storage
                .from('shared-sounds')
                .remove([sound.file_path]);

            if (storageError) {
                console.warn('Storage delete warning:', storageError);
                // Continue anyway - file might already be gone
            }

            // Delete from database
            const { error: dbError } = await supabase
                .from('shared_sounds')
                .delete()
                .eq('id', sound.id);

            if (dbError) throw dbError;

            // Refresh list
            loadSounds();
            setDeleteConfirm(null);
        } catch (err) {
            console.error('Delete error:', err);
            alert('Failed to delete sound: ' + err.message);
        }
    };

    const filteredSounds = searchQuery
        ? sounds.filter(s =>
            s.profiles?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : sounds;

    const isOwner = (sound) => user && sound.user_id === user.id;

    return (
        <div className="flex flex-col h-full bg-background-dark">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <button onClick={onBack} className="flex items-center text-primary text-sm font-medium gap-1">
                    <span className="material-symbols-outlined text-lg">arrow_back_ios</span>
                    Back
                </button>
                <h2 className="text-white font-bold text-lg">Community</h2>
                <div className="w-16"></div>
            </div>

            {/* Search & Filters */}
            <div className="p-4 space-y-3 border-b border-slate-800">
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">search</span>
                    <input
                        type="text"
                        placeholder="Search by username or sound name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-surface-dark border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary placeholder-slate-600 transition-colors"
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setSortBy('popular')}
                        className={clsx(
                            "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors",
                            sortBy === 'popular'
                                ? "bg-primary text-white"
                                : "bg-surface-dark text-slate-400 hover:text-white"
                        )}
                    >
                        🔥 Popular
                    </button>
                    <button
                        onClick={() => setSortBy('newest')}
                        className={clsx(
                            "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors",
                            sortBy === 'newest'
                                ? "bg-primary text-white"
                                : "bg-surface-dark text-slate-400 hover:text-white"
                        )}
                    >
                        ✨ Newest
                    </button>
                </div>
            </div>

            {/* Sounds List */}
            <div className="flex-1 overflow-y-auto p-4 pb-24">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-slate-400">Loading sounds...</p>
                        </div>
                    </div>
                ) : filteredSounds.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                        <span className="material-symbols-outlined text-5xl mb-2">cloud_off</span>
                        <p className="text-sm">No sounds found</p>
                        <p className="text-xs mt-1">Be the first to share!</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredSounds.map(sound => (
                            <div key={sound.id} className={clsx(
                                "bg-surface-dark rounded-xl p-4 border transition-colors",
                                isOwner(sound) ? "border-primary/30" : "border-slate-800 hover:border-slate-700"
                            )}>
                                <div className="flex items-start gap-3">
                                    <div
                                        className="size-12 rounded-lg shrink-0 flex items-center justify-center text-white"
                                        style={{ backgroundColor: sound.color || '#2b8cee' }}
                                    >
                                        <span className="material-symbols-outlined text-2xl">
                                            {sound.icon || 'campaign'}
                                        </span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-white font-bold text-sm truncate">{sound.name}</h4>
                                            {isOwner(sound) && (
                                                <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">You</span>
                                            )}
                                        </div>
                                        <p className="text-slate-400 text-xs mt-0.5">
                                            by {sound.profiles?.username || 'Unknown'}
                                        </p>
                                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">download</span>
                                                {sound.download_count || 0}
                                            </span>
                                            <span>
                                                {new Date(sound.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        {/* Preview/Play Button */}
                                        <button
                                            onClick={() => handlePreview(sound)}
                                            className={clsx(
                                                "size-10 rounded-full flex items-center justify-center transition-colors active:scale-95",
                                                playingId === sound.id
                                                    ? "bg-red-500 hover:bg-red-600 text-white"
                                                    : "bg-slate-700 hover:bg-slate-600 text-white"
                                            )}
                                        >
                                            <span className="material-symbols-outlined text-xl">
                                                {playingId === sound.id ? 'stop' : 'play_arrow'}
                                            </span>
                                        </button>

                                        {/* Download Button */}
                                        <button
                                            onClick={() => handleDownload(sound)}
                                            className="size-10 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center text-white transition-colors active:scale-95"
                                        >
                                            <span className="material-symbols-outlined text-xl">download</span>
                                        </button>

                                        {/* Owner Actions */}
                                        {isOwner(sound) && (
                                            <button
                                                onClick={() => setDeleteConfirm(sound)}
                                                className="size-10 rounded-full bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center text-red-500 transition-colors active:scale-95"
                                            >
                                                <span className="material-symbols-outlined text-xl">delete</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            {deleteConfirm && (
                <ConfirmDialog
                    title="Delete from Community?"
                    message={`Are you sure you want to remove "${deleteConfirm.name}" from the community library? This cannot be undone.`}
                    confirmText="Delete"
                    cancelText="Cancel"
                    onConfirm={() => handleDeleteShared(deleteConfirm)}
                    onCancel={() => setDeleteConfirm(null)}
                />
            )}
        </div>
    );
}
