
import React from 'react';

const Card = ({ children, style = {}, padding = '20px', glass = true, ...props }) => {
    const baseStyle = {
        backgroundColor: 'var(--color-card-bg)',
        backdropFilter: glass ? 'saturate(180%) blur(20px)' : 'none',
        WebkitBackdropFilter: glass ? 'saturate(180%) blur(20px)' : 'none',
        borderRadius: 'var(--radius-lg)',
        padding,
        border: 'var(--border)',
        boxShadow: 'var(--shadow-sm)',
        ...style
    };

    return (
        <div style={baseStyle} {...props}>
            {children}
        </div>
    );
};

export default Card;
