import React from 'react';

const NavIconButton = ({ active, onClick, label, title, style, children, activeColor }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
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
};

export default NavIconButton;
