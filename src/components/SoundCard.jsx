import { useState, useRef } from 'react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { SoundCardContextMenu } from './SoundCardContextMenu';

export function SoundCard({ sound, isPlaying, isEditing, onClick, onDelete, onShare, onEdit }) {
    const [showMenu, setShowMenu] = useState(false);
    const longPressTimer = useRef(null);
    const [isLongPress, setIsLongPress] = useState(false);

    const iconName = sound.icon || 'campaign';
    const borderColor = sound.color || '#2b8cee';

    const handleTouchStart = (e) => {
        if (isEditing) return;

        setIsLongPress(false);
        longPressTimer.current = setTimeout(() => {
            setIsLongPress(true);
            setShowMenu(true);
            // Haptic feedback if available
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
        }, 500);
    };

    const handleTouchEnd = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
        }
    };

    const handleClick = (e) => {
        if (isLongPress) {
            e.preventDefault();
            e.stopPropagation();
            setIsLongPress(false);
            return;
        }
        onClick();
    };

    return (
        <>
            <motion.button
                whileTap={!isLongPress ? { scale: 0.95 } : {}}
                className={clsx(
                    "group relative flex flex-col items-center justify-between gap-4 rounded-xl bg-surface-dark p-4 aspect-square border transition-all touch-manipulation",
                    isPlaying ? "border-2 shadow-lg shadow-primary/20" : "border-transparent hover:border-slate-700",
                    isEditing && "animate-shake border-red-500/50 border-dashed"
                )}
                style={{
                    borderColor: isPlaying ? borderColor : undefined,
                }}
                onClick={handleClick}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
                onMouseDown={handleTouchStart}
                onMouseUp={handleTouchEnd}
                onMouseLeave={handleTouchEnd}
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

            <AnimatePresence>
                {showMenu && (
                    <SoundCardContextMenu
                        sound={sound}
                        onShare={() => onShare && onShare(sound)}
                        onEdit={() => onEdit && onEdit(sound)}
                        onDelete={() => onDelete(sound.id)}
                        onClose={() => setShowMenu(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
