
import React from 'react';

const Card = ({ children, style = {}, padding = '20px', animate = true, glass = true, delay = 0 }) => {
    const baseStyle = {
        backgroundColor: 'var(--color-card-bg)',
        backdropFilter: glass ? 'saturate(180%) blur(20px)' : 'none',
        WebkitBackdropFilter: glass ? 'saturate(180%) blur(20px)' : 'none',
        borderRadius: 'var(--radius-lg)',
        padding,
        border: 'var(--border)',
        boxShadow: animate ? 'none' : 'var(--shadow-sm)',
        animationDelay: `${delay}ms`,
        animationFillMode: 'forwards',
        ...style
    };

    return (
        <div className={animate ? "animate-fade-in" : ""} style={baseStyle}>
            {children}
        </div>
    );
};

export default Card;
