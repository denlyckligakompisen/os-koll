import React, { useEffect, useState } from 'react';
import Card from './common/Card';

const Countdown = () => {
    const getTimeLeft = () => {
        const diff = new Date('2026-06-11T21:00:00') - new Date();
        if (diff <= 0) return null;
        return { days: Math.floor(diff / (1000 * 60 * 60 * 24)) };
    };

    const [timeLeft, setTimeLeft] = useState(getTimeLeft);

    useEffect(() => {
        const timer = setInterval(() => setTimeLeft(getTimeLeft()), 60_000);
        return () => clearInterval(timer);
    }, []);

    if (!timeLeft) return null;

    return (
        <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>

            <div style={{ textAlign: 'center' }}>
                <div key={timeLeft.days} className="animate-fade-in" style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--color-text)', lineHeight: 1 }}>
                    {timeLeft.days}
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginTop: '4px' }}>
                    dagar kvar
                </div>
            </div>
        </Card>
    );
};

export default Countdown;
