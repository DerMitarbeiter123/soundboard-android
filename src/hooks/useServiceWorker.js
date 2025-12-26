import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export function useServiceWorker() {
    const [needRefresh, setNeedRefresh] = useState(false);

    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefreshSW, setNeedRefreshSW],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('✅ Service Worker registered successfully');
            if (r) {
                console.log('🔄 Setting up automatic update checks every 30 seconds');

                // Check for updates immediately
                r.update().then(() => {
                    console.log('✓ Initial update check complete');
                });

                // Then check every 30 seconds
                const interval = setInterval(() => {
                    console.log('🔍 Checking for updates...');
                    r.update().then(() => {
                        console.log('✓ Update check complete');
                    }).catch((err) => {
                        console.error('❌ Update check failed:', err);
                    });
                }, 30000); // 30 seconds

                // Cleanup interval on unmount
                return () => clearInterval(interval);
            }
        },
        onRegisterError(error) {
            console.error('❌ Service Worker registration error:', error);
        },
        onNeedRefresh() {
            console.log('🆕 New version available!');
            setNeedRefresh(true);
        },
        onOfflineReady() {
            console.log('📱 App ready to work offline');
        },
    });

    useEffect(() => {
        if (needRefreshSW) {
            console.log('🔔 Update prompt triggered');
            setNeedRefresh(true);
        }
    }, [needRefreshSW]);

    const updateApp = () => {
        console.log('⬆️ Updating app...');
        updateServiceWorker(true);
    };

    const closePrompt = () => {
        console.log('⏭️ Update dismissed');
        setNeedRefresh(false);
        setNeedRefreshSW(false);
    };

    return {
        needRefresh,
        offlineReady,
        updateApp,
        closePrompt
    };
}
