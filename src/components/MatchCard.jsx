import React from 'react';
import Card from './common/Card';
import BoldSverige from './BoldSverige';
import { getFlagCodes } from '../utils/flags';
import FlagBadge from './common/FlagBadge';

const MatchCard = ({ match, idx, onCountryClick, ...props }) => {
    const homeFlags = getFlagCodes(match.home);
    const awayFlags = getFlagCodes(match.away);

    const handleTeamClick = (e, name) => {
        if (!onCountryClick) return;
        e.preventDefault();
        e.stopPropagation();
        
        // If it's a multi-team string like "3A/B/C/D", we might want to handle it differently,
        // but for now let's just pass the whole string.
        // If it's something like "1A\nSverige", we want "Sverige".
        const country = name.includes('\n') ? name.split('\n')[1] : name;
        onCountryClick(country);
    };

    const renderTeamName = (name) => {
        if (!name) return null;
        if (name.includes('\n')) {
            const [rank, teamName] = name.split('\n');
            return (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>{rank}</span>
                    <BoldSverige text={teamName} />
                </div>
            );
        }
        return <BoldSverige text={name} />;
    };

    const getBroadcasterUrl = (broadcast) => {
        if (!broadcast) return null;
        const b = broadcast.toUpperCase();
        if (b.includes('SVT')) return 'https://www.svtplay.se/kategori/fotbolls-vm';
        if (b.includes('TV4')) return 'https://www.tv4play.se/kategorier/fifa-fotbolls-vm-2026';
        return null;
    };

    const handleBroadcastClick = (e) => {
        const url = getBroadcasterUrl(match.broadcast);
        if (url) {
            e.preventDefault();
            e.stopPropagation();
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    const content = (
        <Card key={idx} padding="12px 14px" style={{
            border: 'var(--border)', boxShadow: 'none', backgroundColor: 'var(--color-card-bg)', display: 'flex', alignItems: 'center', gap: '12px', ...props.style
        }}>
            <FlagBadge codes={homeFlags} name={match.home} size={28} onClick={(e) => handleTeamClick(e, match.home)} />
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, justifyContent: 'center' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--color-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textAlign: 'center' }}>
                    <button 
                        onClick={(e) => handleTeamClick(e, match.home)}
                        aria-label={`Visa information om ${match.home}`}
                        style={{ 
                            flex: 1, 
                            textAlign: 'right', 
                            whiteSpace: 'normal', 
                            lineHeight: '1.2', 
                            wordBreak: 'break-word', 
                            cursor: onCountryClick ? 'pointer' : 'default',
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            font: 'inherit',
                            color: 'inherit'
                        }}
                    >
                        {renderTeamName(match.home)}
                    </button>
                    <button 
                        onClick={handleBroadcastClick}
                        aria-label={match.broadcast ? `Gå till sändning på ${match.broadcast}` : 'Matchinformation'}
                        disabled={!getBroadcasterUrl(match.broadcast)}
                        style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            gap: '4px', 
                            minWidth: '70px', 
                            flexShrink: 0, 
                            cursor: getBroadcasterUrl(match.broadcast) ? 'pointer' : 'default',
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            font: 'inherit',
                            color: 'inherit'
                        }}
                    >
                        {match.group && (
                            <div style={{ fontSize: '0.6rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '2px' }}>
                                {match.group}
                                {match.isPreliminary && ' (prel.)'}
                            </div>
                        )}
                        <span style={{ 
                            fontSize: '0.8rem', 
                            color: match.status === 'live' ? '#ff3b30' : 'var(--color-text)', 
                            fontWeight: '800', 
                            flexShrink: 0, 
                            backgroundColor: match.status === 'live' ? 'rgba(255, 59, 48, 0.1)' : 'var(--color-surface-subtle)', 
                            padding: '2px 8px', 
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}>
                            {match.status === 'live' && <span className="live-indicator-pulse" aria-hidden="true" style={{ width: '6px', height: '6px', backgroundColor: '#ff3b30', borderRadius: '50%' }} />}
                            {match.status === 'live' ? 'LIVE' : match.time}
                        </span>
                        {match.broadcast && (
                            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>
                                {match.broadcast}
                            </div>
                        )}
                    </button>
                    <button 
                        onClick={(e) => handleTeamClick(e, match.away)}
                        aria-label={`Visa information om ${match.away}`}
                        style={{ 
                            flex: 1, 
                            textAlign: 'left', 
                            whiteSpace: 'normal', 
                            lineHeight: '1.2', 
                            wordBreak: 'break-word', 
                            cursor: onCountryClick ? 'pointer' : 'default',
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            font: 'inherit',
                            color: 'inherit'
                        }}
                    >
                        {renderTeamName(match.away)}
                    </button>
                </div>
            </div>
            <FlagBadge codes={awayFlags} name={match.away} size={28} onClick={(e) => handleTeamClick(e, match.away)} />
        </Card>
    );

    return content;
};

export default MatchCard;
