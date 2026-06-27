import React from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import TeamLogo from './MatchCard/TeamLogo';
import MatchEvents from './MatchCard/MatchEvents';
import LineupsSection from './MatchCard/LineupsSection';
import { useMatchStatus } from '../hooks/useMatchStatus';
import { getFlagCodes } from '../utils/flags';
import { cleanTeamNameForDisplay } from '../utils/teamUtils';

const MatchDetailView = ({ match, onBack, variant }) => {
    // Fallbacks if flags are missing
    const homeFlags = match.homeFlags || getFlagCodes(match.home);
    const awayFlags = match.awayFlags || getFlagCodes(match.away);
    
    const { computedStatus, liveCurrentTime } = useMatchStatus(match, variant);

    const getComputedScore = () => {
        if (match.score) return match.score;
        return '';
    };

    const computedScore = getComputedScore();
    let homeScore = '';
    let awayScore = '';
    if (computedScore && computedScore.includes('-')) {
        const parts = computedScore.split('-');
        homeScore = parts[0].trim();
        awayScore = parts[1].trim();
    } else if (computedScore) {
        homeScore = computedScore;
    }

    const renderTeamName = (name) => {
        if (!name) return null;
        let mainName = cleanTeamNameForDisplay(name);
        if (name.includes('\n')) {
            const parts = name.split('\n');
            mainName = cleanTeamNameForDisplay(parts[1]);
        }
        return mainName;
    };

    // Parse progress for live timeline if needed
    const progress = Math.min((parseInt(String(liveCurrentTime).replace('HT', '45').replace('FT', '90').split('+')[0]) || 0) / 90 * 100, 100);

    return (
        <div className="animate-fade-in" style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            backgroundColor: 'var(--color-bg)',
        }}>
            {/* Navigation Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px',
                backgroundColor: 'var(--color-bg)'
            }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        color: 'var(--color-primary)',
                        padding: '8px',
                        margin: '-8px'
                    }}
                    aria-label="Tillbaka"
                >
                    <ChevronLeftIcon fontSize="large" />
                </button>
            </div>

            <div style={{ padding: '0 16px 24px 16px', flex: 1, backgroundColor: 'var(--color-card-bg)' }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                    paddingTop: '16px'
                }}>
                    
                    {/* Top Group / Competition Info */}
                    {match.group && (
                        <div style={{
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            color: 'var(--color-text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            textAlign: 'left'
                        }}>
                            {match.group}
                        </div>
                    )}

                    {/* Scoreboard Area */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        width: '100%'
                    }}>
                        {/* Home Team */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '12px' }}>
                            <TeamLogo logoUrl={match.homeLogo} teamName={match.home} size={72} flags={homeFlags} />
                            <span style={{ fontWeight: '500', textAlign: 'center', fontSize: '1rem' }}>{renderTeamName(match.home)}</span>
                        </div>

                        {/* Score and Time Center */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1.2, marginTop: '8px' }}>
                            {computedStatus === 'upcoming' ? (
                                <div style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>
                                    {match.time || 'TBA'}
                                </div>
                            ) : (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: computedStatus === 'live' ? '#28a745' : 'transparent',
                                    color: computedStatus === 'live' ? '#ffffff' : 'var(--color-text-muted)',
                                    borderRadius: computedStatus === 'live' ? '12px' : '0',
                                    padding: computedStatus === 'live' ? '8px 24px' : '0',
                                    fontSize: computedStatus === 'live' ? '2rem' : '1.25rem',
                                    fontWeight: computedStatus === 'live' ? '700' : '600',
                                    letterSpacing: computedStatus === 'live' ? '2px' : 'normal'
                                }}>
                                    <span>{homeScore}</span>
                                    <span style={{ margin: '0 8px' }}>-</span>
                                    <span>{awayScore}</span>
                                </div>
                            )}
                            
                            {computedStatus === 'live' && match.liveCurrentTime && (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '600',
                                    fontSize: '1rem',
                                    color: 'var(--color-text)'
                                }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '6px' }}>
                                        <div key={match.liveCurrentTime} className="live-minute-spinner" style={{
                                            width: '36px',
                                            height: '36px',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                            color: 'var(--color-text)',
                                            fontSize: '0.85rem',
                                            zIndex: 2
                                        }}>
                                            <div className="live-minute-spinner-inner">
                                                {match.liveCurrentTime && match.liveCurrentTime !== 'HT' && match.liveCurrentTime !== 'FT' 
                                                    ? (String(match.liveCurrentTime).includes("'") ? match.liveCurrentTime : `${match.liveCurrentTime}'`)
                                                    : match.liveCurrentTime}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '4px', marginBottom: '2px', zIndex: 2, position: 'relative' }}>
                                        {(() => {
                                            const p = String(match.period);
                                            if (p === '1' || p === '3') return '1:a halvlek';
                                            if (p === '4') return 'Halvtid';
                                            if (p === '2' || p === '5') return '2:a halvlek';
                                            if (p === '6') return 'Inför förlängning';
                                            if (p === '7') return 'Förlängning (1:a)';
                                            if (p === '8') return 'Paus';
                                            if (p === '9') return 'Förlängning (2:a)';
                                            if (p === '10') return 'Inför straffar';
                                            if (p === '11') return 'Straffläggning';
                                            if (p === 'Finished' || p === '0') return '';
                                            return '';
                                        })()}
                                    </div>
                                    {/* Vertical line connecting the text towards the timeline */}
                                    <div style={{
                                        width: '2px',
                                        height: '36px',
                                        backgroundColor: 'rgba(128,128,128,0.3)',
                                        marginBottom: '-36px',
                                        zIndex: 1
                                    }} />
                                </div>
                            )}
                            {computedStatus === 'finished' && (
                                <div style={{ marginTop: '12px', fontSize: '0.85rem', fontWeight: '500', color: 'var(--color-text-muted)' }}>
                                    Avslutad
                                </div>
                            )}
                        </div>

                        {/* Away Team */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '12px' }}>
                            <TeamLogo logoUrl={match.awayLogo} teamName={match.away} size={72} flags={awayFlags} />
                            <span style={{ fontWeight: '500', textAlign: 'center', fontSize: '1rem' }}>{renderTeamName(match.away)}</span>
                        </div>
                    </div>

                    {/* Timeline / Events */}
                    <div style={{ marginTop: '16px' }}>
                        <MatchEvents match={match} />
                    </div>

                    {/* Lineups Section */}
                    {(match.startingXI?.home?.length > 0 || match.startingXI?.away?.length > 0) && (
                        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div className="animate-fade-in" style={{ width: '100%', overflow: 'hidden' }}>
                                <LineupsSection match={match} />
                            </div>
                        </div>
                    )}

                    {/* Empty State for Missing Data */}
                    {computedStatus === 'finished' && 
                     (!match.scorers?.home?.length && !match.scorers?.away?.length && !match.bookings?.length && !match.substitutions?.length) && 
                     (!match.startingXI?.home?.length && !match.startingXI?.away?.length) && (
                        <div style={{ 
                            marginTop: '32px', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            padding: '32px 16px', 
                            color: 'var(--color-text-muted)',
                            backgroundColor: 'rgba(128, 128, 128, 0.05)',
                            borderRadius: '16px',
                            margin: '32px 16px 16px 16px'
                        }}>
                            <div style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '8px', color: 'var(--color-text)' }}>Ingen detaljdata tillgänglig</div>
                            <div style={{ fontSize: '0.85rem', textAlign: 'center', maxWidth: '280px', lineHeight: 1.5 }}>
                                Matchhändelser, laguppställningar och statistik saknas tyvärr från dataleverantören för just den här matchen.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MatchDetailView;
