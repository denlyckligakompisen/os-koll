import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from './common/Card';
import MatchCard, { cleanTeamNameForDisplay } from './MatchCard';
import SvenskaCupenBracket from './SvenskaCupenBracket';
import { Calendar, List, BarChart3, Trophy, ChevronRight, ArrowLeftRight, Globe, X, ArrowUp, ArrowDown, ChevronDown, Filter } from 'lucide-react';
import MuiMenu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';


const MONTH_MAP = { 
    'jan': 0, 'januari': 0,
    'feb': 1, 'februari': 1,
    'mar': 2, 'mars': 2,
    'apr': 3, 'april': 3,
    'maj': 4,
    'jun': 5, 'juni': 5,
    'jul': 6, 'juli': 6,
    'aug': 7, 'augusti': 7,
    'sep': 8, 'september': 8,
    'okt': 9, 'oktober': 9,
    'nov': 10, 'november': 10,
    'dec': 11, 'december': 11
};

const TEAM_COLORS = {
    "AIK": { bg: "#000000", text: "#ffca28", label: "#ffffff" },
    "BK Häcken": { bg: "#ffd600", text: "#000000", label: "#000000" },
    "Djurgårdens IF": { bg: "#002d62", text: "#7bc3e5", label: "#ffffff" },
    "GAIS": { bg: "#006241", text: "#ffca28", label: "#ffffff" },
    "Halmstads BK": { bg: "#0054a6", text: "#ffd700", label: "#ffffff" },
    "Hammarby IF": { bg: "#007e4a", text: "#ffffff", label: "#ffffff" },
    "IF Brommapojkarna": { bg: "#d32f2f", text: "#000000", label: "#ffffff" },
    "IF Elfsborg": { bg: "#ffd200", text: "#000000", label: "#000000" },
    "IFK Göteborg": { bg: "#004b87", text: "#ffffff", label: "#ffffff" },
    "IK Sirius": { bg: "#004f9f", text: "#ffffff", label: "#ffffff" },
    "Kalmar FF": { bg: "#c2185b", text: "#ffffff", label: "#ffffff" },
    "Malmö FF": { bg: "#7bc3e5", text: "#004b87", label: "#1d2a44" },
    "Mjällby AIF": { bg: "#ff9900", text: "#000000", label: "#000000" },
    "Västerås SK": { bg: "#006338", text: "#ffffff", label: "#ffffff" },
    "Degerfors IF": { bg: "#e53935", text: "#ffffff", label: "#ffffff" },
    "Örgryte IS": { bg: "#aa1111", text: "#2196f3", label: "#ffffff" }
};

const getHeaderStyle = (teamName) => {
    if (!teamName || !TEAM_COLORS[teamName]) {
        return {
            bg: "#ffffff",
            text: "#000000",
            inactiveText: "#636366",
            activeLine: "#000000"
        };
    }
    const colors = TEAM_COLORS[teamName];
    const isLightBg = ["BK Häcken", "IF Elfsborg", "Malmö FF", "Mjällby AIF"].includes(teamName);
    return {
        bg: colors.bg,
        text: colors.label,
        inactiveText: isLightBg ? "rgba(0, 0, 0, 0.45)" : "rgba(255, 255, 255, 0.6)",
        activeLine: colors.text
    };
};

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

