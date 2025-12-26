import { useState, useRef, useEffect } from 'react';
import { useAudio } from '../hooks/useAudio';
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

const ICONS = ['campaign', 'mic', 'notifications', 'warning', 'rocket_launch', 'favorite', 'bolt', 'celebration', 'pets', 'more_horiz'];

export function AddSoundModal({ onClose, onSave }) {
    const [mode, setMode] = useState('record'); // 'record' | 'import'
    const [recording, setRecording] = useState(false);
    const [timer, setTimer] = useState(0);
    const [audioBlob, setAudioBlob] = useState(null);
    const [name, setName] = useState('');
    const [color, setColor] = useState(COLORS[0]);
    const [icon, setIcon] = useState(ICONS[0]);

    const mediaRecorder = useRef(null);
    const chunks = useRef([]);
    const timerRef = useRef(null);
    const { playBlob } = useAudio();

    useEffect(() => {
        return () => clearInterval(timerRef.current);
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(stream);
            chunks.current = [];

            mediaRecorder.current.ondataavailable = (e) => chunks.current.push(e.data);
            mediaRecorder.current.onstop = () => {
                const blob = new Blob(chunks.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                stream.getTracks().forEach(t => t.stop());
            };

            mediaRecorder.current.start();
            setRecording(true);
            setTimer(0);
            timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
        } catch (e) {
            console.error("Mic access denied", e);
            alert("Could not access microphone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current && recording) {
            mediaRecorder.current.stop();
            setRecording(false);
            clearInterval(timerRef.current);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAudioBlob(file);
            setName(file.name.split('.')[0].substring(0, 15));
        }
    };

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        return { m, s };
    };
    const { m, s } = formatTime(timer);

    const handleSave = () => {
        if (!name || !audioBlob) return;

        // Calculate duration estimate (very rough for webm, better to decode but slow)
        // We'll just pass 0 or timer value
        const duration = mode === 'record' ? timer : 5; // placeholder

        onSave({ name, color, icon, duration }, audioBlob);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-md bg-background-light dark:bg-background-dark rounded-xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-slate-800">
                    <button onClick={onClose} className="text-primary text-sm font-medium">Cancel</button>
                    <h3 className="text-white font-bold">Add Sound</h3>
                    <button onClick={handleSave} disabled={!audioBlob || !name} className="text-primary text-sm font-bold disabled:opacity-50">Save</button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Tabs */}
                    <div className="flex p-1 bg-surface-dark rounded-lg">
                        <button
                            className={clsx("flex-1 py-1.5 text-sm font-medium rounded-md transition-all", mode === 'record' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400')}
                            onClick={() => setMode('record')}
                        >
                            Record Audio
                        </button>
                        <button
                            className={clsx("flex-1 py-1.5 text-sm font-medium rounded-md transition-all", mode === 'import' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400')}
                            onClick={() => setMode('import')}
                        >
                            Import File
                        </button>
                    </div>

                    {/* Main Interaction Area */}
                    <div className="bg-surface-dark rounded-xl p-8 flex flex-col items-center justify-center space-y-6 relative border border-slate-800">
                        {mode === 'record' ? (
                            <>
                                <div className="flex items-center gap-2 text-4xl font-mono font-bold text-white tracking-widest">
                                    <span>{m}</span><span className="text-slate-600">:</span><span>{s}</span>
                                </div>

                                {/* Visualizer Placeholder */}
                                {recording && (
                                    <div className="flex gap-1 h-12 items-center">
                                        {[...Array(10)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="w-1 bg-primary rounded-full animate-wave"
                                                style={{ animationDelay: `${i * 0.1}s` }}
                                            />
                                        ))}
                                    </div>
                                )}

                                <button
                                    className={clsx("size-20 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95", recording ? "bg-red-500 shadow-red-500/30" : "bg-primary shadow-primary/30")}
                                    onClick={recording ? stopRecording : startRecording}
                                >
                                    <span className={clsx("material-symbols-outlined text-4xl text-white", recording ? "animate-pulse" : "")}>
                                        {recording ? 'stop' : 'mic'}
                                    </span>
                                </button>
                                <p className="text-slate-500 text-sm">{recording ? 'Tap to stop' : 'Tap to record'}</p>
                            </>
                        ) : (
                            <div className="w-full text-center">
                                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-slate-500 transition-colors">
                                    <span className="material-symbols-outlined text-4xl text-slate-500 mb-2">upload_file</span>
                                    <span className="text-sm text-slate-400">Click to upload audio</span>
                                    <input type="file" className="hidden" accept="audio/*" onChange={handleFileSelect} />
                                </label>
                                {audioBlob && <p className="mt-2 text-primary text-sm truncate">{audioBlob.name}</p>}
                            </div>
                        )}
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
                            <div className="grid grid-cols-5 gap-2">
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

                    {audioBlob && (
                        <button onClick={() => playBlob(audioBlob)} className="w-full py-3 rounded-lg border border-slate-700 text-slate-300 hover:bg-white/5 flex items-center justify-center gap-2 transition-colors">
                            <span className="material-symbols-outlined">play_arrow</span>
                            Preview Sound
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
