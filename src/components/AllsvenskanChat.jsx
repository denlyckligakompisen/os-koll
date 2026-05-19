import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Sparkles, AlertCircle, HelpCircle } from 'lucide-react';
import Card from './common/Card';

// Team aliases mapping to exact team name in database
const TEAM_ALIASES = {
  'aik': 'AIK',
  'gnaget': 'AIK',
  'häcken': 'BK Häcken',
  'bk häcken': 'BK Häcken',
  'getingarna': 'BK Häcken',
  'degerfors': 'Degerfors IF',
  'degerfors if': 'Degerfors IF',
  'djurgården': 'Djurgårdens IF',
  'djurgårdens if': 'Djurgårdens IF',
  'dif': 'Djurgårdens IF',
  'gais': 'GAIS',
  'makrillarna': 'GAIS',
  'halmstad': 'Halmstads BK',
  'halmstads bk': 'Halmstads BK',
  'hbk': 'Halmstads BK',
  'hammarby': 'Hammarby IF',
  'hammarby if': 'Hammarby IF',
  'bajen': 'Hammarby IF',
  'brommapojkarna': 'IF Brommapojkarna',
  'bp': 'IF Brommapojkarna',
  'elfsborg': 'IF Elfsborg',
  'if elfsborg': 'IF Elfsborg',
  'göteborg': 'IFK Göteborg',
  'ifk göteborg': 'IFK Göteborg',
  'blåvitt': 'IFK Göteborg',
  'änglarna': 'IFK Göteborg',
  'norrköping': 'IFK Norrköping',
  'ifk norrköping': 'IFK Norrköping',
  'peking': 'IFK Norrköping',
  'värnamo': 'IFK Värnamo',
  'ifk värnamo': 'IFK Värnamo',
  'sirius': 'IK Sirius',
  'ik sirius': 'IK Sirius',
  'blåsvart': 'IK Sirius',
  'kalmar': 'Kalmar FF',
  'kalmar ff': 'Kalmar FF',
  'kff': 'Kalmar FF',
  'malmö': 'Malmö FF',
  'malmö ff': 'Malmö FF',
  'mff': 'Malmö FF',
  'di blåe': 'Malmö FF',
  'mjällby': 'Mjällby AIF',
  'mjällby aif': 'Mjällby AIF',
  'maif': 'Mjällby AIF',
  'västerås': 'Västerås SK',
  'vsk': 'Västerås SK',
  'västerås sk': 'Västerås SK',
  'helsingborg': 'Helsingborgs IF',
  'helsingborgs if': 'Helsingborgs IF',
  'hif': 'Helsingborgs IF',
  'örebro': 'Örebro SK',
  'örebro sk': 'Örebro SK',
  'ösk': 'Örebro SK',
  'sundsvall': 'GIF Sundsvall',
  'gif sundsvall': 'GIF Sundsvall',
  'giffarna': 'GIF Sundsvall',
  'östersund': 'Östersunds FK',
  'östersunds fk': 'Östersunds FK',
  'öfk': 'Östersunds FK',
  'varberg': 'Varbergs BoIS',
  'varbergs bois': 'Varbergs BoIS',
  'falkenberg': 'Falkenbergs FF',
  'falkenbergs ff': 'Falkenbergs FF',
  'trelleborg': 'Trelleborgs FF',
  'trelleborgs ff': 'Trelleborgs FF',
  'jönköping': 'Jönköpings Södra IF',
  'j-södra': 'Jönköpings Södra IF',
  'jönköpings södra': 'Jönköpings Södra IF'
};

const SUGGESTIONS = [
  "Hur många mål gjorde Sirius 2018?",
  "Vad är Malmö FF:s längsta segersvit?",
  "Vem vann Allsvenskan 2024?",
  "Hur gick det för AIK säsongen 2023?"
];

