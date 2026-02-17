import React from 'react';

const ChannelLogo = ({ channel, size = 24 }) => {
    const normalizedChannel = channel.toLowerCase();

    if (normalizedChannel.includes('svt')) {
        return (
            <div style={{
                backgroundColor: 'white',
                padding: '4px 12px',
                borderRadius: '100px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                height: size
            }}>
                <svg width={size * 1.5} height={size * 0.6} viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 15C7 15 5 13 5 10H8C8 11 9 12 10 12C11 12 12 11 12 10C12 8 8 8 8 6C8 4 10 3 12 3C14 3 16 4 16 6H13C13 5 12 4 12 4C11 4 11 5 11 6C11 7 15 7 15 10C15 13 13 15 10 15Z" fill="#1f2937" />
                    <path d="M25 15L20 3H22L25 12.5L28 3H30L25 15Z" fill="#1f2937" />
                    <path d="M40 5H36V15H33V5H29V3H40V5Z" fill="#1f2937" />
                </svg>
                <div style={{
                    width: '0',
                    height: '0',
                    borderTop: '5px solid transparent',
                    borderBottom: '5px solid transparent',
                    borderLeft: '8px solid #00d900',
                    marginLeft: '2px'
                }} />
            </div>
        );
    }

    if (normalizedChannel.includes('tv4')) {
        return (
            <div style={{
                backgroundColor: 'white',
                padding: '4px 8px',
                borderRadius: '100px',
                display: 'flex',
                alignItems: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                height: size
            }}>
                <div style={{
                    width: size * 0.8,
                    height: size * 0.8,
                    backgroundColor: '#e11212',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '900',
                    fontSize: size * 0.6,
                    fontFamily: 'Arial, sans-serif'
                }}>
                    4
                </div>
            </div>
        );
    }

    if (normalizedChannel.includes('max') || normalizedChannel.includes('hbo')) {
        return (
            <div style={{
                backgroundColor: 'white',
                padding: '4px 12px',
                borderRadius: '100px',
                display: 'flex',
                alignItems: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                height: size
            }}>
                <span style={{
                    color: '#002be7',
                    fontWeight: '900',
                    fontSize: size * 0.7,
                    fontFamily: 'Arial, sans-serif',
                    letterSpacing: '-0.5px'
                }}>
                    Max
                </span>
            </div>
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
