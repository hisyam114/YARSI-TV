import React, { useEffect, useState } from 'react';
import { fetchScheduleData, type ScheduleItem } from '../services/googleSheets';

const LandingPage: React.FC = () => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchScheduleData();
        const activeSchedules = data.filter(item => item.Status?.toLowerCase() !== 'completed');
        // Sort to ensure 'Ongoing' is at the top
        activeSchedules.sort((a, b) => {
          if (a.Status?.toLowerCase() === 'ongoing') return -1;
          if (b.Status?.toLowerCase() === 'ongoing') return 1;
          return 0;
        });
        setSchedule(activeSchedules);
      } catch (error) {
        console.error("Failed to fetch schedule data", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div style={{ padding: 'var(--spacing-lg)', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <div>
          <h1 style={{ color: 'var(--color-primary)' }}>YARSI TV</h1>
          <p className="text-dim">Crew Portal & Public Schedule</p>
        </div>
        <a href="#/login" style={{ 
          background: 'var(--color-surface-container)', 
          color: 'var(--color-on-surface)',
          border: '1px solid var(--color-border)',
          padding: 'var(--spacing-sm) var(--spacing-md)',
          borderRadius: 'var(--radius-base)',
          fontWeight: 600,
          display: 'inline-block'
        }}>
          Control Room Login
        </a>
      </header>

      <section>
        <h2 style={{ marginBottom: 'var(--spacing-md)' }}>Upcoming Broadcasts</h2>
        
        {loading ? (
          <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--color-outline)' }}>
            Loading Live Schedule...
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-md)' }}>
            {schedule.map((item, index) => (
              <div key={index} className="glass-panel" style={{ padding: 'var(--spacing-md)', borderLeft: item.Status?.toLowerCase() === 'ongoing' ? '4px solid var(--color-vibrant-green)' : '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-sm)' }}>
                  <h3 style={{ margin: 0, color: item.Status?.toLowerCase() === 'ongoing' ? 'var(--color-vibrant-green)' : 'var(--color-on-surface)' }}>{item.Program_Name}</h3>
                  <span className="label-caps" style={{ 
                    padding: 'var(--spacing-xs) var(--spacing-sm)', 
                    backgroundColor: item.Status?.toLowerCase() === 'ongoing' ? 'rgba(0, 255, 65, 0.1)' : 'var(--color-surface-container-high)',
                    color: item.Status?.toLowerCase() === 'ongoing' ? 'var(--color-vibrant-green)' : 'var(--color-outline)',
                    borderRadius: 'var(--radius-full)'
                  }}>
                    {item.Status}
                  </span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', marginTop: 'var(--spacing-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-dim label-caps">Date</span>
                    <span>{item.Date}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-dim label-caps">Time</span>
                    <span>{item.Start_Time} - {item.End_Time}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-dim label-caps">Location</span>
                    <span>{item.Location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default LandingPage;
