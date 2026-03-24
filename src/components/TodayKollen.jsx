import React from 'react';
import { getTeamLogo } from '../utils/assets';
import PageHeader from './common/PageHeader';
import Card from './common/Card';

const TODAY_DATE = 'Söndag 22 Mars';

const TodayKollen = () => {
    const events = [
        {
            competition: 'Svenska Cupen - Semifinal',
            time: '14:00',
            home: 'Hammarby IF',
            away: 'Djurgårdens IF',
            location: 'Tele2 Arena',
            broadcast: 'TV4 Play'
        },
        {
            competition: 'Svenska Cupen - Semifinal',
            time: '16:30',
            home: 'IK Sirius',
            away: 'IFK Göteborg',
            location: 'Studenternas IP',
            broadcast: 'SVT Play'
        }
    ];

    return (
        <div className="animate-fade-in" style={{ padding: '0 10px', minHeight: 'calc(100vh - 120px)' }}>
            <PageHeader 
                title="Dagens höjdpunkter" 
                subtitle={TODAY_DATE} 
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
                <div style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: '800', 
                    color: 'var(--color-text-muted)', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em',
                    paddingLeft: '4px'
                }}>
                    Fotboll: Svenska Cupen
                </div>

                {events.map((event, idx) => (
                    <Card key={idx} padding="20px" style={{ position: 'relative', overflow: 'hidden' }}>
                        <div style={{ 
                            position: 'absolute', 
                            top: '12px', 
                            right: '12px', 
                            fontSize: '0.65rem', 
                            fontWeight: '800', 
                            backgroundColor: 'rgba(255, 59, 48, 0.1)', 
                            color: '#ff3b30', 
                            padding: '2px 8px', 
                            borderRadius: '4px',
                            textTransform: 'uppercase'
                        }}>
                            LIVE SNART
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                <img src={getTeamLogo(event.home)} alt={event.home} style={{ height: '40px', width: 'auto' }} />
                                <div style={{ fontSize: '0.85rem', fontWeight: '800' }}>{event.home}</div>
                            </div>

                            <div style={{ padding: '0 15px', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--color-text)' }}>{event.time}</div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>KICKOFF</div>
                            </div>

                            <div style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                <img src={getTeamLogo(event.away)} alt={event.away} style={{ height: '40px', width: 'auto' }} />
                                <div style={{ fontSize: '0.85rem', fontWeight: '800' }}>{event.away}</div>
                            </div>
                        </div>

                        <div style={{ 
                            borderTop: '1px solid rgba(0,0,0,0.05)', 
                            paddingTop: '12px', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            fontSize: '0.75rem',
                            color: 'var(--color-text-muted)',
                            fontWeight: '600'
                        }}>
                            <div>📍 {event.location}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                📺 <span style={{ color: '#000' }}>{event.broadcast}</span>
                            </div>
                        </div>
                    </Card>
                ))}

                <Card style={{ 
                    background: 'linear-gradient(135deg, #003399 0%, #001f5c 100%)', 
                    color: '#fff',
                    marginTop: '20px'
                }} padding="24px">
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: '700', opacity: 0.8, textTransform: 'uppercase', marginBottom: '8px' }}>Allsvenskan Premiär</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '900' }}>13 DAGAR KVAR</div>
                        <div style={{ fontSize: '0.75rem', marginTop: '8px', opacity: 0.7 }}>Degerfors IF - IK Sirius | 4 April</div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default TodayKollen;
