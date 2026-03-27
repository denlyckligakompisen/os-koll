import React from 'react';
import Card from './common/Card';
import BoldSverige from './BoldSverige';
import { getFlagCodes, flagUrl } from '../utils/flags';

const MatchCard = ({ match, idx, ...props }) => {
    const homeFlags = getFlagCodes(match.home);
    const awayFlags = getFlagCodes(match.away);

    const renderBadge = (codes, name) => (
        <div style={{
            width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
                {codes.map((code, fIdx) => (
                    code !== 'UN' ? (
                        <img key={fIdx} src={flagUrl(code)} alt={name} width={codes.length > 1 ? 14 : 22} height={codes.length > 1 ? 14 : 22} style={{ borderRadius: '50%', objectFit: 'cover', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                    ) : codes.length === 1 ? (
                        <div key={fIdx} style={{ width: '22px', height: '22px', borderRadius: '50%', border: '1px solid rgba(0,0,0,0.1)', backgroundColor: 'transparent' }} />
                    ) : null
                ))}
            </div>
        </div>
    );

    const content = (
        <Card key={idx} padding="12px 14px" style={{
            border: 'var(--border)', boxShadow: 'none', backgroundColor: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '12px', ...props.style
        }}>
            {renderBadge(homeFlags, match.home)}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, justifyContent: 'center' }}>
                <div style={{ fontSize: '0.9rem', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textAlign: 'center' }}>
                    <span style={{ flex: 1, textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <BoldSverige text={match.home} />
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: '800', flexShrink: 0, backgroundColor: 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                        {match.time}
                    </span>
                    <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <BoldSverige text={match.away} />
                    </span>
                </div>
            </div>
            {renderBadge(awayFlags, match.away)}
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