export const AllsvenskanChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 'welcome', 
      sender: 'assistant', 
      text: 'Hej! Jag är din Allsvenskan-assistent. Fråga mig vad som helst om säsongerna 2017–2026. Jag räknar ut de exakta svaren live! ⚽🤖',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastTeam, setLastTeam] = useState(null);
  const [lastYear, setLastYear] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Extract team from string
  const findTeam = (text) => {
    const cleanText = text.toLowerCase();
    let bestMatch = null;
    let maxLen = 0;
    
    Object.keys(TEAM_ALIASES).forEach(alias => {
      // Look for boundary-friendly matching of alias
      const regex = new RegExp(`\\b${alias}\\b|${alias}`, 'i');
      if (regex.test(cleanText) && alias.length > maxLen) {
        bestMatch = TEAM_ALIASES[alias];
        maxLen = alias.length;
      }
    });
    return bestMatch;
  };

  // Extract year from string (2017-2026)
  const findYear = (text) => {
    const match = text.match(/\b(201[7-9]|202[0-6])\b/);
    return match ? parseInt(match[0]) : null;
  };

  // Live calculator helper
  const calculateAnswer = async (queryText) => {
    const query = queryText.toLowerCase();
    let year = findYear(query);
    let team = findTeam(query);

    // Resolve context for follow-up/complementary queries
    if (!team && lastTeam) {
      team = lastTeam;
    }
    if (!year && lastYear) {
      year = lastYear;
    }

    // Save context for future follow-ups
    if (team) setLastTeam(team);
    if (year) setLastYear(year);

    // Question patterns
    const isStreakQuery = query.includes('segersvit') || query.includes('vinstsvit') || query.includes('segrar i rad') || query.includes('vinster i rad') || query.includes('längsta svit') || query.includes('förlustfri') || query.includes('obesegrad') || query.includes('utan förlust');
    const isGoalsQuery = query.includes('mål') || query.includes('insläppta') || query.includes('målskillnad');
    const isWinnerQuery = query.includes('vann') || query.includes('vinnare') || query.includes('guld') || query.includes('mästare');
    const isPositionQuery = query.includes('placering') || query.includes('plats') || query.includes('slutade') || query.includes('position') || query.includes('poäng');

    try {
      // 1. STREAK QUERY
      if (isStreakQuery) {
        if (!team) {
          return "Jag hittade inget lag i din fråga. Fråga till exempel: 'Vad är Hammarbys längsta segersvit?'";
        }
        
        const isUndefeatedMode = query.includes('förlustfri') || query.includes('utan förlust') || query.includes('obesegrad') || query.includes('förlorade inte');
        const streakName = isUndefeatedMode ? 'förlustfria svit' : 'segersvit';
        
        setIsTyping(true);
        let overallMaxStreak = 0;
        let bestStreakDetails = null;

        if (year) {
          // Calculate for a single specific year
          const matchesUrl = year === 2026 ? '/data/allsvenskan_matches.json' : `/data/allsvenskan_matches_${year}.json`;
          try {
            const res = await fetch(matchesUrl);
            if (res.ok) {
              const data = await res.json();
              const matches = data.matches || [];
              matches.sort((a, b) => (a.startTimestamp || 0) - (b.startTimestamp || 0));

              let currentStreak = 0;
              matches.forEach(m => {
                const isHome = m.home === team;
                const isAway = m.away === team;
                if (!isHome && !isAway) return;

                const scores = m.score ? m.score.split('-').map(s => parseInt(s.trim())) : [];
                if (scores.length !== 2 || isNaN(scores[0]) || isNaN(scores[1])) return;

                const isWin = (isHome && scores[0] > scores[1]) || (isAway && scores[1] > scores[0]);
                const isLoss = (isHome && scores[0] < scores[1]) || (isAway && scores[1] < scores[0]);
                const isUndefeated = !isLoss;

                const isTargetSatisfied = isUndefeatedMode ? isUndefeated : isWin;

                if (isTargetSatisfied) {
                  currentStreak++;
                  if (currentStreak > overallMaxStreak) {
                    overallMaxStreak = currentStreak;
                  }
                } else {
                  currentStreak = 0;
                }
              });
            }
          } catch (e) {
            console.error('Failed to analyze year', year, e);
          }
        } else {
          // Calculate continuously across ALL seasons (inter-season)!
          const allSeasonsMatches = [];
          const years = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];

          for (const y of years) {
            const matchesUrl = y === 2026 ? '/data/allsvenskan_matches.json' : `/data/allsvenskan_matches_${y}.json`;
            try {
              const res = await fetch(matchesUrl);
              if (res.ok) {
                const data = await res.json();
                if (data.matches) {
                  data.matches.forEach(m => {
                    m.seasonYear = y;
                  });
                  allSeasonsMatches.push(...data.matches);
                }
              }
            } catch (e) {
              console.error('Failed to load year', y, e);
            }
          }

          // Sort absolutely everything chronologically
          allSeasonsMatches.sort((a, b) => (a.startTimestamp || 0) - (b.startTimestamp || 0));

          let currentStreak = 0;
          let streakStartYear = null;

          allSeasonsMatches.forEach(m => {
            const isHome = m.home === team;
            const isAway = m.away === team;
            if (!isHome && !isAway) return;

            const scores = m.score ? m.score.split('-').map(s => parseInt(s.trim())) : [];
            if (scores.length !== 2 || isNaN(scores[0]) || isNaN(scores[1])) return;

            const isWin = (isHome && scores[0] > scores[1]) || (isAway && scores[1] > scores[0]);
            const isLoss = (isHome && scores[0] < scores[1]) || (isAway && scores[1] < scores[0]);
            const isUndefeated = !isLoss;

            const isTargetSatisfied = isUndefeatedMode ? isUndefeated : isWin;

            if (isTargetSatisfied) {
              if (currentStreak === 0) {
                streakStartYear = m.seasonYear;
              }
              currentStreak++;
              if (currentStreak > overallMaxStreak) {
                overallMaxStreak = currentStreak;
                bestStreakDetails = {
                  startYear: streakStartYear,
                  endYear: m.seasonYear
                };
              }
            } else {
              currentStreak = 0;
            }
          });
        }

        if (overallMaxStreak === 0) {
          return `Jag kunde tyvärr inte hitta någon spelad ${streakName} för **${team}** under den efterfrågade perioden.`;
        }

        if (year) {
          return `Säsongen **${year}** hade **${team}** en längsta **${streakName}** på **${overallMaxStreak}** matcher i rad i Allsvenskan! 📈`;
        } else {
          const seasonText = bestStreakDetails.startYear === bestStreakDetails.endYear
            ? `under säsongen **${bestStreakDetails.startYear}**`
            : `över säsongerna **${bestStreakDetails.startYear}–${bestStreakDetails.endYear}**`;
          return `Mellan 2017 och 2026 är **${team}**s längsta **${streakName}** **${overallMaxStreak}** matcher i rad! Denna fantastiska svit uppnåddes ${seasonText}! ⭐`;
        }
      }

      // 2. GOALS QUERY
      if (isGoalsQuery) {
        if (!team) {
          return "Vilket lag menar du? Ställ en fråga i stil med: 'Hur många mål gjorde Sirius 2018?'";
        }
        if (!year) {
          return `Vilket år vill du veta målen för? Fråga till exempel: 'Hur många mål gjorde **${team} 2024**?'`;
        }

        const tableUrl = year === 2026 ? '/data/allsvenskan_table.json' : `/data/allsvenskan_table_${year}.json`;
        const res = await fetch(tableUrl);
        if (!res.ok) throw new Error('Data saknas');
        const data = await res.json();
        const row = data.table?.find(r => r.team === team);

        if (!row) {
          return `Hittade tyvärr ingen data för **${team}** i Allsvenskan säsongen **${year}**. Spelade de i en annan division det året?`;
        }

        const [made, conceded] = row.goals.split('-').map(Number);
        return `Säsongen **${year}** gjorde **${team}** totalt **${made}** mål och släppte in **${conceded}** mål på ${row.played} matcher (målskillnad: ${row.gd > 0 ? '+' + row.gd : row.gd}). De slutade på plats **${row.rank}** med **${row.points}** poäng! ⚽`;
      }

      // 3. WINNER QUERY
      if (isWinnerQuery) {
        if (!year) {
          return "Vilket år menar du? Fråga till exempel: 'Vem vann Allsvenskan 2024?'";
        }

        const tableUrl = year === 2026 ? '/data/allsvenskan_table.json' : `/data/allsvenskan_table_${year}.json`;
        const res = await fetch(tableUrl);
        if (!res.ok) throw new Error('Data saknas');
        const data = await res.json();
        
        const winner = data.table?.[0];
        const runnerUp = data.table?.[1];

        if (!winner) {
          return `Kunde inte hitta vinnaren för säsongen ${year}. Kontrollera att det är ett giltigt år (2017–2026).`;
        }

        return `Säsongen **${year}** vanns Allsvenskan av **${winner.team}** som samlade ihop **${winner.points}** poäng! 🏆 De vann ${winner.won} matcher, spelade oavgjort ${winner.drawn} och förlorade endast ${winner.lost} matcher. Tvåa kom **${runnerUp?.team || 'Okänt'}** på **${runnerUp?.points || 0}** poäng.`;
      }

      // 4. POSITION / PLACEMENT QUERY
      if (isPositionQuery) {
        if (!team) {
          return "Vilket lag menar du? Fråga till exempel: 'Vilken placering fick AIK 2021?'";
        }
        if (!year) {
          return `Vilket år menar du? Fråga till exempel: 'Hur gick det för **${team} 2023**?'`;
        }

        const tableUrl = year === 2026 ? '/data/allsvenskan_table.json' : `/data/allsvenskan_table_${year}.json`;
        const res = await fetch(tableUrl);
        if (!res.ok) throw new Error('Data saknas');
        const data = await res.json();
        
        const row = data.table?.find(r => r.team === team);
        if (!row) {
          return `Hittade ingen tabellplacering för **${team}** säsongen **${year}**.`;
        }

        return `Säsongen **${year}** slutade **${team}** på plats **${row.rank}** i Allsvenskan med **${row.points}** poäng! De vann ${row.won} matcher, spelade oavgjort ${row.drawn} och förlorade ${row.lost} matcher (målskillnad: ${row.goals}).`;
      }

      // Default fallback conversational reply
      return "Intressant fråga! Jag är en lokal dataanalytiker, och bäst på att räkna ut lagstatistik (segersviter, gjorda/insläppta mål, placeringar, vinnare och poäng per säsong). Prova att ställa en fråga med ett specifikt lag (t.ex. Sirius, MFF, AIK) och år (2017–2026)! 📊";

    } catch (err) {
      console.error(err);
      return `Hittade ingen data för säsongen **${year || '2026'}**. Är du säker på att du angav ett år mellan 2017 och 2026?`;
    }
  };

  const handleSend = async (textToSend) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate thinking/typing animation
    setTimeout(async () => {
      const answer = await calculateAnswer(text);
      
      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: answer,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (navigator.vibrate) navigator.vibrate(10);
        }}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '28px',
          backgroundColor: '#000000',
          color: '#ffffff',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          zIndex: 10000,
          transform: isOpen ? 'rotate(90deg)' : 'scale(1)'
        }}
        className="premium-chat-fab"
        aria-label="Öppna chatt-assistent"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '20px',
            width: '360px',
            height: '480px',
            maxHeight: 'calc(100vh - 120px)',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: '24px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 9999,
            transition: 'all 0.3s ease',
            animation: 'chatSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          className="premium-chat-window"
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: '#000000',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} style={{ color: '#ffcc00' }} />
              <span style={{ fontWeight: '800', fontSize: '0.95rem', letterSpacing: '-0.02em' }}>
                Allsvenskan AI-Koll
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.7)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s'
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              scrollBehavior: 'smooth'
            }}
            className="chat-messages-container"
          >
            {messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div
                  style={{
                    backgroundColor: msg.sender === 'user' ? '#000000' : 'rgba(0,0,0,0.05)',
                    color: msg.sender === 'user' ? '#ffffff' : '#000000',
                    padding: '12px 16px',
                    borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    fontSize: '0.85rem',
                    lineHeight: '1.4',
                    fontWeight: msg.sender === 'user' ? '500' : '500',
                    boxShadow: msg.sender === 'user' ? 'var(--shadow-sm)' : 'none',
                    whiteSpace: 'pre-wrap'
                  }}
                  dangerouslySetInnerHTML={{ 
                    // Support bold markdown syntaxes
                    __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                  }}
                />
                <span
                  style={{
                    fontSize: '0.65rem',
                    color: 'var(--color-text-muted)',
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    margin: '0 4px'
                  }}
                >
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}

            {isTyping && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '18px 18px 18px 4px' }}>
                <div className="chat-dot" style={{ width: '6px', height: '6px', backgroundColor: '#8e8e93', borderRadius: '50%', animation: 'chatDot 1.4s infinite ease-in-out' }} />
                <div className="chat-dot" style={{ width: '6px', height: '6px', backgroundColor: '#8e8e93', borderRadius: '50%', animation: 'chatDot 1.4s infinite ease-in-out 0.2s' }} />
                <div className="chat-dot" style={{ width: '6px', height: '6px', backgroundColor: '#8e8e93', borderRadius: '50%', animation: 'chatDot 1.4s infinite ease-in-out 0.4s' }} />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length === 1 && !isTyping && (
            <div
              style={{
                padding: '0 16px 12px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Förslag på frågor:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {SUGGESTIONS.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(s)}
                    style={{
                      padding: '8px 12px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textAlign: 'left',
                      backgroundColor: 'rgba(0,0,0,0.04)',
                      border: '1px solid rgba(0,0,0,0.06)',
                      borderRadius: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      color: 'var(--color-text)'
                    }}
                    className="premium-suggestion-btn"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input field */}
          <div
            style={{
              padding: '16px',
              borderTop: '1px solid rgba(0,0,0,0.06)',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.6)'
            }}
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              placeholder="Ställ en fråga till databasen..."
              style={{
                flex: 1,
                padding: '12px 16px',
                fontSize: '0.85rem',
                backgroundColor: 'rgba(0,0,0,0.04)',
                border: '1px solid rgba(0,0,0,0.06)',
                borderRadius: '20px',
                outline: 'none',
                fontWeight: '500',
                color: 'var(--color-text)',
                transition: 'border-color 0.2s'
              }}
            />
            <button
              onClick={() => handleSend()}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '21px',
                backgroundColor: '#000000',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-sm)',
                transition: 'transform 0.2s'
              }}
              className="premium-chat-send"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
      
      {/* Dynamic Keyframes for smooth chat transition */}
      <style>{`
        @keyframes chatSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes chatDot {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
        .premium-chat-fab:hover {
          transform: scale(1.08) !important;
        }
        .premium-chat-fab:active {
          transform: scale(0.95) !important;
        }
        .premium-chat-send:active {
          transform: scale(0.9) !important;
        }
        .premium-suggestion-btn:hover {
          background-color: rgba(0,0,0,0.08) !important;
          border-color: rgba(0,0,0,0.12) !important;
        }
      `}</style>
    </>
  );
};
