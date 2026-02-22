
import React from 'react';

const Card = ({ children, style = {}, padding = '20px', animate = true, glass = true }) => {
    const baseStyle = {
        backgroundColor: 'var(--color-card-bg)',
        backdropFilter: glass ? 'saturate(180%) blur(20px)' : 'none',
        WebkitBackdropFilter: glass ? 'saturate(180%) blur(20px)' : 'none',
        borderRadius: '24px',
        padding,
        border: 'var(--border)',
        boxShadow: 'var(--shadow-sm)',
        ...style
    };

    return (
        <div className={animate ? "animate-fade-in" : ""} style={baseStyle}>
            {children}
        </div>
    );
};

export default Card;
