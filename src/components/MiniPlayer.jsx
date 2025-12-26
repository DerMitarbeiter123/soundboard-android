import clsx from 'clsx';
import { useSoundStore } from '../hooks/useSoundStore';

export function MiniPlayer({ playingId, onStop }) {
    const { sounds } = useSoundStore();

    const sound = sounds.find(s => s.id === playingId);

    if (!sound) {
        // Render empty or invisible? Design shows it persistent, so maybe show "Ready"
        // But user design shows a track: "Air Horn".
        // We'll hide it if nothing is playing or selected, or show placeholder.
        return null;
    }

    return (
        <div className="px-4 pb-2 pt-2 border-t border-slate-800 bg-surface-dark/95 backdrop-blur-sm relative z-40">
            <div className="flex items-center gap-3 overflow-hidden rounded-lg bg-[#283039] p-2 pr-4 shadow-sm">
                {/* Album Art / Icon */}
                <div className="flex items-center justify-center rounded-lg size-10 shrink-0 bg-primary/20 text-primary">
                    <span className="material-symbols-outlined text-xl">{sound.icon || 'music_note'}</span>
                </div>

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-bold leading-tight truncate">{sound.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="h-1 flex-1 rounded-full bg-slate-600 overflow-hidden">
                            <div className="h-full w-full bg-primary rounded-full animate-progress-indeterminate"></div>
                        </div>
                        <p className="text-[#9dabb9] text-[10px] font-medium leading-normal truncate">Playing</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={onStop}
                        className="flex shrink-0 items-center justify-center rounded-full size-8 text-white hover:bg-white/10"
                    >
                        <span className="material-symbols-outlined text-xl">pause</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
