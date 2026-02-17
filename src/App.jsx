import React, { useState, useMemo, useEffect } from 'react';
import { fetchSchedule, fetchSokSchedule } from './services/olympicsApi';
import DayGroup from './components/DayGroup';
import FilterBar from './components/FilterBar';
import SokSchedule from './components/SokSchedule';
import { Snowflake } from 'lucide-react';

function App() {
  const [now, setNow] = useState(new Date());
  const [schedule, setSchedule] = useState([]);
  const [sokSchedule, setSokSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');



  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [data, sokData] = await Promise.all([
          fetchSchedule(),
          fetchSokSchedule()
        ]);
        setSchedule(data);
        setSokSchedule(sokData);
      } catch (error) {
        console.error("Failed to fetch schedule:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredEvents = useMemo(() => {
    const cutoff = new Date(now.getTime() - 3 * 60 * 60 * 1000); // Keep events from last 3 hours

    return schedule.filter(event => {
      // Filter by time (Hide past events)
      const eventTime = new Date(`${event.date}T${event.time}`);
      if (isNaN(eventTime.getTime())) return false;

      return eventTime >= cutoff;
    }).filter(event => {
      if (activeFilter === 'sweden') return event.isSweden;
      if (activeFilter === 'medal') return event.isMedal;
      return true; // 'all'
    });
  }, [now, schedule, activeFilter]);

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

  if (loading) {
    return (
      <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--color-text-muted)' }}>
        Laddar schema...
      </div>
    );
  }

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





      {sokSchedule.length > 0 && (
        <SokSchedule events={sokSchedule} />
      )}

      {Object.keys(groupedEvents).length > 0 && (
        Object.keys(groupedEvents).sort().map(date => (
          <DayGroup
            key={date}
            date={date}
            events={groupedEvents[date].sort((a, b) => a.time.localeCompare(b.time))}
          />
        ))
      )}
    </div>
  );
}

export default App;
