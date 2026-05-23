import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from './common/Card';
import { Calendar, List, BarChart3, Trophy, ChevronRight, ArrowLeftRight, MapPin, Clock, Globe, X } from 'lucide-react';
import MuiMenu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

const SiriusKollen = () => {
    const [activeTab, setActiveTab] = useState('matcher');
    const [filterTeam, setFilterTeam] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();

    const teams = [
        "AIK", "BK Häcken", "Djurgårdens IF", "GAIS", "Halmstads BK", "Hammarby IF", 
        "IF Brommapojkarna", "IF Elfsborg", "IFK Göteborg", "IFK Norrköping", 
        "IK Sirius", "Kalmar FF", "Malmö FF", "Mjällby AIF", "Västerås SK", "Östers IF"
    ].sort((a, b) => a.localeCompare(b, 'sv'));

    const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleTeamClick = (team) => {
        setFilterTeam(team);
        handleMenuClose();
    };

    const getTeamLogo = (name) => {
        const logos = {
            "AIK": "https://upload.wikimedia.org/wikipedia/en/thumb/0/07/AIK_logo.svg/800px-AIK_logo.svg.png",
            "BK Häcken": "https://upload.wikimedia.org/wikipedia/en/thumb/0/00/BK_H%C3%A4cken_logo.svg/800px-BK_H%C3%A4cken_logo.svg.png",
            "Djurgårdens IF": "https://upload.wikimedia.org/wikipedia/en/thumb/8/8a/Djurg%C3%A5rdens_IF_logo.svg/800px-Djurg%C3%A5rdens_IF_logo.svg.png",
            "GAIS": "https://upload.wikimedia.org/wikipedia/en/thumb/f/f6/GAIS_logo.svg/800px-GAIS_logo.svg.png",
            "Halmstads BK": "https://upload.wikimedia.org/wikipedia/en/thumb/3/3d/Halmstads_BK_logo.svg/800px-Halmstads_BK_logo.svg.png",
            "Hammarby IF": "https://upload.wikimedia.org/wikipedia/en/thumb/c/c2/Hammarby_IF_logo.svg/800px-Hammarby_IF_logo.svg.png",
            "IF Brommapojkarna": "https://upload.wikimedia.org/wikipedia/en/thumb/2/2f/IF_Brommapojkarna_logo.svg/800px-IF_Brommapojkarna_logo.svg.png",
            "IF Elfsborg": "https://upload.wikimedia.org/wikipedia/en/thumb/f/f0/IF_Elfsborg_logo.svg/800px-IF_Elfsborg_logo.svg.png",
            "IFK Göteborg": "https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/IFK_G%C3%B6teborg_logo.svg/800px-IFK_G%C3%B6teborg_logo.svg.png",
            "IFK Norrköping": "https://upload.wikimedia.org/wikipedia/en/thumb/c/c5/IFK_Norrk%C3%B6ping_logo.svg/800px-IFK_Norrk%C3%B6ping_logo.svg.png",
            "IK Sirius": "https://upload.wikimedia.org/wikipedia/en/2/23/IK_Sirius_logo.png",
            "Kalmar FF": "https://upload.wikimedia.org/wikipedia/en/thumb/c/c5/Kalmar_FF_logo.svg/800px-Kalmar_FF_logo.svg.png",
            "Malmö FF": "https://upload.wikimedia.org/wikipedia/en/thumb/f/f3/Malm%C3%B6_FF_logo.svg/800px-Malm%C3%B6_FF_logo.svg.png",
            "Mjällby AIF": "https://upload.wikimedia.org/wikipedia/en/thumb/0/0e/Mj%C3%A4llby_AIF_logo.svg/800px-Mj%C3%A4llby_AIF_logo.svg.png",
            "Västerås SK": "https://upload.wikimedia.org/wikipedia/en/thumb/b/b5/V%C3%A4ster%C3%A5s_SK_logo.svg/800px-V%C3%A4ster%C3%A5s_SK_logo.svg.png",
            "Östers IF": "https://upload.wikimedia.org/wikipedia/en/thumb/1/1a/%C3%96sters_IF_logo.svg/800px-%C3%96sters_IF_logo.svg.png"
        };
        return logos[name] || "https://upload.wikimedia.org/wikipedia/en/thumb/e/ef/Allsvenskan_logo.svg/800px-Allsvenskan_logo.svg.png";
    };

    const tabs = [
        { id: 'matcher', label: 'Matcher', icon: Calendar },
        { id: 'tabell', label: 'Tabell', icon: List },
        { id: 'trupp', label: 'Trupp', icon: BarChart3 }
    ];

    const nextMatch = {
        home: filterTeam || 'Allsvenskan',
        away: filterTeam === 'Malmö FF' ? 'AIK' : 'Malmö FF',
        date: 'Söndag 3 maj',
        time: '15:00',
        venue: filterTeam === 'IK Sirius' ? 'Studenternas IP' : 'Arena',
        competition: 'Allsvenskan'
    };

    const recentMatches = [
        { opponent: filterTeam === 'Djurgårdens IF' ? 'Hammarby IF' : 'Djurgårdens IF', result: '2-1', date: '26 apr', score: 'W' },
        { opponent: filterTeam === 'Hammarby IF' ? 'AIK' : 'Hammarby IF', result: '1-1', date: '19 apr', score: 'D' },
        { opponent: filterTeam === 'AIK' ? 'IFK Göteborg' : 'AIK', result: '0-2', date: '12 apr', score: 'L' }
    ];

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '100px' }}>
            <div className="nav-container" style={{ '--active-color': '#005DAA' }}>
                <div
                    className="header-logo"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate('/vm')}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src="https://upload.wikimedia.org/wikipedia/en/thumb/e/ef/Allsvenskan_logo.svg/800px-Allsvenskan_logo.svg.png" alt="" style={{ height: '36px' }} />
                        <ArrowLeftRight size={18} color="#aeafb4" />
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

                <div style={{ justifySelf: 'end', display: 'flex', alignItems: 'center', paddingRight: '8px' }}>
                    <button
                        onClick={handleMenuClick}
                        className={`sverige-toggle ${filterTeam ? 'active' : ''}`}
                        aria-label="Välj lag att filtrera"
                        style={{ 
                            height: '40px', 
                            width: '40px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            borderRadius: '50%',
                            background: filterTeam ? 'rgba(0, 0, 0, 0.03)' : 'transparent',
                            border: filterTeam ? '1px solid rgba(0, 0, 0, 0.05)' : 'none'
                        }}
                    >
                        {filterTeam ? (
                            <img src={getTeamLogo(filterTeam)} alt="" style={{ height: '24px', width: '24px', objectFit: 'contain' }} />
                        ) : (
                            <Globe size={24} color="#8e8e93" strokeWidth={1.5} />
                        )}
                    </button>
                </div>
            </div>

            <MuiMenu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                slotProps={{
                    paper: {
                        style: {
                            maxHeight: 400,
                            width: '280px',
                            borderRadius: '16px',
                            marginTop: '8px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                            border: '0.5px solid rgba(0,0,0,0.08)',
                            padding: '8px 0'
                        }
                    }
                }}
            >
                {filterTeam && (
                    <MenuItem 
                        onClick={() => {
                            setFilterTeam(null);
                            handleMenuClose();
                        }}
                        style={{ 
                            fontSize: '0.9rem', 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            margin: '2px 8px',
                            backgroundColor: 'rgba(0, 0, 0, 0.05)',
                            color: 'var(--color-text)',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img src={getTeamLogo(filterTeam)} alt="" style={{ height: '22px' }} />
                            <span>{filterTeam}</span>
                        </div>
                        <X size={18} strokeWidth={2.5} />
                    </MenuItem>
                )}
                {teams
                    .filter(t => t !== filterTeam)
                    .map((team) => (
                    <MenuItem 
                        key={team}
                        onClick={() => handleTeamClick(team)}
                        style={{ 
                            fontSize: '0.9rem', 
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            margin: '2px 8px'
                        }}
                    >
                        <img src={getTeamLogo(team)} alt="" style={{ height: '22px' }} />
                        <span>{team}</span>
                    </MenuItem>
                ))}
            </MuiMenu>

            <div style={{ maxWidth: '600px', margin: '32px auto 0 auto', padding: '0 10px' }}>
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {activeTab === 'matcher' && (
                        <>
                            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', paddingLeft: '4px', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>
                                NÄSTA MATCH
                            </div>
                            <Card padding="28px" style={{ background: 'linear-gradient(135deg, #005DAA 0%, #003a6b 100%)', color: 'white', border: 'none', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1 }}>
                                    <img src="https://upload.wikimedia.org/wikipedia/en/2/23/IK_Sirius_logo.png" alt="" style={{ height: '150px' }} />
                                </div>
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.9, textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.05em' }}>
                                        {filterTeam || 'Allsvenskan'}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ textAlign: 'center', flex: 1 }}>
                                            <div style={{ fontSize: '1.25rem', }}>{nextMatch.home}</div>
                                        </div>
                                        <div style={{ textAlign: 'center', minWidth: '100px' }}>
                                            <div style={{ fontSize: '1.8rem', letterSpacing: '-0.02em' }}>{nextMatch.time}</div>
                                            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{nextMatch.date}</div>
                                        </div>
                                        <div style={{ textAlign: 'center', flex: 1 }}>
                                            <div style={{ fontSize: '1.25rem', }}>{nextMatch.away}</div>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '0.8rem', opacity: 0.9 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <MapPin size={14} /> {nextMatch.venue}
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', paddingLeft: '4px', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>
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
                                                    fontSize: '0.75rem'
                                                }}>
                                                    {m.score}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.95rem' }}>{m.opponent}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{m.date}</div>
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '1.1rem' }}>{m.result}</div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </>
                    )}

                    {activeTab === 'tabell' && (
                        <Card padding="0">
                            <div style={{ padding: '20px', borderBottom: 'var(--border)' }}>
                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Tabell</h3>
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
