import React, { useState, useRef, useEffect } from 'react';
import { Repeat } from 'lucide-react';

const PullToRefresh = ({ children, onRefresh }) => {
    const [pullY, setPullY] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const startY = useRef(0);
    const isPulling = useRef(false);
    
    // Threshold to trigger refresh
    const THRESHOLD = 80;

    const handleTouchStart = (e) => {
        if (window.scrollY === 0) {
            startY.current = e.touches[0].clientY;
            isPulling.current = true;
        }
    };

    const handleTouchMove = (e) => {
        if (!isPulling.current || isRefreshing) return;
        
        const currentY = e.touches[0].clientY;
        const diff = currentY - startY.current;
        
        // Only allow pulling down when at the top
        if (diff > 0 && window.scrollY === 0) {
            // Apply resistance
            const resistance = diff * 0.4;
            // Cap the visual pull distance
            setPullY(Math.min(resistance, THRESHOLD + 40));
            
            // Prevent default scrolling when pulling down
            if (e.cancelable) {
                e.preventDefault();
            }
        } else if (diff < 0) {
            // User scrolled down normally
            isPulling.current = false;
        }
    };

    const handleTouchEnd = () => {
        if (!isPulling.current) return;
        isPulling.current = false;

        if (pullY >= THRESHOLD) {
            setIsRefreshing(true);
            setPullY(THRESHOLD); // Snap to loading position
            
            if (onRefresh) {
                onRefresh().then(() => {
                    setIsRefreshing(false);
                    setPullY(0);
                });
            } else {
                // Fallback to window reload
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            }
        } else {
            // Spring back
            setPullY(0);
        }
    };

    // Global event listener to prevent pull-to-refresh default behavior
    useEffect(() => {
        const preventDefault = (e) => {
            if (isPulling.current && e.cancelable) {
                e.preventDefault();
            }
        };
        document.addEventListener('touchmove', preventDefault, { passive: false });
        return () => document.removeEventListener('touchmove', preventDefault);
    }, []);

    const rotation = Math.min((pullY / THRESHOLD) * 360, 360);

    return (
        <div 
            onTouchStart={handleTouchStart} 
            onTouchMove={handleTouchMove} 
            onTouchEnd={handleTouchEnd}
            style={{ 
                minHeight: '100vh',
                position: 'relative',
                transform: `translateY(${pullY}px)`,
                transition: isPulling.current ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
            }}
        >
            {/* Loading Indicator placed above the content but moving with it */}
            <div style={{
                position: 'absolute',
                top: -50,
                left: 0,
                right: 0,
                height: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pullY / THRESHOLD
            }}>
                <Repeat 
                    size={24} 
                    color="var(--color-text-muted)" 
                    style={{ 
                        transform: `rotate(${isRefreshing ? 0 : rotation}deg)`,
                        animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
                    }} 
                />
            </div>
            
            {children}
            
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default PullToRefresh;
