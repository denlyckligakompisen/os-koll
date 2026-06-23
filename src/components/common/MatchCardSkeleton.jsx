import React from 'react';
import Card from './Card';

const MatchCardSkeleton = ({ highlight = false }) => {
    if (highlight) {
        return (
            <Card style={{ marginBottom: '8px', minHeight: '190px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '12px' }}>
                        <div className="skeleton" style={{ width: '64px', height: '64px', borderRadius: '50%' }} />
                        <div className="skeleton" style={{ width: '80px', height: '16px', borderRadius: '4px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '120px', flexShrink: 0, gap: '6px' }}>
                        <div className="skeleton" style={{ width: '100px', height: '60px', borderRadius: '16px' }} />
                        <div className="skeleton" style={{ width: '50px', height: '12px', borderRadius: '4px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '12px' }}>
                        <div className="skeleton" style={{ width: '64px', height: '64px', borderRadius: '50%' }} />
                        <div className="skeleton" style={{ width: '80px', height: '16px', borderRadius: '4px' }} />
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card padding="12px 14px" style={{ marginBottom: '8px', display: 'flex', minHeight: '80px', alignItems: 'center' }}>
            <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
                {/* Home Team */}
                <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                    <div className="skeleton" style={{ width: '60px', height: '14px', borderRadius: '4px' }} />
                    <div className="skeleton" style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0 }} />
                </div>
                
                {/* Center Score Block */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '120px', flexShrink: 0 }}>
                    <div className="skeleton" style={{ width: '80px', height: '44px', borderRadius: '16px' }} />
                </div>
                
                {/* Away Team */}
                <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: '8px', justifyContent: 'flex-start' }}>
                    <div className="skeleton" style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0 }} />
                    <div className="skeleton" style={{ width: '60px', height: '14px', borderRadius: '4px' }} />
                </div>
            </div>
        </Card>
    );
};

export default MatchCardSkeleton;
