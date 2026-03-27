import React from 'react';
import Card from './common/Card';
import BoldSverige from './BoldSverige';
import { getFlagCodes } from '../utils/flags';
import FlagBadge from './common/FlagBadge';

const MatchCard = ({ match, idx, ...props }) => {
    const homeFlags = getFlagCodes(match.home);
    const awayFlags = getFlagCodes(match.away);

    const content = (
        <Card key={idx} padding="12px 14px" style={{
            border: 'var(--border)', boxShadow: 'none', backgroundColor: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '12px', ...props.style
        }}>
            <FlagBadge codes={homeFlags} name={match.home} size={22} />
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, justifyContent: 'center' }}>
                <div style={{ fontSize: '0.9rem', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textAlign: 'center' }}>
                    <span style={{ flex: 1, textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <BoldSverige text={match.home} />
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '70px' }}>
                        {match.broadcast && (
                            <div style={{ fontSize: '0.6rem', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {match.broadcast}
                            </div>
                        )}
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: '800', flexShrink: 0, backgroundColor: 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                            {match.time}
                        </span>
                    </div>
                    <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <BoldSverige text={match.away} />
                    </span>
                </div>
            </div>
            <FlagBadge codes={awayFlags} name={match.away} size={22} />
        </Card>
    );

    if (match.link) {
        return (
            <a href={match.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
                {content}
            </a>
        );
    }
    return content;
};

export default MatchCard;
