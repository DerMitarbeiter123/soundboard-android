import { useSoundStore } from '../hooks/useSoundStore';
import clsx from 'clsx';

function Section({ title, children }) {
    return (
        <div className="mb-8">
            <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-3 px-1">{title}</h4>
            <div className="bg-surface-dark rounded-xl overflow-hidden border border-slate-800">
                {children}
            </div>
        </div>
    );
}

function ToggleItem({ label, sublabel, value, onChange, last = false }) {
    return (
        <div className={clsx("flex items-center justify-between p-4", !last && "border-b border-slate-800")}>
            <div>
                <p className="text-white font-medium text-sm">{label}</p>
                {sublabel && <p className="text-slate-500 text-xs mt-0.5">{sublabel}</p>}
            </div>
            <button
                onClick={() => onChange(!value)}
                className={clsx("w-12 h-7 rounded-full relative transition-colors duration-200 ease-in-out", value ? "bg-primary" : "bg-slate-600")}
            >
                <div className={clsx("absolute top-1 left-1 size-5 bg-white rounded-full shadow-sm transition-transform duration-200", value ? "translate-x-5" : "translate-x-0")} />
            </button>
        </div>
    );
}

export function SettingsScreen({ onBack }) {
    const { settings, updateSettings } = useSoundStore();

    return (
        <div className="flex flex-col h-full bg-black select-none">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-background-dark border-b border-slate-800">
                <button onClick={onBack} className="flex items-center text-primary text-sm font-medium gap-1">
                    <span className="material-symbols-outlined text-lg">arrow_back_ios</span>
                    Soundboard
                </button>
                <h2 className="text-white font-bold text-lg">Settings</h2>
                <button onClick={() => window.location.reload()} className="text-primary text-sm font-medium">Reset</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">

                {/* Audio Section */}
                <Section title="Audio">
                    <div className="p-4 border-b border-slate-800">
                        <div className="flex justify-between mb-2">
                            <span className="text-white font-medium text-sm">Master Volume</span>
                            <span className="text-slate-400 text-xs">{settings.masterVolume}%</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-slate-500 text-sm">volume_mute</span>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={settings.masterVolume}
                                onChange={(e) => updateSettings('masterVolume', Number(e.target.value))}
                                className="flex-1 h-1 bg-slate-700/50 rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary/90"
                            />
                            <span className="material-symbols-outlined text-slate-500 text-sm">volume_up</span>
                        </div>
                        <p className="text-slate-500 text-[10px] mt-3">This volume setting overrides individual sound volumes.</p>
                    </div>
                </Section>

                {/* Playback Behavior */}
                <Section title="Playback Behavior">
                    <ToggleItem
                        label="Stop on Tap Again"
                        value={settings.stopOnTap}
                        onChange={v => updateSettings('stopOnTap', v)}
                    />
                    <ToggleItem
                        label="Allow Overlap"
                        sublabel="Play multiple sounds at once"
                        value={settings.allowOverlap}
                        onChange={v => updateSettings('allowOverlap', v)}
                    />
                    <ToggleItem
                        label="Loop by Default"
                        value={settings.loopDefault}
                        onChange={v => updateSettings('loopDefault', v)}
                        last
                    />
                </Section>

                {/* Interface */}
                <Section title="Interface">
                    <div className="p-4 border-b border-slate-800">
                        <p className="text-white font-medium text-sm mb-3">Button Size</p>
                        <div className="flex bg-slate-800 p-1 rounded-lg">
                            {['Small', 'Medium', 'Large'].map(size => (
                                <button
                                    key={size}
                                    onClick={() => updateSettings('buttonSize', size.toLowerCase())}
                                    className={clsx("flex-1 py-1.5 text-xs font-medium rounded-md transition-all", settings.buttonSize === size.toLowerCase() ? "bg-slate-600 text-white shadow-sm" : "text-slate-400")}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>
                    <ToggleItem
                        label="Haptic Feedback"
                        value={settings.hapticFeedback}
                        onChange={v => updateSettings('hapticFeedback', v)}
                        last
                    />
                </Section>

                {/* General */}
                <Section title="General">
                    <div className="flex items-center justify-between p-4 border-b border-slate-800 cursor-pointer active:bg-white/5">
                        <span className="text-primary text-sm font-medium">Export Soundboard</span>
                        <span className="material-symbols-outlined text-slate-500 text-lg">ios_share</span>
                    </div>
                    <div className="flex items-center justify-between p-4 cursor-pointer active:bg-white/5">
                        <span className="text-white text-sm font-medium">Version</span>
                        <span className="text-slate-500 text-sm">1.0.2</span>
                    </div>
                </Section>

            </div>
        </div>
    );
}
