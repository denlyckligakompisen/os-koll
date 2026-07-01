import React from 'react';
import { getRelativeDateLabel } from '../../utils/dateUtils';

const DateHeader = ({ date, monthMap, labelOverride }) => {
    if (!date && !labelOverride) return null;

    let labelText = labelOverride || getRelativeDateLabel(date, monthMap).replace('Ikväll', 'Idag');
    const isToday = labelText.toLowerCase() === 'idag';
    
    return (
        <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '12px 16px',
            color: 'var(--color-text-muted)',
            marginTop: '8px',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            margin: '8px -16px 0 -16px',
            background: 'rgba(242, 242, 246, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)'
        }}>
            <span style={{ 
                fontSize: '0.8rem', 
                textTransform: 'uppercase', 
                letterSpacing: '0.06em',
                fontWeight: '500'
            }}>
                {labelText}
            </span>
        </div>
    );
};

export default DateHeader;
