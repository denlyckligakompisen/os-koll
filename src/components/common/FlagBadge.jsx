import React from 'react';
import { flagUrl } from '../../utils/flags';

const FlagBadge = ({ codes, name, size = 22, shadow = true }) => {
    if (!codes || codes.length === 0) {
        return (
            <div style={{ 
                width: `${size}px`, 
                height: `${size}px`, 
                borderRadius: '50%', 
                border: '1px solid #ddd', 
                backgroundColor: '#fff',
                flexShrink: 0 
            }} />
        );
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: codes.length > 1 ? '1px' : '0' }}>
            {codes.map((code, idx) => {
                const imgSize = codes.length > 1 ? Math.floor(size * 0.65) : size;
                return (
                    <img 
                        key={idx} 
                        src={flagUrl(code)} 
                        alt={name} 
                        style={{ 
                            width: `${imgSize}px`, 
                            height: `${imgSize}px`, 
                            borderRadius: '50%', 
                            objectFit: 'cover', 
                            boxShadow: shadow ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            flexShrink: 0
                        }} 
                    />
                );
            })}
        </div>
    );
};

export default FlagBadge;
