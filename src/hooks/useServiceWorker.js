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
            console.log('SW Registered:', r);
            // Check for updates every 60 seconds
            r && setInterval(() => {
                r.update();
            }, 60000);
        },
        onRegisterError(error) {
            console.log('SW registration error', error);
        },
    });

    useEffect(() => {
        if (needRefreshSW) {
            setNeedRefresh(true);
        }
    }, [needRefreshSW]);

    const updateApp = () => {
        updateServiceWorker(true);
    };

    const closePrompt = () => {
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
