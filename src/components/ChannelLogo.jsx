import React from 'react';

const ChannelLogo = ({ channel, size = 24 }) => {
    const normalizedChannel = channel.toLowerCase();

    if (normalizedChannel.includes('svt')) {
        return (
            <svg width={size * 2.5} height={size} viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="SVT">
                {/* Simple background pill if needed, or just the logo. Let's do a stylized 'svt' text for now as the flower is complex */}
                {/* This is a simplified representation */}
                <path d="M15 28C10 28 8 26 8 22H12C12 24 13 25 15 25C17 25 18 24 18 22C18 19 12 19 12 15C12 11 15 9 19 9C23 9 25 11 25 15H21C21 13 20 12 19 12C17 12 16 13 16 15C16 17 22 17 22 22C22 26 19 28 15 28Z" fill="white" />
                <path d="M35 28L28 9H32L37 24L42 9H46L39 28H35Z" fill="white" />
                <path d="M58 12H53V28H49V12H44V9H58V12Z" fill="white" />
                {/* The 'flower' icon roughly approximated or just kept as text for clarity at small sizes */}
            </svg>
        );
    }

    if (normalizedChannel.includes('tv4')) {
        return (
            <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="TV4">
                <circle cx="20" cy="20" r="20" fill="#dc2626" />
                <path d="M26 23H22V28H18V23H13V19L19 9H22V19H26V23ZM18 19V13.5L14.5 19H18Z" fill="white" />
            </svg>
        );
    }

    if (normalizedChannel.includes('max')) {
        return (
            <svg width={size * 2.5} height={size} viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Max">
                <path d="M10 28V12H16L22 22L28 12H34V28H29V18L22 28L15 18V28H10Z" fill="#2563eb" />
                <path d="M45 28L43 23H57L55 28H45ZM50 12L39 31H44L46 26H54L56 31H61L50 12Z" fill="#2563eb" />
                <path d="M68 12L74 20L68 28H74L77 23L80 28H86L80 20L86 12H80L77 17L74 12H68Z" fill="#2563eb" />
                {/* Simplified abstract 'target' in the 'a' omitted for simplicity, stick to wordmark */}
            </svg>
        );
    }

    // Fallback text
    return (
        <span style={{ fontWeight: 800, fontSize: '0.8rem', color: '#fff' }}>
            {channel}
        </span>
    );
};

export default ChannelLogo;
