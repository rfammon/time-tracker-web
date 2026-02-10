import { useEffect, useRef } from 'react';

/**
 * Custom hook to prevent the screen from sleeping using the Screen Wake Lock API.
 * @param enabled - Whether the wake lock should be active.
 */
export function useWakeLock(enabled: boolean) {
    const wakeLock = useRef<WakeLockSentinel | null>(null);

    const requestWakeLock = async () => {
        if ('wakeLock' in navigator && !wakeLock.current) {
            try {
                wakeLock.current = await navigator.wakeLock.request('screen');
                console.log('Wake Lock acquired');

                wakeLock.current.addEventListener('release', () => {
                    console.log('Wake Lock released');
                    wakeLock.current = null;
                });
            } catch (err: any) {
                console.error(`${err.name}, ${err.message}`);
            }
        }
    };

    const releaseWakeLock = async () => {
        if (wakeLock.current) {
            await wakeLock.current.release();
            wakeLock.current = null;
        }
    };

    useEffect(() => {
        if (enabled) {
            requestWakeLock();
        } else {
            releaseWakeLock();
        }

        // Re-acquire lock when page becomes visible again
        const handleVisibilityChange = () => {
            if (enabled && document.visibilityState === 'visible') {
                requestWakeLock();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            releaseWakeLock();
        };
    }, [enabled]);
}
