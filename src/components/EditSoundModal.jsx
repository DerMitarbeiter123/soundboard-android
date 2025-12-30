import { useState } from 'react';
import clsx from 'clsx';

const COLORS = [
    '#2b8cee', // Primary Blue
    '#ef4444', // Red
    '#f97316', // Orange
    '#eab308', // Yellow
    '#10b981', // Green
    '#06b6d4', // Cyan
    '#8b5cf6', // Purple
];

const ICONS = [
    // Original icons
    'campaign', 'mic', 'notifications', 'warning', 'rocket_launch',
    'favorite', 'bolt', 'celebration', 'pets',
    // Music & Audio
    'music_note', 'album', 'headphones', 'speaker', 'radio',
    'piano', 'audiotrack', 'graphic_eq', 'equalizer', 'volume_up',
    // Voice & Sound
    'record_voice_over', 'spatial_audio', 'surround_sound', 'queue_music',
    // Fun & Games
    'sports_esports', 'videogame_asset', 'smart_toy', 'mood', 'sentiment_very_satisfied',
    // Nature
    'nature', 'forest', 'water_drop', 'thunderstorm', 'air',
    // Misc
    'star', 'auto_awesome', 'flare', 'whatshot', 'eco',
    'more_horiz'
];

export function EditSoundModal({ sound, onClose, onSave }) {
    const [name, setName] = useState(sound.name || '');
    const [color, setColor] = useState(sound.color || COLORS[0]);
    const [icon, setIcon] = useState(sound.icon || ICONS[0]);

    const handleSave = () => {
        if (!name.trim()) return;

        onSave(sound.id, {
            name: name.trim(),
            color,
            icon
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-md bg-background-light dark:bg-background-dark rounded-xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-slate-800">
                    <button onClick={onClose} className="text-primary text-sm font-medium">Cancel</button>
                    <h3 className="text-white font-bold">Edit Sound</h3>
                    <button onClick={handleSave} disabled={!name.trim()} className="text-primary text-sm font-bold disabled:opacity-50">Save</button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Preview Card */}
                    <div className="bg-surface-dark rounded-xl p-6 flex flex-col items-center justify-center border border-slate-800">
                        <div
                            className="size-16 rounded-xl flex items-center justify-center mb-3"
                            style={{ backgroundColor: color + '20', borderColor: color, borderWidth: 2 }}
                        >
                            <span className="material-symbols-outlined text-4xl" style={{ color }}>
                                {icon}
                            </span>
                        </div>
                        <p className="text-white font-bold text-lg">{name || 'Sound Name'}</p>
                        <p className="text-slate-500 text-xs mt-1">Preview of your changes</p>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-slate-400 text-xs font-bold mb-1.5 ml-1">Sound Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="e.g. Vine Boom"
                                className="w-full bg-surface-dark border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-400 text-xs font-bold mb-2 ml-1">Button Color</label>
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                {COLORS.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setColor(c)}
                                        className={clsx("size-10 rounded-full shrink-0 border-2 transition-all flex items-center justify-center", color === c ? "border-white scale-110" : "border-transparent")}
                                        style={{ backgroundColor: c }}
                                    >
                                        {color === c && <span className="material-symbols-outlined text-white text-sm">check</span>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-slate-400 text-xs font-bold mb-2 ml-1">Icon</label>
                            <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-1">
                                {ICONS.map(ic => (
                                    <button
                                        key={ic}
                                        onClick={() => setIcon(ic)}
                                        className={clsx("aspect-square rounded-lg flex items-center justify-center transition-all bg-surface-dark border", icon === ic ? "border-primary text-primary bg-primary/10" : "border-transparent text-slate-500 hover:text-slate-300")}
                                    >
                                        <span className="material-symbols-outlined">{ic}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
