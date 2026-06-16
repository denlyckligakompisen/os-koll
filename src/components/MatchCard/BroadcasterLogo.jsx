import React from 'react';

const BroadcasterLogo = ({ name, size = 'default' }) => {
    if (!name) return null;
    const b = name.toUpperCase().trim();
    const isLarge = size === 'large';
    const height = isLarge ? 18 : 14;

    if (b.includes('SVT')) {
        return (
            <svg viewBox="0 0 120 40" height={height} aria-label="SVT" style={{ display: 'block' }}>
                <rect width="120" height="40" rx="6" fill="#1B6E1F" />
                <text x="60" y="29" textAnchor="middle" fill="#ffffff" fontFamily="'Inter', Arial, sans-serif" fontSize="24" fontWeight="700" letterSpacing="2">SVT</text>
            </svg>
        );
    }

    if (b.includes('TV4')) {
        return (
            <svg viewBox="0 0 120 40" height={height} aria-label="TV4" style={{ display: 'block' }}>
                <rect width="120" height="40" rx="6" fill="#E3000B" />
                <text x="60" y="29" textAnchor="middle" fill="#ffffff" fontFamily="'Inter', Arial, sans-serif" fontSize="24" fontWeight="700" letterSpacing="2">TV4</text>
            </svg>
        );
    }

    if (b.includes('MAX')) {
        return (
            <img src="/max_logo.svg" alt="Max" style={{ height: `${height}px`, objectFit: 'contain', display: 'block' }} />
        );
    }

    // Fallback: plain text for unknown broadcasters
    return (
        <span style={{ fontSize: isLarge ? '0.8rem' : '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>
            {name}
        </span>
    );
};

export default BroadcasterLogo;
