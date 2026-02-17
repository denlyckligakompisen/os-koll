
import React from 'react';

const SvtPlayBadge = ({ link, isLive }) => {
    return (
        <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            title="Sänds på SVT Play"
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                backgroundColor: '#00c800',
                color: 'white',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: '800',
                textDecoration: 'none',
                marginLeft: '4px',
                transition: 'opacity 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
        >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z" />
            </svg>
            SVT
            {isLive && (
                <span style={{
                    width: '6px',
                    height: '6px',
                    backgroundColor: '#ff4b2b',
                    borderRadius: '50%',
                    marginLeft: '2px'
                }} />
            )}
        </a>
    );
};

export default SvtPlayBadge;
