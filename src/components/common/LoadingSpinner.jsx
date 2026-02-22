import React from 'react';

const LoadingSpinner = ({ label = 'Laddar...' }) => (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '60px 20px',
        color: 'var(--color-text-muted)'
    }}>
        <div style={{
            width: '28px',
            height: '28px',
            border: '3px solid rgba(0,0,0,0.08)',
            borderTop: '3px solid var(--color-text-muted)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
        }} />
        <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{label}</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
);

export default LoadingSpinner;
