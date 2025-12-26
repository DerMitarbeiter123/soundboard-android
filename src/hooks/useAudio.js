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
    // Polyfill-like helpers
    const blobToBuffer = (blob) => {
        return new Promise((resolve, reject) => {
            if (blob.arrayBuffer) {
                blob.arrayBuffer().then(resolve).catch(reject);
            } else {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = (e) => reject(e);
                reader.readAsArrayBuffer(blob);
            }
        });
    };

    const decodeAudio = (ctx, arrayBuffer) => {
        return new Promise((resolve, reject) => {
            // Attempt Promise-based syntax first (Modern)
            const res = ctx.decodeAudioData(arrayBuffer, resolve, (e) => {
                // Fallback for older implementations if promise doesn't trigger
                reject(new Error("Decode failed: " + (e.message || "Unknown error")));
            });
            // If it returns a promise (Standard), handle it
            if (res && res.catch) {
                res.then(resolve).catch(reject);
            }
        });
    };

    const playBlob = async (blob, options = {}) => {
        if (!blob) throw new Error("No audio data provided");

        // Safety check for blob type
        if (!(blob instanceof Blob)) {
            console.error("Invalid blob:", blob);
            throw new Error("Data is not a valid Audio Blob");
        }

        const {
            volume = 100,
            loop = false,
            allowOverlap = false,
            soundId = null
        } = options;

        const ctx = initContext();

        if (!allowOverlap) {
            stopAll();
        }

        try {
            let buffer = bufferCache.get(blob);
            if (!buffer) {
                // Safe conversion
                const arrayBuffer = await blobToBuffer(blob);
                // Safe decoding
                buffer = await decodeAudio(ctx, arrayBuffer);
                bufferCache.set(blob, buffer);
            }

            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.loop = loop;

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
            console.error("Playback failed logic:", err);
            throw err;
        }
    };

    return { playBlob, stopAll, playingId, initContext };
}