const getRelativeDateLabel = (dateStr) => {
    if (!dateStr) return '';
    try {
        const matchDate = parseMatchDate(dateStr, "12:00");
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        
        matchDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        tomorrow.setHours(0, 0, 0, 0);
        yesterday.setHours(0, 0, 0, 0);
        
        if (matchDate.getTime() === today.getTime()) {
            return "Idag";
        }
        if (matchDate.getTime() === tomorrow.getTime()) {
            return "Imorgon";
        }
        if (matchDate.getTime() === yesterday.getTime()) {
            return "Igår";
        }
    } catch {
        // Fallback
    }
    return dateStr;
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
    ].sort((a, b) => cleanTeamNameForDisplay(a).localeCompare(cleanTeamNameForDisplay(b), 'sv'));

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

        // Refetch matches every minute to keep live data updated
        const interval = setInterval(async () => {
            try {
                const matchesRes = await fetch('/data/allsvenskan_matches.json');
                const matches = await matchesRes.json();
                setMatchesData(matches);
            } catch (error) {
                console.error('Error refetching Allsvenskan matches:', error);
            }
        }, 60000);

        return () => clearInterval(interval);
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
        let result = matchesData.matches;
        if (filterTeam) {
            result = matchesData.matches.filter(m => {
                const cleanFilter = filterTeam.replace(' IF', '').replace(' FF', '').replace(' BK', '').trim();
                return m.home.includes(cleanFilter) || m.away.includes(cleanFilter) || 
                       m.home.includes(filterTeam) || m.away.includes(filterTeam);
            });
        }
        
        // Sort matches chronologically
        return [...result].sort((a, b) => {
            return parseMatchDate(a.date, a.time) - parseMatchDate(b.date, b.time);
        });
    }, [matchesData, filterTeam]);

    const nextMatchDateString = useMemo(() => {
        if (filteredMatches.length === 0) return null;
        const now = new Date();
        const upcoming = filteredMatches.filter(m => parseMatchDate(m.date, m.time) >= now);
        return upcoming[0] ? upcoming[0].date : null;
    }, [filteredMatches]);

    const heroMatches = useMemo(() => {
        if (!nextMatchDateString) return [];
        return filteredMatches.filter(m => m.date === nextMatchDateString);
    }, [filteredMatches, nextMatchDateString]);

    const groupedMatches = useMemo(() => {
        const groups = {};
        filteredMatches.forEach(match => {
            if (!groups[match.date]) groups[match.date] = [];
            groups[match.date].push(match);
        });
        const list = Object.entries(groups).map(([date, matches]) => ({ date, matches }));
        
        // Sort grouped dates chronologically
        return list.sort((a, b) => {
            if (a.matches.length === 0) return 1;
            if (b.matches.length === 0) return -1;
            return parseMatchDate(a.matches[0].date, a.matches[0].time) - parseMatchDate(b.matches[0].date, b.matches[0].time);
        });
    }, [filteredMatches]);


    const headerStyle = useMemo(() => getHeaderStyle(filterTeam), [filterTeam]);

    const tableTrends = useMemo(() => {
        if (!tableData?.table || !matchesData?.matches) return {};
        
        try {
            const currentTable = tableData.table;
            const matches = matchesData.matches;

            // Map each team to their current table stats
            const prevStats = currentTable.map(row => {
                const goalsParts = row.goals.split('-').map(Number);
                return {
                    team: row.team,
                    points: parseInt(row.points) || 0,
                    played: parseInt(row.played) || 0,
                    won: parseInt(row.won) || 0,
                    drawn: parseInt(row.drawn) || 0,
                    lost: parseInt(row.lost) || 0,
                    goalsFor: goalsParts[0] || 0,
                    goalsAgainst: goalsParts[1] || 0,
                    gd: parseInt(row.gd) || 0,
                    currentRank: parseInt(row.rank) || 0
                };
            });

            const clean = (n) => n.replace(' IF', '').replace(' FF', '').replace(' BK', '').trim();

            // Find the last finished match for each team and subtract its impact
            prevStats.forEach(stat => {
                const cleanTeam = clean(stat.team);
                
                // Find all finished matches for this team
                const teamMatches = matches.filter(m => {
                    if (m.status !== 'finished' || !m.score) return false;
                    return clean(m.home).includes(cleanTeam) || clean(m.away).includes(cleanTeam);
                });

                if (teamMatches.length > 0) {
                    const sortedMatches = [...teamMatches].sort((a, b) => {
                        const dateA = parseMatchDate(a.date, a.time);
                        const dateB = parseMatchDate(b.date, b.time);
                        return dateB - dateA;
                    });

                    const lastMatch = sortedMatches[0];
                    const scoreParts = lastMatch.score.split('-').map(s => parseInt(s.trim()));
                    if (scoreParts.length === 2 && !isNaN(scoreParts[0]) && !isNaN(scoreParts[1])) {
                        const homeScore = scoreParts[0];
                        const awayScore = scoreParts[1];
                        const isHome = clean(lastMatch.home).includes(cleanTeam);

                        const goalsFor = isHome ? homeScore : awayScore;
                        const goalsAgainst = isHome ? awayScore : homeScore;

                        stat.goalsFor -= goalsFor;
                        stat.goalsAgainst -= goalsAgainst;
                        stat.gd = stat.goalsFor - stat.goalsAgainst;
                        stat.played -= 1;

                        if (homeScore === awayScore) {
                            stat.points -= 1;
                            stat.drawn -= 1;
                        } else if ((isHome && homeScore > awayScore) || (!isHome && awayScore > homeScore)) {
                            stat.points -= 3;
                            stat.won -= 1;
                        } else {
                            stat.lost -= 1;
                        }
                    }
                }
            });

            // Sort previous stats
            const sortedPrev = [...prevStats].sort((a, b) => {
                if (b.points !== a.points) return b.points - a.points;
                if (b.gd !== a.gd) return b.gd - a.gd;
                return b.goalsFor - a.goalsFor;
            });

            const trends = {};
            sortedPrev.forEach((stat, idx) => {
                const prevRank = idx + 1;
                const currentRank = stat.currentRank;
                if (prevRank > currentRank) {
                    trends[stat.team] = 'up';
                } else if (prevRank < currentRank) {
                    trends[stat.team] = 'down';
                } else {
                    trends[stat.team] = 'same';
                }
            });

            return trends;
        } catch (error) {
            console.error('Error calculating table trends:', error);
            return {};
        }
    }, [tableData, matchesData]);

    useEffect(() => {
        // Delay to allow for tab switching and DOM rendering
        const timer = setTimeout(() => {
            if (activeTab === 'matcher' && nextMatchRef.current) {
                nextMatchRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else if (activeTab !== 'matcher') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }, 150);

        return () => clearTimeout(timer);
    }, [activeTab, loading, filterTeam, nextMatchDateString]);

    const activeTabRef = React.useRef(activeTab);
    useEffect(() => {
        activeTabRef.current = activeTab;
    }, [activeTab]);

    const containerRef = React.useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let startX = 0;
        let startY = 0;
        let isHorizontalSwipe = false;
        let isVerticalSwipe = false;

        const handleStart = (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isHorizontalSwipe = false;
            isVerticalSwipe = false;
        };

        const handleMove = (e) => {
            if (!startX || !startY) return;

            // Avbryt om användaren sveper inuti cup-trädet eller andra scrollbara vyer
            if (e.target.closest('.bracket-container') || e.target.closest('[style*="overflow-x: auto"]') || e.target.closest('[style*="overflowX: auto"]')) {
                return;
            }

            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const diffX = startX - currentX;
            const diffY = startY - currentY;

            if (isVerticalSwipe) return;

            if (!isHorizontalSwipe && !isVerticalSwipe) {
                if (Math.abs(diffX) > 8 || Math.abs(diffY) > 8) {
                    if (Math.abs(diffX) > Math.abs(diffY)) {
                        isHorizontalSwipe = true;
                    } else {
                        isVerticalSwipe = true;
                    }
                }
            }

            // Blockera vertikal scroll helt om vi sveper horisontellt! (Detta tar bort diagonal jiggle)
            if (isHorizontalSwipe) {
                if (e.cancelable) {
                    e.preventDefault();
                }
            }
        };

        const handleEnd = (e) => {
            if (!startX || !startY || !isHorizontalSwipe) {
                startX = 0;
                startY = 0;
                return;
            }

            const endX = e.changedTouches[0].clientX;
            const diffX = startX - endX;

            if (Math.abs(diffX) > 60) {
                const currentIndex = SUBTABS.findIndex(t => t.id === activeTabRef.current);
                if (diffX > 0) {
                    if (currentIndex < SUBTABS.length - 1) {
                        setActiveTab(SUBTABS[currentIndex + 1].id);
                        if (navigator.vibrate) navigator.vibrate(10);
                    }
                } else {
                    if (currentIndex > 0) {
                        setActiveTab(SUBTABS[currentIndex - 1].id);
                        if (navigator.vibrate) navigator.vibrate(10);
                    }
                }
            }

            startX = 0;
            startY = 0;
            isHorizontalSwipe = false;
            isVerticalSwipe = false;
        };

        container.addEventListener('touchstart', handleStart, { passive: true });
        container.addEventListener('touchmove', handleMove, { passive: false });
        container.addEventListener('touchend', handleEnd, { passive: true });

        return () => {
            container.removeEventListener('touchstart', handleStart);
            container.removeEventListener('touchmove', handleMove);
            container.removeEventListener('touchend', handleEnd);
        };
    }, []);

    return (
        <div 
            ref={containerRef}
            style={{ minHeight: '100vh', paddingBottom: '100px' }}
        >
            {activeTab !== 'matcher' && activeTab !== 'gruppspel' && (
                <button
                    className={`scroll-to-top-btn ${showScrollTop ? 'visible' : ''}`}
                    onClick={scrollToTop}
                    aria-label="Scrolla till toppen"
                >
                    <ArrowUp size={28} />
                </button>
            )}

            <div className="nav-container" style={{ 
                backgroundColor: headerStyle.bg,
                color: headerStyle.text,
                '--active-color': headerStyle.activeLine,
                transition: 'background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease',
                boxShadow: filterTeam ? 'none' : '0 4px 12px rgba(0,0,0,0.05)'
            }}>
                <div style={{ justifySelf: 'start', display: 'flex', alignItems: 'center' }}>
                    <button
                        onClick={() => navigate('/vm')}
                        style={{ 
                            background: 'none', 
                            border: 'none', 
                            cursor: 'pointer',
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '10px',
                            padding: '6px 8px',
                            borderRadius: '12px',
                            transition: 'background-color 0.2s',
                        }}
                    >
                        <img src={logosData['ALLSVENSKAN_LOGO'] || "https://upload.wikimedia.org/wikipedia/en/thumb/e/ef/Allsvenskan_logo.svg/800px-Allsvenskan_logo.svg.png"} alt="Allsvenskan Logo" style={{ height: '34px', objectFit: 'contain' }} />
                        <ArrowLeftRight size={18} color="#aeafb4" />
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
                                if (tab.id === 'matcher' && activeTab === 'matcher') {
                                    if (nextMatchRef.current) {
                                        nextMatchRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    } else {
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }
                                } else {
                                    setActiveTab(tab.id);
                                }
                                if (navigator.vibrate) navigator.vibrate(10);
                            }}
                            style={{
                                color: activeTab === tab.id ? headerStyle.text : headerStyle.inactiveText,
                                borderBottomColor: activeTab === tab.id ? headerStyle.activeLine : 'transparent',
                                transition: 'all 0.3s ease'
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
                            <Filter size={24} color={headerStyle.inactiveText} strokeWidth={1.5} style={{ transition: 'color 0.3s ease' }} />
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
                            <span>{cleanTeamNameForDisplay(filterTeam)}</span>
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
                        <span>{cleanTeamNameForDisplay(team)}</span>
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
                            ) : (
                                <>
                                    {groupedMatches.length > 0 ? (
                                        groupedMatches.map((group, i) => (
                                            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <div style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', paddingLeft: '4px', color: 'var(--color-text-muted)', letterSpacing: '0.02em' }}>
                                                    {getRelativeDateLabel(group.date)}
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {group.matches.map((match, j) => {
                                                        const isNext = nextMatchDateString && match.date === nextMatchDateString;
                                                        return (
                                                            <div key={j} ref={isNext && heroMatches[0] === match ? nextMatchRef : null}>
                                                                <MatchCard 
                                                                    match={match} 
                                                                    idx={j} 
                                                                    variant={isNext ? 'hero' : undefined}
                                                                    homeLogo={getTeamLogo(match.home)}
                                                                    awayLogo={getTeamLogo(match.away)}
                                                                    filterTeam={filterTeam}
                                                                    allMatches={matchesData?.matches}
                                                                    onTeamClick={setFilterTeam}
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
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        gap: '4px',
                                                        paddingLeft: '4px'
                                                    }}>
                                                        <div style={{ 
                                                            width: '20px', 
                                                            height: '28px', 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            justifyContent: 'center', 
                                                            fontWeight: '700', 
                                                            fontSize: '0.85rem', 
                                                            backgroundColor: 'transparent', 
                                                            color: 'inherit' 
                                                        }}>
                                                            {team.rank}
                                                        </div>
                                                        {tableTrends[team.team] === 'up' && (
                                                            <ArrowUp size={12} style={{ color: '#34c759', flexShrink: 0 }} strokeWidth={3} />
                                                        )}
                                                        {tableTrends[team.team] === 'down' && (
                                                            <ArrowDown size={12} style={{ color: '#ff3b30', flexShrink: 0 }} strokeWidth={3} />
                                                        )}
                                                    </div>
                                                </td>
                                                <td style={{ 
                                                    padding: '11px 4px',
                                                    borderTop: isSeparator ? '1px dashed rgba(0,0,0,0.15)' : 'none'
                                                }}>
                                                    <span style={{ fontWeight: '500', whiteSpace: 'normal', lineHeight: '1.2', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        {getTeamLogo(team.team) && <img src={getTeamLogo(team.team)} alt="" style={{ height: '26px', width: '26px', objectFit: 'contain' }} />}
                                                        <span>{cleanTeamNameForDisplay(team.team)}</span>
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
