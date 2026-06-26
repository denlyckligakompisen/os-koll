import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from './common/Card';
import MatchCard from './MatchCard';
import MatchGroupList from './common/MatchGroupList';
import SharedMatchTable from './common/SharedMatchTable';
import TeamLogo from './MatchCard/TeamLogo';
import { cleanTeamNameForDisplay } from '../utils/teamUtils';
import BoldSverige from './BoldSverige';
import MatchCardSkeleton from './common/MatchCardSkeleton';
import FlagBadge from './common/FlagBadge';
import { getFlagCode } from '../utils/flags';
import { Calendar, List, BarChart3, Trophy, ChevronRight, ArrowLeftRight, Globe, X, ArrowUp, ArrowDown, ChevronDown, Filter, Play, Pause, Repeat, Users } from 'lucide-react';
import FilterDrawer from './common/FilterDrawer';
import HistoryIcon from '@mui/icons-material/History';
import { getRelativeDateLabel } from '../utils/dateUtils';
import { useSwipeNavigation } from '../utils/navigation';
import { useAllsvenskanData } from '../hooks/useAllsvenskanData';
import { formatTmDate, convertValueToSek, getRawSekValue, getHeaderStyle, TEAM_COLORS } from '../utils/allsvenskanUtils';
import { parseTournamentDate } from '../utils/dateUtils';

// Constants and utils are imported from allsvenskanUtils and dateUtils

