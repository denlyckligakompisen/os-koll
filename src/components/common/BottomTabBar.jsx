import React from 'react';

const BottomTabBar = ({ tabs, activeId, onSelect, activeColor }) => {
    return (
        <div className="bottom-tab-bar-wrapper" style={{
            display: 'flex',
            justifyContent: 'center',
            paddingBottom: '16px',
            zIndex: 1100,
            pointerEvents: 'none'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '28px',
                padding: '10px 24px',
                borderRadius: '9999px',
                backgroundColor: 'var(--color-card-bg)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
                pointerEvents: 'auto'
            }}>
                {tabs.map(tab => {
                    const active = tab.id === activeId;
                    const color = active ? (activeColor || 'var(--color-primary)') : 'var(--color-text-muted)';
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            className="bottom-tab-bar-btn"
                            onClick={() => onSelect(tab.id)}
                            aria-label={tab.label}
                            aria-current={active ? 'page' : undefined}
                            title={tab.title}
                            style={{
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px',
                                minWidth: '44px',
                                minHeight: '44px',
                                borderRadius: '12px',
                                color,
                                transition: 'color 0.2s ease'
                            }}
                        >
                            <tab.icon size={22} strokeWidth={active ? 2.2 : 1.8} />
                            <span style={{
                                position: 'relative',
                                fontSize: '0.65rem',
                                fontWeight: '500',
                                lineHeight: 1,
                                whiteSpace: 'nowrap',
                                visibility: active ? 'hidden' : 'visible'
                            }}>
                                {tab.label}
                                {active && (
                                    <span style={{
                                        position: 'absolute',
                                        left: '50%',
                                        top: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        width: '4px',
                                        height: '4px',
                                        borderRadius: '50%',
                                        backgroundColor: color,
                                        visibility: 'visible'
                                    }} />
                                )}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomTabBar;
