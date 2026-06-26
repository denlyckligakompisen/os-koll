export const COUNTRY_COLORS = {
    'Sverige': { bg: '#FFCD00', text: '#004B87', active: '#004B87' },
    'Mexiko': { bg: '#006341', text: '#FFFFFF', active: '#CE1126' },
    'USA': { bg: '#002868', text: '#FFFFFF', active: '#BF0A30' },
    'Kanada': { bg: '#D22630', text: '#FFFFFF', active: '#FFFFFF' },
    'Brasilien': { bg: '#009C3B', text: '#FFDF00', active: '#002776' },
    'Bosnien och Hercegovina': { bg: '#002F6C', text: '#FFCD00', active: '#FFCD00' },
    'Turkiet': { bg: '#E30A17', text: '#FFFFFF', active: '#FFFFFF' },
    'Tjeckien': { bg: '#11457E', text: '#FFFFFF', active: '#D7141A' },
    'Nederländerna': { bg: '#FF4F00', text: '#FFFFFF', active: '#21468B' },
    'Tyskland': { bg: '#000000', text: '#FFFFFF', active: '#FFCE00' },
    'Spanien': { bg: '#AA151B', text: '#F1BF00', active: '#F1BF00' },
    'Frankrike': { bg: '#002395', text: '#FFFFFF', active: '#ED2939' },
    'Argentina': { bg: '#43A1D5', text: '#FFFFFF', active: '#FFB81C' },
    'England': { bg: '#FFFFFF', text: '#CF0820', active: '#CF0820' },
    'Portugal': { bg: '#046A38', text: '#FFFFFF', active: '#DA291C' },
    'Belgien': { bg: '#E20613', text: '#FFD200', active: '#000000' },
    'Italien': { bg: '#0066B2', text: '#FFFFFF', active: '#FFFFFF' },
    'Japan': { bg: '#000555', text: '#FFFFFF', active: '#EE0000' },
    'Sydkorea': { bg: '#003478', text: '#FFFFFF', active: '#C60C30' },
    'Ecuador': { bg: '#FFDD00', text: '#00205B', active: '#ED1C24' },
    'Uruguay': { bg: '#0038A8', text: '#FFFFFF', active: '#FCD116' },
    'Senegal': { bg: '#00853F', text: '#FDEF42', active: '#E31B23' },
    'Marocko': { bg: '#C1272D', text: '#FFFFFF', active: '#006233' },
    'Schweiz': { bg: '#D52B1E', text: '#FFFFFF', active: '#FFFFFF' },
    'Österrike': { bg: '#ED2939', text: '#FFFFFF', active: '#FFFFFF' },
    'Kroatien': { bg: '#ED1C24', text: '#FFFFFF', active: '#0051BA' },
    'Colombia': { bg: '#FCD116', text: '#003893', active: '#CE1126' },
    'Norge': { bg: '#BA0C2F', text: '#FFFFFF', active: '#00205B' },
    'Danmark': { bg: '#C60C30', text: '#FFFFFF', active: '#FFFFFF' },
    'Saudiarabien': { bg: '#006C35', text: '#FFFFFF', active: '#FFFFFF' },
    'Egypten': { bg: '#CE1126', text: '#FFFFFF', active: '#000000' },
    'Tunisien': { bg: '#E70013', text: '#FFFFFF', active: '#FFFFFF' },
    'Ghana': { bg: '#006B3F', text: '#FCD116', active: '#CE1126' },
    'Sydafrika': { bg: '#007749', text: '#FFB81C', active: '#001489' },
    'Australien': { bg: '#008751', text: '#FFCD00', active: '#FFCD00' },
    'Haiti': { bg: '#00209F', text: '#FFFFFF', active: '#D21034' },
    'Jamaika': { bg: '#009B3A', text: '#FED100', active: '#000000' },
    'Bolivia': { bg: '#007A33', text: '#FFFFFF', active: '#EE3A43' },
    'Panama': { bg: '#DA291C', text: '#FFFFFF', active: '#00205B' },
    'Curaçao': { bg: '#002B7F', text: '#FED100', active: '#FED100' },
    'Uzbekistan': { bg: '#0099B5', text: '#FFFFFF', active: '#1EB53A' },
    'Paraguay': { bg: '#D52B1E', text: '#FFFFFF', active: '#0038A8' },
    'Jordanien': { bg: '#000000', text: '#FFFFFF', active: '#CE1126' },
    'Qatar': { bg: '#8A1538', text: '#FFFFFF', active: '#FFFFFF' },
    'Skottland': { bg: '#005EB8', text: '#FFFFFF', active: '#FFFFFF' }
};

