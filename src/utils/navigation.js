import { useEffect, useRef } from 'react';

export const useSwipeNavigation = (activeTab, setActiveTab, subtabs) => {
    const activeTabRef = useRef(activeTab);

    useEffect(() => {
        activeTabRef.current = activeTab;
    }, [activeTab]);

    useEffect(() => {
        let startX = 0;
        let startY = 0;
        let isHorizontalSwipe = false;
        let isVerticalSwipe = false;

        const handleStart = (e) => {
            if (e.target.closest('input[type="range"]') || e.target.closest('.custom-slider')) {
                startX = 0;
                startY = 0;
                return;
            }
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isHorizontalSwipe = false;
            isVerticalSwipe = false;
        };

        const handleMove = (e) => {
            if (e.target.closest('input[type="range"]') || e.target.closest('.custom-slider')) {
                return;
            }
            if (!startX || !startY) return;

            if (e.target.closest('.bracket-container') || e.target.closest('[style*="overflow-x: auto"]') || e.target.closest('[style*="overflowX: auto"]')) {
                return;
            }

            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const diffX = startX - currentX;
            const diffY = startY - currentY;

            if (isVerticalSwipe) return;

            if (!isHorizontalSwipe && !isVerticalSwipe) {
                if (Math.abs(diffX) > 8 || Math.abs(diffY) > 8) {
                    if (Math.abs(diffX) > Math.abs(diffY)) {
                        isHorizontalSwipe = true;
                    } else {
                        isVerticalSwipe = true;
                    }
                }
            }

            if (isHorizontalSwipe) {
                if (e.cancelable) {
                    e.preventDefault();
                }
            }
        };

        const handleEnd = (e) => {
            if (!startX || !startY || !isHorizontalSwipe) {
                startX = 0;
                startY = 0;
                return;
            }

            const endX = e.changedTouches[0].clientX;
            const diffX = startX - endX;

            if (Math.abs(diffX) > 60) {
                const currentIndex = subtabs.findIndex(t => t.id === activeTabRef.current);
                if (diffX > 0) {
                    if (currentIndex < subtabs.length - 1) {
                        setActiveTab(subtabs[currentIndex + 1].id);
                        if (navigator.vibrate) navigator.vibrate(10);
                    }
                } else {
                    if (currentIndex > 0) {
                        setActiveTab(subtabs[currentIndex - 1].id);
                        if (navigator.vibrate) navigator.vibrate(10);
                    }
                }
            }

            startX = 0;
            startY = 0;
            isHorizontalSwipe = false;
            isVerticalSwipe = false;
        };

        window.addEventListener('touchstart', handleStart, { passive: true });
        window.addEventListener('touchmove', handleMove, { passive: false });
        window.addEventListener('touchend', handleEnd, { passive: true });

        return () => {
            window.removeEventListener('touchstart', handleStart);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [setActiveTab, subtabs]);
};

export const getHeaderStyle = (filterItem) => {
    if (filterItem) {
        return {
            bg: '#1c1c1e',
            text: '#ffffff',
            activeLine: '#34c759'
        };
    }
    return {
        bg: 'var(--color-surface)',
        text: 'var(--color-text)',
        activeLine: 'var(--color-primary)'
    };
};
