const fs = require('fs');

let content = fs.readFileSync('src/components/AllsvenskanKollen.jsx', 'utf-8');

const startText = "{activeTab === 'transfers' && (";
const lines = content.split('\n');
let startIndex = -1;
let endIndex = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(startText)) {
        startIndex = i;
        break;
    }
}

if (startIndex !== -1) {
    let braceCount = 0;
    for (let i = startIndex; i < lines.length; i++) {
        braceCount += (lines[i].match(/\{/g) || []).length;
        braceCount -= (lines[i].match(/\}/g) || []).length;
        braceCount += (lines[i].match(/\(/g) || []).length;
        braceCount -= (lines[i].match(/\)/g) || []).length;

        if (braceCount === 0 && lines[i].includes(")}")) {
            endIndex = i;
            break;
        }
    }
}

if (startIndex !== -1 && endIndex !== -1) {
    const newUI = [
        "                    {activeTab === 'squads' && (",
        "                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>",
        "                            {loading ? (",
        "                                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>",
        "                                    Laddar trupper...",
        "                                </div>",
        "                            ) : !squadsData?.teams ? (",
        "                                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>",
        "                                    Inga trupper tillgängliga.",
        "                                </div>",
        "                            ) : (",
        "                                <>",
        "                                    {squadsData.lastUpdated && (",
        "                                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textAlign: 'right', padding: '0 4px' }}>",
        "                                            Uppdaterad: {new Date(squadsData.lastUpdated).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}",
        "                                        </div>",
        "                                    )}",
        "                                    {Object.entries(squadsData.teams)",
        "                                        .filter(([teamName]) => {",
        "                                            if (!filterTeam) return true;",
        "                                            const cleanFilter = filterTeam.replace(' IF', '').replace(' FF', '').replace(' BK', '').trim();",
        "                                            return teamName.includes(cleanFilter) || teamName.includes(filterTeam) || teamName === filterTeam;",
        "                                        })",
        "                                        .sort(([a], [b]) => cleanTeamNameForDisplay(a).localeCompare(cleanTeamNameForDisplay(b), 'sv'))",
        "                                        .map(([teamName, players]) => {",
        "                                            if (!players || players.length === 0) return null;",
        "                                            const teamColor = TEAM_COLORS[teamName] || '#999';",
        "                                            const positionGroups = {",
        "                                                'Målvakter': players.filter(p => p.position.includes('Goalkeeper')),",
        "                                                'Försvarare': players.filter(p => p.position.includes('Back') || p.position === 'Defender'),",
        "                                                'Mittfältare': players.filter(p => p.position.includes('Midfield')),",
        "                                                'Anfallare': players.filter(p => p.position.includes('Forward') || p.position.includes('Winger') || p.position.includes('Striker') || p.position === 'Attack')",
        "                                            };",
        "                                            return (",
        "                                                <Card key={teamName} padding=\"0\" style={{ overflow: 'hidden', border: 'var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>",
        "                                                    <div style={{ padding: '16px', background: 'var(--color-card-bg)', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>",
        "                                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,0,0,0.05)', flexShrink: 0 }}>",
        "                                                            {logosData && logosData[teamName] ? (",
        "                                                                <img src={logosData[teamName]} alt=\"\" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />",
        "                                                            ) : (",
        "                                                                <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: teamColor }} />",
        "                                                            )}",
        "                                                        </div>",
        "                                                        <div style={{ flex: 1 }}>",
        "                                                            <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>",
        "                                                                <BoldSverige text={cleanTeamNameForDisplay(teamName)} />",
        "                                                            </div>",
        "                                                        </div>",
        "                                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', backgroundColor: 'rgba(0,0,0,0.04)', padding: '4px 10px', borderRadius: '12px' }}>",
        "                                                            {players.length} spelare",
        "                                                        </div>",
        "                                                    </div>",
        "                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>",
        "                                                        {Object.entries(positionGroups).map(([groupName, groupPlayers]) => {",
        "                                                            if (groupPlayers.length === 0) return null;",
        "                                                            return (",
        "                                                                <div key={groupName} style={{ padding: '12px 16px', borderTop: '1px solid rgba(0,0,0,0.04)' }}>",
        "                                                                    <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.05em', marginBottom: '10px' }}>",
        "                                                                        {groupName} ({groupPlayers.length})",
        "                                                                    </div>",
        "                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>",
        "                                                                        {groupPlayers.map((p, idx) => (",
        "                                                                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 10px', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.02)' }}>",
        "                                                                                <div style={{ width: '24px', fontSize: '0.8rem', fontWeight: 800, color: p.number ? 'var(--color-text)' : 'var(--color-text-muted)', textAlign: 'center' }}>",
        "                                                                                    {p.number || '-'}",
        "                                                                                </div>",
        "                                                                                <div style={{ flex: 1, minWidth: 0 }}>",
        "                                                                                    <div style={{ fontWeight: 600, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>",
        "                                                                                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'flex', gap: '6px' }}>",
        "                                                                                        <span>{p.position}</span>",
        "                                                                                        {p.age && <span>• {p.age.split(' ')[0]} {p.age.includes('(') ? p.age.split(' ')[1] : ''}</span>}",
        "                                                                                    </div>",
        "                                                                                </div>",
        "                                                                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: p.value && p.value !== '-' ? 'var(--color-text)' : 'var(--color-text-muted)', textAlign: 'right' }}>",
        "                                                                                    {p.value}",
        "                                                                                </div>",
        "                                                                            </div>",
        "                                                                        ))}",
        "                                                                    </div>",
        "                                                                </div>",
        "                                                            );",
        "                                                        })}",
        "                                                    </div>",
        "                                                </Card>",
        "                                            );",
        "                                        })}",
        "                                </>",
        "                            )}",
        "                        </div>",
        "                    )}"
    ].join('\n');

    lines.splice(startIndex, endIndex - startIndex + 1, newUI);
    content = lines.join('\n');
}

fs.writeFileSync('src/components/AllsvenskanKollen.jsx', content);
console.log('Done!');
