import React, { useState, useEffect } from 'react';
import FlagBadge from '../common/FlagBadge';

const TeamLogo = ({ logoUrl, teamName, size = 64, flags = [], onClick }) => {
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setHasError(false);
    }, [logoUrl]);

    if (logoUrl && !hasError) {
        return (
            <img
                src={logoUrl}
                alt=""
                onError={() => setHasError(true)}
                onClick={onClick}
                style={{
                    height: `${size}px`,
                    width: `${size}px`,
                    objectFit: 'contain',
                    transition: 'all 0.3s ease',
                    cursor: onClick ? 'pointer' : 'default'
                }}
            />
        );
    }

    if (flags && flags.length > 0) {
        return <FlagBadge codes={flags} name={teamName} size={size} onClick={onClick} />;
    }

    const initials = teamName
        ? teamName.replace(/\b(IF|FF|BK|AIF|IK|IS|FK|SK|BoIS)\b/g, '').trim().substring(0, 2).toUpperCase()
        : 'T';

    const colors = [
        ['#4f46e5', '#3b82f6'],
        ['#059669', '#10b981'],
        ['#dc2626', '#f43f5e'],
        ['#b45309', '#d97706'],
        ['#7c3aed', '#8b5cf6'],
        ['#0891b2', '#06b6d4'],
        ['#2563eb', '#3b82f6'],
        ['#0284c7', '#0ea5e9'],
    ];
    let sum = 0;
    for (let i = 0; i < (teamName || '').length; i++) {
        sum += (teamName || '').charCodeAt(i);
    }
    const [color1, color2] = colors[sum % colors.length];

    return (
        <div
            onClick={onClick}
            style={{
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${color1}, ${color2})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: `${Math.round(size * 0.38)}px`,
                letterSpacing: '0.02em',
                boxShadow: 'var(--shadow-sm)',
                border: '1.5px solid rgba(255, 255, 255, 0.7)',
                flexShrink: 0,
                textShadow: '0 1px 2px rgba(0,0,0,0.15)',
                userSelect: 'none',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'all 0.2s ease'
            }}
        >
            {initials}
        </div>
    );
};

export default TeamLogo;
