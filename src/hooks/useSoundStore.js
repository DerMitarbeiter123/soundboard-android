import { useState, useEffect } from 'react';
import { set, get, del } from 'idb-keyval';

const STORAGE_KEY = 'soundboard_layout_v2';
const SETTINGS_KEY = 'soundboard_settings_v1';

const DEFAULT_SETTINGS = {
  masterVolume: 80,
  stopOnTap: true,
  allowOverlap: false,
  loopDefault: false,
  buttonSize: 'medium', // small, medium, large
  hapticFeedback: true,
};

export function useSoundStore() {
  const [sounds, setSounds] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Load initial state
  useEffect(() => {
    const init = async () => {
      // Load Sounds
      const storedSounds = localStorage.getItem(STORAGE_KEY);
      if (storedSounds) {
        try {
          setSounds(JSON.parse(storedSounds));
        } catch (e) {
          console.error("Failed to parse sounds", e);
        }
      }

      // Load Settings
      const storedSettings = localStorage.getItem(SETTINGS_KEY);
      if (storedSettings) {
        try {
          setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) });
        } catch (e) { }
      }

      setLoading(false);
    };
    init();
  }, []);

  // Save changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sounds));
    }
  }, [sounds, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }
  }, [settings, loading]);

  const addSound = async (soundMeta, blob) => {
    const id = self.crypto.randomUUID();
    const audioKey = `audio_${id}`;

    // Save blob to IDB
    if (blob) {
      await set(audioKey, blob);
    }

    // soundMeta should include: name, color, icon, duration
    const newSound = {
      id,
      audioKey,
      isFavorite: false,
      ...soundMeta
    };

    setSounds(prev => [...prev, newSound]);
    return newSound;
  };

  const updateSound = (id, changes) => {
    setSounds(prev => prev.map(s => s.id === id ? { ...s, ...changes } : s));
  };

  const deleteSound = async (id) => {
    const sound = sounds.find(s => s.id === id);
    if (sound) {
      await del(sound.audioKey); // Remove blob
      setSounds(prev => prev.filter(s => s.id !== id));
    }
  };

  const toggleFavorite = (id) => {
    setSounds(prev => prev.map(s => s.id === id ? { ...s, isFavorite: !s.isFavorite } : s));
  };

  const updateSettings = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return {
    sounds,
    settings,
    loading,
    addSound,
    updateSound,
    deleteSound,
    toggleFavorite,
    updateSettings
  };
}
