
import React, { useMemo } from 'react';

const SokSchedule = ({ events, svtEvents = [] }) => {
    if (!events || events.length === 0) {
        return <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>Inga events hittades från SOK.</div>;
    }

    const getEventDate = (dayStr) => {
        try {
            const parts = dayStr.match(/([a-ö]+)\s+(\d+)\s+([a-zA-Z]+)/);
            if (!parts) return null;
            const dayNum = parseInt(parts[2], 10);
            const monthStr = parts[3].toLowerCase().substring(0, 3);
            const monthMap = {
                'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'maj': 4, 'jun': 5,
                'jul': 6, 'aug': 7, 'sep': 8, 'okt': 9, 'nov': 10, 'dec': 11
            };
            const monthIndex = monthMap[monthStr];
            if (monthIndex === undefined) return null;
            return new Date(new Date().getFullYear(), monthIndex, dayNum);
        } catch (e) {
            return null;
        }
    };

    const formatDayHeader = (dayStr) => {
        try {
            const parts = dayStr.match(/([a-ö]+)\s+(\d+)\s+([a-zA-Z]+)/);
            if (!parts) return dayStr.charAt(0).toUpperCase() + dayStr.slice(1);

            const dayName = parts[1];
            const date = getEventDate(dayStr);
            if (!date) return dayStr.charAt(0).toUpperCase() + dayStr.slice(1);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            // Reset hours for comparison
            date.setHours(0, 0, 0, 0);

            if (date.getTime() === today.getTime()) {
                return "Idag";
            } else if (date.getTime() === tomorrow.getTime()) {
                return "Imorgon";
            } else {
                // Just capitalize the day name, e.g. "Onsdag"
                // Or keep the full string "Onsdag 18 feb"? 
                // User said "sedan veckodagar", implies simplify to just the day?
                // "Idag", "Imorgon", "Torsdag", "Fredag"...
                // But if there's a gap or for clarity, the date is nice. 
                // I'll capitalize the full string for now to be safe, e.g. "Torsdag 19 feb"
                // actually, let's just use the dayName capitalized.
                return dayName.charAt(0).toUpperCase() + dayName.slice(1);
            }
        } catch (e) {
            return dayStr;
        }
    };





    const findSvtMatch = (event) => {
        if (!svtEvents || svtEvents.length === 0) return null;

        const date = getEventDate(event.day);
        if (!date) return null;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        // Normalize time for comparison (e.g. "09.45" -> "09:45")
        const normalizedSokTime = event.time.replace('.', ':');

        // Filter events for the same day
        const dayEvents = svtEvents.filter(e => e.date === dateStr);

        // 1. Precise time match
        let match = dayEvents.find(e => e.time === normalizedSokTime);
        if (match) return match;

        // 2. keyword match (if the SVT title contains the sport name and time is close)
        const sportLower = event.sport.toLowerCase();
        match = dayEvents.find(e => {
            const titleLower = e.title.toLowerCase();
            const subtitleLower = e.subtitle?.toLowerCase() || '';
            const isSportMatch = titleLower.includes(sportLower) || subtitleLower.includes(sportLower);

            // Check if time is within +/- 1 hour (broadcasting often starts earlier or covers multiple events)
            const [sokH, sokM] = normalizedSokTime.split(':').map(Number);
            const [svtH, svtM] = e.time.split(':').map(Number);
            const sokTotal = sokH * 60 + sokM;
            const svtTotal = svtH * 60 + svtM;

            const timeDiff = Math.abs(sokTotal - svtTotal);
            return isSportMatch && timeDiff <= 60;
        });

        return match;
    };

    const formatDetails = (text) => {
        if (!text) return "";
        let formatted = text;

        // Remove "Ställning..." and everything after it
        formatted = formatted.replace(/\s*Ställning.*$/s, '');

        // Break after score (e.g. "9-4 Christoffer")
        formatted = formatted.replace(/(\d+[-–]\d+)\s+([A-ZÅÄÖ])/g, '$1\n$2');

        // Break before numbered items like 1), 2), 3)
        formatted = formatted.replace(/[,]?\s+(\d+\))/g, '\n$1');

        return formatted.trim();
    };

    const groupedEvents = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const groups = {};
        events.forEach(event => {
            const eventDate = getEventDate(event.day);
            if (eventDate) {
                eventDate.setHours(0, 0, 0, 0);
                if (eventDate < today) return; // Skip past events
            }

            if (!groups[event.day]) {
                groups[event.day] = [];
            }
            groups[event.day].push(event);
        });
        return groups;
    }, [events]);

    const days = Object.keys(groupedEvents);

    return (
        <div className="day-group" style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: '12px', marginBottom: '20px', overflow: 'hidden' }}>
            {days.map(day => (
                <div key={day}>
                    <div style={{
                        padding: '1rem',
                        backgroundColor: 'var(--color-bg-alt)',
                        borderBottom: '1px solid var(--color-border)',
                        color: 'var(--color-text-highlight)'
                    }}>
                        <h2 style={{
                            margin: 0,
                            fontSize: '1.5rem',
                            fontWeight: '800',
                            textTransform: 'capitalize'
                        }}>
                            {formatDayHeader(day)}
                        </h2>
                    </div>

                    <div className="events-list" style={{ padding: '0.5rem' }}>
                        {groupedEvents[day].map((event) => {
                            return (
                                <div key={event.id} className="event-card" style={{
                                    padding: '0.75rem 1rem',
                                    backgroundColor: 'var(--color-bg-alt)',
                                    borderRadius: '8px',
                                    marginBottom: '0.5rem',
                                    border: '1px solid var(--color-border)',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>


                                    <div style={{
                                        display: 'flex',
                                        gap: '12px',
                                        alignItems: 'baseline',
                                        flexWrap: 'wrap'
                                    }}>
                                        <span style={{
                                            fontSize: '1.1rem',
                                            fontWeight: 'bold',
                                            color: '#fbc02d',
                                            minWidth: '50px'
                                        }}>
                                            {event.time}
                                        </span>

                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                                            <span style={{
                                                fontSize: '1.1rem',
                                                fontWeight: '700',
                                                color: 'var(--color-text-highlight)'
                                            }}>
                                                {event.sport}
                                            </span>
                                            <span style={{
                                                fontSize: '1rem',
                                                color: 'var(--color-text-primary)',
                                                opacity: 0.9
                                            }}>
                                                {event.event}
                                            </span>
                                            {(() => {
                                                const svtMatch = findSvtMatch(event);
                                                if (svtMatch) {
                                                    return (
                                                        <div
                                                            title="Sänds på SVT Play"
                                                            style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                backgroundColor: '#00d2c8', // SVT Play Teal
                                                                padding: '2px 6px',
                                                                borderRadius: '4px',
                                                                marginLeft: '4px'
                                                            }}
                                                        >
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                                                                <path d="M8 5v14l11-7z" />
                                                            </svg>
                                                            <span style={{ color: 'white', fontSize: '0.65rem', fontWeight: '800', marginLeft: '2px' }}>PLAY</span>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </div>
                                    </div>

                                    {event.details && (
                                        <div style={{ marginTop: '8px' }}>
                                            <p style={{
                                                margin: 0,
                                                fontSize: '0.9rem',
                                                color: 'var(--color-text-muted)',
                                                lineHeight: '1.4',
                                                whiteSpace: 'pre-line'
                                            }}>
                                                {formatDetails(event.details)}
                                            </p>
                                        </div>
                                    )}

                                    {(() => {
                                        const svtMatch = findSvtMatch(event);
                                        if (svtMatch) {
                                            return (
                                                <div style={{ marginTop: '12px' }}>
                                                    <a
                                                        href={svtMatch.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            padding: '6px 12px',
                                                            backgroundColor: 'var(--color-secondary)',
                                                            color: 'white',
                                                            borderRadius: '6px',
                                                            fontSize: '0.85rem',
                                                            fontWeight: '600',
                                                            textDecoration: 'none',
                                                            transition: 'opacity 0.2s'
                                                        }}
                                                        onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
                                                        onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M8 5v14l11-7z" />
                                                        </svg>
                                                        Titta på SVT Play
                                                    </a>
                                                    {svtMatch.live && (
                                                        <span style={{
                                                            marginLeft: '8px',
                                                            fontSize: '0.75rem',
                                                            color: '#ff4b2b',
                                                            fontWeight: 'bold',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            ● LIVE
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SokSchedule;
