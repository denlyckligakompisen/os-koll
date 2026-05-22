import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from './common/Card';
import MatchCard, { cleanTeamNameForDisplay } from './MatchCard';
import SvenskaCupenBracket from './SvenskaCupenBracket';
import { Calendar, List, BarChart3, Trophy, ChevronRight, ArrowLeftRight, Globe, X, ArrowUp, ArrowDown, ChevronDown, Filter, Play, Pause, Repeat } from 'lucide-react';
import MuiMenu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useSwipeNavigation } from '../utils/navigation';


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
    const [statFilter, setStatFilter] = useState('lag');
    const [playerFilter, setPlayerFilter] = useState('maraton');
    const [filterTeam, setFilterTeam] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [navAnchorEl, setNavAnchorEl] = useState(null);
    const [matchesData, setMatchesData] = useState(null);
    const [logosData, setLogosData] = useState({});
    const [tableData, setTableData] = useState(null);
    const [maratonData, setMaratonData] = useState(null);
    const [transfersData, setTransfersData] = useState(null);
    const [loading, setLoading] = useState(true);
    const tableRefs = React.useRef({});
    const maratonRefs = React.useRef({});
    const nextMatchRef = React.useRef(null);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const navigate = useNavigate();
    
    const [selectedSeason, setSelectedSeason] = useState(2026);
    const [selectedStatTable, setSelectedStatTable] = useState('2026');
    const [currentRoundSliderVal, setCurrentRoundSliderVal] = useState(30);
    const [isPlaying, setIsPlaying] = useState(false);

    const teams = useMemo(() => {
        if (!matchesData?.matches) return [];
        const uniqueTeams = new Set();
        matchesData.matches.forEach(m => {
            if (m.home) uniqueTeams.add(m.home);
            if (m.away) uniqueTeams.add(m.away);
        });
        return Array.from(uniqueTeams).sort((a, b) => 
            cleanTeamNameForDisplay(a).localeCompare(cleanTeamNameForDisplay(b), 'sv')
        );
    }, [matchesData]);

    const SUBTABS = [
        { id: 'matcher', label: 'Matcher', icon: Calendar },
        { id: 'gruppspel', label: 'Tabell', icon: List },
        { id: 'slutspel', label: 'Svenska Cupen', icon: Trophy },
        { id: 'statistik', label: 'Statistik', icon: BarChart3 },
        { id: 'transfers', label: 'Transfers', icon: Repeat }
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
                setIsPlaying(false);
                setLoading(true);
                const matchesUrl = selectedSeason === 2026 
                    ? '/data/allsvenskan_matches.json' 
                    : `/data/allsvenskan_matches_${selectedSeason}.json`;
                const tableUrl = selectedSeason === 2026 
                    ? '/data/allsvenskan_table.json' 
                    : `/data/allsvenskan_table_${selectedSeason}.json`;

                const [matchesRes, logosRes, tableRes, maratonRes] = await Promise.all([
                    fetch(matchesUrl),
                    fetch('/data/allsvenskan_logos.json'),
                    fetch(tableUrl),
                    fetch('/data/allsvenskan_maraton.json')
                ]);
                const matches = await matchesRes.json();
                const logos = await logosRes.json();
                const table = await tableRes.json();
                const maraton = await maratonRes.json();

                // Transfers loaded separately to avoid crashing main data load
                let transfers = null;
                try {
                    const transfersRes = await fetch('/data/allsvenskan_transfers.json');
                    const contentType = transfersRes.headers.get('content-type') || '';
                    if (transfersRes.ok && contentType.includes('application/json')) {
                        transfers = await transfersRes.json();
                    }
                } catch (e) {
                    // Transfers data not available yet — ignore
                }

                setMatchesData(matches);
                setLogosData(logos);
                setTableData(table);
                setMaratonData(maraton);
                setTransfersData(transfers);
                setLoading(false);
            } catch (error) {
                console.error(`Error fetching Allsvenskan data for season ${selectedSeason}:`, error);
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedSeason]);





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
        const firstActiveMatch = filteredMatches.find(m => m.status === 'upcoming' || m.status === 'live');
        return firstActiveMatch ? firstActiveMatch.date : null;
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


    const maxPlayedRound = useMemo(() => {
        if (!matchesData?.matches) return 30;
        const finishedMatches = matchesData.matches.filter(m => m.status === 'finished');
        if (finishedMatches.length === 0) return 0;
        return Math.max(...finishedMatches.map(m => m.round || 1));
    }, [matchesData]);

    useEffect(() => {
        if (matchesData) {
            setCurrentRoundSliderVal(maxPlayedRound);
        }
    }, [matchesData, maxPlayedRound]);

    const prevActiveTabRef = React.useRef(activeTab);

    useEffect(() => {
        if (activeTab === 'gruppspel' && prevActiveTabRef.current !== 'gruppspel') {
            setSelectedSeason(2026);
            setSelectedStatTable('2026');
            if (selectedSeason === 2026 && matchesData) {
                setCurrentRoundSliderVal(maxPlayedRound);
            }
        }
        if (activeTab !== 'statistik') {
            setStatFilter('lag');
            setPlayerFilter('maraton');
        }
        prevActiveTabRef.current = activeTab;
    }, [activeTab, selectedSeason, matchesData, maxPlayedRound]);

    const computedTableData = useMemo(() => {
        if (!matchesData?.matches) return [];
        
        const teamSet = new Set();
        matchesData.matches.forEach(m => {
            if (m.home) teamSet.add(m.home);
            if (m.away) teamSet.add(m.away);
        });
        const teamList = Array.from(teamSet);
        
        const stats = {};
        teamList.forEach(team => {
            stats[team] = {
                team,
                played: 0,
                won: 0,
                drawn: 0,
                lost: 0,
                goalsFor: 0,
                goalsAgainst: 0,
                points: 0
            };
        });

        const finishedMatches = matchesData.matches.filter(m => 
            m.status === 'finished' && 
            m.score && 
            (m.round || 1) <= currentRoundSliderVal
        );

        finishedMatches.forEach(m => {
            const scoreParts = m.score.split('-').map(s => parseInt(s.trim()));
            if (scoreParts.length === 2 && !isNaN(scoreParts[0]) && !isNaN(scoreParts[1])) {
                const homeGoals = scoreParts[0];
                const awayGoals = scoreParts[1];
                const homeTeam = m.home;
                const awayTeam = m.away;

                if (stats[homeTeam] && stats[awayTeam]) {
                    stats[homeTeam].played += 1;
                    stats[awayTeam].played += 1;
                    stats[homeTeam].goalsFor += homeGoals;
                    stats[homeTeam].goalsAgainst += awayGoals;
                    stats[awayTeam].goalsFor += awayGoals;
                    stats[awayTeam].goalsAgainst += homeGoals;

                    if (homeGoals > awayGoals) {
                        stats[homeTeam].won += 1;
                        stats[homeTeam].points += 3;
                        stats[awayTeam].lost += 1;
                    } else if (awayGoals > homeGoals) {
                        stats[awayTeam].won += 1;
                        stats[awayTeam].points += 3;
                        stats[homeTeam].lost += 1;
                    } else {
                        stats[homeTeam].drawn += 1;
                        stats[homeTeam].points += 1;
                        stats[awayTeam].drawn += 1;
                        stats[awayTeam].points += 1;
                    }
                }
            }
        });

        const table = Object.values(stats).map(teamStat => {
            const gd = teamStat.goalsFor - teamStat.goalsAgainst;
            return {
                team: teamStat.team,
                played: String(teamStat.played),
                won: String(teamStat.won),
                drawn: String(teamStat.drawn),
                lost: String(teamStat.lost),
                goals: `${teamStat.goalsFor}-${teamStat.goalsAgainst}`,
                gd: String(gd),
                points: String(teamStat.points),
                goalsForNum: teamStat.goalsFor,
                gdNum: gd,
                pointsNum: teamStat.points
            };
        });

        table.sort((a, b) => {
            if (b.pointsNum !== a.pointsNum) return b.pointsNum - a.pointsNum;
            if (b.gdNum !== a.gdNum) return b.gdNum - a.gdNum;
            if (b.goalsForNum !== a.goalsForNum) return b.goalsForNum - a.goalsForNum;
            return cleanTeamNameForDisplay(a.team).localeCompare(cleanTeamNameForDisplay(b.team), 'sv');
        });

        return table.map((team, index) => ({
            ...team,
            rank: String(index + 1)
        }));
    }, [matchesData, currentRoundSliderVal]);

    const sliderTableTrends = useMemo(() => {
        if (!matchesData?.matches || currentRoundSliderVal <= 0) return {};

        const tableR = computedTableData;
        const teamSet = new Set();
        matchesData.matches.forEach(m => {
            if (m.home) teamSet.add(m.home);
            if (m.away) teamSet.add(m.away);
        });
        const teamList = Array.from(teamSet);
        
        const statsPrev = {};
        teamList.forEach(team => {
            statsPrev[team] = {
                team,
                played: 0,
                won: 0,
                drawn: 0,
                lost: 0,
                goalsFor: 0,
                goalsAgainst: 0,
                points: 0
            };
        });

        const finishedMatchesPrev = matchesData.matches.filter(m => 
            m.status === 'finished' && 
            m.score && 
            (m.round || 1) < currentRoundSliderVal
        );

        finishedMatchesPrev.forEach(m => {
            const scoreParts = m.score.split('-').map(s => parseInt(s.trim()));
            if (scoreParts.length === 2 && !isNaN(scoreParts[0]) && !isNaN(scoreParts[1])) {
                const homeGoals = scoreParts[0];
                const awayGoals = scoreParts[1];
                const homeTeam = m.home;
                const awayTeam = m.away;

                if (statsPrev[homeTeam] && statsPrev[awayTeam]) {
                    statsPrev[homeTeam].played += 1;
                    statsPrev[awayTeam].played += 1;
                    statsPrev[homeTeam].goalsFor += homeGoals;
                    statsPrev[homeTeam].goalsAgainst += awayGoals;
                    statsPrev[awayTeam].goalsFor += awayGoals;
                    statsPrev[awayTeam].goalsAgainst += homeGoals;

                    if (homeGoals > awayGoals) {
                        statsPrev[homeTeam].won += 1;
                        statsPrev[homeTeam].points += 3;
                        statsPrev[awayTeam].lost += 1;
                    } else if (awayGoals > homeGoals) {
                        statsPrev[awayTeam].won += 1;
                        statsPrev[awayTeam].points += 3;
                        statsPrev[homeTeam].lost += 1;
                    } else {
                        statsPrev[homeTeam].drawn += 1;
                        statsPrev[homeTeam].points += 1;
                        statsPrev[awayTeam].drawn += 1;
                        statsPrev[awayTeam].points += 1;
                    }
                }
            }
        });

        const tablePrev = Object.values(statsPrev).map(teamStat => {
            const gd = teamStat.goalsFor - teamStat.goalsAgainst;
            return {
                team: teamStat.team,
                goalsForNum: teamStat.goalsFor,
                gdNum: gd,
                pointsNum: teamStat.points
            };
        });

        tablePrev.sort((a, b) => {
            if (b.pointsNum !== a.pointsNum) return b.pointsNum - a.pointsNum;
            if (b.gdNum !== a.gdNum) return b.gdNum - a.gdNum;
            if (b.goalsForNum !== a.goalsForNum) return b.goalsForNum - a.goalsForNum;
            return cleanTeamNameForDisplay(a.team).localeCompare(cleanTeamNameForDisplay(b.team), 'sv');
        });

        const prevRanks = {};
        tablePrev.forEach((t, index) => {
            prevRanks[t.team] = index + 1;
        });

        const trends = {};
        tableR.forEach((t, index) => {
            const currentRank = index + 1;
            const prevRank = prevRanks[t.team];
            if (!prevRank) {
                trends[t.team] = 'same';
            } else if (prevRank > currentRank) {
                trends[t.team] = 'up';
            } else if (prevRank < currentRank) {
                trends[t.team] = 'down';
            } else {
                trends[t.team] = 'same';
            }
        });

        return trends;
    }, [matchesData, currentRoundSliderVal, computedTableData]);

    useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(() => {
            setCurrentRoundSliderVal(prev => {
                if (prev >= maxPlayedRound) {
                    setIsPlaying(false);
                    return prev;
                }
                return prev + 1;
            });
        }, 700);

        return () => clearInterval(interval);
    }, [isPlaying, maxPlayedRound]);

    const togglePlayback = () => {
        if (currentRoundSliderVal >= maxPlayedRound) {
            setCurrentRoundSliderVal(0);
        }
        setIsPlaying(prev => !prev);
    };

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

    const topScorers = useMemo(() => {
        if (!matchesData?.matches) return [];
        const counts = {};
        matchesData.matches.forEach(m => {
            if (m.status === 'finished' && m.scorers) {
                (m.scorers.home || []).forEach(s => {
                    if (!s.suffix?.includes('självmål')) {
                        const key = s.player;
                        if (!counts[key]) counts[key] = { goals: 0, team: m.home };
                        counts[key].goals += 1;
                    }
                });
                (m.scorers.away || []).forEach(s => {
                    if (!s.suffix?.includes('självmål')) {
                        const key = s.player;
                        if (!counts[key]) counts[key] = { goals: 0, team: m.away };
                        counts[key].goals += 1;
                    }
                });
            }
        });

        return Object.entries(counts)
            .map(([player, data]) => ({ player, goals: data.goals, team: data.team }))
            .sort((a, b) => b.goals - a.goals || a.player.localeCompare(b.player, 'sv'));
    }, [matchesData]);

    const topAssists = useMemo(() => {
        if (!matchesData?.matches) return [];
        const counts = {};
        matchesData.matches.forEach(m => {
            if (m.status === 'finished' && m.scorers) {
                (m.scorers.home || []).forEach(s => {
                    if (s.assist) {
                        const key = s.assist;
                        if (!counts[key]) counts[key] = { assists: 0, team: m.home };
                        counts[key].assists += 1;
                    }
                });
                (m.scorers.away || []).forEach(s => {
                    if (s.assist) {
                        const key = s.assist;
                        if (!counts[key]) counts[key] = { assists: 0, team: m.away };
                        counts[key].assists += 1;
                    }
                });
            }
        });

        return Object.entries(counts)
            .map(([player, data]) => ({ player, assists: data.assists, team: data.team }))
            .sort((a, b) => b.assists - a.assists || a.player.localeCompare(b.player, 'sv'));
    }, [matchesData]);

    useEffect(() => {
        // Delay to allow for tab switching and DOM rendering
        const timer = setTimeout(() => {
            if (activeTab === 'matcher' && nextMatchRef.current) {
                nextMatchRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else if (activeTab === 'gruppspel') {
                // Do not scroll at all in table if a filter is active
                if (!filterTeam) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            } else if (activeTab === 'statistik' && statFilter === 'lag' && filterTeam && maratonRefs.current[filterTeam]) {
                maratonRefs.current[filterTeam].scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else if (activeTab !== 'matcher') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }, 150);

        return () => clearTimeout(timer);
    }, [activeTab, loading, filterTeam, nextMatchDateString, statFilter]);

    useSwipeNavigation(activeTab, setActiveTab, SUBTABS);

    return (
        <div 
            style={{ paddingBottom: '24px' }}
        >
            <button
                className={`scroll-to-top-btn ${showScrollTop ? 'visible' : ''}`}
                onClick={scrollToTop}
                aria-label="Scrolla till toppen"
            >
                <ArrowUp size={28} />
            </button>

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
                                    if (tab.id === 'gruppspel') {
                                        setSelectedSeason(2026);
                                        if (selectedSeason === 2026 && matchesData) {
                                            setCurrentRoundSliderVal(maxPlayedRound);
                                        }
                                    }
                                    window.scrollTo({ top: 0 });
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
                    
                    {/* Season Selector */}
                    {/* Season Selector */}
                    {/* Season Selector with Inline Slider */}

                    
                    {activeTab === 'matcher' && (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: '4px', marginBottom: '16px' }}>
                                <div style={{ position: 'relative', width: '100px', flexShrink: 0 }}>
                                    <select
                                        value={selectedSeason}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            setSelectedSeason(val);
                                            if (navigator.vibrate) navigator.vibrate(5);
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '8px 32px 8px 12px',
                                            fontSize: '0.85rem',
                                            fontWeight: '750',
                                            color: 'var(--color-text)',
                                            backgroundColor: 'rgba(0,0,0,0.05)',
                                            border: '1px solid rgba(0,0,0,0.08)',
                                            borderRadius: '20px',
                                            outline: 'none',
                                            cursor: 'pointer',
                                            WebkitAppearance: 'none',
                                            appearance: 'none',
                                            transition: 'all 0.2s ease',
                                            boxShadow: 'var(--shadow-sm)'
                                        }}
                                    >
                                        {[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008].map(yr => (
                                            <option key={yr} value={yr} style={{ color: '#000', fontWeight: '600' }}>{yr}</option>
                                        ))}
                                    </select>
                                    <div style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        pointerEvents: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: 'var(--color-text-muted)'
                                    }}>
                                        <ChevronDown size={14} strokeWidth={2.5} />
                                    </div>
                                </div>
                            </div>
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
                                                                    variant={isNext && match.status !== 'finished' ? 'hero' : undefined}
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
                        <div style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Top Controls: Selector for Seasons & Round Slider / Playback Capsule */}
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '12px', 
                                width: '100%', 
                                flexWrap: 'wrap',
                                paddingLeft: '4px',
                                marginBottom: '-4px'
                            }}>
                                {/* Season Dropdown */}
                                <div style={{ position: 'relative', width: '100px', flexShrink: 0 }}>
                                    <select
                                        value={selectedSeason}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            setSelectedSeason(val);
                                            if (navigator.vibrate) navigator.vibrate(5);
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '8px 32px 8px 12px',
                                            fontSize: '0.85rem',
                                            fontWeight: '750',
                                            color: 'var(--color-text)',
                                            backgroundColor: 'rgba(0,0,0,0.05)',
                                            border: '1px solid rgba(0,0,0,0.08)',
                                            borderRadius: '20px',
                                            outline: 'none',
                                            cursor: 'pointer',
                                            WebkitAppearance: 'none',
                                            appearance: 'none',
                                            transition: 'all 0.2s ease',
                                            boxShadow: 'var(--shadow-sm)'
                                        }}
                                    >
                                        {[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008].map(yr => (
                                            <option key={yr} value={yr} style={{ color: '#000', fontWeight: '600' }}>{yr}</option>
                                        ))}
                                    </select>
                                    <div style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        pointerEvents: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: 'var(--color-text-muted)'
                                    }}>
                                        <ChevronDown size={14} strokeWidth={2.5} />
                                    </div>
                                </div>

                                {/* Round Slider Capsule */}
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '10px', 
                                    flex: 1, 
                                    minWidth: '200px',
                                    backgroundColor: 'rgba(0,0,0,0.03)',
                                    padding: '6px 14px',
                                    borderRadius: '24px',
                                    border: '1px solid rgba(0,0,0,0.04)'
                                }}>

                                    <input 
                                        type="range" 
                                        min="0" 
                                        max={maxPlayedRound} 
                                        value={currentRoundSliderVal}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            setCurrentRoundSliderVal(val);
                                            if (isPlaying) setIsPlaying(false);
                                            if (navigator.vibrate) navigator.vibrate(2);
                                        }}
                                        style={{
                                            flex: 1,
                                            height: '4px',
                                            borderRadius: '2px',
                                            background: 'rgba(0, 0, 0, 0.1)',
                                            outline: 'none',
                                            WebkitAppearance: 'none',
                                            appearance: 'none',
                                            cursor: 'pointer',
                                            touchAction: 'none',
                                            '--range-color': filterTeam ? headerStyle.bg : 'var(--color-text)'
                                        }}
                                        className="custom-slider"
                                    />

                                </div>
                            </div>

                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                                    Laddar tabell...
                                </div>
                            ) : (
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
                                            {computedTableData.map((team, idx) => {
                                                const rank = parseInt(team.rank);
                                                const isFiltered = filterTeam === team.team;
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
                                                                {sliderTableTrends[team.team] === 'up' && (
                                                                    <ArrowUp size={12} style={{ color: '#34c759', flexShrink: 0 }} strokeWidth={3} />
                                                                )}
                                                                {sliderTableTrends[team.team] === 'down' && (
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
                            )}
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                            {/* Main Filter: Lag / Spelare */}
                            <div style={{ display: 'flex', gap: '8px', paddingLeft: '4px', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '12px' }}>
                                <button
                                    onClick={() => {
                                        setStatFilter('lag');
                                        setPlayerFilter('maraton');
                                        if (navigator.vibrate) navigator.vibrate(5);
                                    }}
                                    style={{
                                        padding: '8px 20px',
                                        borderRadius: '20px',
                                        fontSize: '0.9rem',
                                        fontWeight: '750',
                                        cursor: 'pointer',
                                        border: 'none',
                                        transition: 'all 0.2s ease',
                                        backgroundColor: statFilter === 'lag' ? (filterTeam ? headerStyle.bg : 'var(--color-text)') : 'rgba(0,0,0,0.05)',
                                        color: statFilter === 'lag' ? (filterTeam ? headerStyle.text : 'var(--color-bg)') : 'var(--color-text-muted)',
                                    }}
                                >
                                    Lag
                                </button>
                                <button
                                    onClick={() => {
                                        setStatFilter('spelare');
                                        setPlayerFilter('mål');
                                        if (navigator.vibrate) navigator.vibrate(5);
                                    }}
                                    style={{
                                        padding: '8px 20px',
                                        borderRadius: '20px',
                                        fontSize: '0.9rem',
                                        fontWeight: '750',
                                        cursor: 'pointer',
                                        border: 'none',
                                        transition: 'all 0.2s ease',
                                        backgroundColor: statFilter === 'spelare' ? (filterTeam ? headerStyle.bg : 'var(--color-text)') : 'rgba(0,0,0,0.05)',
                                        color: statFilter === 'spelare' ? (filterTeam ? headerStyle.text : 'var(--color-bg)') : 'var(--color-text-muted)',
                                    }}
                                >
                                    Spelare
                                </button>
                            </div>

                            {/* Sub Filter */}
                            <div style={{ display: 'flex', gap: '8px', paddingLeft: '4px', marginTop: '-4px' }}>
                                {statFilter === 'lag' ? (
                                    <button
                                        onClick={() => {
                                            setPlayerFilter('maraton');
                                            if (navigator.vibrate) navigator.vibrate(5);
                                        }}
                                        style={{
                                            padding: '6px 14px',
                                            borderRadius: '16px',
                                            fontSize: '0.8rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            backgroundColor: playerFilter === 'maraton' ? 'rgba(0,0,0,0.08)' : 'transparent',
                                            color: playerFilter === 'maraton' ? 'var(--color-text)' : 'var(--color-text-muted)',
                                            border: '1px solid rgba(0,0,0,0.08)'
                                        }}
                                    >
                                        Maratontabell
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => {
                                                setPlayerFilter('mål');
                                                if (navigator.vibrate) navigator.vibrate(5);
                                            }}
                                            style={{
                                                padding: '6px 14px',
                                                borderRadius: '16px',
                                                fontSize: '0.8rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                backgroundColor: playerFilter === 'mål' ? 'rgba(0,0,0,0.08)' : 'transparent',
                                                color: playerFilter === 'mål' ? 'var(--color-text)' : 'var(--color-text-muted)',
                                                border: '1px solid rgba(0,0,0,0.08)'
                                            }}
                                        >
                                            Mål
                                        </button>
                                        <button
                                            onClick={() => {
                                                setPlayerFilter('assists');
                                                if (navigator.vibrate) navigator.vibrate(5);
                                            }}
                                            style={{
                                                padding: '6px 14px',
                                                borderRadius: '16px',
                                                fontSize: '0.8rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                backgroundColor: playerFilter === 'assists' ? 'rgba(0,0,0,0.08)' : 'transparent',
                                                color: playerFilter === 'assists' ? 'var(--color-text)' : 'var(--color-text-muted)',
                                                border: '1px solid rgba(0,0,0,0.08)'
                                            }}
                                        >
                                            Assist
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Tables rendering */}
                            {statFilter === 'lag' && playerFilter === 'maraton' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
                                    <Card style={{ marginBottom: '0' }}>
                                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 2px', fontSize: '0.9rem' }}>
                                            <thead>
                                                <tr style={{ borderBottom: 'var(--border)' }}>
                                                    <th scope="col" style={{ textAlign: 'left', padding: '8px 4px', color: 'var(--color-text-muted)', fontWeight: '600', width: '36px' }}>#</th>
                                                    <th scope="col" style={{ textAlign: 'left', padding: '8px 4px', color: 'var(--color-text-muted)', fontWeight: '600' }}>LAG</th>
                                                    <th scope="col" style={{ textAlign: 'center', padding: '8px 4px', color: 'var(--color-text-muted)', fontWeight: '600', width: '35px' }}>SÄS</th>
                                                    <th scope="col" style={{ textAlign: 'center', padding: '8px 4px', color: 'var(--color-text-muted)', fontWeight: '600', width: '45px' }}>M</th>
                                                    <th scope="col" style={{ textAlign: 'right', padding: '8px 4px', color: 'var(--color-text-muted)', fontWeight: '600', width: '45px' }}>P</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {maratonData?.table.map((row, idx) => {
                                                    const isFiltered = filterTeam && row.team.includes(filterTeam);
                                                    return (
                                                        <tr 
                                                            key={idx}
                                                            ref={el => maratonRefs.current[row.team] = el}
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
                                                                <div style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem' }}>
                                                                    {row.rank}
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: '11px 4px' }}>
                                                                <span style={{ fontWeight: '500', whiteSpace: 'normal', lineHeight: '1.2', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    {getTeamLogo(row.team) && <img src={getTeamLogo(row.team)} alt="" style={{ height: '26px', width: '26px', objectFit: 'contain' }} />}
                                                                    <span>{cleanTeamNameForDisplay(row.team)}</span>
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: '11px 4px', textAlign: 'center' }}>{row.seasons}</td>
                                                            <td style={{ padding: '11px 4px', textAlign: 'center' }}>{row.played}</td>
                                                            <td style={{ 
                                                                padding: '11px 4px', 
                                                                textAlign: 'right', 
                                                                fontWeight: '800',
                                                                borderTopRightRadius: isFiltered ? '10px' : '0',
                                                                borderBottomRightRadius: isFiltered ? '10px' : '0'
                                                            }}>{row.points}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </Card>
                                </div>
                            )}

                            {statFilter === 'spelare' && playerFilter === 'mål' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
                                    <Card style={{ marginBottom: '0' }}>
                                        {topScorers.length > 0 ? (
                                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 2px', fontSize: '0.9rem' }}>
                                                <thead>
                                                    <tr style={{ borderBottom: 'var(--border)' }}>
                                                        <th scope="col" style={{ textAlign: 'left', padding: '8px 4px', color: 'var(--color-text-muted)', fontWeight: '600', width: '36px' }}>#</th>
                                                        <th scope="col" style={{ textAlign: 'left', padding: '8px 4px', color: 'var(--color-text-muted)', fontWeight: '600' }}>SPELARE</th>
                                                        <th scope="col" style={{ textAlign: 'right', padding: '8px 4px', color: 'var(--color-text-muted)', fontWeight: '600', width: '45px' }}>MÅL</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {topScorers.map((scorer, idx) => {
                                                        const isFiltered = filterTeam && scorer.team.includes(filterTeam);
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
                                                                    <div style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem' }}>
                                                                        {idx + 1}
                                                                    </div>
                                                                </td>
                                                                <td style={{ padding: '11px 4px' }}>
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                                        <span style={{ fontWeight: '600' }}>{scorer.player}</span>
                                                                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                            {getTeamLogo(scorer.team) && <img src={getTeamLogo(scorer.team)} alt="" style={{ height: '14px', width: '14px', objectFit: 'contain' }} />}
                                                                            {cleanTeamNameForDisplay(scorer.team)}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td style={{ 
                                                                    padding: '11px 4px', 
                                                                    textAlign: 'right', 
                                                                    fontWeight: '800',
                                                                    fontSize: '1rem',
                                                                    borderTopRightRadius: isFiltered ? '10px' : '0',
                                                                    borderBottomRightRadius: isFiltered ? '10px' : '0'
                                                                }}>{scorer.goals}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-muted)' }}>
                                                Inga mål registrerade ännu för säsongen 2026.
                                            </div>
                                        )}
                                    </Card>
                                </div>
                            )}

                            {statFilter === 'spelare' && playerFilter === 'assists' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
                                    <Card style={{ marginBottom: '0' }}>
                                        {topAssists.length > 0 ? (
                                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 2px', fontSize: '0.9rem' }}>
                                                <thead>
                                                    <tr style={{ borderBottom: 'var(--border)' }}>
                                                        <th scope="col" style={{ textAlign: 'left', padding: '8px 4px', color: 'var(--color-text-muted)', fontWeight: '600', width: '36px' }}>#</th>
                                                        <th scope="col" style={{ textAlign: 'left', padding: '8px 4px', color: 'var(--color-text-muted)', fontWeight: '600' }}>SPELARE</th>
                                                        <th scope="col" style={{ textAlign: 'right', padding: '8px 4px', color: 'var(--color-text-muted)', fontWeight: '600', width: '45px' }}>ASSIST</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {topAssists.map((item, idx) => {
                                                        const isFiltered = filterTeam && item.team.includes(filterTeam);
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
                                                                    <div style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem' }}>
                                                                        {idx + 1}
                                                                    </div>
                                                                </td>
                                                                <td style={{ padding: '11px 4px' }}>
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                                        <span style={{ fontWeight: '600' }}>{item.player}</span>
                                                                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                            {getTeamLogo(item.team) && <img src={getTeamLogo(item.team)} alt="" style={{ height: '14px', width: '14px', objectFit: 'contain' }} />}
                                                                            {cleanTeamNameForDisplay(item.team)}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td style={{ 
                                                                    padding: '11px 4px', 
                                                                    textAlign: 'right', 
                                                                    fontWeight: '800',
                                                                    fontSize: '1rem',
                                                                    borderTopRightRadius: isFiltered ? '10px' : '0',
                                                                    borderBottomRightRadius: isFiltered ? '10px' : '0'
                                                                }}>{item.assists}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-muted)' }}>
                                                Inga assists registrerade ännu för säsongen 2026.
                                            </div>
                                        )}
                                    </Card>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'transfers' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                                    Laddar transfers...
                                </div>
                            ) : !transfersData?.teams ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                                    Inga transferdata tillgängliga.
                                </div>
                            ) : (
                                <>
                                    {transfersData.lastUpdated && (
                                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textAlign: 'right', padding: '0 4px' }}>
                                            Uppdaterad: {new Date(transfersData.lastUpdated).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    )}
                                    {Object.entries(transfersData.teams)
                                        .filter(([teamName]) => {
                                            if (!filterTeam) return true;
                                            const cleanFilter = filterTeam.replace(' IF', '').replace(' FF', '').replace(' BK', '').trim();
                                            return teamName.includes(cleanFilter) || teamName.includes(filterTeam) || teamName === filterTeam;
                                        })
                                        .sort(([a], [b]) => cleanTeamNameForDisplay(a).localeCompare(cleanTeamNameForDisplay(b), 'sv'))
                                        .map(([teamName, teamTransfers]) => {
                                            const hasArrivals = teamTransfers.arrivals?.length > 0;
                                            const hasDepartures = teamTransfers.departures?.length > 0;
                                            if (!hasArrivals && !hasDepartures) return null;
                                            const teamColor = TEAM_COLORS[teamName];

                                            return (
                                                <Card key={teamName} padding="0" style={{ overflow: 'hidden' }}>
                                                    {/* Team header */}
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '10px',
                                                        padding: '14px 16px',
                                                        backgroundColor: teamColor?.bg || 'var(--color-card-bg)',
                                                        borderBottom: '1px solid rgba(0,0,0,0.06)'
                                                    }}>
                                                        {getTeamLogo(teamName) && (
                                                            <img src={getTeamLogo(teamName)} alt="" style={{ height: '26px', width: '26px', objectFit: 'contain' }} />
                                                        )}
                                                        <span style={{
                                                            fontWeight: 700,
                                                            fontSize: '0.95rem',
                                                            color: teamColor?.label || 'var(--color-text)'
                                                        }}>
                                                            {cleanTeamNameForDisplay(teamName)}
                                                        </span>
                                                        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                                                            {hasArrivals && (
                                                                <span style={{
                                                                    fontSize: '0.7rem',
                                                                    fontWeight: 700,
                                                                    backgroundColor: 'rgba(52, 199, 89, 0.2)',
                                                                    color: '#2d9e4e',
                                                                    padding: '2px 8px',
                                                                    borderRadius: '10px'
                                                                }}>
                                                                    {teamTransfers.arrivals.length} IN
                                                                </span>
                                                            )}
                                                            {hasDepartures && (
                                                                <span style={{
                                                                    fontSize: '0.7rem',
                                                                    fontWeight: 700,
                                                                    backgroundColor: 'rgba(255, 59, 48, 0.15)',
                                                                    color: '#d93025',
                                                                    padding: '2px 8px',
                                                                    borderRadius: '10px'
                                                                }}>
                                                                    {teamTransfers.departures.length} UT
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Arrivals */}
                                                    {hasArrivals && (
                                                        <div style={{ padding: '12px 16px' }}>
                                                            <div style={{
                                                                fontSize: '0.7rem',
                                                                fontWeight: 800,
                                                                textTransform: 'uppercase',
                                                                color: '#2d9e4e',
                                                                letterSpacing: '0.05em',
                                                                marginBottom: '8px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '6px'
                                                            }}>
                                                                <ArrowDown size={12} /> Nyförvärv
                                                            </div>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                                {teamTransfers.arrivals.map((t, idx) => (
                                                                    <div key={idx} style={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '10px',
                                                                        padding: '8px 10px',
                                                                        borderRadius: '10px',
                                                                        backgroundColor: 'rgba(52, 199, 89, 0.04)',
                                                                        border: '0.5px solid rgba(52, 199, 89, 0.1)',
                                                                    }}>
                                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                                            <div style={{ fontWeight: 600, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                                {t.player}
                                                                            </div>
                                                                            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                                                                                {t.position && <span style={{ opacity: 0.8 }}>{t.position}</span>}
                                                                                {t.age && <span>· {t.age} år</span>}
                                                                                {t.from && <span>· från {t.from}</span>}
                                                                            </div>
                                                                        </div>
                                                                        <div style={{
                                                                            fontSize: '0.72rem',
                                                                            fontWeight: 700,
                                                                            color: t.fee && t.fee !== '-' && !t.fee.toLowerCase().includes('free') ? '#2d9e4e' : 'var(--color-text-muted)',
                                                                            textAlign: 'right',
                                                                            whiteSpace: 'nowrap',
                                                                            flexShrink: 0
                                                                        }}>
                                                                            {t.fee || '-'}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Departures */}
                                                    {hasDepartures && (
                                                        <div style={{ padding: '12px 16px', borderTop: hasArrivals ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
                                                            <div style={{
                                                                fontSize: '0.7rem',
                                                                fontWeight: 800,
                                                                textTransform: 'uppercase',
                                                                color: '#d93025',
                                                                letterSpacing: '0.05em',
                                                                marginBottom: '8px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '6px'
                                                            }}>
                                                                <ArrowUp size={12} /> Försäljningar
                                                            </div>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                                {teamTransfers.departures.map((t, idx) => (
                                                                    <div key={idx} style={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '10px',
                                                                        padding: '8px 10px',
                                                                        borderRadius: '10px',
                                                                        backgroundColor: 'rgba(255, 59, 48, 0.03)',
                                                                        border: '0.5px solid rgba(255, 59, 48, 0.08)',
                                                                    }}>
                                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                                            <div style={{ fontWeight: 600, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                                {t.player}
                                                                            </div>
                                                                            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                                                                                {t.position && <span style={{ opacity: 0.8 }}>{t.position}</span>}
                                                                                {t.age && <span>· {t.age} år</span>}
                                                                                {t.to && <span>· till {t.to}</span>}
                                                                            </div>
                                                                        </div>
                                                                        <div style={{
                                                                            fontSize: '0.72rem',
                                                                            fontWeight: 700,
                                                                            color: t.fee && t.fee !== '-' && !t.fee.toLowerCase().includes('free') ? '#d93025' : 'var(--color-text-muted)',
                                                                            textAlign: 'right',
                                                                            whiteSpace: 'nowrap',
                                                                            flexShrink: 0
                                                                        }}>
                                                                            {t.fee || '-'}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </Card>
                                            );
                                        })}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AllsvenskanKollen;
