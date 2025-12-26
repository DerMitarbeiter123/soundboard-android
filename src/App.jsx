import { useState, useEffect } from 'react';
import { useSoundStore } from './hooks/useSoundStore';
import { useAudio } from './hooks/useAudio';
import { useUser } from './hooks/useUser';
import { SoundCard } from './components/SoundCard';
import { AddSoundModal } from './components/AddSoundModal';
import { SettingsScreen } from './components/SettingsScreen';
import { LibraryView } from './components/LibraryView';
import { ProfileScreen } from './components/ProfileScreen';
import { CommunityLibrary } from './components/CommunityLibrary';
import { MiniPlayer } from './components/MiniPlayer';
import clsx from 'clsx';
import './components/Animations.css';

function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in px-4 w-full max-w-xs pointer-events-none">
      {/* Add pointer-events-auto to inner if buttons added */}
      <div className={clsx(
        "flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md",
        type === 'error' ? "bg-red-900/90 border-red-500/50 text-white" : "bg-slate-800/90 border-slate-700 text-white"
      )}>
        <span className="material-symbols-outlined text-xl">
          {type === 'error' ? 'error' : 'check_circle'}
        </span>
        <p className="text-sm font-medium flex-1">{message}</p>
      </div>
    </div>
  );
}

function App() {
  const { user, loading: userLoading } = useUser();
  const { sounds, settings, addSound, deleteSound, getAudioBlob } = useSoundStore();
  const { playBlob, stopAll, playingId, initContext } = useAudio();

  const [currentView, setCurrentView] = useState('board'); // 'board' | 'settings' | 'library' | 'community' | 'profile'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => setToast({ message, type });

  // Unlock audio on first user interaction just in case
  useEffect(() => {
    const unlock = () => {
      initContext();
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
    };
    window.addEventListener('click', unlock);
    window.addEventListener('touchstart', unlock);
    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
    };
  }, [initContext]);

  const handlePlaySound = async (sound) => {
    if (isEditing) return;

    try {
      const blob = await getAudioBlob(sound.audioKey);
      if (blob) {
        await playBlob(blob, {
          volume: settings.masterVolume,
          loop: settings.loopDefault,
          allowOverlap: settings.allowOverlap,
          soundId: sound.id
        });
      } else {
        showToast("Audio file missing", "error");
      }
    } catch (e) {
      console.error("Failed to play sound", e);
      // Show detailed error for debugging
      const errorMsg = e.message || "Unknown error";
      showToast(`Error: ${errorMsg}`, "error");
    }
  };

  const handleSaveNewSound = (meta, blob) => {
    addSound(meta, blob)
      .then(() => showToast("Sound added!"))
      .catch(() => showToast("Failed to save", "error"));
  };

  const favorites = sounds.filter(s => s.isFavorite);

  const renderContent = () => {
    if (currentView === 'settings') {
      return <SettingsScreen onBack={() => setCurrentView('board')} />;
    }
    if (currentView === 'library') {
      return <LibraryView onPlay={handlePlaySound} />;
    }
    if (currentView === 'profile') {
      return <ProfileScreen onBack={() => setCurrentView('board')} />;
    }
    if (currentView === 'community') {
      return <CommunityLibrary onBack={() => setCurrentView('board')} />;
    }

    return (
      <main className="flex-1 overflow-y-auto px-4 pt-2 pb-48 scrollbar-hide relative z-0 overscroll-y-none">
        {/* Favorites Section */}
        {favorites.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3 px-1 mt-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Favorites</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {favorites.map(sound => (
                <SoundCard
                  key={sound.id}
                  sound={sound}
                  isPlaying={playingId === sound.id}
                  isEditing={isEditing}
                  onClick={() => handlePlaySound(sound)}
                  onDelete={deleteSound}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4 px-1 mt-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">All Sounds</span>
          {sounds.length > 8 && <span className="text-xs text-primary cursor-pointer" onClick={() => setCurrentView('library')}>View all</span>}
        </div>

        <div className="grid grid-cols-2 gap-3 pb-4">
          {sounds.map(sound => (
            <SoundCard
              key={sound.id}
              sound={sound}
              isPlaying={playingId === sound.id}
              isEditing={isEditing}
              onClick={() => handlePlaySound(sound)}
              onDelete={deleteSound}
            />
          ))}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="group relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-700 p-4 aspect-square hover:bg-white/5 transition-all active:scale-95 touch-manipulation"
          >
            <span className="material-symbols-outlined text-3xl text-slate-600">add</span>
            <p className="text-slate-500 text-sm font-medium">Add Slot</p>
          </button>
        </div>

        {sounds.length === 0 && (
          <div className="text-center py-10 opacity-50">
            <p className="text-slate-400 text-sm">Tap "Add Slot" or use the Record button below.</p>
          </div>
        )}
      </main>
    );
  };

  return (
    // Fixed: Mobile Fullscreen vs Desktop Frame
    <div className="relative flex flex-col h-[100dvh] w-full sm:max-w-md bg-background-light dark:bg-background-dark overflow-hidden shadow-2xl font-display sm:mx-auto sm:my-8 sm:h-[844px] sm:rounded-3xl sm:border-slate-800 sm:border sm:ring-8 sm:ring-slate-900">

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <header className="flex items-center justify-between bg-background-dark p-4 pt-[max(1rem,env(safe-area-inset-top))] z-20 shrink-0 border-b border-white/5">
        <button
          onClick={() => setCurrentView('profile')}
          className="flex size-10 items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors active:scale-95 touch-manipulation"
        >
          <span className="material-symbols-outlined">person</span>
        </button>
        <h2 className="text-white text-lg font-bold leading-tight tracking-tight">
          {user?.username || 'SonicGrid'}
        </h2>
        <button
          onClick={() => setCurrentView('community')}
          className="flex size-10 items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors active:scale-95 touch-manipulation"
        >
          <span className="material-symbols-outlined">public</span>
        </button>
      </header>

      {renderContent()}

      {currentView === 'board' && (
        <div className="absolute bottom-[160px] right-4 z-30 pointer-events-none pb-[env(safe-area-inset-bottom)]">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="pointer-events-auto flex items-center justify-center rounded-full h-14 bg-primary text-white shadow-lg shadow-primary/40 pl-5 pr-6 gap-3 transition-transform hover:scale-105 active:scale-95 touch-manipulation"
          >
            <span className="material-symbols-outlined text-2xl">mic</span>
            <span className="font-bold text-base">Record</span>
          </button>
        </div>
      )}

      {/* Styled Bottom Area */}
      <div className="absolute bottom-0 w-full z-40 flex flex-col bg-background-dark pb-[env(safe-area-inset-bottom)]">
        <MiniPlayer playingId={playingId} onStop={stopAll} />

        <nav className="flex justify-between items-center px-4 pb-6 pt-2 bg-background-dark border-t border-transparent">
          <button
            onClick={() => setCurrentView('board')}
            className={clsx("flex flex-1 flex-col items-center justify-end gap-1 transition-colors active:scale-95 touch-manipulation", currentView === 'board' ? "text-primary" : "text-[#9dabb9] hover:text-white")}
          >
            <span className={clsx("material-symbols-outlined text-2xl", currentView === 'board' && "filled")}>grid_view</span>
            <p className="text-[10px] font-bold leading-normal tracking-[0.015em]">Board</p>
          </button>

          <button
            onClick={() => setCurrentView('community')}
            className={clsx("flex flex-1 flex-col items-center justify-end gap-1 transition-colors active:scale-95 touch-manipulation", currentView === 'community' ? "text-primary" : "text-[#9dabb9] hover:text-white")}
          >
            <span className={clsx("material-symbols-outlined text-2xl", currentView === 'community' && "filled")}>public</span>
            <p className="text-[10px] font-medium leading-normal tracking-[0.015em]">Community</p>
          </button>

          <button
            onClick={() => setCurrentView('library')}
            className={clsx("flex flex-1 flex-col items-center justify-end gap-1 transition-colors active:scale-95 touch-manipulation", currentView === 'library' ? "text-primary" : "text-[#9dabb9] hover:text-white")}
          >
            <span className={clsx("material-symbols-outlined text-2xl", currentView === 'library' && "filled")}>library_music</span>
            <p className="text-[10px] font-medium leading-normal tracking-[0.015em]">Library</p>
          </button>

          <button
            onClick={() => setCurrentView('settings')}
            className={clsx("flex flex-1 flex-col items-center justify-end gap-1 transition-colors active:scale-95 touch-manipulation", currentView === 'settings' ? "text-primary" : "text-[#9dabb9] hover:text-white")}
          >
            <span className={clsx("material-symbols-outlined text-2xl", currentView === 'settings' && "filled")}>settings</span>
            <p className="text-[10px] font-medium leading-normal tracking-[0.015em]">Settings</p>
          </button>
        </nav>
      </div>

      {isAddModalOpen && (
        <AddSoundModal onClose={() => setIsAddModalOpen(false)} onSave={handleSaveNewSound} />
      )}

    </div>
  );
}

export default App;
