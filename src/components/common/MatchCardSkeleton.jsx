import React from 'react';
import Card from './Card';

const MatchCardSkeleton = () => {
    return (
        <Card style={{ marginBottom: '12px' }}>
                {/* Header: Time and Group */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div className="skeleton" style={{ width: '40px', height: '14px' }} />
                    <div className="skeleton" style={{ width: '60px', height: '14px' }} />
                </div>

                {/* Teams Layout */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                    
                    {/* Home Team */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '8px' }}>
                        <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
                        <div className="skeleton" style={{ width: '70px', height: '16px' }} />
                    </div>

                    {/* Center Score/VS Area */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '80px', flexShrink: 0, gap: '4px' }}>
                        <div className="skeleton" style={{ width: '60px', height: '32px', borderRadius: '8px' }} />
                        <div className="skeleton" style={{ width: '40px', height: '12px' }} />
                    </div>

                    {/* Away Team */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '8px' }}>
                        <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
                        <div className="skeleton" style={{ width: '70px', height: '16px' }} />
                    </div>

                </div>
        </Card>
    );
};

export default MatchCardSkeleton;
