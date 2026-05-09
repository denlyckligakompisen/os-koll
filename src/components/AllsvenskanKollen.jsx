import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from './common/Card';
import MatchCard from './MatchCard';
import SvenskaCupenBracket from './SvenskaCupenBracket';
import { Calendar, List, BarChart3, Trophy, ChevronRight, ArrowLeftRight, Globe, X, ArrowUp, ChevronDown } from 'lucide-react';
import MuiMenu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';


const MONTH_MAP = { 'jan': 0, 'feb': 1, 'mar': 2, 'mars': 2, 'apr': 3, 'maj': 4, 'jun': 5, 'juni': 5, 'jul': 6, 'juli': 6, 'aug': 7, 'sep': 8, 'okt': 9, 'nov': 10, 'dec': 11 };

const parseMatchDate = (dateStr, timeStr) => {
    if (!dateStr) return new Date();
    const parts = dateStr.split(' ');
    if (parts.length < 3) return new Date();
    
    const day = parseInt(parts[1]);
    const monthName = parts[2]?.toLowerCase();
    const year = parseInt(parts[3]) || 2026;

    let hour = 0, minute = 0;
    if (timeStr && timeStr.includes(':')) {
        const [h, m] = timeStr.split(':').map(Number);
        hour = h;
        minute = m;
    }

    return new Date(year, MONTH_MAP[monthName] ?? 0, day, hour, minute);
};

