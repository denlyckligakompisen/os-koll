
import React, { useMemo } from 'react';

const SokSchedule = ({ events }) => {
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

            date.setHours(0, 0, 0, 0);

            if (date.getTime() === today.getTime()) {
                return "Idag";
            } else if (date.getTime() === tomorrow.getTime()) {
                return "Imorgon";
            } else {
                return dayName.charAt(0).toUpperCase() + dayName.slice(1);
            }
        } catch (e) {
            return dayStr;
        }
    };

    const formatDetails = (text) => {
        if (!text) return "";
        let formatted = text;

        formatted = formatted.replace(/\s*Ställning.*$/s, '');
        formatted = formatted.replace(/(\d+[-–]\d+)\s+([A-ZÅÄÖ])/g, '$1\n$2');
        formatted = formatted.replace(/[,]?\s+(\d+\))/g, '\n$1');

        return formatted.trim();
    };

    const groupedEvents = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const groups = {};
        events.forEach(event => {
            if (event.sport === 'Ceremoni') return;
            const eventDate = getEventDate(event.day);
            if (eventDate) {
                eventDate.setHours(0, 0, 0, 0);
                if (eventDate < today) return;
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
