
import React, { useState, useMemo, useRef, useEffect } from 'react';
import DayGroup from './DayGroup';
import { parseSwedishDate } from '../../utils/dateUtils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SokSchedule = ({ events, svtEvents = [] }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [hasInitialized, setHasInitialized] = useState(false);
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
                if (eventDate < today) return;
            }

            if (!groups[event.day]) {
                groups[event.day] = [];
            }
            groups[event.day].push(event);
        });

        const sortedDays = Object.keys(groups).sort((a, b) => {
            const da = parseSwedishDate(a);
            const db = parseSwedishDate(b);
            return da - db;
        });

        return { days: sortedDays, groupedEvents: groups };
    }, [events]);

    useEffect(() => {
        if (!hasInitialized && days.length > 0) {
            setActiveIndex(0);
            setHasInitialized(true);
        }
    }, [days, hasInitialized]);

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
        <div className="schedule-container">

            {/* Day Navigation */}
            <div className="day-tabs-container" style={{
                marginBottom: '1.25rem',
                position: 'sticky',
                top: '0',
                zIndex: 10,
                backgroundColor: 'rgba(242, 242, 247, 0.8)',
                backdropFilter: 'saturate(180%) blur(20px)',
                WebkitBackdropFilter: 'saturate(180%) blur(20px)',
                paddingTop: '0.75rem',
                paddingBottom: '0.75rem',
                marginRight: '-24px',
                marginLeft: '-24px',
                paddingLeft: '24px',
                paddingRight: '24px'
            }}>
                <div
                    ref={tabsRef}
                    style={{
                        display: 'flex',
                        overflowX: 'auto',
                        gap: '2px',
                        padding: '3px',
                        backgroundColor: 'rgba(118, 118, 128, 0.12)',
                        borderRadius: '9px',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        WebkitOverflowScrolling: 'touch',
                    }}
                    className="hide-scrollbar"
                >
                    {days.map((day, index) => {
                        const isActive = index === activeIndex;

                        const eventDate = parseSwedishDate(day);
                        let displayDay = day.replace('dag', '');

                        if (eventDate) {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);

                            const tomorrow = new Date();
                            tomorrow.setDate(today.getDate() + 1);
                            tomorrow.setHours(0, 0, 0, 0);

                            const checkDate = new Date(eventDate);
                            checkDate.setHours(0, 0, 0, 0);

                            if (checkDate.getTime() === today.getTime()) {
                                displayDay = 'Idag';
                            } else if (checkDate.getTime() === tomorrow.getTime()) {
                                displayDay = 'Imorgon';
                            }
                        }

                        return (
                            <button
                                key={day}
                                onClick={() => setActiveIndex(index)}
                                style={{
                                    padding: '6px 14px',
                                    borderRadius: '7px',
                                    border: 'none',
                                    backgroundColor: isActive ? '#ffffff' : 'transparent',
                                    color: 'var(--color-text)',
                                    boxShadow: isActive ? '0 3px 8px rgba(0,0,0,0.12), 0 3px 1px rgba(0,0,0,0.04)' : 'none',
                                    whiteSpace: 'nowrap',
                                    fontSize: '0.85rem',
                                    fontWeight: isActive ? '600' : '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    flexShrink: 0,
                                    flex: 1,
                                    textAlign: 'center'
                                }}
                            >
                                {displayDay}
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
                />
            </div>
        </div>
    );
};

export default SokSchedule;
