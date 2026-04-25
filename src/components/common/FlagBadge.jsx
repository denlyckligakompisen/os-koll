import React from 'react';
import { flagUrl } from '../../utils/flags';

const FlagBadge = ({ codes, name, size = 22, shadow = true, onClick }) => {
    if (!codes || codes.length === 0) {
        return (
            <div 
                onClick={onClick}
                style={{ 
                    width: `${size}px`, 
                    height: `${size}px`, 
                    borderRadius: '50%', 
                    border: '1px solid #ddd', 
                    backgroundColor: '#fff',
                    flexShrink: 0,
                    cursor: onClick ? 'pointer' : 'default'
                }} 
            />
        );
    }

    const badgeContent = (
        <div 
            style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: (codes && codes.length > 1) ? '1px' : '0',
            }}
        >
            {codes && codes.map((code, idx) => {
                const imgSize = codes.length > 1 ? Math.floor(size * 0.65) : size;
                return (
                    <img 
                        key={idx} 
                        src={flagUrl(code)} 
                        alt="" 
                        aria-hidden="true"
                        style={{ 
                            width: `${imgSize}px`, 
                            height: `${imgSize}px`, 
                            borderRadius: '50%', 
                            objectFit: 'cover', 
                            border: shadow ? 'var(--border-flag)' : 'none',
                            filter: shadow ? 'var(--drop-shadow-flag)' : 'none',
                            transition: 'transform 0.3s ease',
                            flexShrink: 0
                        }} 
                    />
                );
            })}
        </div>
    );

    if (onClick) {
        return (
            <button
                onClick={onClick}
                aria-label={`Visa information om ${name}`}
                style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    margin: 0,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: '50%'
                }}
            >
                {badgeContent}
            </button>
        );
    }

    return badgeContent;
};

export default FlagBadge;
