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
        <Card padding="0px" style={{ marginBottom: '8px', minHeight: '80px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', width: '100%', alignItems: 'stretch' }}>
                {/* Left Block: Time */}
                <div style={{ width: '72px', flexShrink: 0, padding: '16px 4px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="skeleton" style={{ width: '40px', height: '14px', borderRadius: '4px' }} />
                </div>

                {/* Right Block: Teams */}
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center', gap: '12px', padding: '16px 16px 16px 0' }}>
                    {/* Home Team */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div className="skeleton" style={{ width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0 }} />
                        <div className="skeleton" style={{ width: '120px', height: '14px', borderRadius: '4px' }} />
                    </div>
                    {/* Away Team */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div className="skeleton" style={{ width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0 }} />
                        <div className="skeleton" style={{ width: '100px', height: '14px', borderRadius: '4px' }} />
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default MatchCardSkeleton;
