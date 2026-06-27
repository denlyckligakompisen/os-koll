import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import Card from './common/Card';
import BoldSverige from './BoldSverige';
import MatchCard from './MatchCard';
import MatchDetailView from './MatchDetailView';
import DateHeader from './common/DateHeader';
import EmptyState from './common/EmptyState';
import SharedMatchTable from './common/SharedMatchTable';
import { getFlagCodes, getFlagCode } from '../utils/flags';
import FlagBadge from './common/FlagBadge';
import MatchCardSkeleton from './common/MatchCardSkeleton';
import { ChevronUp, ChevronDown, ArrowUp, Filter, X, Play, History, ListOrdered, Menu, List, Trophy } from 'lucide-react';
import { getRelativeDateLabel, parseTournamentDate } from '../utils/dateUtils';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import EventIcon from '@mui/icons-material/Event';
import PublicIcon from '@mui/icons-material/Public';


import { getVMHeaderStyle, getAbbr, sortTeamsSimple, sortGroupTeams } from '../utils/vmUtils';
import { useVMData } from '../hooks/useVMData';
import VMBracket from './VMBracket';

const CURRENT_YEAR = 2026;
const GROUP_MONTH_MAP = { 'juni': 5, 'juli': 6 };
const DATA_BASE_URL = 'https://raw.githubusercontent.com/denlyckligakompisen/os-koll/main/public/data';

