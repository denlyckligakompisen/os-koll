
import React, { useState, useEffect } from 'react';

const OlympicsCountdown = () => {
    const calculateDaysLeft = (targetDate) => {
        const now = new Date();
        const difference = new Date(targetDate) - now;
        return Math.max(0, Math.ceil(difference / (1000 * 60 * 60 * 24)));
    };

    const [daysLA28, setDaysLA28] = useState(calculateDaysLeft('2028-07-14T20:00:00'));

    useEffect(() => {
        const timer = setInterval(() => {
            setDaysLA28(calculateDaysLeft('2028-07-14T20:00:00'));
        }, 60000); // Update every minute

        return () => clearInterval(timer);
    }, []);

    return (
        <div style={{
            marginTop: '0px',
            padding: '24px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            marginBottom: '100px'
        }}>
            <h2 style={{
                fontSize: '0.8rem',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--color-text-muted)',
                textAlign: 'center',
                marginBottom: '8px'
            }}>
                Nästa OS
            </h2>

            <a
                href="https://la28.org/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    width: '100%',
                    transition: 'transform 0.2s ease',
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                {/* LA 2028 */}
                <div style={{
                    margin: '0 16px 0 16px',
                    padding: '20px',
                    backgroundColor: 'var(--color-card-bg)',
                    backdropFilter: 'blur(16px)',
                    borderRadius: 'var(--radius-lg)',
                    border: 'var(--border)',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    width: '280px',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        height: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/2028_Summer_Olympics_logo.svg/300px-2028_Summer_Olympics_logo.svg.png"
                            alt="LA28 Logo"
                            style={{ height: '100%', width: 'auto', objectFit: 'contain' }}
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = '<div style="font-size: 1.2rem; font-weight: 900; color: #1e293b; letter-spacing: -0.5px;">Los Angeles 2028</div>';
                            }}
                        />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--color-text)', lineHeight: 1 }}>{daysLA28}</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginTop: '4px' }}>dagar kvar</div>
                    </div>
                </div>
            </a>
        </div>
    );
};

export default OlympicsCountdown;
