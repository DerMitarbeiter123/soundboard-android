import { useState, useRef } from 'react';

export function useAudio() {
    const [playingId, setPlayingId] = useState(null);
    const activeAudio = useRef(null);
    const audioCache = useRef(new Map());

    const stopAll = () => {
        if (activeAudio.current) {
            activeAudio.current.pause();
            activeAudio.current.currentTime = 0;
            activeAudio.current = null;
        }
        setPlayingId(null);
    };

    // Convert blob to base64 data URL for PWA compatibility
    const blobToDataURL = (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const playBlob = async (blob, options = {}) => {
        if (!blob) throw new Error("No audio data provided");

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

        if (!allowOverlap) {
            stopAll();
        }

        try {
            // Create or get cached data URL
            let dataUrl = audioCache.current.get(blob);
            if (!dataUrl) {
                dataUrl = await blobToDataURL(blob);
                audioCache.current.set(blob, dataUrl);
            }

            // Create audio element
            const audio = new Audio();
            audio.volume = volume / 100;
            audio.loop = loop;

            // Set up event handlers BEFORE setting src
            audio.onended = () => {
                if (activeAudio.current === audio) {
                    activeAudio.current = null;
                    setPlayingId(null);
                }
            };

            audio.onerror = (e) => {
                console.error("Audio playback error:", e, audio.error);
                const errorMsg = audio.error ?
                    `Audio error: ${audio.error.code} - ${audio.error.message}` :
                    "Failed to play audio file";
                throw new Error(errorMsg);
            };

            // Set source and play
            audio.src = dataUrl;
            await audio.play();

            activeAudio.current = audio;
            if (soundId) setPlayingId(soundId);

            return audio;
        } catch (err) {
            console.error("Playback failed:", err);
            throw err;
        }
    };

    const initContext = () => {
        // Not needed for HTML5 Audio approach
        return null;
    };

    return { playBlob, stopAll, playingId, initContext };
}
