import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from './common/Card';
import MatchCard from './MatchCard';
import { Calendar, List, BarChart3, Trophy, ChevronRight, ArrowLeftRight, Globe, X, ArrowUp } from 'lucide-react';
import MuiMenu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

const AllsvenskanKollen = () => {
    const [activeTab, setActiveTab] = useState('matcher');
    const [filterTeam, setFilterTeam] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [matchesData, setMatchesData] = useState(null);
    const [logosData, setLogosData] = useState({});
    const [loading, setLoading] = useState(true);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const navigate = useNavigate();

    const teams = [
        "AIK", "BK Häcken", "Djurgårdens IF", "GAIS", "Halmstads BK", "Hammarby", 
        "IF Brommapojkarna", "IF Elfsborg", "IFK Göteborg", 
        "IK Sirius", "Kalmar FF", "Malmö FF", "Mjällby AIF", "Västerås SK", "Degerfors IF", "Örgryte IS"
    ].sort((a, b) => a.localeCompare(b, 'sv'));

    const SUBTABS = [
        { id: 'matcher', label: 'Matcher', icon: Calendar },
        { id: 'tabell', label: 'Tabell', icon: List },
        { id: 'trupp', label: 'Trupp', icon: BarChart3 }
    ];

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [matchesRes, logosRes] = await Promise.all([
                    fetch('/data/allsvenskan_matches.json'),
                    fetch('/data/allsvenskan_logos.json')
                ]);
                const matches = await matchesRes.json();
                const logos = await logosRes.json();
                setMatchesData(matches);
                setLogosData(logos);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching Allsvenskan data:', error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleTeamClick = (team) => {
        setFilterTeam(prev => prev === team ? null : team);
        handleMenuClose();
    };

    const getTeamLogo = (name) => {
        if (!name) return "";
        // Match name directly or clean it
        if (logosData[name]) return logosData[name];
        
        const cleanName = name.replace(' IF', '').replace(' FF', '').replace(' BK', '').trim();
        if (logosData[cleanName]) return logosData[cleanName];

        // Fallback for names that might have slight variations in the team bar
        const logoEntries = Object.entries(logosData);
        const match = logoEntries.find(([team]) => team.includes(cleanName) || cleanName.includes(team));
        if (match) return match[1];

        return "https://upload.wikimedia.org/wikipedia/en/thumb/e/ef/Allsvenskan_logo.svg/800px-Allsvenskan_logo.svg.png";
    };

    const filteredMatches = useMemo(() => {
        if (!matchesData?.matches) return [];
        if (!filterTeam) return matchesData.matches;
        return matchesData.matches.filter(m => 
            m.home.includes(filterTeam) || m.away.includes(filterTeam)
        );
    }, [matchesData, filterTeam]);

    const groupedMatches = useMemo(() => {
        const groups = {};
        filteredMatches.forEach(match => {
            if (!groups[match.date]) groups[match.date] = [];
            groups[match.date].push(match);
        });
        return Object.entries(groups).map(([date, matches]) => ({ date, matches }));
    }, [filteredMatches]);

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '100px' }}>
            <button
                className={`scroll-to-top-btn ${showScrollTop ? 'visible' : ''}`}
                onClick={scrollToTop}
                aria-label="Scrolla till toppen"
            >
                <ArrowUp size={28} />
            </button>

            <div className="nav-container" style={{ '--active-color': '#005DAA' }}>
                <div
                    className="header-logo"
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    onClick={() => navigate('/vm')}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src="https://upload.wikimedia.org/wikipedia/en/thumb/e/ef/Allsvenskan_logo.svg/800px-Allsvenskan_logo.svg.png" alt="" style={{ height: '36px' }} />
                        <ArrowLeftRight size={18} color="#aeafb4" />
                    </div>
                </div>
                
                <div className="segmented-control">
                    <div className="segmented-pill" style={{
                        left: 'var(--pill-padding)',
                        width: `calc((100% - (var(--pill-padding) * 2)) / ${SUBTABS.length})`,
                        transform: `translateX(${SUBTABS.findIndex(t => t.id === activeTab) * 100}%)`
                    }} />
                    {SUBTABS.map(tab => (
                        <button 
                            key={tab.id}
                            className={`segmented-button ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab(tab.id);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        >
                            <tab.icon size={22} className="tab-icon" />
                            <span className="tab-label">{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div style={{ justifySelf: 'end', display: 'flex', alignItems: 'center' }}>
                    <button
                        onClick={handleMenuClick}
                        className={`sverige-toggle ${filterTeam ? 'active' : ''}`}
                        aria-label="Välj lag att filtrera"
                        style={{ height: '100%' }}
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
                            fontWeight: 700, 
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
                            fontWeight: 500,
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {activeTab === 'matcher' && (
                        <>
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                                    Laddar matcher...
                                </div>
                            ) : groupedMatches.length > 0 ? (
                                groupedMatches.map((group, i) => (
                                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', paddingLeft: '4px', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>
                                            {group.date}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {group.matches.map((match, j) => (
                                                <MatchCard 
                                                    key={j} 
                                                    match={match} 
                                                    idx={j} 
                                                    homeLogo={getTeamLogo(match.home)}
                                                    awayLogo={getTeamLogo(match.away)}
                                                    onClick={() => match.link && window.open(match.link, '_blank')}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                                    Inga matcher hittades.
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'tabell' && (
                        <Card padding="0">
                            <div style={{ padding: '20px', borderBottom: 'var(--border)' }}>
                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Tabell</h3>
                            </div>
                            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                <Trophy size={48} style={{ marginBottom: '12px', opacity: 0.2 }} />
                                <p>Tabelluppgifter laddas från Allsvenskan.se...</p>
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

export default AllsvenskanKollen;
