import { useState } from 'react';
import { useSoundStore } from '../hooks/useSoundStore';
import clsx from 'clsx';

export function LibraryView({ onPlay }) {
    const { sounds, toggleFavorite, deleteSound } = useSoundStore();
    const [filter, setFilter] = useState('');

    const filteredSounds = sounds.filter(s => s.name.toLowerCase().includes(filter.toLowerCase()));

    return (
        <div className="flex flex-col h-full bg-background-dark">
            {/* Search within Library */}
            <div className="px-4 py-2">
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">search</span>
                    <input
                        type="text"
                        placeholder="Search sounds..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full bg-surface-dark border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary placeholder-slate-600 transition-colors"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-24">
                {filteredSounds.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                        <span className="material-symbols-outlined text-4xl mb-2">music_off</span>
                        <p className="text-sm">No sounds found</p>
                    </div>
                ) : (
                    <div className="space-y-2 mt-2">
                        {filteredSounds.map(sound => (
                            <div key={sound.id} className="flex items-center gap-3 p-3 bg-surface-dark rounded-xl border border-transparent hover:border-slate-700 transition-colors group">
                                <button
                                    onClick={() => onPlay(sound)}
                                    className="size-10 rounded-full bg-slate-800 shrink-0 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors"
                                >
                                    <span className="material-symbols-outlined text-xl">play_arrow</span>
                                </button>

                                <div className="flex-1 min-w-0">
                                    <h4 className="text-white text-sm font-bold truncate">{sound.name}</h4>
                                    <p className="text-slate-500 text-xs">
                                        {sound.duration ? `${sound.duration}s` : 'Unknown'} • Added recently
                                    </p>
                                </div>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => toggleFavorite(sound.id)}
                                        className={clsx("size-8 rounded-full flex items-center justify-center transition-colors", sound.isFavorite ? "text-red-500" : "text-slate-600 hover:text-white")}
                                    >
                                        <span className={clsx("material-symbols-outlined text-xl", sound.isFavorite && "filled")}>favorite</span>
                                    </button>
                                    <button
                                        onClick={() => deleteSound(sound.id)}
                                        className="size-8 rounded-full flex items-center justify-center text-slate-600 hover:text-red-500 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-xl">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
