import React from 'react';
import { SearchX } from 'lucide-react';

const EmptyState = ({ message = "Inga matcher hittades.", icon: Icon = SearchX }) => {
    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '48px 24px', 
            color: 'var(--color-text-muted)',
            textAlign: 'center',
            gap: '12px'
        }}>
            <div style={{ 
                background: 'rgba(128, 128, 128, 0.05)', 
                borderRadius: '50%', 
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Icon size={32} strokeWidth={1.5} color="var(--color-text-muted)" style={{ opacity: 0.6 }} />
            </div>
            <span style={{ fontSize: '0.95rem', fontWeight: '500' }}>{message}</span>
        </div>
    );
};

export default EmptyState;
