
import React from 'react';

const PageHeader = ({ title, subtitle, icon, logoSrc, style = {} }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            marginBottom: '16px',
            textAlign: 'center',
            ...style
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
                {logoSrc ? (
                    <img
                        src={logoSrc}
                        alt={title}
                        style={{
                            height: '32px',
                            width: 'auto',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                        }}
                    />
                ) : icon}
                <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.04em', color: '#000000' }}>
                    {title}
                </h2>
            </div>
            {subtitle && (
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: '500' }}>
                    {subtitle}
                </div>
            )}
        </div>
    );
};

export default PageHeader;
