import { useCallback } from 'react';

const useHaptics = () => {
    const triggerHaptic = useCallback((type = 'light') => {
        // Haptic feedback only works on mobile devices that support navigator.vibrate
        if (!navigator.vibrate) return;

        switch (type) {
            case 'light':
                navigator.vibrate(5); // Very subtle tap
                break;
            case 'medium':
                navigator.vibrate(10); // Standard tap
                break;
            case 'heavy':
                navigator.vibrate(15); // Distinct click
                break;
            case 'success':
                navigator.vibrate([10, 30, 10]); // Short double-tap
                break;
            case 'error':
                navigator.vibrate([15, 50, 15, 50, 15]); // Quick triple buzz
                break;
            case 'warning':
                navigator.vibrate([30, 50, 10]); // Long buzz then short
                break;
            default:
                navigator.vibrate(10);
        }
    }, []);

    return { triggerHaptic };
};

export default useHaptics;