const VMKollen = () => {
    const navigate = useNavigate();
    const { groupsData, matchesData, knockoutData, rankingData, loading, fetchAllData } = useVMData();
    const [matchStatusFilter, setMatchStatusFilter] = useState('upcoming');
    const [filterCountries, setFilterCountries] = useState([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setIsFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const [showScrollTop, setShowScrollTop] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [showAllTeamsModal, setShowAllTeamsModal] = useState(false);
    const [showBracketModal, setShowBracketModal] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState(null);

    const [expandedMatchId, setExpandedMatchId] = useState(null);
    const rankingRefs = React.useRef({});
    const tableRefs = React.useRef({});
    const headerStyle = useMemo(() => getVMHeaderStyle(filterCountries.length === 1 ? filterCountries[0] : null), [filterCountries]);

    // Auto-scroll in stats sub-tabs
    useEffect(() => {
        if (filterCountries.length === 0) return;

        setTimeout(() => {
            if (rankingData?.rankings) {
                const target = rankingData.rankings.find(r => filterCountries.some(fc => r.team.includes(fc)));
                if (target && rankingRefs.current[target.team]) {
                    rankingRefs.current[target.team].scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }, 100);
    }, [filterCountries, rankingData]);

    const allCountries = useMemo(() => {
        if (!groupsData?.groups) return [];
        const teamsSet = new Set();
        groupsData.groups.forEach(group => {
            group.teams.forEach(t => teamsSet.add(typeof t === 'string' ? t : t.name));
        });
        const sorted = [...teamsSet].sort((a, b) => a.localeCompare(b, 'sv'));
        const swedeIdx = sorted.indexOf('Sverige');
        if (swedeIdx > -1) {
            sorted.splice(swedeIdx, 1);
            sorted.unshift('Sverige');
        }
        return sorted;
    }, [groupsData]);

    const tournamentTeams = React.useMemo(() => {
        if (!groupsData?.groups) return new Set();
        const teams = new Set();
        groupsData.groups.forEach(group => {
            group.teams.forEach(t => teams.add(typeof t === 'string' ? t : t.name));
        });
        return teams;
    }, [groupsData]);







    // handleCountryClick removed as filtering should only be done via the dropdown

    useEffect(() => {
        const saved = localStorage.getItem('os-koll-filter');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) setFilterCountries(parsed);
                else setFilterCountries([saved]);
            } catch {
                setFilterCountries([saved]);
            }
        }
    }, []);

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

    const scrollToPlayoff = () => {
        const el = document.getElementById('playoff-start');
        if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        if (filterCountries.length > 0) localStorage.setItem('os-koll-filter', JSON.stringify(filterCountries));
        else localStorage.removeItem('os-koll-filter');
    }, [filterCountries]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [filterCountries, matchStatusFilter, showBracketModal]);

    const getSortedGroupTeams = React.useCallback((group) => {
        if (!group || !matchesData?.matches) return group?.teams || [];
        const groupMatches = matchesData.matches.filter(m => m.group === group.name);
        return sortGroupTeams(group.teams, groupMatches, rankingData);
    }, [matchesData, rankingData]);

    const filteredCountryStatusList = React.useMemo(() => {
        if (!groupsData?.groups || filterCountries.length === 0) return [];
        return filterCountries.map(fc => {
            const group = groupsData.groups.find(g =>
                g.teams.some(t => (typeof t === 'string' ? t : t.name).includes(fc))
            );
            if (!group) return null;

            const groupChar = group.name.split(' ')[1];
            const sorted = getSortedGroupTeams(group);
            const rank = sorted.findIndex(t => (typeof t === 'string' ? t : t.name).includes(fc)) + 1;

            return { groupChar, rank, country: fc };
        }).filter(Boolean);
    }, [groupsData, filterCountries, getSortedGroupTeams]);

    const top8ThirdsNames = React.useMemo(() => {
        const top8 = new Set();
        if (groupsData?.groups) {
            const getRank = (teamName) => {
                if (!rankingData?.rankings) return 999;
                const index = rankingData.rankings.findIndex(r => r.team === teamName || r.team.includes(teamName) || teamName.includes(r.team));
                return index !== -1 ? index : 999;
            };
            const thirds = groupsData.groups.map(g => {
                const sorted = getSortedGroupTeams(g);
                return sorted[2];
            }).filter(Boolean);
            thirds.sort((a, b) => {
                return (b.pts - a.pts) || (b.gd - a.gd) || (b.gf - a.gf) || (b.fairPlay - a.fairPlay) || (getRank(a.name) - getRank(b.name));
            });
            thirds.slice(0, 8).forEach(t => top8.add(t.name));
        }
        return top8;
    }, [groupsData, rankingData, getSortedGroupTeams]);

    const isTeamSecuredAtRank = (group, rank, team) => {
        // If all matches played, everyone is secured
        if (group.teams.every(t => t.played === 3)) return true;

        // Calculate max possible points for all teams
        const teamsWithMax = group.teams.map(t => ({
            ...t,
            maxPts: t.pts + ((3 - t.played) * 3),
            minPts: t.pts
        }));

        // Sort teams by max possible points (optimistic for others, pessimistic for this team)
        const teamMinPts = team.pts; // The worst they can do is their current points
        const teamMaxPts = team.pts + ((3 - team.played) * 3);

        if (rank === 1) {
            // To be secured as 1st, their current points must be strictly greater than max points of all others
            const othersMax = Math.max(...teamsWithMax.filter(t => t.name !== team.name).map(t => t.maxPts));
            return teamMinPts > othersMax;
        } else if (rank === 2) {
            // To be secured as 2nd, they must not be able to reach 1st, AND no one else can reach them
            const currentFirst = getSortedGroupTeams(group)[0];
            if (!currentFirst) return false;
            // Can they catch 1st?
            if (teamMaxPts >= currentFirst.pts) return false; // They might still become 1st, so not secured at 2nd!
            
            // Can anyone catch them from below?
            const othersBelow = teamsWithMax.filter(t => t.name !== team.name && t.name !== currentFirst.name);
            const othersBelowMax = Math.max(0, ...othersBelow.map(t => t.maxPts));
            return teamMinPts > othersBelowMax;
        }
        
        return false;
    };

    const resolveTeamInfo = (label) => {
        if (!label || !groupsData?.groups) return { name: label || 'TBA', isPlaceholder: true };

        // Handle 1A, 2B, etc.
        const rankMatch = label.match(/^([12])([A-L])$/i);
        if (rankMatch) {
            const rank = parseInt(rankMatch[1]);
            const groupChar = rankMatch[2].toUpperCase();
            const groupIdx = groupChar.charCodeAt(0) - 65;

            const group = groupsData.groups[groupIdx];
            if (group) {
                const sorted = getSortedGroupTeams(group);
                const team = sorted[rank - 1];
                if (team) {
                    const isSecured = isTeamSecuredAtRank(group, rank, team);
                    return {
                        name: isSecured ? team.name : label,
                        realName: team.name,
                        isPlaceholder: !isSecured,
                        originalLabel: label,
                        isSecured: isSecured
                    };
                }
            }
        }

        // Handle 3rd place complex labels
        if (label.includes('/')) {
            const parts = label.split('/');
            const groupChars = [];
            const rank = parseInt(parts[0][0]);
            groupChars.push(parts[0][1]);
            for (let i = 1; i < parts.length; i++) groupChars.push(parts[i]);

            const validIndices = [];
            groupChars.forEach((char, i) => {
                const idx = char.toUpperCase().charCodeAt(0) - 65;
                const group = groupsData.groups[idx];
                if (group) {
                    const team = group.teams[rank - 1];
                    if (team && top8ThirdsNames.has(team.name)) {
                        validIndices.push(i);
                    }
                }
            });

            // If none are in top 8 (fallback) or if rank is not 3, just use all
            const indicesToUse = (rank === 3 && validIndices.length > 0) ? validIndices : groupChars.map((_, i) => i);

            const abbrs = indicesToUse.map(i => {
                const char = groupChars[i];
                const idx = char.toUpperCase().charCodeAt(0) - 65;
                const group = groupsData.groups[idx];
                if (group) {
                    const sorted = getSortedGroupTeams(group);
                    const team = sorted[rank - 1];
                    return team ? getAbbr(team.name) : char;
                }
                return char;
            });

            const flagCodes = indicesToUse.map(i => {
                const char = groupChars[i];
                const idx = char.toUpperCase().charCodeAt(0) - 65;
                const group = groupsData.groups[idx];
                if (group) {
                    const sorted = getSortedGroupTeams(group);
                    const team = sorted[rank - 1];
                    if (team && team.name) {
                        return getFlagCode(team.name);
                    }
                }
                return null;
            }).filter(Boolean);

            return {
                name: label,
                isPlaceholder: true
            };
        }

        return { name: label, isPlaceholder: true };
    };

    const combinedMatches = React.useMemo(() => {
        const groupMatches = matchesData?.matches || [];
        const knockoutMatches = [];
        const bracketProgression = {
            74: 77, 77: 74,
            73: 75, 75: 73,
            76: 78, 78: 76,
            79: 80, 80: 79,
            81: 82, 82: 81,
            83: 84, 84: 83,
            85: 86, 86: 85,
            87: 88, 88: 87,
            89: 90, 90: 89,
            91: 92, 92: 91,
            93: 94, 94: 93,
            95: 96, 96: 95,
            97: 98, 98: 97,
            99: 100, 100: 99,
            101: 102, 102: 101, // final
        };

        if (knockoutData?.rounds && groupsData) {
            knockoutData.rounds.forEach(round => {
                round.matches.forEach(m => {
                    const homeInfo = resolveTeamInfo(m.home);
                    const awayInfo = resolveTeamInfo(m.away);
                    knockoutMatches.push({
                        ...m,
                        home: homeInfo.name,
                        away: awayInfo.name,
                        homeFlags: homeInfo.flagCodes,
                        awayFlags: awayInfo.flagCodes,
                        realHome: homeInfo.realName || m.home,
                        realAway: awayInfo.realName || m.away,
                        homeOriginal: homeInfo.originalLabel,
                        awayOriginal: awayInfo.originalLabel,
                        homeSecured: homeInfo.isSecured,
                        awaySecured: awayInfo.isSecured,
                        isKnockout: true,
                        isPreliminary: true, // Always preliminary for knockout matches for now
                        roundName: round.name,
                        group: round.name
                    });
                });
            });

            // Second pass for next opponents
            knockoutMatches.forEach(m => {
                const otherId = bracketProgression[m.id];
                if (otherId) {
                    const otherMatch = knockoutMatches.find(x => x.id === otherId);
                    if (otherMatch) {
                        const h = otherMatch.realHome || otherMatch.home;
                        const a = otherMatch.realAway || otherMatch.away;
                        m.nextOpponentInfo = `${h} / ${a}`;
                    }
                }
            });
        }
        return [...groupMatches, ...knockoutMatches];
    }, [matchesData, knockoutData, groupsData]);

    const nextMatches = React.useMemo(() => {
        if (combinedMatches.length === 0) return [];

        let pool = combinedMatches.filter(m => {
            if (m.status !== 'finished') return true;
            const startMs = m.startTimestamp ? m.startTimestamp * 1000 : parseTournamentDate(m.date, m.time, GROUP_MONTH_MAP).getTime();
            const hideAfterMs = startMs + (140 * 60 * 1000); // 125 min match + 15 min delay
            return Date.now() <= hideAfterMs;
        });
        if (filterCountries.length > 0) {
            pool = pool.filter(m => filterCountries.some(fc => m.home.includes(fc) || m.away.includes(fc)));
        }

        if (pool.length === 0) return [];

        const withDates = pool.map(m => ({
            ...m,
            fullDate: parseTournamentDate(m.date, m.time, GROUP_MONTH_MAP).getTime()
        }));

        const sorted = [...withDates].sort((a, b) => a.fullDate - b.fullDate);
        const earliestTime = sorted[0].fullDate;

        return withDates.filter(m => m.fullDate === earliestTime);
    }, [matchesData, filterCountries]);

    const groupedMatches = React.useMemo(() => {
        if (combinedMatches.length === 0) return {};
        return combinedMatches.reduce((acc, m) => {
            const isMatchLiveOrRecentlyFinishedOrSoon = (m, isHeroMatch = false) => {
                if (isHeroMatch) return true;
                if (m.status === 'live') return true;
                if (m.status === 'finished') return true;
                const startMs = m.startTimestamp ? m.startTimestamp * 1000 : parseTournamentDate(m.date, m.time, GROUP_MONTH_MAP).getTime();
                if (m.status === 'upcoming') {
                    const timeUntilStart = startMs - Date.now();
                    if (timeUntilStart > 0) {
                        if (isHeroMatch && timeUntilStart <= 60 * 60 * 1000) return true;
                        if (!isHeroMatch && timeUntilStart <= 30 * 60 * 1000) return true;
                    }
                }
                return false;
            };

            const isCountryPlaceholder = (label, status) => {
                if (!label || !status.groupChar || !status.rank) return false;
                
                if (status.rank === 3 && !top8ThirdsNames.has(status.country)) {
                    return false;
                }

                const placeholderPart = label.split('\n')[0];
                const target = `${status.rank}${status.groupChar}`;
                if (placeholderPart.includes(target)) return true;
                if (status.rank === 3 && placeholderPart.startsWith('3') && placeholderPart.includes(status.groupChar)) {
                    return true;
                }
                return false;
            };

            const isFilterCountryMatch = filterCountries.length > 0 ? filterCountries.some(fc => {
                const status = filteredCountryStatusList.find(s => s.country === fc);
                return (m.home?.includes(fc)) ||
                    (m.away?.includes(fc)) ||
                    (m.realHome?.includes(fc)) ||
                    (m.realAway?.includes(fc)) ||
                    (status && isCountryPlaceholder(m.home, status)) ||
                    (status && isCountryPlaceholder(m.away, status));
            }) : true;

            if (filterCountries.length > 0 && !isFilterCountryMatch) return acc;

            if (filterCountries.length === 0) {
                if (matchStatusFilter === 'upcoming' && m.status === 'finished') {
                    return acc;
                }

                if (matchStatusFilter === 'played' && m.status !== 'finished') return acc;
            }

            // We no longer skip nextMatches here because they are rendered inline with variant="hero"

            let groupKey = m.date;
            const label = getRelativeDateLabel(m.date, GROUP_MONTH_MAP);
            if (label === 'Imorgon' && m.time) {
                const hour = parseInt(m.time.split(':')[0], 10);
                if (hour >= 0 && hour <= 6) {
                    groupKey = m.date + '_night';
                }
            }

            if (!acc[groupKey]) acc[groupKey] = [];
            acc[groupKey].push(m);
            return acc;
        }, {});
    }, [combinedMatches, filterCountries, nextMatches, filteredCountryStatusList, matchStatusFilter, top8ThirdsNames]);

    const getTeamRank = (teamName) => {
        if (!rankingData?.rankings) return 999;
        const rankObj = rankingData.rankings.find(r => r.team === teamName);
        return rankObj ? parseInt(rankObj.rank, 10) : 999;
    };

    const handleCardClick = (match) => {
        setSelectedMatch(match);
    };

    const renderInlineGroupTable = (matchId, groupName, homeTeam, awayTeam, isLive) => {
        if (matchStatusFilter === 'played') return null;
        if (!groupsData?.groups) return null;
        if (filterCountries.length > 0) return null;
        if (!isLive) return null;
        const group = groupsData.groups.find(g => g.name === groupName);
        if (!group) return null;
        const highlightTeams = [homeTeam, awayTeam].filter(Boolean).map(n => n.includes('\n') ? n.split('\n')[1] : n);
        return (
            <div style={{
                marginTop: '4px',
                marginBottom: '8px',
                animation: 'slideOutFromUnder 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}>
                {renderTable(group.name, group.teams, null, 0, highlightTeams, true)}
            </div>
        );
    };


    const qualifiedThirds = React.useMemo(() => {
        if (!groupsData?.groups) return [];
        const thirdPlacedTeams = groupsData.groups.map(group => {
            return group.teams[2]; // Already sorted by sortGroupTeams
        });
        return thirdPlacedTeams
            .filter(Boolean)
            .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || b.fairPlay - a.fairPlay || a.name.localeCompare(b.name, 'sv'))
            .slice(0, 8)
            .map(t => t.name);
    }, [groupsData]);

    if (loading) {
        return (
            <div className="app-container">
                <div style={{ padding: '80px 16px', display: 'flex', flexDirection: 'column' }}>
                    <MatchCardSkeleton />
                    <MatchCardSkeleton />
                    <MatchCardSkeleton />
                    <MatchCardSkeleton />
                </div>
            </div>
        );
    }
    if (!groupsData) return null;

    const renderTable = (groupName, teams, displayName, idx = 0, highlightTeams = [], isInline = false) => {
        const sortedTeams = teams; // Already sorted by sortGroupTeams

        const mappedTeams = sortedTeams.map((teamData, tidx) => {
            const team = typeof teamData === 'string' ? { name: teamData, played: 0, gd: 0, pts: 0, won: 0, drawn: 0, lost: 0 } : teamData;
            const flagCodes = getFlagCodes(team.name);
            const rank = tidx + 1;
            const isFiltered = filterCountries.length > 0 && filterCountries.some(fc => team.name.includes(fc));
            const isHighlighted = highlightTeams.some(ht => team.name.includes(ht)) || isFiltered;

            let rowBgColor = isHighlighted ? 'rgba(0, 0, 0, 0.05)' : 'transparent';
            const gRank = team.groupRank || (groupName === 'Alla Lag' ? null : rank);
            const isQualifiedThird = gRank === 3 && qualifiedThirds.includes(team.name);

            if (groupName === 'Alla Lag') {
                if (gRank === 1) rowBgColor = 'rgba(52, 199, 89, 0.3)';
                else if (gRank === 2) rowBgColor = 'rgba(52, 199, 89, 0.2)';
                else if (isQualifiedThird) rowBgColor = 'rgba(255, 204, 0, 0.2)';
                else if (gRank === 3) rowBgColor = 'rgba(255, 204, 0, 0.1)';
            }

            const thirdPlaceTeam = sortedTeams[2];
            const thirdPlaceTeamName = thirdPlaceTeam ? (typeof thirdPlaceTeam === 'string' ? thirdPlaceTeam : thirdPlaceTeam.name) : null;
            const thirdPlaceQualifies = thirdPlaceTeamName ? qualifiedThirds.includes(thirdPlaceTeamName) : false;
            const isLastQualifier = groupName !== 'Alla Lag' && ((rank === 2 && !thirdPlaceQualifies) || (rank === 3 && isQualifiedThird));

            return {
                rank,
                teamName: team.name,
                flags: flagCodes,
                played: team.played || 0,
                won: team.won || 0,
                drawn: team.drawn || 0,
                lost: team.lost || 0,
                gd: team.gd || 0,
                points: team.pts || 0,
                rowBgColor,
                isHighlighted,
                bottomDivider: isLastQualifier
            };
        });

        return (
            <SharedMatchTable 
                key={groupName}
                title={displayName || groupName} 
                teams={mappedTeams} 
                isInline={isInline} 
            />
        );
    };

    const formatSwedishDate = (dateStr) => {
        if (!dateStr) return '';
        const match = dateStr.match(/^(\d{1,2})\s+([A-Za-z]+).*?(\(\d+\s+days\))?$/);
        if (!match) return dateStr;

        const day = parseInt(match[1]);
        const monthEng = match[2].toLowerCase();

        const engToSwe = {
            'january': 'januari', 'february': 'februari', 'march': 'mars', 'april': 'april',
            'may': 'maj', 'june': 'juni', 'july': 'juli', 'august': 'augusti',
            'september': 'september', 'october': 'oktober', 'november': 'november', 'december': 'december',
            'jan': 'januari', 'feb': 'februari', 'mar': 'mars', 'apr': 'april',
            'jun': 'juni', 'jul': 'juli', 'aug': 'augusti', 'sep': 'september',
            'oct': 'oktober', 'nov': 'november', 'dec': 'december'
        };

        const monthSwe = engToSwe[monthEng] || monthEng;
        return `${day} ${monthSwe}`;
    };


    const renderAllMatches = () => {
        if (!matchesData) return null;

        if (matchStatusFilter === 'played') {
            const playedMatches = combinedMatches;

            let matchesToRender = playedMatches;
            let groupsToRender = groupsData.groups;

            if (filterCountries.length > 0) {
                const country = filterCountries[0];
                matchesToRender = playedMatches.filter(m => {
                    return m.home.includes(country) || m.away.includes(country) || 
                           (m.realHome && m.realHome.includes(country)) || 
                           (m.realAway && m.realAway.includes(country));
                });
                groupsToRender = groupsData.groups.filter(g => 
                    g.teams.some(t => {
                        const teamName = typeof t === 'string' ? t : t.name;
                        return teamName.includes(country);
                    })
                );
            }

            if (matchesToRender.length === 0 && filterCountries.length > 0 && groupsToRender.length === 0) {
                return <EmptyState />;
            }

            const playoffMatches = matchesToRender.filter(m => !m.group || m.group.toLowerCase().includes('slutspel') || m.isKnockout);

            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                    {groupsToRender.map(group => {
                        const groupMatches = matchesToRender.filter(m => m.group === group.name && !m.isKnockout);
                        
                        // If no played matches in this group yet and we are not filtering, 
                        // maybe we still show the table? The prompt says "ändra spelade matcher till en vy där alla grupper visas, grupp a, tabell, matcher" 
                        // So we should show the table for all groups even if no matches are played yet.

                        return (
                            <div key={group.name} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {renderTable(group.name, group.teams, group.name, 0, filterCountries, false)}
                                {groupMatches.length > 0 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {groupMatches.sort((a, b) => {
                                            const timeA = a.startTimestamp ? a.startTimestamp * 1000 : parseTournamentDate(a.date, a.time || '00:00', GROUP_MONTH_MAP).getTime();
                                            const timeB = b.startTimestamp ? b.startTimestamp * 1000 : parseTournamentDate(b.date, b.time || '00:00', GROUP_MONTH_MAP).getTime();
                                            return timeA - timeB;
                                        }).map((m, idx) => {
                                            const matchKey = `${m.home}-${m.away}-${m.date}`;
                                            return (
                                                <MatchCard 
                                                    key={matchKey} 
                                                    match={m} 
                                                    idx={idx} 
                                                    filterTeam={filterCountries.length === 1 ? filterCountries[0] : null} 
                                                    isFiltered={filterCountries.length > 0} 
                                                    homeRank={getTeamRank(m.realHome || m.home)} 
                                                    awayRank={getTeamRank(m.realAway || m.away)} 
                                                    onGroupClick={m.status === 'live' ? () => handleCardClick(m) : undefined}
                                                    onCardClick={() => {
                                                        if (m.status === 'live') {
                                                            handleCardClick(m);
                                                        } else if (m.status === 'finished') {
                                                            window.open(`https://www.svtplay.se/sok?q=${encodeURIComponent('VM fotboll höjdpunkter ' + (m.realHome || m.home) + ' ' + (m.realAway || m.away))}`, '_blank', 'noopener,noreferrer');
                                                        }
                                                    }} 
                                                    hideGroup={true}
                                                    isTableView={true}
                                                />
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}


                </div>
            );
        }

        const isMatchLiveOrRecentlyFinishedOrSoon = (m, isHeroMatch = false) => {
            if (isHeroMatch) return true;
            if (m.status === 'live') return true;
            if (m.status === 'finished') return true;
            const startMs = m.startTimestamp ? m.startTimestamp * 1000 : parseTournamentDate(m.date, m.time, GROUP_MONTH_MAP).getTime();
            if (m.status === 'upcoming') {
                const timeUntilStart = startMs - Date.now();
                if (timeUntilStart > 0) {
                    if (isHeroMatch && timeUntilStart <= 60 * 60 * 1000) return true;
                    if (!isHeroMatch && timeUntilStart <= 60 * 60 * 1000) return true;
                }
            }
            return false;
        };


        let localGroupedMatches = {};
        Object.keys(groupedMatches).forEach(date => {
            groupedMatches[date].forEach(m => {
                const startMs = m.startTimestamp ? m.startTimestamp * 1000 : parseTournamentDate(m.date, m.time, GROUP_MONTH_MAP).getTime();
                const hideAfterMs = startMs + (140 * 60 * 1000);
                const isPlayed = m.status === 'finished' && Date.now() > hideAfterMs;
                
                const keep = matchStatusFilter === 'played' ? isPlayed : !isPlayed;

                if (keep) {
                    const matchHour = new Date(startMs).getHours();
                    let targetDate = date;
                    
                    const relativeLabel = getRelativeDateLabel(date.replace('_night', ''), GROUP_MONTH_MAP);
                    const rlLower = relativeLabel.toLowerCase();
                    const currentHour = new Date().getHours();
                    let willBeInatt = false;
                    if (rlLower === 'ikväll' || rlLower === 'i kväll' || rlLower === 'idag') {
                        willBeInatt = true;
                    } else if (rlLower === 'imorgon' && currentHour >= 12) {
                        willBeInatt = true;
                    }
                    
                    if (matchHour < 7 || date.includes('_night')) {
                        if (matchStatusFilter === 'played') {
                            targetDate = date.replace('_night', '');
                        } else if (willBeInatt) {
                            targetDate = date.replace('_night', '') + '_night';
                        } else {
                            targetDate = date.replace('_night', '');
                        }
                    }
                    if (!localGroupedMatches[targetDate]) {
                        localGroupedMatches[targetDate] = [];
                    }
                    localGroupedMatches[targetDate].push(m);
                }
            });
        });

        let sortedDates = Object.keys(localGroupedMatches).sort((a, b) => {
            const dateA = a.replace('_night', '');
            const dateB = b.replace('_night', '');
            const diff = parseTournamentDate(dateA, '00:00', GROUP_MONTH_MAP) - parseTournamentDate(dateB, '00:00', GROUP_MONTH_MAP);
            if (diff !== 0) return diff;
            if (a.includes('_night') && !b.includes('_night')) return -1;
            if (!a.includes('_night') && b.includes('_night')) return 1;
            return 0;
        });

        if (matchStatusFilter === 'played') {
            sortedDates.reverse();
        }

        const ROUND_NAMES = {
            "1/16-final": "Sextondelsfinaler",
            "1/8-final": "Åttondelsfinaler",
            "Kvartsfinal": "Kvartsfinaler",
            "Semifinal": "Semifinaler",
            "Bronsmatch": "Bronsmatch",
            "Final": "Final"
        };

        const roundsData = [];
        let currentRound = null;
        let currentRoundDates = [];

        sortedDates.forEach((date) => {
            const matches = localGroupedMatches[date];
            const firstMatch = matches[0];
            let roundKey = "Gruppspel";

            if (firstMatch.isKnockout && firstMatch.roundName) {
                roundKey = firstMatch.roundName;
            }

            if (roundKey !== currentRound) {
                if (currentRound !== null) {
                    roundsData.push({ roundKey: currentRound, dates: currentRoundDates });
                }
                currentRound = roundKey;
                currentRoundDates = [date];
            } else {
                currentRoundDates.push(date);
            }
        });

        if (currentRound !== null) {
            roundsData.push({ roundKey: currentRound, dates: currentRoundDates });
        }

        const firstPlayoffIndex = roundsData.findIndex(r => r.roundKey !== "Gruppspel");

        if (roundsData.length === 0) {
            return <EmptyState />;
        }

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {roundsData.map((roundObj, index) => {
                    const roundHeader = roundObj.roundKey === "Gruppspel" ? "Gruppspel" : (ROUND_NAMES[roundObj.roundKey] || roundObj.roundKey);
                    return (
                        <div key={roundObj.roundKey} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                            {roundObj.dates.map((date) => {
                                const matches = localGroupedMatches[date];
                                return (
                                    <React.Fragment key={date}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {(() => {
                                                let relativeLabel = getRelativeDateLabel(date.replace('_night', ''), GROUP_MONTH_MAP);
                                                if (matchStatusFilter === 'played') {
                                                    const rlLower = relativeLabel.toLowerCase();
                                                    if (rlLower === 'ikväll' || rlLower === 'i kväll' || rlLower === 'imorgon') {
                                                        relativeLabel = 'Idag';
                                                    }
                                                } else {
                                                    const currentHour = new Date().getHours();
                                                    if (date.includes('_night')) {
                                                        const rlLower = relativeLabel.toLowerCase();
                                                        if (rlLower === 'ikväll' || rlLower === 'i kväll' || rlLower === 'idag') {
                                                            relativeLabel = 'Inatt';
                                                        } else if (rlLower === 'imorgon' && currentHour >= 12) {
                                                            relativeLabel = 'Inatt';
                                                        }
                                                    }
                                                }
                                                const hasHero = matches.some(m => nextMatches.some(nm => nm.home === m.home && nm.away === m.away && nm.date === m.date && nm.time === m.time));
                                                const isCountdownOrLive = matches.some(m => {
                                                    if (m.status === 'live' || m.status === 'finished') return true;
                                                    const startMs = m.startTimestamp ? m.startTimestamp * 1000 : parseTournamentDate(m.date, m.time, GROUP_MONTH_MAP).getTime();
                                                    return (startMs - Date.now()) <= 60 * 60 * 1000;
                                                });
                                                let hideHeader = (['ikväll', 'i kväll', 'inatt'].includes(relativeLabel.toLowerCase()) && matches.some(m => isMatchLiveOrRecentlyFinishedOrSoon(m))) || (filterCountries.length === 0 && hasHero && isCountdownOrLive);
                                                if (matchStatusFilter === 'played' || filterCountries.length > 0) {
                                                    hideHeader = false;
                                                }
                                                if (hideHeader) return null;
                                                return (
                                                    <div style={{ marginTop: '8px' }}>
                                                        <DateHeader labelOverride={relativeLabel} />
                                                    </div>
                                                );
                                            })()}
                                            {(matchStatusFilter === 'played' ? [...matches].sort((a, b) => {
                                                const timeA = a.startTimestamp ? a.startTimestamp * 1000 : parseTournamentDate(a.date, a.time || '00:00', GROUP_MONTH_MAP).getTime();
                                                const timeB = b.startTimestamp ? b.startTimestamp * 1000 : parseTournamentDate(b.date, b.time || '00:00', GROUP_MONTH_MAP).getTime();
                                                return timeB - timeA;
                                            }) : matches).map((m, i) => {
                                                const matchKey = `${m.home}-${m.away}-${m.date}`;
                                                const isHero = filterCountries.length === 0 && nextMatches.some(nm => nm.home === m.home && nm.away === m.away && nm.date === m.date && nm.time === m.time);

                                                const hasHero = filterCountries.length === 0 && matches.some(mx => nextMatches.some(nm => nm.home === mx.home && nm.away === mx.away && nm.date === mx.date && nm.time === mx.time));
                                                const isFirstNonHero = hasHero && !isHero && i === matches.findIndex(mx => !nextMatches.some(nm => nm.home === mx.home && nm.away === mx.away && nm.date === mx.date && nm.time === mx.time));
                                                let relativeLabel = getRelativeDateLabel(date.replace('_night', ''), GROUP_MONTH_MAP);
                                                if (matchStatusFilter === 'played') {
                                                    const rlLower = relativeLabel.toLowerCase();
                                                    if (rlLower === 'ikväll' || rlLower === 'i kväll' || rlLower === 'imorgon') {
                                                        relativeLabel = 'Idag';
                                                    }
                                                } else {
                                                    const currentHour = new Date().getHours();
                                                    if (date.includes('_night')) {
                                                        const rlLower = relativeLabel.toLowerCase();
                                                        if (rlLower === 'ikväll' || rlLower === 'i kväll' || rlLower === 'idag') {
                                                            relativeLabel = 'Inatt';
                                                        } else if (rlLower === 'imorgon' && currentHour >= 12) {
                                                            relativeLabel = 'Inatt';
                                                        }
                                                    }
                                                }

                                                const homeRankVal = getTeamRank(m.realHome || m.home);
                                                const awayRankVal = getTeamRank(m.realAway || m.away);
                                                const isTopMatch = (homeRankVal + awayRankVal) <= 30;
                                                const isBottomMatch = (homeRankVal + awayRankVal) >= 100;
                                                const isSwedenMatch = (m.realHome || m.home) === 'Sverige' || (m.realAway || m.away) === 'Sverige';

                                                let cardClass = '';
                                                let cardStyle = {};
                                                let badgeBg = '';
                                                let badgeText = '';
                                                let badgeColor = '#000';

                                                const showSwedenBadge = isSwedenMatch;
                                                const showTopMatchBadge = isTopMatch;

                                                if (showSwedenBadge) {
                                                    cardClass = 'sweden-frame-animated';
                                                    badgeBg = 'linear-gradient(135deg, #005293, #006AA7)';
                                                    badgeColor = '#FECB00';
                                                    badgeText = 'Sverige spelar';
                                                } else if (showTopMatchBadge) {
                                                    cardClass = 'gold-frame-animated';
                                                    badgeBg = 'linear-gradient(135deg, #FFD700, #FDB931)';
                                                    badgeText = 'Supermatch';
                                                }

                                                const isCountdownOrLive2 = matches.some(mx => {
                                                    if (mx.status === 'live' || mx.status === 'finished') return true;
                                                    const startMs = mx.startTimestamp ? mx.startTimestamp * 1000 : parseTournamentDate(mx.date, mx.time, GROUP_MONTH_MAP).getTime();
                                                    return (startMs - Date.now()) <= 60 * 60 * 1000;
                                                });
                                                return (
                                                    <React.Fragment key={i}>
                                                        {filterCountries.length === 0 && isFirstNonHero && isCountdownOrLive2 && (
                                                            <div style={{
                                                                fontSize: '0.8rem',
                                                                textTransform: 'uppercase',
                                                                paddingLeft: '4px',
                                                                color: 'var(--color-text-muted)',
                                                                letterSpacing: '0.06em',
                                                                marginTop: '8px'
                                                            }}>{relativeLabel}</div>
                                                        )}
                                                        <div id={index === firstPlayoffIndex && date === roundObj.dates[0] && i === 0 ? 'playoff-start' : undefined} className={cardClass} style={{ ...cardStyle, position: 'relative', zIndex: 10 }}>
                                                            {badgeText && (
                                                                <div className={showTopMatchBadge ? 'topmatch-badge' : (showSwedenBadge ? 'sweden-badge' : '')} style={{
                                                                    position: 'absolute',
                                                                    top: '-8px',
                                                                    left: '12px',
                                                                    background: badgeBg,
                                                                    color: badgeColor,
                                                                    fontSize: '0.65rem',
                                                                    fontWeight: 'bold',
                                                                    padding: '2px 8px',
                                                                    borderRadius: '8px',
                                                                    zIndex: 10,
                                                                    textTransform: 'uppercase',
                                                                    letterSpacing: '0.05em'
                                                                }}>
                                                                    {badgeText}
                                                                </div>
                                                            )}
                                                            <MatchCard match={m} variant={undefined} idx={i} filterTeam={filterCountries.length === 1 ? filterCountries[0] : null} isFiltered={filterCountries.length > 0} homeRank={getTeamRank(m.realHome || m.home)} awayRank={getTeamRank(m.realAway || m.away)} onGroupClick={m.status === 'live' ? () => handleCardClick(m) : undefined} onCardClick={m.status === 'live' ? () => handleCardClick(m) : undefined} />
                                                        </div>
                                                        {m.group && renderInlineGroupTable(matchKey, m.group, m.realHome || m.home, m.realAway || m.away, isMatchLiveOrRecentlyFinishedOrSoon(m, isHero))}
                                                    </React.Fragment>
                                                );
                                            })}
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        );
    };



    const renderColorLegend = () => (
        <div style={{ marginTop: '16px', marginBottom: '32px', padding: '16px', backgroundColor: 'var(--color-card-bg)', borderRadius: '16px', border: 'var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '1rem', fontWeight: 'bold' }}>Färgförklaring</h3>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ width: '16px', height: '16px', backgroundColor: 'rgba(52, 199, 89, 0.3)', borderRadius: '4px', marginRight: '12px', flexShrink: 0 }}></div>
                <span style={{ fontSize: '0.85rem' }}><strong>Gruppettor</strong> (vidare till slutspel)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ width: '16px', height: '16px', backgroundColor: 'rgba(52, 199, 89, 0.2)', borderRadius: '4px', marginRight: '12px', flexShrink: 0 }}></div>
                <span style={{ fontSize: '0.85rem' }}><strong>Grupptvåor</strong> (vidare till slutspel)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ width: '16px', height: '16px', backgroundColor: 'rgba(255, 204, 0, 0.2)', borderRadius: '4px', marginRight: '12px', flexShrink: 0 }}></div>
                <span style={{ fontSize: '0.85rem' }}><strong>8 bästa grupptreorna</strong> (vidare till slutspel)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '16px', height: '16px', backgroundColor: 'rgba(255, 204, 0, 0.1)', borderRadius: '4px', marginRight: '12px', flexShrink: 0 }}></div>
                <span style={{ fontSize: '0.85rem' }}><strong>Övriga grupptreor</strong> (utslagna)</span>
            </div>
        </div>
    );


    return (
        <div
            className="page-transition"
            style={{ minHeight: '100vh', paddingBottom: '100px' }}
        >



            {/* Full-width Sticky Header */}
            <div className={`nav-container ${isScrolled ? 'scrolled' : ''}`} style={{
                backgroundColor: 'var(--color-glass-bg)',
                color: 'var(--color-text)',
                '--active-color': 'var(--color-primary)',
                transition: 'background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease',
                boxShadow: 'none',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                justifyContent: 'center'
            }}>
                <div style={{ maxWidth: '600px', width: '100%', display: 'flex', justifyContent: 'center', position: 'relative' }}>
                    <div style={{
                        position: 'absolute',
                        left: '0',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <button
                            className="header-logo"
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '8px'
                            }}
                            onClick={() => navigate('/allsvenskan')}
                            aria-label="Gå till Allsvenskan"
                        >
                            <img
                                src="https://upload.wikimedia.org/wikipedia/en/1/17/2026_FIFA_World_Cup_emblem.svg"
                                alt=""
                                aria-hidden="true"
                                style={{
                                    height: '32px',
                                    transition: 'height 0.3s ease'
                                }}
                            />
                        </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', gap: '12px' }}>
                        <button
                            type="button"
                            className={`segmented-button ${(!showBracketModal && matchStatusFilter === 'upcoming') ? 'active' : ''}`}
                            onClick={() => {
                                if (selectedMatch) setSelectedMatch(null);
                                setShowBracketModal(false);
                                setMatchStatusFilter('upcoming');
                            }}
                            style={{
                                backgroundColor: (!showBracketModal && matchStatusFilter === 'upcoming') ? 'var(--color-primary)' : 'rgba(118, 118, 128, 0.12)',
                                borderRadius: '50%',
                                padding: '0',
                                width: '36px',
                                height: '36px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease',
                                color: (!showBracketModal && matchStatusFilter === 'upcoming') ? 'white' : 'var(--color-text)',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                            aria-label="Visa kommande matcher"
                            title="Kommande matcher"
                        >
                            <EventIcon fontSize="small" />
                        </button>

                        <button
                            type="button"
                            className={`segmented-button ${showBracketModal ? 'active' : ''}`}
                            onClick={() => {
                                if (selectedMatch) setSelectedMatch(null);
                                setShowBracketModal(true);
                            }}
                            style={{
                                backgroundColor: showBracketModal ? 'var(--color-primary)' : 'rgba(118, 118, 128, 0.12)',
                                borderRadius: '50%',
                                padding: '0',
                                width: '36px',
                                height: '36px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease',
                                color: showBracketModal ? 'white' : 'var(--color-text)',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                            aria-label="Visa slutspelsträd"
                            title="Slutspelsträd"
                        >
                            <Trophy size={18} style={{ transform: 'translateX(-0.5px)' }} />
                        </button>

                        {combinedMatches.length > 0 && (
                            <button 
                                className={`segmented-button ${(!showBracketModal && matchStatusFilter === 'played') ? 'active' : ''}`}
                                onClick={() => {
                                    if (selectedMatch) setSelectedMatch(null);
                                    setShowBracketModal(false);
                                    setMatchStatusFilter('played');
                                }}
                                title="Visa grupper och tabeller"
                                style={{
                                    backgroundColor: (!showBracketModal && matchStatusFilter === 'played') ? 'var(--color-primary)' : 'rgba(118, 118, 128, 0.12)',
                                    borderRadius: '50%',
                                    padding: '0',
                                    width: '36px',
                                    height: '36px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease',
                                    color: (!showBracketModal && matchStatusFilter === 'played') ? 'white' : 'var(--color-text)',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <FormatListBulletedIcon fontSize="small" />
                            </button>
                        )}


                    </div>

                    <div style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 10
                    }}>
                        <div style={{ position: 'relative' }} ref={filterRef}>
                        {filterCountries.length === 0 ? (
                            <div 
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', cursor: 'pointer' }}
                            >
                                <PublicIcon />
                            </div>
                        ) : (
                            <div 
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', cursor: 'pointer' }}
                            >
                                <FlagBadge codes={getFlagCodes(filterCountries[0])} name={filterCountries[0]} size={24} />
                            </div>
                        )}

                        {isFilterOpen && (
                            <div style={{
                                position: 'absolute',
                                top: '50px',
                                right: 0,
                                width: '220px',
                                maxHeight: '300px',
                                overflowY: 'auto',
                                backgroundColor: 'var(--color-bg)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '12px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                zIndex: 1000,
                                display: 'flex',
                                flexDirection: 'column',
                                padding: '8px 0'
                            }}>
                                <div 
                                    onClick={() => {
                                        setFilterCountries([]);
                                        setIsFilterOpen(false);
                                    }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '10px 16px',
                                        cursor: 'pointer',
                                        backgroundColor: filterCountries.length === 0 ? 'var(--color-surface-hover)' : 'transparent',
                                        transition: 'background-color 0.2s',
                                        fontWeight: filterCountries.length === 0 ? 'bold' : 'normal'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = filterCountries.length === 0 ? 'var(--color-surface-hover)' : 'transparent'}
                                >
                                    <PublicIcon fontSize="small" />
                                    <span style={{ fontSize: '0.9rem' }}>Alla lag</span>
                                </div>
                                {Array.from(tournamentTeams).sort().map(team => (
                                    <div 
                                        key={team}
                                        onClick={() => {
                                            setFilterCountries([team]);
                                            setIsFilterOpen(false);
                                        }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '10px 16px',
                                            cursor: 'pointer',
                                            backgroundColor: filterCountries.includes(team) ? 'var(--color-surface-hover)' : 'transparent',
                                            transition: 'background-color 0.2s',
                                            fontWeight: filterCountries.includes(team) ? 'bold' : 'normal'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = filterCountries.includes(team) ? 'var(--color-surface-hover)' : 'transparent'}
                                    >
                                        <FlagBadge codes={getFlagCodes(team)} name={team} size={20} />
                                        <span style={{ fontSize: '0.9rem' }}>{team}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                </div>


                {/* Filter removed as per user request */}
            </div>

            {selectedMatch ? (
                <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
                    <MatchDetailView 
                        match={selectedMatch} 
                        onBack={() => setSelectedMatch(null)} 
                        variant="vm" 
                    />
                </div>
            ) : (
                <>
                    {showBracketModal && (
                        <div className="tab-content-enter" style={{ width: '100%', overflowX: 'auto', padding: '16px 0', borderBottom: '1px solid var(--border)', marginBottom: '16px', background: 'var(--color-card-bg)' }}>
                            <div style={{ width: 'fit-content', margin: '0 auto', padding: '0 16px' }}>
                                <VMBracket filterCountry={filterCountries.length === 1 ? filterCountries[0] : null} liveGroupsData={groupsData} />
                            </div>
                        </div>
                    )}

            {/* Centered Content Container */}
            {!showBracketModal && (
                <div style={{
                    maxWidth: '600px',
                    margin: '32px auto 0 auto',
                    padding: '0 10px'
                }}>
                    <div className="tab-content-enter" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                        {renderAllMatches()}
                    </div>
                </div>
            )}
            </>
            )}



            {showAllTeamsModal && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'var(--color-bg)',
                    zIndex: 9999,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    padding: '16px',
                    paddingTop: 'calc(env(safe-area-inset-top) + 16px)'
                }}>
                    <div className="modal-slide-up" style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
                        <div style={{ 
                            position: 'sticky', 
                            top: '16px', 
                            zIndex: 1000, 
                            display: 'flex', 
                            justifyContent: 'flex-end', 
                            alignItems: 'center', 
                            marginBottom: '16px',
                            pointerEvents: 'none'
                        }}>
                            <button
                                onClick={() => setShowAllTeamsModal(false)}
                                style={{
                                    pointerEvents: 'auto',
                                    background: 'var(--color-glass-bg)',
                                    backdropFilter: 'blur(12px)',
                                    WebkitBackdropFilter: 'blur(12px)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '36px', height: '36px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: 'var(--shadow-md)',
                                    color: 'var(--color-text)'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        {(() => {
                            if (!groupsData?.groups) return null;
                            const allTeams = groupsData.groups.flatMap(g => {
                                const sorted = getSortedGroupTeams(g);
                                return sorted.map((t, i) => {
                                    const team = typeof t === 'string' ? { name: t, played: 0, gd: 0, pts: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, fairPlay: 0 } : t;
                                    return { ...team, groupRank: i + 1 };
                                });
                            });
                            allTeams.sort((a, b) => {
                                if (a.groupRank !== b.groupRank) return a.groupRank - b.groupRank;
                                return b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || b.fairPlay - a.fairPlay || a.name.localeCompare(b.name, 'sv');
                            });
                            
                            const mappedTeams = allTeams.map((team, tidx) => {
                                const rank = tidx + 1;
                                const gRank = team.groupRank;
                                const isQualifiedThird = gRank === 3 && qualifiedThirds.includes(team.name);
                                
                                let rowBgColor = 'transparent';

                                return { 
                                    ...team, 
                                    rank, 
                                    teamName: team.name, 
                                    points: team.pts, 
                                    flags: getFlagCodes(team.name),
                                    rowBgColor
                                };
                            });

                            const rankNames = {
                                1: "Gruppettor",
                                2: "Grupptvåor",
                                3: "Grupptreor",
                                4: "Gruppfyror"
                            };

                            return (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    {[3].map(r => {
                                        const teamsInRank = mappedTeams.filter(t => t.groupRank === r);
                                        if (teamsInRank.length === 0) return null;
                                        
                                        const displayTeams = teamsInRank.map((t, idx) => ({ ...t, rank: idx + 1 }));

                                        return (
                                            <SharedMatchTable 
                                                key={r}
                                                title={rankNames[r] || `Plats ${r}`} 
                                                teams={displayTeams} 
                                                dividerIndex={r === 3 ? 8 : undefined}
                                            />
                                        );
                                    })}
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}
            

            
            <div className="bracket-landscape-wrapper">
                <VMBracket filterCountry={filterCountries.length === 1 ? filterCountries[0] : null} liveGroupsData={groupsData} />
            </div>
        </div>
    );
};

export default VMKollen;
