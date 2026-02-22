
import React from 'react';

const TabBar = ({ activeTab, onTabChange }) => (
    <nav style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        border: 'var(--border)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        justifyContent: 'space-around',
        paddingTop: '8px',
        paddingBottom: '8px',
        borderRadius: '32px',
        width: 'auto',
        minWidth: '280px',
        maxWidth: '400px',
        zIndex: 1000,
        margin: '0 auto'
    }}>
        {[
            {
                id: 'os',
                label: 'OS-kollen',
                icon: (
                    <svg width="28" height="14" viewBox="0 0 110 50" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="20" cy="18" r="16" fill="none" stroke={activeTab === 'os' ? "#0085C7" : "currentColor"} strokeWidth="5" />
                        <circle cx="55" cy="18" r="16" fill="none" stroke={activeTab === 'os' ? "#000000" : "currentColor"} strokeWidth="5" />
                        <circle cx="90" cy="18" r="16" fill="none" stroke={activeTab === 'os' ? "#DF0024" : "currentColor"} strokeWidth="5" />
                        <circle cx="37.5" cy="34" r="16" fill="none" stroke={activeTab === 'os' ? "#F4C300" : "currentColor"} strokeWidth="5" />
                        <circle cx="72.5" cy="34" r="16" fill="none" stroke={activeTab === 'os' ? "#009F3D" : "currentColor"} strokeWidth="5" />
                    </svg>
                )
            },
            { id: 'vm', label: 'VM-kollen', icon: '⚽' },
            {
                id: 'sirius',
                label: 'Sirius-kollen',
                icon: (
                    <img
                        src="https://data-20ca4.kxcdn.com/teamImages%2FIKS%2Flo70q4e1-iks.png?width=100"
                        alt="Sirius"
                        style={{ height: '28px', width: 'auto', borderRadius: '4px' }}
                    />
                )
            }
        ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    style={{
                        background: 'none',
                        border: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: tab.id === 'os' ? '4px' : '2px',
                        color: isActive ? '#000000' : 'var(--color-text-muted)',
                        cursor: 'pointer',
                        flex: 1,
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        padding: '4px 0 12px 0'
                    }}
                >
                    <span style={{
                        fontSize: '1.3rem',
                        transform: isActive ? 'scale(1.1)' : 'scale(1)',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        height: '24px',
                        filter: isActive ? 'none' : 'grayscale(1) opacity(0.5)'
                    }}>
                        {tab.icon}
                    </span>
                    <span style={{
                        fontSize: '0.7rem',
                        fontWeight: isActive ? '700' : '500',
                        letterSpacing: isActive ? '-0.01em' : '0'
                    }}>
                        {tab.label}
                    </span>
                    {isActive && (
                        <div style={{
                            position: 'absolute',
                            bottom: '4px',
                            width: '20px',
                            height: '3px',
                            backgroundColor: '#000000',
                            borderRadius: '2px'
                        }} />
                    )}
                </button>
            );
        })}
    </nav>
);

export default TabBar;