const AllsvenskanKollen = () => {
    const [activeTab, setActiveTab] = useState('matcher');
    const [filterTeam, setFilterTeam] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [navAnchorEl, setNavAnchorEl] = useState(null);
    const [matchesData, setMatchesData] = useState(null);
    const [logosData, setLogosData] = useState({});
    const [tableData, setTableData] = useState(null);
    const [maratonData, setMaratonData] = useState(null);
    const [loading, setLoading] = useState(true);
    const tableRefs = React.useRef({});
    const maratonRefs = React.useRef({});
    const nextMatchRef = React.useRef(null);
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
        { id: 'slutspel', label: 'Svenska Cupen', icon: Trophy },
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
        // Delay to allow for tab switching and DOM rendering
        const timer = setTimeout(() => {
            if (activeTab === 'matcher' && nextMatchRef.current) {
                nextMatchRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [activeTab, loading]);

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
    const handleNavMenuClick = (event) => setNavAnchorEl(event.currentTarget);
    const handleNavMenuClose = () => setNavAnchorEl(null);

    const handleTeamClick = (teamName) => {
        if (!teamName) return;
        
        // Find exact match first
        let matchedTeam = teams.find(t => t === teamName);
        
        // If no exact match, try fuzzy match
        if (!matchedTeam) {
            const clean = (n) => n.replace(' IF', '').replace(' FF', '').replace(' BK', '').trim();
            const cleanedInput = clean(teamName);
            matchedTeam = teams.find(t => clean(t) === cleanedInput || t.includes(cleanedInput));
        }

        if (matchedTeam) {
            setFilterTeam(prev => prev === matchedTeam ? null : matchedTeam);
        }
        handleMenuClose();
    };

    const getTeamLogo = (name) => {
        if (!name) return null;
        // Match name directly or clean it
        if (logosData[name]) return logosData[name];
        
        const cleanName = name.replace(' IF', '').replace(' FF', '').replace(' BK', '').trim();
        if (logosData[cleanName]) return logosData[cleanName];

        // Fallback for names that might have slight variations in the team bar
        const logoEntries = Object.entries(logosData);
        const match = logoEntries.find(([team]) => team.includes(cleanName) || cleanName.includes(team));
        if (match) return match[1];

        return null;
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

    const nextMatchTime = useMemo(() => {
        if (filteredMatches.length === 0) return null;
        const now = new Date();
        const upcoming = filteredMatches
            .map(m => parseMatchDate(m.date, m.time))
            .filter(d => d >= now)
            .sort((a, b) => a - b);
        return upcoming[0] ? upcoming[0].getTime() : null;
    }, [filteredMatches]);

    const groupedMatches = useMemo(() => {
        const groups = {};
        filteredMatches.forEach(match => {
            if (!groups[match.date]) groups[match.date] = [];
            groups[match.date].push(match);
        });
        return Object.entries(groups).map(([date, matches]) => ({ date, matches }));
    }, [filteredMatches]);

    const heroMatches = useMemo(() => {
        if (!nextMatchTime) return [];
        return filteredMatches.filter(m => parseMatchDate(m.date, m.time).getTime() === nextMatchTime);
    }, [filteredMatches, nextMatchTime]);

    const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });

    const handleTouchStart = (e) => {
        setTouchStart({
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        });
    };

    const handleTouchEnd = (e) => {
        if (!touchStart.x || !touchStart.y) return;

        // Blixtsnabb avbrytning om användaren sveper inuti cup-trädet som har egen horisontell scroll
        if (e.target.closest('.bracket-container') || e.target.closest('[style*="overflow-x: auto"]') || e.target.closest('[style*="overflowX: auto"]')) {
            return;
        }

        const diffX = touchStart.x - e.changedTouches[0].clientX;
        const diffY = touchStart.y - e.changedTouches[0].clientY;

        // Tröskel på 60px för att undvika oavsiktliga svep vid vertikal scroll
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 60) {
            const currentIndex = SUBTABS.findIndex(t => t.id === activeTab);
            if (diffX > 0) {
                // Svep åt vänster -> Nästa flik
                if (currentIndex < SUBTABS.length - 1) {
                    setActiveTab(SUBTABS[currentIndex + 1].id);
                }
            } else {
                // Svep åt höger -> Föregående flik
                if (currentIndex > 0) {
                    setActiveTab(SUBTABS[currentIndex - 1].id);
                }
            }
        }
        setTouchStart({ x: 0, y: 0 });
    };

    return (
        <div 
            style={{ minHeight: '100vh', paddingBottom: '100px' }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            <button
                className={`scroll-to-top-btn ${showScrollTop ? 'visible' : ''}`}
                onClick={scrollToTop}
                aria-label="Scrolla till toppen"
            >
                <ArrowUp size={28} />
            </button>

            <div className="nav-container" style={{ '--active-color': '#000000' }}>
                <div style={{ justifySelf: 'start', display: 'flex', alignItems: 'center' }}>
                    <button
                        onClick={handleNavMenuClick}
                        style={{ 
                            background: 'none', 
                            border: 'none', 
                            cursor: 'pointer',
                            display: 'flex', 
                            alignItems: 'center', 
                            padding: '6px 8px',
                            borderRadius: '12px',
                            transition: 'background-color 0.2s',
                        }}
                    >
                        <img src={logosData['ALLSVENSKAN_LOGO'] || "https://upload.wikimedia.org/wikipedia/en/thumb/e/ef/Allsvenskan_logo.svg/800px-Allsvenskan_logo.svg.png"} alt="Allsvenskan Logo" style={{ height: '34px', objectFit: 'contain' }} />
                    </button>
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
                        style={{ 
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        {filterTeam && getTeamLogo(filterTeam) ? (
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
                            {getTeamLogo(filterTeam) && <img src={getTeamLogo(filterTeam)} alt="" style={{ height: '22px', width: '22px', objectFit: 'contain' }} />}
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
                        {getTeamLogo(team) && <img src={getTeamLogo(team)} alt="" style={{ height: '22px', width: '22px', objectFit: 'contain' }} />}
                        <span>{team}</span>
                    </MenuItem>
                ))}
            </MuiMenu>

            <MuiMenu
                anchorEl={navAnchorEl}
                open={Boolean(navAnchorEl)}
                onClose={handleNavMenuClose}
                transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                slotProps={{
                    paper: {
                        style: {
                            borderRadius: '16px',
                            marginTop: '8px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                            border: '0.5px solid rgba(0,0,0,0.08)',
                            padding: '6px 0',
                            minWidth: '160px'
                        }
                    }
                }}
            >
                <MenuItem 
                    onClick={() => {
                        navigate('/vm');
                        handleNavMenuClose();
                    }}
                    style={{ 
                        fontSize: '0.9rem', 
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        margin: '2px 8px',
                        color: 'var(--color-text)',
                    }}
                >
                    <Globe size={20} color="#007aff" />
                    <span>VM-Kollen</span>
                </MenuItem>
            </MuiMenu>

            <div style={{ maxWidth: '600px', margin: '32px auto 0 auto', padding: '0 10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {activeTab === 'matcher' && (
                        <>
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                                    Laddar matcher...
                                </div>
                            ) : (
                                <>
                                    {groupedMatches.length > 0 ? (
                                        groupedMatches.map((group, i) => (
                                            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <div style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', paddingLeft: '4px', color: 'var(--color-text-muted)', letterSpacing: '0.02em' }}>
                                                    {group.date}
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {group.matches.map((match, j) => {
                                                        const isNext = nextMatchTime && parseMatchDate(match.date, match.time).getTime() === nextMatchTime;
                                                        return (
                                                            <div key={j} ref={isNext && heroMatches[0] === match ? nextMatchRef : null}>
                                                                <MatchCard 
                                                                    match={match} 
                                                                    idx={j} 
                                                                    variant={isNext ? 'hero' : undefined}
                                                                    homeLogo={getTeamLogo(match.home)}
                                                                    awayLogo={getTeamLogo(match.away)}
                                                                    onClick={() => match.link && window.open(match.link, '_blank')}
                                                                />
                                                            </div>
                                                        );
                                                    })}
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
                        </>
                    )}

                    {activeTab === 'gruppspel' && (
                        <div style={{ marginBottom: '32px' }}>
                            <Card style={{ marginBottom: '0' }}>
                                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 2px', fontSize: '0.9rem' }}>
                                    <thead>
                                        <tr style={{ borderBottom: 'var(--border)' }}>
                                            <th scope="col" style={{ textAlign: 'left', padding: '8px 4px', color: 'var(--color-text-muted)', fontWeight: '600', width: '36px' }}></th>
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
                                        const isPlayoff = rank === 14;
                                        const isRelegation = rank >= 15;

                                        const isSeparator = [2, 4, 14, 15].includes(rank);

                                        return (
                                            <tr 
                                                key={idx} 
                                                ref={el => tableRefs.current[team.team] = el}
                                                style={{ 
                                                    backgroundColor: isFiltered ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
                                                    transition: 'background-color 0.2s ease'
                                                }}
                                            >
                                                <td style={{ 
                                                    padding: '8px 4px',
                                                    borderTopLeftRadius: isFiltered ? '10px' : '0',
                                                    borderBottomLeftRadius: isFiltered ? '10px' : '0',
                                                    borderTop: isSeparator ? '1px dashed rgba(0,0,0,0.15)' : 'none'
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
                                                        backgroundColor: 'transparent', 
                                                        color: 'inherit' 
                                                    }}>
                                                        {team.rank}
                                                    </div>
                                                </td>
                                                <td style={{ 
                                                    padding: '11px 4px',
                                                    borderTop: isSeparator ? '1px dashed rgba(0,0,0,0.15)' : 'none'
                                                }}>
                                                    <span style={{ fontWeight: '500', whiteSpace: 'normal', lineHeight: '1.2', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        {getTeamLogo(team.team) && <img src={getTeamLogo(team.team)} alt="" style={{ height: '26px', width: '26px', objectFit: 'contain' }} />}
                                                        <span>{team.team}</span>
                                                    </span>
                                                </td>
                                                <td style={{ 
                                                    padding: '11px 4px', 
                                                    textAlign: 'center',
                                                    borderTop: isSeparator ? '1px dashed rgba(0,0,0,0.15)' : 'none'
                                                }}>{team.played}</td>
                                                <td style={{ 
                                                    padding: '11px 4px', 
                                                    textAlign: 'center', 
                                                    color: team.gd.startsWith('-') ? '#ff3b30' : (team.gd === '0' ? 'inherit' : '#34c759'),
                                                    borderTop: isSeparator ? '1px dashed rgba(0,0,0,0.15)' : 'none'
                                                }}>
                                                    {(!team.gd.startsWith('-') && team.gd !== '0') ? `+${team.gd}` : team.gd}
                                                </td>
                                                <td style={{ 
                                                    padding: '11px 4px', 
                                                    textAlign: 'right', 
                                                    fontWeight: '800',
                                                    borderTopRightRadius: isFiltered ? '10px' : '0',
                                                    borderBottomRightRadius: isFiltered ? '10px' : '0',
                                                    borderTop: isSeparator ? '1px dashed rgba(0,0,0,0.15)' : 'none'
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
                        <div style={{ width: '100%' }}>
                            <SvenskaCupenBracket 
                                filterTeam={filterTeam} 
                                onTeamClick={handleTeamClick} 
                                getTeamLogo={getTeamLogo}
                            />
                        </div>
                    )}

                    {activeTab === 'statistik' && (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted)' }}>
                            <BarChart3 size={40} strokeWidth={1.2} style={{ marginBottom: '12px', opacity: 0.4 }} />
                            <div style={{ fontSize: '0.95rem', fontWeight: '600' }}>Kommer snart</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AllsvenskanKollen;
