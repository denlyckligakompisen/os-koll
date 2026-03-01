import React, { useState, useEffect } from 'react';
import Card from './common/Card';

const TARGET_DATE = '2028-07-14T00:00:00';

const OlympicsCountdown = () => {
    const getDaysLeft = () => Math.max(0, Math.ceil((new Date(TARGET_DATE) - new Date()) / (1000 * 60 * 60 * 24)));

    const [daysLA28, setDaysLA28] = useState(getDaysLeft);

    useEffect(() => {
        const timer = setInterval(() => setDaysLA28(getDaysLeft()), 60_000);
        return () => clearInterval(timer);
    }, []);

    return (
        <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
            <h2 style={{
                margin: '0 0 16px 0',
                fontSize: '0.9rem',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--color-text-muted)',
                textAlign: 'center'
            }}>
                Sommar-OS i Los Angeles 2028
            </h2>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--color-text)', lineHeight: 1 }}>{daysLA28}</div>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginTop: '4px' }}>dagar kvar</div>
            </div>
        </Card>
    );
};

export default OlympicsCountdown;
