import { useState, useRef } from 'react';

// Shared context
let audioCtx = null;
const bufferCache = new WeakMap();
const activeSources = new Set();

export function useAudio() {
    const [playingId, setPlayingId] = useState(null); // ID of mostly recently triggering sound

    const initContext = () => {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContext();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    };

    const stopAll = () => {
        activeSources.forEach(source => {
            try { source.stop(); } catch (e) { }
        });
        activeSources.clear();
        setPlayingId(null);
    };

    /**
     * Play a sound blob.
     * @param {Blob} blob - Audio data
     * @param {Object} options - { volume: 0-100, loop: boolean, allowOverlap: boolean, soundId: string }
     */
    const playBlob = async (blob, options = {}) => {
        if (!blob) return;
        const ctx = initContext();

        const {
            volume = 100,
            loop = false,
            allowOverlap = false,
            soundId = null
        } = options;

        // Handle Overlap Logic
        if (!allowOverlap) {
            stopAll();
        }

        try {
            let buffer = bufferCache.get(blob);
            if (!buffer) {
                const arrayBuffer = await blob.arrayBuffer();
                buffer = await ctx.decodeAudioData(arrayBuffer);
                bufferCache.set(blob, buffer);
            }

            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.loop = loop;

            // Volume Control
            const gainNode = ctx.createGain();
            gainNode.gain.value = volume / 100;

            source.connect(gainNode);
            gainNode.connect(ctx.destination);

            source.onended = () => {
                activeSources.delete(source);
                if (activeSources.size === 0) setPlayingId(null);
            };

            source.start(0);
            activeSources.add(source);
            if (soundId) setPlayingId(soundId);

            return source;
        } catch (err) {
            console.error("Playback failed:", err);
        }
    };

    return { playBlob, stopAll, playingId, initContext };
}
