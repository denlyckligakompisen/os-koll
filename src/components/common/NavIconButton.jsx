import React from 'react';

const NavIconButton = ({ active, onClick, label, title, style, children, activeColor, showLabel }) => {
    const button = (
        <button
            type="button"
            onClick={onClick}
            aria-label={showLabel ? undefined : label}
            aria-current={active ? 'page' : undefined}
            title={title}
            style={{
                backgroundColor: active ? (activeColor || 'var(--color-primary)') : 'rgba(118, 118, 128, 0.12)',
                borderRadius: '50%',
                padding: 0,
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                color: active ? 'white' : 'var(--color-text)',
                border: 'none',
                cursor: 'pointer',
                ...style
            }}
        >
            {children}
        </button>
    );

    if (!showLabel) return button;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            {button}
            <span style={{
                fontSize: '0.6rem',
                fontWeight: active ? '600' : '500',
                color: active ? (activeColor || 'var(--color-primary)') : 'var(--color-text-muted)',
                lineHeight: 1,
                transition: 'color 0.2s ease',
                whiteSpace: 'nowrap'
            }}>
                {label}
            </span>
        </div>
    );
};

export default NavIconButton;