export const getVMHeaderStyle = (countryName) => {
    if (!countryName) {
        return {
            bg: 'var(--color-glass-bg)',
            text: 'var(--color-text)',
            inactiveText: 'var(--color-text-muted)',
            activeLine: 'var(--color-text)'
        };
    }
    const colors = COUNTRY_COLORS[countryName] || { bg: '#1c1c1e', text: '#ffffff', active: '#34c759' };
    return {
        bg: colors.bg,
        text: colors.text,
        inactiveText: 'rgba(255, 255, 255, 0.6)',
        activeLine: colors.active
    };
};

export const TEAM_ABBR = {
    'Sverige': 'SWE', 'Mexiko': 'MEX', 'USA': 'USA', 'Kanada': 'CAN', 'Brasilien': 'BRA',
    'Bosnien och Hercegovina': 'BIH', 'Turkiet': 'TUR', 'Tjeckien': 'CZE', 'Nederländerna': 'NED',
    'Tyskland': 'GER', 'Spanien': 'ESP', 'Frankrike': 'FRA', 'Argentina': 'ARG',
    'England': 'ENG', 'Portugal': 'POR', 'Belgien': 'BEL', 'Italien': 'ITA',
    'Japan': 'JPN', 'Sydkorea': 'KOR', 'Ecuador': 'ECU', 'Uruguay': 'URU',
    'Senegal': 'SEN', 'Marocko': 'MAR', 'Schweiz': 'SUI', 'Österrike': 'AUT',
    'Kroatien': 'CRO', 'Colombia': 'COL', 'Norge': 'NOR', 'Danmark': 'DEN',
    'Saudiarabien': 'KSA', 'Egypten': 'EGY', 'Tunisien': 'TUN', 'Ghana': 'GHA',
    'Sydafrika': 'RSA', 'Australien': 'AUS', 'Haiti': 'HAI', 'Jamaika': 'JAM',
    'Bolivia': 'BOL', 'Panama': 'PAN', 'Curaçao': 'CUW', 'Uzbekistan': 'UZB',
    'Paraguay': 'PAR', 'Jordanien': 'JOR', 'Qatar': 'QAT', 'Skottland': 'SCO'
};

export const getAbbr = (name) => TEAM_ABBR[name] || name?.substring(0, 3).toUpperCase();

export const sortTeamsSimple = (teams) => {
    return [...teams].sort((a, b) => {
        const teamA = typeof a === 'string' ? { name: a, pts: 0, gd: 0, gf: 0, fairPlay: 0 } : a;
        const teamB = typeof b === 'string' ? { name: b, pts: 0, gd: 0, gf: 0, fairPlay: 0 } : b;
        return teamB.pts - teamA.pts || teamB.gd - teamA.gd || teamB.gf - teamA.gf || teamB.fairPlay - teamA.fairPlay || teamA.name.localeCompare(teamB.name, 'sv');
    });
};

