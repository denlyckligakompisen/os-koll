import React from 'react';
import Card from './Card';

const MatchCardSkeleton = ({ highlight = false }) => {
    if (highlight) {
        return (
            <Card style={{ marginBottom: '8px', minHeight: '180px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '12px' }}>
                        <div className="skeleton" style={{ width: '64px', height: '64px', borderRadius: '50%' }} />
                        <div className="skeleton" style={{ width: '70px', height: '16px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '90px', flexShrink: 0, gap: '6px' }}>
                        <div className="skeleton" style={{ width: '60px', height: '32px', borderRadius: '12px' }} />
                        <div className="skeleton" style={{ width: '40px', height: '12px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '12px' }}>
                        <div className="skeleton" style={{ width: '64px', height: '64px', borderRadius: '50%' }} />
                        <div className="skeleton" style={{ width: '70px', height: '16px' }} />
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card padding="12px 14px" style={{ marginBottom: '8px', display: 'flex', minHeight: '56px' }}>
            <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '12px' }}>
                <div className="skeleton" style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0 }} />
                
                <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: '8px' }}>
                    <div className="skeleton" style={{ flex: 1, height: '14px', borderRadius: '4px' }} />
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '70px', flexShrink: 0 }}>
                        <div className="skeleton" style={{ width: '40px', height: '20px', borderRadius: '6px' }} />
                    </div>
                    
                    <div className="skeleton" style={{ flex: 1, height: '14px', borderRadius: '4px' }} />
                </div>

                <div className="skeleton" style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0 }} />
            </div>
        </Card>
    );
};

export default MatchCardSkeleton;
