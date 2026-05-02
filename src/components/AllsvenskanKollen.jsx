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
    const [tableData, setTableData] = useState(null);
    const [maratonData, setMaratonData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const navigate = useNavigate();

    const teams = [
        "AIK", "BK Häcken", "Djurgårdens IF", "GAIS", "Halmstads BK", "Hammarby IF", 
        "IF Brommapojkarna", "IF Elfsborg", "IFK Göteborg", 
        "IK Sirius", "Kalmar FF", "Malmö FF", "Mjällby AIF", "Västerås SK", "Degerfors IF", "Örgryte IS"
    ].sort((a, b) => a.localeCompare(b, 'sv'));

    const SUBTABS = [
        { id: 'matcher', label: 'Matcher', icon: Calendar },
        { id: 'gruppspel', label: 'Tabell', icon: List },
        { id: 'slutspel', label: 'Slutspel', icon: Trophy },
        { id: 'statistik', label: 'Statistik', icon: BarChart3 }
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
        const saved = localStorage.getItem('allsvenskan-koll-filter');
        if (saved) setFilterTeam(saved);
    }, []);

    useEffect(() => {
        if (filterTeam) localStorage.setItem('allsvenskan-koll-filter', filterTeam);
        else localStorage.removeItem('allsvenskan-koll-filter');
    }, [filterTeam]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [activeTab, filterTeam]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [matchesRes, logosRes, tableRes, maratonRes] = await Promise.all([
                    fetch('/data/allsvenskan_matches.json'),
                    fetch('/data/allsvenskan_logos.json'),
                    fetch('/data/allsvenskan_table.json'),
                    fetch('/data/allsvenskan_maraton.json')
                ]);
                const matches = await matchesRes.json();
                const logos = await logosRes.json();
                const table = await tableRes.json();
                const maraton = await maratonRes.json();
                setMatchesData(matches);
                setLogosData(logos);
                setTableData(table);
                setMaratonData(maraton);
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

        return logosData['ALLSVENSKAN_LOGO'] || "https://upload.wikimedia.org/wikipedia/en/thumb/e/ef/Allsvenskan_logo.svg/800px-Allsvenskan_logo.svg.png";
    };

    const filteredMatches = useMemo(() => {
        if (!matchesData?.matches) return [];
        if (!filterTeam) return matchesData.matches;
        return matchesData.matches.filter(m => {
            const cleanFilter = filterTeam.replace(' IF', '').replace(' FF', '').replace(' BK', '').trim();
            return m.home.includes(cleanFilter) || m.away.includes(cleanFilter) || 
                   m.home.includes(filterTeam) || m.away.includes(filterTeam);
        });
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
                        <img src={logosData['ALLSVENSKAN_LOGO'] || "https://upload.wikimedia.org/wikipedia/en/thumb/e/ef/Allsvenskan_logo.svg/800px-Allsvenskan_logo.svg.png"} alt="" style={{ height: '36px' }} />
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
                            whiteSpace: 'normal',
                            lineHeight: '1.2'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img src={getTeamLogo(filterTeam)} alt="" style={{ height: '22px', width: '22px', objectFit: 'contain' }} />
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
                            margin: '2px 8px',
                            whiteSpace: 'normal',
                            lineHeight: '1.2'
                        }}
                    >
                        <img src={getTeamLogo(team)} alt="" style={{ height: '22px', width: '22px', objectFit: 'contain' }} />
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
                                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', paddingLeft: '4px', color: 'var(--color-text-muted)', letterSpacing: '0.02em' }}>
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

                    {activeTab === 'gruppspel' && (
                        <div style={{ marginBottom: '32px' }}>
                            <Card style={{ marginBottom: '0' }}>
                                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 2px', fontSize: '0.9rem' }}>
                                    <thead>
                                        <tr style={{ borderBottom: 'var(--border)' }}>
                                            <th scope="col" style={{ textAlign: 'left', padding: '8px 4px', color: 'var(--color-text-muted)', fontWeight: '600', width: '36px' }}>#</th>
                                            <th scope="col" style={{ textAlign: 'left', padding: '8px 4px', color: 'var(--color-text-muted)', fontWeight: '600' }}>LAG</th>
                                            <th scope="col" style={{ textAlign: 'center', padding: '8px 4px', color: 'var(--color-text-muted)', fontWeight: '600', width: '30px' }}>M</th>
                                            <th scope="col" style={{ textAlign: 'center', padding: '8px 4px', color: 'var(--color-text-muted)', fontWeight: '600', width: '40px' }}>+/-</th>
                                            <th scope="col" style={{ textAlign: 'right', padding: '8px 4px', color: 'var(--color-text-muted)', fontWeight: '600', width: '40px' }}>P</th>
                                        </tr>
                                    </thead>
                                <tbody>
                                    {tableData?.table.map((team, idx) => {
                                        const rank = parseInt(team.rank);
                                        const isFiltered = filterTeam === team.team;
                                        const isTop = rank <= 3;
                                        const isBottom = rank >= 14;

                                        return (
                                            <tr 
                                                key={idx} 
                                                style={{ 
                                                    backgroundColor: isFiltered ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
                                                    transition: 'background-color 0.2s ease'
                                                }}
                                            >
                                                <td style={{ 
                                                    padding: '8px 4px',
                                                    borderTopLeftRadius: isFiltered ? '10px' : '0',
                                                    borderBottomLeftRadius: isFiltered ? '10px' : '0'
                                                }}>
                                                    <div style={{ 
                                                        width: '28px', 
                                                        height: '28px', 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        justifyContent: 'center', 
                                                        borderRadius: '8px', 
                                                        fontWeight: '700', 
                                                        fontSize: '0.85rem', 
                                                        backgroundColor: isTop ? 'rgba(52, 199, 89, 0.15)' : (isBottom ? 'rgba(255, 59, 48, 0.15)' : 'transparent'), 
                                                        color: isTop ? '#34c759' : (isBottom ? '#ff3b30' : 'inherit') 
                                                    }}>
                                                        {team.rank}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '11px 4px' }}>
                                                    <button 
                                                        onClick={() => handleTeamClick(team.team)}
                                                        style={{ 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            gap: '8px', 
                                                            cursor: 'pointer',
                                                            background: 'none',
                                                            border: 'none',
                                                            padding: 0,
                                                            font: 'inherit',
                                                            color: 'inherit',
                                                            width: '100%',
                                                            textAlign: 'left'
                                                        }}
                                                    >
                                                        <img src={getTeamLogo(team.team)} alt="" style={{ height: '26px', width: '26px', objectFit: 'contain' }} />
                                                        <span style={{ fontWeight: '500', whiteSpace: 'normal', lineHeight: '1.2' }}>{team.team}</span>
                                                    </button>
                                                </td>
                                                <td style={{ padding: '11px 4px', textAlign: 'center' }}>{team.played}</td>
                                                <td style={{ padding: '11px 4px', textAlign: 'center', color: team.gd.startsWith('-') ? '#ff3b30' : (team.gd === '0' ? 'inherit' : '#34c759') }}>
                                                    {(!team.gd.startsWith('-') && team.gd !== '0') ? `+${team.gd}` : team.gd}
                                                </td>
                                                <td style={{ 
                                                    padding: '11px 4px', 
                                                    textAlign: 'right', 
                                                    fontWeight: '800',
                                                    borderTopRightRadius: isFiltered ? '10px' : '0',
                                                    borderBottomRightRadius: isFiltered ? '10px' : '0'
                                                }}>{team.points}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </Card>
                    </div>
                    )}

                    {activeTab === 'slutspel' && (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted)' }}>
                            <Trophy size={48} style={{ marginBottom: '16px', opacity: 0.2, margin: '0 auto' }} />
                            <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text)', marginBottom: '8px' }}>Inget slutspel</h3>
                            <p style={{ fontSize: '0.9rem' }}>Allsvenskan är en rak serie utan slutspel.</p>
                        </div>
                    )}

                    {activeTab === 'statistik' && (
                        <div style={{ marginBottom: '32px' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', paddingLeft: '4px', marginBottom: '12px', color: 'var(--color-text-muted)', letterSpacing: '0.02em' }}>
                                Allsvenskans Maratontabell
                            </div>
                            <Card style={{ marginBottom: '0' }}>
                                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 2px', fontSize: '0.9rem' }}>
                                    <thead>
                                        <tr style={{ borderBottom: 'var(--border)' }}>
                                            <th scope="col" style={{ textAlign: 'left', padding: '8px 4px', color: 'var(--color-text-muted)', fontWeight: '600', width: '36px' }}>#</th>
                                            <th scope="col" style={{ textAlign: 'left', padding: '8px 4px', color: 'var(--color-text-muted)', fontWeight: '600' }}>LAG</th>
                                            <th scope="col" style={{ textAlign: 'center', padding: '8px 4px', color: 'var(--color-text-muted)', fontWeight: '600', width: '40px' }}>SÄS</th>
                                            <th scope="col" style={{ textAlign: 'center', padding: '8px 4px', color: 'var(--color-text-muted)', fontWeight: '600', width: '50px' }}>S</th>
                                            <th scope="col" style={{ textAlign: 'right', padding: '8px 4px', color: 'var(--color-text-muted)', fontWeight: '600', width: '60px' }}>P</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {maratonData?.table.slice(0, 25).map((team, idx) => {
                                            const rank = idx + 1;
                                            const isFiltered = filterTeam && team.team.includes(filterTeam);
                                            
                                            return (
                                                <tr 
                                                    key={idx} 
                                                    style={{ 
                                                        backgroundColor: isFiltered ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
                                                        transition: 'background-color 0.2s ease'
                                                    }}
                                                >
                                                    <td style={{ padding: '8px 4px' }}>
                                                        <div style={{ 
                                                            width: '28px', 
                                                            height: '28px', 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            justifyContent: 'center', 
                                                            borderRadius: '8px', 
                                                            fontWeight: '700', 
                                                            fontSize: '0.85rem',
                                                            backgroundColor: rank <= 3 ? 'rgba(52, 199, 89, 0.15)' : 'transparent',
                                                            color: rank <= 3 ? '#34c759' : 'inherit'
                                                        }}>
                                                            {team.rank}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '11px 4px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <img src={getTeamLogo(team.team)} alt="" style={{ height: '22px', width: '22px', objectFit: 'contain' }} />
                                                            <span style={{ fontWeight: '500' }}>{team.team}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '11px 4px', textAlign: 'center' }}>{team.seasons}</td>
                                                    <td style={{ padding: '11px 4px', textAlign: 'center' }}>{team.played}</td>
                                                    <td style={{ padding: '11px 4px', textAlign: 'right', fontWeight: '800' }}>{team.points}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                <div style={{ padding: '16px', textAlign: 'center', borderTop: 'var(--border)', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                    Visar de 25 främsta lagen genom tiderna
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AllsvenskanKollen;