export const sortGroupTeams = (teams, groupMatches, rankingData) => {
    const getRank = (teamName) => {
        if (!rankingData?.rankings) return 999;
        const index = rankingData.rankings.findIndex(r => r.team === teamName || r.team.includes(teamName) || teamName.includes(r.team));
        return index !== -1 ? index : 999;
    };

    const sortSubset = (subsetTeams, subsetMatches) => {
        if (subsetTeams.length <= 1) return subsetTeams;

        const miniStats = {};
        subsetTeams.forEach(t => miniStats[t.name] = { pts: 0, gd: 0, gf: 0 });

        subsetMatches.forEach(m => {
            if ((m.status === 'finished' || m.status === 'live') && m.score && m.score.includes('-')) {
                const parts = m.score.split('-');
                const homeScore = parseInt(parts[0].trim(), 10);
                const awayScore = parseInt(parts[1].trim(), 10);
                if (isNaN(homeScore) || isNaN(awayScore)) return;

                if (miniStats[m.home] && miniStats[m.away]) {
                    miniStats[m.home].gf += homeScore;
                    miniStats[m.home].ga = (miniStats[m.home].ga || 0) + awayScore;
                    miniStats[m.home].gd = miniStats[m.home].gf - miniStats[m.home].ga;

                    miniStats[m.away].gf += awayScore;
                    miniStats[m.away].ga = (miniStats[m.away].ga || 0) + homeScore;
                    miniStats[m.away].gd = miniStats[m.away].gf - miniStats[m.away].ga;

                    if (homeScore > awayScore) miniStats[m.home].pts += 3;
                    else if (homeScore === awayScore) {
                        miniStats[m.home].pts += 1;
                        miniStats[m.away].pts += 1;
                    } else miniStats[m.away].pts += 3;
                }
            }
        });

        subsetTeams.sort((a, b) => {
            const stA = miniStats[a.name];
            const stB = miniStats[b.name];
            return stB.pts - stA.pts || stB.gd - stA.gd || stB.gf - stA.gf;
        });

        const clusters = [];
        let currentCluster = [];
        let lastSig = null;

        subsetTeams.forEach(t => {
            const st = miniStats[t.name];
            const sig = `${st.pts}_${st.gd}_${st.gf}`;
            if (sig !== lastSig) {
                if (currentCluster.length > 0) clusters.push(currentCluster);
                currentCluster = [t];
                lastSig = sig;
            } else {
                currentCluster.push(t);
            }
        });
        if (currentCluster.length > 0) clusters.push(currentCluster);

        if (clusters.length === 1 && clusters[0].length === subsetTeams.length) {
            return clusters[0].sort((a, b) => {
                if (b.gd !== a.gd) return b.gd - a.gd;
                if (b.gf !== a.gf) return b.gf - a.gf;
                if (b.fairPlay !== a.fairPlay) return b.fairPlay - a.fairPlay;
                return getRank(a.name) - getRank(b.name);
            });
        }

        const resolved = [];
        clusters.forEach(cluster => {
            if (cluster.length === 1) {
                resolved.push(cluster[0]);
            } else {
                const clusterNames = new Set(cluster.map(t => t.name));
                const subMatches = subsetMatches.filter(m => clusterNames.has(m.home) && clusterNames.has(m.away));
                resolved.push(...sortSubset(cluster, subMatches));
            }
        });

        return resolved;
    };

    const sortedTeams = [...teams].sort((a, b) => b.pts - a.pts);
    const pointClusters = [];
    let currentPtCluster = [];
    let lastPts = null;

    sortedTeams.forEach(t => {
        if (t.pts !== lastPts) {
            if (currentPtCluster.length > 0) pointClusters.push(currentPtCluster);
            currentPtCluster = [t];
            lastPts = t.pts;
        } else {
            currentPtCluster.push(t);
        }
    });
    if (currentPtCluster.length > 0) pointClusters.push(currentPtCluster);

    const finalRanking = [];
    pointClusters.forEach(cluster => {
        if (cluster.length === 1) {
            finalRanking.push(cluster[0]);
        } else {
            const clusterNames = new Set(cluster.map(t => t.name));
            const clusterMatches = groupMatches.filter(m => clusterNames.has(m.home) && clusterNames.has(m.away));
            finalRanking.push(...sortSubset(cluster, clusterMatches));
        }
    });

    return finalRanking;
};