const AllsvenskanKollen = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('matcher');
    const [matchStatusFilter, setMatchStatusFilter] = useState('upcoming');
    const [statFilter, setStatFilter] = useState('lag');
    const [playerFilter, setPlayerFilter] = useState('maraton');
    const [filterTeam, setFilterTeam] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [navAnchorEl, setNavAnchorEl] = useState(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const tableRefs = React.useRef({});
    const maratonRefs = React.useRef({});
    const nextMatchRef = React.useRef(null);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [error, setError] = useState(null);
    const [selectedSeason, setSelectedSeason] = useState(2026);
    const [selectedStatTable, setSelectedStatTable] = useState('2026');
    const [currentRoundSliderVal, setCurrentRoundSliderVal] = useState(30);

    const { matchesData, logosData, tableData, maratonData, squadsData, loading, liveError, isPlaying, setIsPlaying } = useAllsvenskanData(selectedSeason);

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
        { id: 'statistik', label: 'Statistik', icon: BarChart3 },
        { id: 'cup', label: 'Cupen', icon: Trophy },
        { id: 'squads', label: 'Trupper', icon: Users }
    ];

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 400);
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
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

    const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);
    const handleNavMenuClick = (event) => setNavAnchorEl(event.currentTarget);
    const handleNavMenuClose = () => setNavAnchorEl(null);

    const handleTeamClick = (teamName) => {
        if (filterTeam) return;
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
            setFilterTeam(matchedTeam);
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
        
        if (matchStatusFilter === 'upcoming') {
            const now = new Date();
            now.setHours(0,0,0,0);
            result = result.filter(m => {
                if (m.status !== 'finished') return true;
                const md = parseTournamentDate(m.date, m.time);
                md.setHours(0,0,0,0);
                return md.getTime() === now.getTime(); // Keep today's finished matches
            });
        } else if (matchStatusFilter === 'played') {
            result = result.filter(m => m.status === 'finished');
        }
        
        // Sort matches chronologically
        return [...result].sort((a, b) => {
            return parseTournamentDate(a.date, a.time) - parseTournamentDate(b.date, b.time);
        });
    }, [matchesData, filterTeam, matchStatusFilter]);

    const nextMatchDateString = useMemo(() => {
        if (filteredMatches.length === 0) return null;
        const now = new Date();
        now.setHours(0,0,0,0);
        const firstActiveMatch = filteredMatches.find(m => {
            if (m.status === 'live') return true;
            if (m.status === 'upcoming') {
                const md = parseTournamentDate(m.date, m.time);
                md.setHours(0,0,0,0);
                if (md.getTime() < now.getTime()) return false;
                return true;
            }
            return false;
        });
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
        let list = Object.entries(groups).map(([date, matches]) => ({ date, matches }));
        
        // Sort grouped dates chronologically
        list.sort((a, b) => {
            if (a.matches.length === 0) return 1;
            if (b.matches.length === 0) return -1;
            return parseTournamentDate(a.matches[0].date, a.matches[0].time) - parseTournamentDate(b.matches[0].date, b.matches[0].time);
        });

        if (matchStatusFilter === 'played') {
            list.reverse();
            list.forEach(group => {
                group.matches.reverse();
            });
        }

        return list;
    }, [filteredMatches, matchStatusFilter]);


    const maxPlayedRound = useMemo(() => {
        if (!matchesData?.matches) return 30;
        const teamMatchesCount = {};
        matchesData.matches.forEach(m => {
            if (m.status === 'finished' && m.score) {
                teamMatchesCount[m.home] = (teamMatchesCount[m.home] || 0) + 1;
                teamMatchesCount[m.away] = (teamMatchesCount[m.away] || 0) + 1;
            }
        });
        const max = Math.max(0, ...Object.values(teamMatchesCount));
        return max || 30;
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
                points: 0,
                form: []
            };
        });

        const chronMatches = [...matchesData.matches]
            .filter(m => m.status === 'finished' && m.score)
            .sort((a, b) => a.startTimestamp - b.startTimestamp);

        const teamMatchesCount = {};
        teamList.forEach(t => teamMatchesCount[t] = 0);

        const finishedMatches = [];
        for (const m of chronMatches) {
            const hCount = teamMatchesCount[m.home] || 0;
            const aCount = teamMatchesCount[m.away] || 0;
            if (hCount < currentRoundSliderVal && aCount < currentRoundSliderVal) {
                finishedMatches.push(m);
                teamMatchesCount[m.home] = hCount + 1;
                teamMatchesCount[m.away] = aCount + 1;
            }
        }

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
                    stats[awayTeam].goalsAgainst += awayGoals;
                    stats[awayTeam].goalsFor += awayGoals;
                    stats[awayTeam].goalsAgainst += homeGoals;

                    if (homeGoals > awayGoals) {
                        stats[homeTeam].won += 1;
                        stats[homeTeam].points += 3;
                        stats[homeTeam].form.push('W');
                        stats[awayTeam].lost += 1;
                        stats[awayTeam].form.push('L');
                    } else if (awayGoals > homeGoals) {
                        stats[awayTeam].won += 1;
                        stats[awayTeam].points += 3;
                        stats[awayTeam].form.push('W');
                        stats[homeTeam].lost += 1;
                        stats[homeTeam].form.push('L');
                    } else {
                        stats[homeTeam].drawn += 1;
                        stats[homeTeam].points += 1;
                        stats[homeTeam].form.push('D');
                        stats[awayTeam].drawn += 1;
                        stats[awayTeam].points += 1;
                        stats[awayTeam].form.push('D');
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
                pointsNum: teamStat.points,
                form: teamStat.form // Show all played matches
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

        const chronMatches = [...matchesData.matches]
            .filter(m => m.status === 'finished' && m.score)
            .sort((a, b) => a.startTimestamp - b.startTimestamp);

        const teamMatchesCount = {};
        teamList.forEach(t => teamMatchesCount[t] = 0);

        const finishedMatchesPrev = [];
        for (const m of chronMatches) {
            const hCount = teamMatchesCount[m.home] || 0;
            const aCount = teamMatchesCount[m.away] || 0;
            // Trends compare current round to previous round (currentRoundSliderVal - 1)
            if (hCount < currentRoundSliderVal - 1 && aCount < currentRoundSliderVal - 1) {
                finishedMatchesPrev.push(m);
                teamMatchesCount[m.home] = hCount + 1;
                teamMatchesCount[m.away] = aCount + 1;
            }
        }

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
                    statsPrev[awayTeam].goalsAgainst += awayGoals;
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
                        const dateA = parseTournamentDate(a.date, a.time);
                        const dateB = parseTournamentDate(b.date, b.time);
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
        const normalizeName = (name) => {
            if (name === 'Robbie Philip Thomas Ure') return 'Robbie Ure';
            return name;
        };

        matchesData.matches.forEach(m => {
            if (m.status === 'finished' && m.scorers) {
                (m.scorers.home || []).forEach(s => {
                    if (!s.suffix?.includes('självmål')) {
                        let key = typeof s.player === 'string' ? s.player : (s.player?.name || 'Okänd');
                        key = normalizeName(key);
                        if (key && key !== 'Okänd') {
                            if (!counts[key]) counts[key] = { goals: 0, team: m.home };
                            counts[key].goals += 1;
                        }
                    }
                });
                (m.scorers.away || []).forEach(s => {
                    if (!s.suffix?.includes('självmål')) {
                        let key = typeof s.player === 'string' ? s.player : (s.player?.name || 'Okänd');
                        key = normalizeName(key);
                        if (key && key !== 'Okänd') {
                            if (!counts[key]) counts[key] = { goals: 0, team: m.away };
                            counts[key].goals += 1;
                        }
                    }
                });
            }
        });

        const grouped = {};
        Object.entries(counts).forEach(([player, data]) => {
            if (!grouped[data.goals]) grouped[data.goals] = [];
            grouped[data.goals].push({ player, team: data.team });
        });

        return Object.entries(grouped)
            .map(([goals, players]) => ({
                goals: parseInt(goals),
                players: players.sort((a, b) => {
                    const getLastName = (name) => {
                        const parts = name.trim().split(/\s+/);
                        return parts[parts.length - 1];
                    };
                    const cmp = getLastName(a.player).localeCompare(getLastName(b.player), 'sv');
                    return cmp !== 0 ? cmp : a.player.localeCompare(b.player, 'sv');
                })
            }))
            .sort((a, b) => b.goals - a.goals);
    }, [matchesData]);

    const renderInlineMatchTable = (homeTeam, awayTeam) => {
        if (!computedTableData || computedTableData.length === 0) return null;
        
        const cleanName = (n) => {
            if (!n) return '';
            return n.replace(' IF', '').replace(' FF', '').replace(' BK', '').trim();
        };
        const homeClean = cleanName(homeTeam);
        const awayClean = cleanName(awayTeam);
        
        const teamsToShow = computedTableData.filter(t => 
            cleanName(t.team).includes(homeClean) || homeClean.includes(cleanName(t.team)) ||
            cleanName(t.team).includes(awayClean) || awayClean.includes(cleanName(t.team))
        );
        
        if (teamsToShow.length === 0) return null;

        const mappedTeams = teamsToShow.map(team => {
            const isHighlighted = cleanName(team.team) === homeClean || cleanName(team.team) === awayClean;
            return {
                rank: team.rank,
                teamName: team.team,
                logoUrl: getTeamLogo(team.team),
                played: team.played,
                won: team.won,
                drawn: team.drawn,
                lost: team.lost,
                gd: team.gd,
                points: team.points,
                rowBgColor: 'rgba(0, 0, 0, 0.05)',
                isHighlighted,
                displayName: cleanTeamNameForDisplay(team.team)
            };
        });

        return (
            <SharedMatchTable 
                teams={mappedTeams} 
                isInline={true} 
            />
        );
    };


    useEffect(() => {
        // Delay to allow for tab switching and DOM rendering
        const timer = setTimeout(() => {
            if (activeTab === 'matcher') {
                if (nextMatchRef.current) {
                    nextMatchRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        }, 150);

        return () => clearTimeout(timer);
    }, [activeTab, loading, nextMatchDateString, filterTeam]);

    useSwipeNavigation(activeTab, setActiveTab, SUBTABS);

    return (
        <div 
            className="page-transition"
            style={{ paddingBottom: '24px' }}
        >
            <button
                className={`scroll-to-top-btn ${showScrollTop ? 'visible' : ''}`}
                onClick={scrollToTop}
                aria-label="Scrolla till toppen"
            >
                <ArrowUp size={28} />
            </button>

            <div className={`nav-container ${isScrolled ? 'scrolled' : ''}`} style={{ 
                backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.95)' : '#ffffff',
                color: 'var(--color-text)',
                '--active-color': 'var(--color-text)',
                '--inactive-color': 'var(--color-text-muted)',
                transition: 'background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease',
                boxShadow: 'none',
                borderBottom: 'none',
                backdropFilter: isScrolled ? 'blur(20px)' : 'none',
                WebkitBackdropFilter: isScrolled ? 'blur(20px)' : 'none'
            }}>
                <div style={{ justifySelf: 'start', display: 'flex', alignItems: 'center' }}>
                    <button
                        onClick={() => navigate('/vm')}
                        aria-label="Växla till VM 2026"
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
                        <img src={logosData['ALLSVENSKAN_LOGO'] || "https://upload.wikimedia.org/wikipedia/en/thumb/e/ef/Allsvenskan_logo.svg/800px-Allsvenskan_logo.svg.png"} alt="Allsvenskan" style={{ height: '34px', objectFit: 'contain' }} />
                    </button>
                </div>
                
                <nav className="web-nav-links" aria-label="Huvudmeny">
                    {SUBTABS.map(tab => (
                        <button 
                            key={tab.id}
                            className={`web-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                            aria-current={activeTab === tab.id ? 'page' : undefined}
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
                            }}
                        >
                            <tab.icon size={20} className="tab-icon" />
                            <span className="tab-label">{tab.label}</span>
                        </button>
                    ))}
                </nav>

                <div style={{ justifySelf: 'end', display: 'flex', alignItems: 'center' }}>
                    <button
                        onClick={(e) => {
                            e.currentTarget.blur();
                            if (filterTeam) {
                                setFilterTeam(null);
                            } else {
                                handleMenuClick(e);
                            }
                        }}
                        className={`sverige-toggle ${filterTeam ? 'active' : ''}`}
                        aria-label={filterTeam ? 'Rensa filter' : 'Välj lag att filtrera'}
                        style={{ 
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        {filterTeam && getTeamLogo(filterTeam) ? (
                            <div style={{ position: 'relative' }}>
                                <img src={getTeamLogo(filterTeam)} alt="" style={{ height: '34px', width: '34px', objectFit: 'contain' }} />
                            </div>
                        ) : (
                            <Filter size={24} color="var(--color-text-muted)" strokeWidth={1.5} style={{ transition: 'color 0.3s ease' }} aria-hidden="true" />
                        )}
                    </button>
                </div>
            </div>
            
            {/* Global Error Message */}
            {error && (
                <div style={{
                    padding: '16px',
                    margin: '16px',
                    backgroundColor: 'var(--color-danger)',
                    color: 'white',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    Error: {error}
                </div>
            )}
            
            {/* Live Data Error Message */}
            {liveError && (
                <div style={{
                    padding: '16px',
                    margin: '16px',
                    backgroundColor: '#ff9800',
                    color: 'white',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    Kunde inte hämta live-data (CORS eller nätverksfel). Fel: {liveError}. Testa att starta om servern med (Ctrl+C sedan npm run dev) och uppdatera sidan!
                </div>
            )}


            <FilterDrawer 
                isOpen={Boolean(anchorEl)}
                onClose={handleMenuClose}
                items={teams.map(team => ({
                    id: team,
                    label: cleanTeamNameForDisplay(team),
                    icon: <TeamLogo logoUrl={getTeamLogo(team)} teamName={team} size={28} />
                }))}
                selectedItem={filterTeam ? {
                    id: filterTeam,
                    label: cleanTeamNameForDisplay(filterTeam),
                    icon: <TeamLogo logoUrl={getTeamLogo(filterTeam)} teamName={filterTeam} size={28} />
                } : null}
                onSelect={handleTeamClick}
                onClear={() => {
                    setFilterTeam(null);
                    handleMenuClose();
                }}
            />



            <div style={{ maxWidth: '600px', margin: '32px auto 0 auto', padding: '0 10px' }}>
                <div key={activeTab} className="tab-content-enter" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {/* Season Selector */}
                    {/* Season Selector */}
                    {/* Season Selector with Inline Slider */}

                    
                    {activeTab === 'matcher' && (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: '4px', paddingRight: '8px', marginBottom: '16px' }}>
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
                                            fontWeight: '400',
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
                                            <option key={yr} value={yr} style={{ color: '#000', }}>{yr}</option>
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

                                <button 
                                    className={`segmented-button ${matchStatusFilter === 'played' ? 'active' : ''}`}
                                    onClick={() => setMatchStatusFilter(prev => prev === 'upcoming' ? 'played' : 'upcoming')}
                                    title={matchStatusFilter === 'played' ? "Visa kommande matcher" : "Visa spelade matcher"}
                                    style={{
                                        backgroundColor: matchStatusFilter === 'played' ? 'var(--color-primary)' : 'rgba(118, 118, 128, 0.12)',
                                        borderRadius: '50%',
                                        padding: '0',
                                        width: '36px',
                                        height: '36px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s ease',
                                        color: matchStatusFilter === 'played' ? 'white' : 'var(--color-text)',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <HistoryIcon fontSize="small" style={{ transform: 'translateX(-1px)' }} />
                                </button>
                            </div>
                            {loading ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <MatchCardSkeleton />
                                    <MatchCardSkeleton />
                                    <MatchCardSkeleton />
                                </div>
                            ) : (
                                <>
                                    {Object.keys(groupedMatches).length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted)' }}>
                                            <div style={{ fontSize: '3rem', opacity: 0.2, marginBottom: '16px' }}>⚽</div>
                                            <h3 style={{ fontSize: '1.2rem', margin: '0 0 8px 0', color: 'var(--color-text)' }}>Inga matcher hittades</h3>
                                            <p style={{ margin: 0, fontSize: '0.9rem' }}>
                                                {filterTeam ? `Kunde inte hitta några ${matchStatusFilter === 'played' ? 'spelade' : 'kommande'} matcher för ${filterTeam}.` : `Inga ${matchStatusFilter === 'played' ? 'spelade' : 'kommande'} matcher för denna säsong.`}
                                            </p>
                                            {filterTeam && (
                                                <button 
                                                    onClick={() => setFilterTeam(null)}
                                                    style={{ marginTop: '24px', padding: '10px 20px', borderRadius: '20px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                                                >
                                                    Rensa filter
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <MatchGroupList 
                                            groupedMatches={groupedMatches}
                                            renderMatch={(match, j) => {
                                                const isNext = nextMatchDateString && match.date === nextMatchDateString;
                                                return (
                                                    <div key={j} ref={isNext && heroMatches[0] === match ? nextMatchRef : null}>
                                                        <MatchCard 
                                                            match={match} 
                                                            idx={j} 
                                                            variant={isNext && match.status !== 'finished' ? 'hero' : undefined}
                                                            isAllsvenskan={true}
                                                            homeLogo={getTeamLogo(match.home)}
                                                            awayLogo={getTeamLogo(match.away)}
                                                            filterTeam={filterTeam}
                                                            allMatches={matchesData?.matches}
                                                            onTeamClick={setFilterTeam}
                                                            hideBroadcast={true}
                                                            hideEventsForPlayed={true}
                                                        />
                                                        {(isNext && match.status !== 'finished') && renderInlineMatchTable(match.home, match.away)}
                                                    </div>
                                                );
                                            }}
                                        />
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
                                            fontWeight: '400',
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
                                            <option key={yr} value={yr} style={{ color: '#000', }}>{yr}</option>
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
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <MatchCardSkeleton />
                                    <MatchCardSkeleton />
                                    <MatchCardSkeleton />
                                </div>
                            ) : error ? (
                                <div style={{ padding: '20px', textAlign: 'center' }}>{error}</div>
                            ) : (
                                <Card style={{ marginBottom: '0' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                        <thead>
                                            <tr style={{ borderBottom: 'var(--border)' }}>
                                                <th scope="col" style={{ textAlign: 'left', padding: '8px 4px', color: 'var(--color-text-muted)', width: '18px' }}></th>
                                                <th scope="col" style={{ textAlign: 'left', padding: '8px 4px', color: 'var(--color-text-muted)', }}>LAG</th>
                                                <th scope="col" style={{ textAlign: 'center', padding: '8px 4px', color: 'var(--color-text-muted)', width: '30px' }}>M</th>
                                                <th scope="col" style={{ textAlign: 'center', padding: '8px 4px', color: 'var(--color-text-muted)', width: '40px' }}>+/-</th>
                                                <th scope="col" style={{ textAlign: 'right', padding: '8px 4px', color: 'var(--color-text-muted)', width: '40px' }}>P</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {computedTableData.map((team, idx) => {
                                                const rank = parseInt(team.rank);
                                                const isFiltered = filterTeam === team.team;
                                                const isSeparator = [2, 4, 14, 15].includes(rank);

                                                return (
                                                    <React.Fragment key={idx}>
                                                        <tr 
                                                            ref={el => tableRefs.current[team.team] = el}
                                                            style={{ 
                                                                backgroundColor: isFiltered ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
                                                                transition: 'background-color 0.2s ease'
                                                            }}
                                                        >
                                                            <td style={{ 
                                                                padding: '8px 4px',
                                                                borderTopLeftRadius: isFiltered ? '10px' : '0',
                                                                borderBottomLeftRadius: (isFiltered && (!team.form || team.form.length === 0)) ? '10px' : '0',
                                                                borderTop: isSeparator ? '1px dashed rgba(0,0,0,0.15)' : 'none'
                                                            }}>
                                                                <div style={{ 
                                                                    display: 'flex', 
                                                                    alignItems: 'center', 
                                                                    gap: '0',
                                                                    paddingLeft: '0'
                                                                }}>
                                                                    <div style={{ 
                                                                        width: '18px', 
                                                                        height: '28px', 
                                                                        display: 'flex', 
                                                                        alignItems: 'center', 
                                                                        justifyContent: 'center', 
                                                                        fontSize: '0.85rem', 
                                                                        backgroundColor: 'transparent', 
                                                                        color: 'inherit' 
                                                                    }}>
                                                                        {team.rank}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td style={{ 
                                                                padding: '11px 4px',
                                                                borderTop: isSeparator ? '1px dashed rgba(0,0,0,0.15)' : 'none'
                                                            }}>
                                                                <span style={{ whiteSpace: 'normal', lineHeight: '1.2', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                                                                borderTopRightRadius: isFiltered ? '10px' : '0',
                                                                borderBottomRightRadius: (isFiltered && (!team.form || team.form.length === 0)) ? '10px' : '0',
                                                                borderTop: isSeparator ? '1px dashed rgba(0,0,0,0.15)' : 'none'
                                                            }}>{team.points}</td>
                                                        </tr>
                                                        {team.form && team.form.length > 0 && (
                                                            <tr style={{ backgroundColor: isFiltered ? 'rgba(0, 0, 0, 0.05)' : 'transparent' }}>
                                                                <td colSpan="5" style={{ 
                                                                    padding: '0 12px 10px 12px', 
                                                                    borderTop: 'none',
                                                                    borderBottomLeftRadius: isFiltered ? '10px' : '0',
                                                                    borderBottomRightRadius: isFiltered ? '10px' : '0'
                                                                }}>
                                                                    <div style={{ 
                                                                        display: 'flex', 
                                                                        borderRadius: '3px', 
                                                                        overflow: 'hidden', 
                                                                        width: `${(team.form.length / 30) * 100}%`,
                                                                        height: '5px'
                                                                    }}>
                                                                        {team.form.map((f, i) => (
                                                                            <div key={i} style={{
                                                                                flex: 1,
                                                                                height: '100%',
                                                                                backgroundColor: f === 'W' ? '#34c759' : f === 'L' ? '#ff3b30' : '#ffcc00'
                                                                            }} title={f === 'W' ? 'Vinst' : f === 'L' ? 'Förlust' : 'Oavgjort'} />
                                                                        ))}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </Card>
                            )}
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
                                        fontWeight: '400',
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
                                        fontWeight: '400',
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
                                                cursor: 'pointer',
                                                fontWeight: '400',
                                                transition: 'all 0.2s ease',
                                                backgroundColor: playerFilter === 'maraton' ? (filterTeam ? headerStyle.bg : 'var(--color-text)') : 'transparent',
                                                color: playerFilter === 'maraton' ? (filterTeam ? headerStyle.text : 'var(--color-bg)') : 'var(--color-text-muted)',
                                                border: playerFilter === 'maraton' ? `1px solid ${filterTeam ? headerStyle.bg : 'var(--color-text)'}` : '1px solid rgba(0,0,0,0.08)',
                                                boxShadow: playerFilter === 'maraton' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
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
                                                cursor: 'pointer',
                                                fontWeight: '400',
                                                transition: 'all 0.2s ease',
                                                backgroundColor: playerFilter === 'mål' ? (filterTeam ? headerStyle.bg : 'var(--color-text)') : 'transparent',
                                                color: playerFilter === 'mål' ? (filterTeam ? headerStyle.text : 'var(--color-bg)') : 'var(--color-text-muted)',
                                                border: playerFilter === 'mål' ? `1px solid ${filterTeam ? headerStyle.bg : 'var(--color-text)'}` : '1px solid rgba(0,0,0,0.08)',
                                                boxShadow: playerFilter === 'mål' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                                            }}
                                        >
                                            Mål
                                        </button>

                                    </>
                                )}
                            </div>

                            {/* Tables rendering */}
                            {statFilter === 'lag' && playerFilter === 'maraton' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
                                    <Card style={{ marginBottom: '0' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                            <thead>
                                                <tr style={{ borderBottom: 'var(--border)' }}>
                                                    <th scope="col" style={{ textAlign: 'left', padding: '8px 4px', color: 'var(--color-text-muted)', width: '36px' }}>#</th>
                                                    <th scope="col" style={{ textAlign: 'left', padding: '8px 4px', color: 'var(--color-text-muted)', }}>LAG</th>
                                                    <th scope="col" style={{ textAlign: 'center', padding: '8px 4px', color: 'var(--color-text-muted)', width: '35px' }}>SÄS</th>
                                                    <th scope="col" style={{ textAlign: 'center', padding: '8px 4px', color: 'var(--color-text-muted)', width: '45px' }}>M</th>
                                                    <th scope="col" style={{ textAlign: 'right', padding: '8px 4px', color: 'var(--color-text-muted)', width: '45px' }}>P</th>
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
                                                                <div style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', fontSize: '0.85rem' }}>
                                                                    {row.rank}
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: '11px 4px' }}>
                                                                <span style={{ whiteSpace: 'normal', lineHeight: '1.2', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    {getTeamLogo(row.team) && <img src={getTeamLogo(row.team)} alt="" style={{ height: '26px', width: '26px', objectFit: 'contain' }} />}
                                                                    <span>{cleanTeamNameForDisplay(row.team)}</span>
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: '11px 4px', textAlign: 'center' }}>{row.seasons}</td>
                                                            <td style={{ padding: '11px 4px', textAlign: 'center' }}>{row.played}</td>
                                                            <td style={{ 
                                                                padding: '11px 4px', 
                                                                textAlign: 'right', 
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
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>

                                                <tbody>
                                                    {topScorers.map((group, groupIdx) => {

                                                        return (
                                                            <React.Fragment key={groupIdx}>
                                                                <tr>
                                                                    <td style={{ 
                                                                        padding: '16px 4px 6px 4px', 
                                                                        fontWeight: '400', 
                                                                        fontSize: '0.85rem', 
                                                                        color: 'var(--color-text-muted)'
                                                                    }}>
                                                                        <span style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--color-text)' }}>{group.goals}</span> Mål
                                                                    </td>
                                                                </tr>
                                                                {group.players.map((scorer, idx) => {
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
                                                                                padding: '11px 8px',
                                                                                borderRadius: isFiltered ? '8px' : '0'
                                                                            }}>
                                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                                                    <span style={{ fontWeight: '400'}}>{scorer.player}</span>
                                                                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                                        {getTeamLogo(scorer.team) && <img src={getTeamLogo(scorer.team)} alt="" style={{ height: '14px', width: '14px', objectFit: 'contain' }} />}
                                                                                        {cleanTeamNameForDisplay(scorer.team)}
                                                                                    </span>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </React.Fragment>
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


                        </div>
                    )}

                    {activeTab === 'cup' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
                            <Trophy size={48} color="var(--color-text-muted)" style={{ opacity: 0.5, marginBottom: '16px' }} />
                            <h3 style={{ margin: 0, color: 'var(--color-text)', fontSize: '1.2rem', fontWeight: '600' }}>Svenska Cupen</h3>
                            <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>Information och spelschema för cupen kommer snart...</p>
                        </div>
                    )}

                    {activeTab === 'squads' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {loading ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <MatchCardSkeleton />
                                    <MatchCardSkeleton />
                                </div>
                            ) : !squadsData?.teams ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                                    Inga trupper tillgängliga.
                                </div>
                            ) : (
                                <>

                                    {Object.entries(squadsData.teams)
                                        .filter(([teamName]) => {
                                            if (!filterTeam) return true;
                                            const cleanFilter = filterTeam.replace(' IF', '').replace(' FF', '').replace(' BK', '').trim();
                                            return teamName.includes(cleanFilter) || teamName.includes(filterTeam) || teamName === filterTeam;
                                        })
                                        .sort(([a], [b]) => cleanTeamNameForDisplay(a).localeCompare(cleanTeamNameForDisplay(b), 'sv'))
                                        .map(([teamName, players]) => {
                                            if (!players || players.length === 0) return null;
                                            const teamColor = TEAM_COLORS[teamName] || '#999';
                                            const positionGroups = {
                                                'Målvakter': players.filter(p => p.position.includes('Goalkeeper')),
                                                'Försvarare': players.filter(p => p.position.includes('Back') || p.position === 'Defender'),
                                                'Mittfältare': players.filter(p => p.position.includes('Midfield')),
                                                'Anfallare': players.filter(p => p.position.includes('Forward') || p.position.includes('Winger') || p.position.includes('Striker') || p.position === 'Attack')
                                            };
                                            
                                            let totalAge = 0;
                                            let ageCount = 0;
                                            let totalSek = 0;
                                            players.forEach(p => {
                                                totalSek += getRawSekValue(p.value);
                                                if (p.age) {
                                                    const match = p.age.match(/\((\d+)\)/);
                                                    let ageNum = match ? parseInt(match[1]) : parseInt(p.age);
                                                    if (!isNaN(ageNum)) {
                                                        totalAge += ageNum;
                                                        ageCount++;
                                                    }
                                                }
                                            });
                                            const avgAge = ageCount > 0 ? (totalAge / ageCount).toFixed(1).replace('.', ',') : '-';
                                            const totalValueFormatted = totalSek > 0 ? (totalSek / 1000000).toFixed(1).replace('.', ',') + ' mnkr' : '-';

                                            return (
                                                <Card key={teamName} padding="0" style={{ overflow: 'hidden', border: 'var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                                                    <div style={{ padding: '16px', background: 'var(--color-card-bg)', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,0,0,0.05)', flexShrink: 0 }}>
                                                            {logosData && logosData[teamName] ? (
                                                                <img src={logosData[teamName]} alt="" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                                                            ) : (
                                                                <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: teamColor }} />
                                                            )}
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontSize: '1.05rem', }}>
                                                                <BoldSverige text={cleanTeamNameForDisplay(teamName)} />
                                                            </div>
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', backgroundColor: 'rgba(0,0,0,0.04)', padding: '4px 10px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <span>{players.length} spelare</span>
                                                            <span style={{ opacity: 0.5 }}>•</span>
                                                            <span>{avgAge} år</span>
                                                            <span style={{ opacity: 0.5 }}>•</span>
                                                            <span>{totalValueFormatted}</span>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        {Object.entries(positionGroups).map(([groupName, groupPlayers]) => {
                                                            if (groupPlayers.length === 0) return null;
                                                            
                                                            const sortedPlayers = [...groupPlayers].sort((a, b) => {
                                                                const getNumber = (numStr) => {
                                                                    if (!numStr || numStr === '-') return Number.MAX_SAFE_INTEGER;
                                                                    const num = parseInt(numStr, 10);
                                                                    return isNaN(num) ? Number.MAX_SAFE_INTEGER : num;
                                                                };
                                                                return getNumber(a.number) - getNumber(b.number);
                                                            });

                                                            return (
                                                                <div key={groupName} style={{ padding: '12px 16px', borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                                                                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.05em', marginBottom: '10px' }}>
                                                                        {groupName} ({sortedPlayers.length})
                                                                    </div>
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                                        {sortedPlayers.map((p, idx) => (
                                                                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 10px', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                                                                                <div style={{ width: '24px', fontSize: '0.8rem', color: p.number ? 'var(--color-text)' : 'var(--color-text-muted)', textAlign: 'center' }}>
                                                                                    {p.number || '-'}
                                                                                </div>
                                                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                                                    <div style={{ fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                                        <span>{p.name}</span>
                                                                                        {p.age && <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{p.age.match(/\((\d+)\)/) ? p.age.match(/\((\d+)\)/)[1] + ' år' : p.age}</span>}
                                                                                        {p.nationalities && p.nationalities.length > 0 && (
                                                                                            <span style={{ display: 'inline-flex', gap: '4px', flexShrink: 0 }}>
                                                                                                {p.nationalities.map(nat => getFlagCode(nat.country)).filter(Boolean).map((code, idx) => (
                                                                                                    <FlagBadge 
                                                                                                        key={idx}
                                                                                                        codes={[code]} 
                                                                                                        size={16} 
                                                                                                        shadow={true} 
                                                                                                    />
                                                                                                ))}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                                                        {[
                                                                                            p.joined && p.joined !== '-' ? formatTmDate(p.joined) : null,
                                                                                            p.contract && p.contract !== '-' ? formatTmDate(p.contract) : null
                                                                                        ]
                                                                                            .filter(Boolean)
                                                                                            .map(s => s.charAt(0).toUpperCase() + s.slice(1))
                                                                                            .join(' - ')}
                                                                                    </div>
                                                                                </div>
                                                                                <div style={{ fontSize: '0.75rem', color: p.value && p.value !== '-' ? 'var(--color-text)' : 'var(--color-text-muted)', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                                                                    {convertValueToSek(p.value)}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
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
