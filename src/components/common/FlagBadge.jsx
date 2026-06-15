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

    let badgeContent;
    
    if (codes && codes.length > 1) {
        const displayCodes = codes.slice(0, 4);
        badgeContent = (
            <div style={{
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: '50%',
                overflow: 'hidden',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gridTemplateRows: '1fr 1fr',
                border: shadow ? 'var(--border-flag)' : 'none',
                boxShadow: shadow ? 'var(--drop-shadow-flag)' : 'none',
                flexShrink: 0,
                backgroundColor: 'var(--color-bg)'
            }}>
                {displayCodes.map((code, idx) => (
                    <img 
                        key={idx}
                        src={flagUrl(code)}
                        alt=""
                        aria-hidden="true"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            gridColumn: displayCodes.length === 3 && idx === 2 ? '1 / span 2' : 'auto'
                        }}
                    />
                ))}
            </div>
        );
    } else {
        badgeContent = (
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
                        <div key={idx} style={{ 
                            position: 'relative', 
                            width: `${imgSize}px`, 
                            height: `${imgSize}px`, 
                            flexShrink: 0,
                            filter: shadow ? 'var(--drop-shadow-flag)' : 'none'
                        }}>
                            <img 
                                src={flagUrl(code)} 
                                alt="" 
                                aria-hidden="true"
                                style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    borderRadius: '50%', 
                                    objectFit: 'cover', 
                                    border: shadow ? 'var(--border-flag)' : 'none',
                                    transition: 'transform 0.3s ease',
                                    display: 'block'
                                }} 
                            />
                            {shadow && (
                                <div style={{
                                    position: 'absolute',
                                    top: 0, left: 0, right: 0, bottom: 0,
                                    borderRadius: '50%',
                                    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)',
                                    pointerEvents: 'none'
                                }} />
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

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
