
import React from 'react';

const SvtPlayBadge = ({ link, isLive }) => {
    return (
        <div
            title="Sänds på SVT"
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                backgroundColor: '#34c759', // iOS System Green
                color: 'white',
                borderRadius: '6px',
                fontSize: '0.7rem',
                fontWeight: '700',
                textDecoration: 'none'
            }}
        >
            SVT
            {isLive && (
                <span
                    className="live-indicator-pulse"
                    style={{
                        width: '5px',
                        height: '5px',
                        backgroundColor: '#ff3b30', // iOS System Red
                        borderRadius: '50%',
                        marginLeft: '2px'
                    }}
                />
            )}
        </div>
    );
};

export default SvtPlayBadge;
