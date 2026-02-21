import React from 'react';
import ChannelLogo from '../ChannelLogo';

const SvtPlayBadge = ({ link, isLive }) => {
    return (
        <div
            title="Sänds på SVT"
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '2px 10px',
                backgroundColor: 'rgba(52, 199, 89, 0.15)', // Lighten background
                color: '#34c759',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: '800',
                textDecoration: 'none',
                border: '1px solid rgba(52, 199, 89, 0.2)'
            }}
        >
            <ChannelLogo channel="SVT" size={18} />
            <span style={{ fontSize: '0.7rem', color: '#00c800', fontWeight: '800' }}>PLAY</span>
            {isLive && (
                <span
                    className="live-indicator-pulse"
                    style={{
                        width: '6px',
                        height: '6px',
                        backgroundColor: '#ff3b30',
                        borderRadius: '50%',
                        marginLeft: '2px'
                    }}
                />
            )}
        </div>
    );
};

export default SvtPlayBadge;
