import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from './common/Card';
import { Calendar, List, BarChart3, Trophy, ChevronRight, ArrowLeftRight, MapPin, Clock } from 'lucide-react';

const SiriusKollen = () => {
    const [activeTab, setActiveTab] = useState('matcher');
    const navigate = useNavigate();

    const tabs = [
        { id: 'matcher', label: 'Matcher', icon: Calendar },
        { id: 'tabell', label: 'Tabell', icon: List },
        { id: 'trupp', label: 'Trupp', icon: BarChart3 }
    ];

    const nextMatch = {
        home: 'IK Sirius',
        away: 'Malmö FF',
        date: 'Söndag 3 maj',
        time: '15:00',
        venue: 'Studenternas IP',
        competition: 'Allsvenskan'
    };

    const recentMatches = [
        { opponent: 'IFK Norrköping', result: '2-1', date: '26 apr', score: 'W' },
        { opponent: 'Hammarby IF', result: '1-1', date: '19 apr', score: 'D' },
        { opponent: 'AIK', result: '0-2', date: '12 apr', score: 'L' }
    ];

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '100px' }}>
            <div className="nav-container" style={{ '--active-color': '#005DAA' }}>
                <div className="header-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/vm')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img src="https://upload.wikimedia.org/wikipedia/en/2/23/IK_Sirius_logo.png" alt="IK Sirius" style={{ height: '32px' }} />
                        <ArrowLeftRight size={16} color="var(--color-text-muted)" />
                    </div>
                </div>
                
                <div className="segmented-control">
                    {tabs.map(tab => (
                        <button 
                            key={tab.id}
                            className={`segmented-button ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <tab.icon size={22} className="tab-icon" />
                            <span className="tab-label">{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="sverige-toggle" onClick={() => navigate('/vm')} style={{ cursor: 'pointer', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Trophy size={20} color="var(--color-text-muted)" />
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>VM-Koll</span>
                </div>
            </div>

            <div style={{ maxWidth: '600px', margin: '32px auto 0 auto', padding: '0 10px' }}>
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {activeTab === 'matcher' && (
                        <>
                            <div style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', paddingLeft: '4px', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>
                                NÄSTA MATCH
                            </div>
                            <Card padding="28px" style={{ background: 'linear-gradient(135deg, #005DAA 0%, #003a6b 100%)', color: 'white', border: 'none', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1 }}>
                                    <img src="https://upload.wikimedia.org/wikipedia/en/2/23/IK_Sirius_logo.png" alt="" style={{ height: '150px' }} />
                                </div>
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: '800', opacity: 0.9, textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.05em' }}>
                                        {nextMatch.competition}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ textAlign: 'center', flex: 1 }}>
                                            <div style={{ fontSize: '1.25rem', fontWeight: '900' }}>{nextMatch.home}</div>
                                        </div>
                                        <div style={{ textAlign: 'center', minWidth: '100px' }}>
                                            <div style={{ fontSize: '1.8rem', fontWeight: '900', letterSpacing: '-0.02em' }}>{nextMatch.time}</div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: '700', opacity: 0.8 }}>{nextMatch.date}</div>
                                        </div>
                                        <div style={{ textAlign: 'center', flex: 1 }}>
                                            <div style={{ fontSize: '1.25rem', fontWeight: '900' }}>{nextMatch.away}</div>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '0.8rem', fontWeight: '600', opacity: 0.9 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <MapPin size={14} /> {nextMatch.venue}
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <div style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', paddingLeft: '4px', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>
                                SENASTE MATCHER
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {recentMatches.map((m, idx) => (
                                    <Card key={idx} padding="16px" className="premium-card-hover">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ 
                                                    width: '28px', 
                                                    height: '28px', 
                                                    borderRadius: '6px', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center',
                                                    backgroundColor: m.score === 'W' ? '#34c759' : m.score === 'L' ? '#ff3b30' : '#8e8e93',
                                                    color: 'white',
                                                    fontWeight: '800',
                                                    fontSize: '0.75rem'
                                                }}>
                                                    {m.score}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{m.opponent}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{m.date}</div>
                                                </div>
                                            </div>
                                            <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>{m.result}</div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </>
                    )}

                    {activeTab === 'tabell' && (
                        <Card padding="0">
                            <div style={{ padding: '20px', borderBottom: 'var(--border)' }}>
                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Allsvenskan 2026</h3>
                            </div>
                            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                <Trophy size={48} style={{ marginBottom: '12px', opacity: 0.2 }} />
                                <p>Tabelluppgifter laddas...</p>
                            </div>
                        </Card>
                    )}

                    {activeTab === 'trupp' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            {['Målvakter', 'Försvarare', 'Mittfältare', 'Anfallare'].map(pos => (
                                <Card key={pos} padding="20px" className="premium-card-hover">
                                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>{pos}</h3>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                        Visa spelarlista <ChevronRight size={14} style={{ verticalAlign: 'middle' }} />
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SiriusKollen;
