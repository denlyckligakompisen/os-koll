
import React, { useState, useMemo, useRef, useEffect } from 'react';
import DayGroup from './DayGroup';
import { parseSwedishDate } from '../../utils/dateUtils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SokSchedule = ({ events, svtEvents = [] }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [hasInitialized, setHasInitialized] = useState(false);
    const touchStart = useRef(null);
    const touchEnd = useRef(null);
    const tabsRef = useRef(null);

    // Group and sort events
    const { days, groupedEvents } = useMemo(() => {
        if (!events) return { days: [], groupedEvents: {} };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const groups = {};
        events.forEach(event => {
            const eventDate = parseSwedishDate(event.day);
            if (eventDate) {
                eventDate.setHours(0, 0, 0, 0);
                if (eventDate < today) return; // Skip past events
            }

            if (!groups[event.day]) {
                groups[event.day] = [];
            }
            groups[event.day].push(event);
        });

        // specific sorting if keys get messed up, otherwise rely on input order
        // But input order is safe if scraped correctly.
        // Let's sort explicitly to be sure
        const sortedDays = Object.keys(groups).sort((a, b) => {
            const da = parseSwedishDate(a);
            const db = parseSwedishDate(b);
            return da - db;
        });

        return { days: sortedDays, groupedEvents: groups };
    }, [events]);

    // Initialize activeIndex
    useEffect(() => {
        if (!hasInitialized && days.length > 0) {
            setActiveIndex(0); // Always start at first available day (today or future)
            setHasInitialized(true);
        }
    }, [days, hasInitialized]);

    // Handle Swipe
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        touchEnd.current = null;
        touchStart.current = e.targetTouches[0].clientX;
    }

    const onTouchMove = (e) => {
        touchEnd.current = e.targetTouches[0].clientX;
    }

    const onTouchEnd = () => {
        if (!touchStart.current || !touchEnd.current) return;

        const distance = touchStart.current - touchEnd.current;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && activeIndex < days.length - 1) {
            setActiveIndex(prev => prev + 1);
        }

        if (isRightSwipe && activeIndex > 0) {
            setActiveIndex(prev => prev - 1);
        }
    }

    const scrollToActiveTab = (index) => {
        if (tabsRef.current) {
            const tab = tabsRef.current.children[index];
            if (tab) {
                tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    };

    useEffect(() => {
        scrollToActiveTab(activeIndex);
    }, [activeIndex]);


    if (days.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                Inga kommande events hittades.
            </div>
        );
    }

    const activeDay = days[activeIndex];

    return (
        <div
            className="schedule-container"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            {/* Day Navigation */}
            <div className="day-tabs-container" style={{
                marginBottom: '1rem',
                position: 'sticky',
                top: '0',
                zIndex: 10,
                backgroundColor: 'transparent',
                // backdropFilter: 'blur(8px)', // Removed as requested
                borderBottom: 'none',
                paddingTop: '0.75rem',
                paddingBottom: '0.75rem',
                marginRight: '-24px', // Compensate for parent padding
                marginLeft: '-24px',  // Compensate for parent padding
                paddingLeft: '24px',  // Add padding back to content
                paddingRight: '24px'  // Add padding back to content
            }}>
                <div
                    ref={tabsRef}
                    style={{
                        display: 'flex',
                        overflowX: 'auto',
                        gap: '8px',
                        padding: '0 4px',
                        scrollbarWidth: 'none', // Firefox
                        msOverflowStyle: 'none', // IE/Edge
                        WebkitOverflowScrolling: 'touch',
                    }}
                    className="hide-scrollbar" // Helper class usually needed
                >
                    {days.map((day, index) => {
                        const isActive = index === activeIndex;
                        // Format day for tab: "ons 18 feb" or similar short
                        // day strings are roughly "onsdag 18 feb"
                        const shortDay = day.replace('dag', ''); // onsdag -> ons

                        return (
                            <button
                                key={day}
                                onClick={() => setActiveIndex(index)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    border: 'none',
                                    backgroundColor: isActive ? '#fbc02d' : 'rgba(255, 255, 255, 0.1)',
                                    color: isActive ? '#000' : 'rgba(255, 255, 255, 0.7)',
                                    whiteSpace: 'nowrap',
                                    fontSize: '0.9rem',
                                    fontWeight: isActive ? '700' : '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    flexShrink: 0
                                }}
                            >
                                {shortDay}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content for Active Day */}
            <div className="active-day-content" style={{ minHeight: '300px' }}>
                <DayGroup
                    key={activeDay}
                    day={activeDay}
                    events={groupedEvents[activeDay]}
                    svtEvents={svtEvents}
                    isExpanded={true} // Force expand since we show one day
                />
            </div>
        </div>
    );
};

export default SokSchedule;
