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
            paddingLeft: '4px',
            color: isToday ? 'var(--color-primary)' : 'var(--color-text-muted)',
            marginTop: '8px'
        }}>
            <span style={{ 
                fontSize: '0.8rem', 
                textTransform: 'uppercase', 
                letterSpacing: '0.06em',
                fontWeight: isToday ? '700' : '500'
            }}>
                {labelText}
            </span>
        </div>
    );
};

export default DateHeader;
