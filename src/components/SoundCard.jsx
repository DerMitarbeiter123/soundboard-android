import clsx from 'clsx';
import { motion } from 'framer-motion';

export function SoundCard({ sound, isPlaying, isEditing, onClick, onDelete }) {

    // Fallback icon
    const iconName = sound.icon || 'campaign';

    // Resolve color (hex or class) - we stored hex in AddSoundModal.
    // We can use inline styles for the border color to match "Group Relative" 
    const borderColor = sound.color || '#2b8cee';

    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            className={clsx(
                "group relative flex flex-col items-center justify-between gap-4 rounded-xl bg-surface-dark p-4 aspect-square border transition-all",
                isPlaying ? "border-2 shadow-lg shadow-primary/20" : "border-transparent hover:border-slate-700",
                isEditing && "animate-shake border-red-500/50 border-dashed"
            )}
            style={{
                borderColor: isPlaying ? borderColor : undefined,
            }}
            onClick={onClick}
        >
            {/* Delete Badge */}
            {isEditing && (
                <div
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md z-10"
                    onClick={(e) => { e.stopPropagation(); onDelete(sound.id); }}
                >
                    <span className="material-symbols-outlined text-sm font-bold block">close</span>
                </div>
            )}

            {/* Visualizer (Only visible when playing) */}
            {isPlaying && (
                <div className="absolute top-3 right-3 flex space-x-0.5 items-end h-4">
                    <div className="w-1 bg-primary animate-bounce-1 h-2 rounded-full" style={{ backgroundColor: borderColor }}></div>
                    <div className="w-1 bg-primary animate-bounce-2 h-4 rounded-full" style={{ backgroundColor: borderColor }}></div>
                    <div className="w-1 bg-primary animate-bounce-3 h-3 rounded-full" style={{ backgroundColor: borderColor }}></div>
                </div>
            )}

            <div className="flex-1 flex items-center justify-center">
                <span
                    className={clsx("material-symbols-outlined text-5xl transition-colors", isPlaying ? "text-primary" : "text-slate-500 group-hover:text-white")}
                    style={{ color: isPlaying ? borderColor : undefined }}
                >
                    {iconName}
                </span>
            </div>

            <p className="text-white text-base font-bold w-full text-center truncate select-none">
                {sound.name}
            </p>
        </motion.button>
    );
}
