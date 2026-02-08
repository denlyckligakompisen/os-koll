import React, { useState, useMemo } from 'react';
import { schedule } from './data/schedule';
import DayGroup from './components/DayGroup';
import FilterBar from './components/FilterBar';
import { Snowflake } from 'lucide-react';

const FILTERS = [
  { id: 'all', label: 'Alla' },
  { id: 'svt', label: 'SVT' },
  { id: 'tv4', label: 'TV4' },
  { id: 'max', label: 'Max' },
  { id: 'medal', label: 'Medaljchans' },
  { id: 'sweden', label: 'Sverige' }
];

function App() {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredEvents = useMemo(() => {
    return schedule.filter(event => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'medal') return event.isMedal;
      if (activeFilter === 'sweden') return event.isSweden;
      // Channel filters
      if (['svt', 'tv4', 'max'].includes(activeFilter)) {
        return event.channel.toLowerCase().includes(activeFilter);
      }
      return true;
    });
  }, [activeFilter]);

  const groupedEvents = useMemo(() => {
    const groups = {};
    filteredEvents.forEach(event => {
      if (!groups[event.date]) {
        groups[event.date] = [];
      }
      groups[event.date].push(event);
    });
    return groups;
  }, [filteredEvents]);

  return (
    <div className="app-container">
      <header style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px',
        paddingTop: '12px'
      }}>
        <div style={{
          backgroundColor: 'var(--color-secondary)',
          padding: '10px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Snowflake size={24} color="#fca311" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>OS-Kollen</h1>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Vinter-OS 2026</p>
        </div>
      </header>

      <FilterBar
        filters={FILTERS}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {Object.keys(groupedEvents).length > 0 ? (
        Object.keys(groupedEvents).sort().map(date => (
          <DayGroup
            key={date}
            date={date}
            events={groupedEvents[date].sort((a, b) => a.time.localeCompare(b.time))}
          />
        ))
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
          Inga evenemang hittades för detta val.
        </div>
      )}
    </div>
  );
}

export default App;
