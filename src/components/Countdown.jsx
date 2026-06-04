import React, { useEffect, useState } from 'react';
import Card from './common/Card';
import FlagBadge from './common/FlagBadge';
import { getFlagCodes } from '../utils/flags';

const FIRST_MATCH_DATE = new Date('2026-06-11T21:00:00+02:00');

const Countdown = ({ firstMatch }) => {
    const getTimeLeft = () => {
        const diff = FIRST_MATCH_DATE - new Date();
        if (diff <= 0) return null;
        return {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / (1000 * 60)) % 60),
            seconds: Math.floor((diff / 1000) % 60)
        };
    };

    const [timeLeft, setTimeLeft] = useState(getTimeLeft);

    useEffect(() => {
        const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (!timeLeft) return null;

    const home = firstMatch?.home || 'Mexiko';
    const away = firstMatch?.away || 'Sydafrika';
    const homeFlags = getFlagCodes(home);
    const awayFlags = getFlagCodes(away);

    const units = [
        { value: timeLeft.days, label: 'dagar' },
        { value: timeLeft.hours, label: 'tim' },
        { value: timeLeft.minutes, label: 'min' },
        { value: timeLeft.seconds, label: 'sek' }
    ];

    return (
        <Card style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            border: 'none',
            boxShadow: '0 16px 48px rgba(15, 52, 96, 0.35)',
            color: '#ffffff',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Subtle decorative glow */}
            <div style={{
                position: 'absolute',
                top: '-40%',
                right: '-20%',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(255, 205, 0, 0.08) 0%, transparent 70%)',
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-30%',
                left: '-10%',
                width: '250px',
                height: '250px',
                background: 'radial-gradient(circle, rgba(0, 122, 255, 0.08) 0%, transparent 70%)',
                pointerEvents: 'none'
            }} />

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px',
                position: 'relative',
                zIndex: 1,
                padding: '8px 0'
            }}>
                {/* Tournament label */}
                <div style={{
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontWeight: 500
                }}>
                    FIFA VM 2026 · Invigningsmatchen
                </div>

                {/* Teams row */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <FlagBadge codes={homeFlags} name={home} size={42} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{home}</span>
                    </div>
                    <div style={{
                        fontSize: '0.75rem',
                        color: 'rgba(255, 255, 255, 0.35)',
                        fontWeight: 600,
                        letterSpacing: '0.05em'
                    }}>
                        VS
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <FlagBadge codes={awayFlags} name={away} size={42} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{away}</span>
                    </div>
                </div>

                {/* Countdown digits */}
                <div style={{
                    display: 'flex',
                    gap: '6px',
                    alignItems: 'center'
                }}>
                    {units.map((unit, i) => (
                        <React.Fragment key={unit.label}>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                minWidth: '52px'
                            }}>
                                <div style={{
                                    fontSize: '1.8rem',
                                    fontWeight: 700,
                                    lineHeight: 1,
                                    fontVariantNumeric: 'tabular-nums',
                                    background: 'rgba(255, 255, 255, 0.08)',
                                    borderRadius: '10px',
                                    padding: '8px 6px',
                                    width: '100%',
                                    textAlign: 'center',
                                    backdropFilter: 'blur(8px)',
                                    border: '1px solid rgba(255, 255, 255, 0.06)'
                                }}>
                                    {String(unit.value).padStart(2, '0')}
                                </div>
                                <div style={{
                                    fontSize: '0.6rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    color: 'rgba(255, 255, 255, 0.45)',
                                    fontWeight: 500
                                }}>
                                    {unit.label}
                                </div>
                            </div>
                            {i < units.length - 1 && (
                                <div style={{
                                    fontSize: '1.4rem',
                                    fontWeight: 300,
                                    color: 'rgba(255, 255, 255, 0.25)',
                                    marginBottom: '18px'
                                }}>
                                    :
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </Card>
    );
};

export default Countdown;
