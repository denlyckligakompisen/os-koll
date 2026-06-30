import React from 'react';
import { CircleDashed } from 'lucide-react';

const EmptyState = ({ message = "Domaren har blåst av! Vi hittar inga matcher här.", icon: Icon = CircleDashed }) => {
    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '64px 24px', 
            color: 'var(--color-text-muted)',
            textAlign: 'center',
            gap: '16px'
        }}>
            <div style={{ 
                background: 'var(--color-surface-subtle)', 
                borderRadius: '50%', 
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.02)'
            }}>
                <Icon size={40} strokeWidth={1.5} color="var(--color-text-muted)" style={{ opacity: 0.7 }} />
            </div>
            <span style={{ fontSize: '1rem', fontWeight: '500', maxWidth: '250px', lineHeight: '1.4' }}>{message}</span>
        </div>
    );
};

export default EmptyState;
