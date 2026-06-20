import React from 'react';
import DateHeader from './DateHeader';
import EmptyState from './EmptyState';

const MatchGroupList = ({ groupedMatches, renderMatch, emptyMessage, monthMap }) => {
    if (!groupedMatches || groupedMatches.length === 0) {
        return <EmptyState message={emptyMessage} />;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {groupedMatches.map((group, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {group.date && (
                        <DateHeader date={group.date} monthMap={monthMap} />
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {group.matches.map((match, j) => renderMatch(match, j, group))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MatchGroupList;
