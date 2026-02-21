
import React, { useState, useEffect } from 'react';

const LACountdown = () => {
    const calculateTimeLeft = () => {
        // LA 2028: July 14, 2028
        const targetDate = new Date('2028-07-14T20:00:00');
        const now = new Date();
        const difference = targetDate - now;

        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        } else {
            timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }

        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div style={{
            marginTop: '64px',
            padding: '40px 24px',
            borderRadius: '28px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            textAlign: 'center',
            marginBottom: '60px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
        }}>
            {/* Background decoration */}
            <div style={{
                position: 'absolute',
                top: '-10%',
                right: '-10%',
                width: '100px',
                height: '100px',
                background: 'rgba(56, 189, 248, 0.1)',
                filter: 'blur(40px)',
                borderRadius: '50%'
            }} />

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
                position: 'relative',
                zIndex: 1
            }}>
                {/* LA28 Logo Placeholder/Image */}
                <div style={{
                    height: '100px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '8px'
                }}>
                    <img
                        src="/la28_logo.png"
                        alt="LA28"
                        style={{
                            height: '100%',
                            filter: 'brightness(0) invert(1)', // Gör loggan vit för att passa temat
                            opacity: 0.9
                        }}
                        onError={(e) => {
                            // Fallback om bilden saknas
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div style="font-size: 3rem; font-weight: 900; letter-spacing: -2px;">LA28</div>';
                        }}
                    />
                </div>

                <div style={{
                    fontSize: '0.8rem',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '0.3em',
                    color: 'var(--color-primary)',
                    opacity: 0.9
                }}>
                    NÄSTA OS
                </div>

                <div style={{
                    display: 'flex',
                    gap: '10px',
                    justifyContent: 'center',
                    width: '100%',
                    marginTop: '8px'
                }}>
                    <TimeSegment value={timeLeft.days} label="dagar" />
                    <TimeSegment value={timeLeft.hours} label="tim" />
                    <TimeSegment value={timeLeft.minutes} label="min" />
                    <TimeSegment value={timeLeft.seconds} label="sek" />
                </div>

                <div style={{
                    marginTop: '16px',
                    padding: '8px 20px',
                    borderRadius: '30px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    fontSize: '0.85rem',
                    color: 'var(--color-text)',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <span>🌴</span>
                    <span style={{ opacity: 0.9 }}>14 juli – 30 juli 2028</span>
                </div>
            </div>
        </div>
    );
};

const TimeSegment = ({ value, label }) => (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flex: 1,
        minWidth: '65px',
        padding: '14px 4px',
        background: 'rgba(15, 23, 42, 0.6)',
        borderRadius: '18px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
    }}>
        <span style={{
            fontSize: '1.75rem',
            fontWeight: '900',
            color: '#fff',
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums'
        }}>{value}</span>
        <span style={{
            fontSize: '0.55rem',
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            marginTop: '6px',
            letterSpacing: '0.1em',
            fontWeight: '700'
        }}>{label}</span>
    </div>
);

export default LACountdown;
