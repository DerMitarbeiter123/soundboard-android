import { useState, useEffect } from 'react';
import { useAudio } from '../hooks/useAudio';
import { useSoundStore } from '../hooks/useSoundStore';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import './SoundButton.css'; // We'll make a specific CSS or use global + modules

export const SoundButton = ({ sound, isEditing, onDelete }) => {
    const { playBlob } = useAudio();
    const { getAudioBlob } = useSoundStore();
    const [blob, setBlob] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        getAudioBlob(sound.audioKey).then(b => {
            if (active && b) {
                setBlob(b);
                setLoading(false);
            }
        });
        return () => { active = false; };
    }, [sound.audioKey]);

    const handlePress = () => {
        if (loading || isEditing) return;

        if (blob) {
            playBlob(blob);
        }

        // Trigger visual ripple (handled by framer motion tap)
    };

    const colorMap = {
        'accent-cyan': 'var(--accent-cyan)',
        'accent-pink': 'var(--accent-pink)',
        'accent-purple': 'var(--accent-purple)',
        'default': 'var(--text-main)',
    };

    const accentColor = colorMap[sound.color] || colorMap['default'];

    return (
        <motion.div
            className={clsx("sound-button-wrapper", { 'editing': isEditing })}
            whileTap={!isEditing && { scale: 0.92 }}
            whileHover={!isEditing && { scale: 1.02 }}
        >
            <button
                className="sound-button glass-panel"
                onClick={handlePress}
                style={{ '--btn-accent': accentColor, borderColor: isEditing ? 'rgba(255,0,0,0.5)' : undefined }}
            >
                <span className="sound-name">{sound.name}</span>
                {loading && <span className="loader">...</span>}
            </button>

            {isEditing && (
                <button className="delete-badge" onClick={() => onDelete(sound.id)}>✕</button>
            )}
        </motion.div>
    );
};
