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
                                gap: '4px',
                                color,
                                transition: 'color 0.2s ease'
                            }}
                        >
                            <tab.icon size={22} strokeWidth={active ? 2.2 : 1.8} />
                            <span style={{
                                fontSize: '0.65rem',
                                fontWeight: active ? '600' : '500',
                                lineHeight: 1,
                                whiteSpace: 'nowrap'
                            }}>
                                {tab.label}
                            </span>
                            <div style={{
                                width: '4px',
                                height: '4px',
                                borderRadius: '50%',
                                backgroundColor: active ? color : 'transparent',
                                marginTop: '1px'
                            }} />
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomTabBar;
