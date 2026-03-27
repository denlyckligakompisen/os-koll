import React, { useState } from 'react';
import Card from './common/Card';
import { getFlagCodes } from '../utils/flags';
import FlagBadge from './common/FlagBadge';
import BoldSverige from './BoldSverige';

const WC_ROUNDS = [
    { id: 'r32', label: '1/16-final', date: '28 juni – 3 juli' },
    { id: 'r16', label: '1/8-final', date: '4 juli – 7 juli' },
    { id: 'qf', label: 'Kvartsfinal', date: '9 juli – 11 juli' },
    { id: 'sf', label: 'Semifinal', date: '14 juli – 15 juli' },
    { id: 'f', label: 'Final', date: '19 juli' }
];

const WC_MOCK_DATA = {
    r32: [
        { id: 81, home: 'Sverige', away: 'Sydkorea', time: '18:00', date: '28 juni', venue: 'Los Angeles', broadcast: 'SVT', status: 'upcoming' },
        { id: 82, home: 'Spanien', away: 'Ecuador', time: '21:00', date: '28 juni', venue: 'Miami', broadcast: 'TV4', status: 'upcoming' },
        { id: 83, home: 'Kanada', away: 'Norge', time: '21:00', date: '29 juni', venue: 'Toronto', broadcast: 'TV4', status: 'upcoming' },
        { id: 84, home: 'Brasilien', away: 'Japan', time: '00:00', date: '29 juni', venue: 'Boston', broadcast: 'SVT', status: 'upcoming' },
    ],
    r16: [
        { id: 97, home: 'Vinnare 81', away: 'Vinnare 82', time: '21:00', date: '4 juli', venue: 'Philadelphia', broadcast: 'TV4', status: 'upcoming' },
        { id: 98, home: 'Vinnare 83', away: 'Vinnare 84', time: '21:00', date: '5 juli', venue: 'Houston', broadcast: 'SVT', status: 'upcoming' },
    ],
    qf: [
        { id: 105, home: 'Vinnare 97', away: 'Vinnare 98', time: '21:00', date: '9 juli', venue: 'Boston', broadcast: 'SVT', status: 'upcoming' },
    ],
    sf: [
        { id: 109, home: 'Vinnare 105', away: 'Vinnare 106', time: '21:00', date: '14 juli', venue: 'Dallas', broadcast: 'TV4', status: 'upcoming' },
    ],
    f: [
        { id: 112, home: 'Vinnare 109', away: 'Vinnare 110', time: '21:00', date: '19 juli', venue: 'New York/New Jersey', broadcast: 'TV4', status: 'upcoming' }
    ]
};

const VMBracket = () => {
    const [activeRound, setActiveRound] = useState('r32');

    const matches = WC_MOCK_DATA[activeRound] || [];

    return (
        <div className="animate-fade-in">
            {/* Round Metadata */}
            <div style={{ padding: '0 4px', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    {WC_ROUNDS.find(r => r.id === activeRound)?.date}
                </div>
            </div>

            {/* Rounds Selector (iOS Segmented Style) */}
            <div style={{ 
                display: 'flex', 
                overflowX: 'auto', 
                gap: '8px', 
                padding: '4px', 
                marginBottom: '24px',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
            }}>
                {WC_ROUNDS.map(round => (
                    <button
                        key={round.id}
                        onClick={() => setActiveRound(round.id)}
                        style={{
                            whiteSpace: 'nowrap',
                            padding: '10px 18px',
                            borderRadius: '12px',
                            border: 'none',
                            backgroundColor: activeRound === round.id ? 'var(--color-primary)' : 'var(--color-surface-subtle)',
                            color: activeRound === round.id ? '#ffffff' : 'var(--color-text-muted)',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                    >
                        {round.label}
                    </button>
                ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '40px' }}>
                {matches.map((m, idx) => {
                    const homeFlags = getFlagCodes(m.home);
                    const awayFlags = getFlagCodes(m.away);
                    
                    return (
                        <Card key={m.id} delay={idx * 60} style={{ border: 'var(--border)', backgroundColor: 'var(--color-card-bg)' }} padding="16px">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Match {m.id} · {m.venue}
                                </div>
                                <div style={{ 
                                    fontSize: '0.7rem', 
                                    fontWeight: '900', 
                                    backgroundColor: 'rgba(0, 122, 255, 0.1)', 
                                    color: 'var(--color-primary)',
                                    padding: '2px 8px', 
                                    borderRadius: '4px' 
                                }}>
                                    {m.date}
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <FlagBadge codes={homeFlags} name={m.home} size={30} />
                                    <span style={{ fontWeight: '700', fontSize: '1rem', lineHeight: '1.2' }}><BoldSverige text={m.home} /></span>
                                </div>
                                
                                <div style={{ 
                                    fontSize: '1.1rem', 
                                    fontWeight: '900', 
                                    color: 'var(--color-text)', 
                                    backgroundColor: 'var(--color-surface-subtle)', 
                                    padding: '4px 12px', 
                                    borderRadius: '8px',
                                    minWidth: '60px',
                                    textAlign: 'center'
                                }}>
                                    {m.time}
                                </div>
                                
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'flex-end', textAlign: 'right' }}>
                                    <span style={{ fontWeight: '700', fontSize: '1rem', lineHeight: '1.2' }}><BoldSverige text={m.away} /></span>
                                    <FlagBadge codes={awayFlags} name={m.away} size={30} />
                                </div>
                            </div>

                            {activeRound !== 'f' && (
                                <div style={{ 
                                    marginTop: '14px', 
                                    paddingTop: '10px', 
                                    borderTop: '0.5px solid var(--color-surface-subtle)', 
                                    fontSize: '0.7rem', 
                                    color: 'var(--color-text-muted)',
                                    textAlign: 'center',
                                    fontWeight: '500'
                                }}>
                                    Vinnaren går till Match {Math.floor((m.id - 81) / 2) + 97} ({WC_ROUNDS.find(r => r.id === 'r16')?.label})
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default VMBracket;
