import React, { useEffect, useState } from 'react';
import { fetchScheduleData, type ScheduleItem } from '../services/googleSheets';

const AdminDashboard: React.FC = () => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchScheduleData();
        setSchedule(data);
      } catch (error) {
        console.error("Failed to fetch schedule data", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const ongoingProgram = schedule.find(item => item.Status?.toLowerCase() === 'ongoing');
  const upcomingPrograms = schedule.filter(item => item.Status?.toLowerCase() === 'upcoming');

  return (
    <div>
      <h2 style={{ marginBottom: 'var(--spacing-md)' }}>Dashboard Terpadu</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
        {/* Metric Cards */}
        <div className="glass-panel" style={{ padding: 'var(--spacing-md)' }}>
          <p className="label-caps" style={{ color: 'var(--color-outline)' }}>ON-AIR STATUS</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-xs)' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: ongoingProgram ? 'var(--color-vibrant-green)' : 'var(--color-outline)', boxShadow: ongoingProgram ? '0 0 10px var(--color-vibrant-green)' : 'none' }} />
            <h3 style={{ color: ongoingProgram ? 'var(--color-vibrant-green)' : 'var(--color-outline)' }}>{ongoingProgram ? 'LIVE' : 'OFF-AIR'}</h3>
          </div>
          {ongoingProgram && (
            <p className="text-dim" style={{ marginTop: 'var(--spacing-xs)' }}>{ongoingProgram.Program_Name}</p>
          )}
        </div>

        <div className="glass-panel" style={{ padding: 'var(--spacing-md)' }}>
          <p className="label-caps" style={{ color: 'var(--color-outline)' }}>NEXT UPCOMING</p>
          {upcomingPrograms.length > 0 ? (
            <>
              <h3 style={{ marginTop: 'var(--spacing-xs)' }}>{upcomingPrograms[0].Program_Name}</h3>
              <p className="text-dim">{upcomingPrograms[0].Start_Time} - {upcomingPrograms[0].End_Time} WIB</p>
            </>
          ) : (
            <p className="text-dim" style={{ marginTop: 'var(--spacing-xs)' }}>No upcoming schedules.</p>
          )}
        </div>

        <div className="glass-panel" style={{ padding: 'var(--spacing-md)' }}>
          <p className="label-caps" style={{ color: 'var(--color-outline)' }}>EQUIPMENT ALERTS</p>
          <h3 style={{ marginTop: 'var(--spacing-xs)', color: 'var(--color-error)' }}>2 Items Overdue</h3>
        </div>
      </div>

      <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Jadwal Operasional (Synced with Google Sheets)</h3>
      <div className="glass-panel" style={{ overflowX: 'auto', padding: 0 }}>
        {loading ? (
          <div style={{ padding: 'var(--spacing-md)', textAlign: 'center', color: 'var(--color-outline)' }}>
            Loading from Google Sheets...
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: 'var(--color-surface-container)' }}>
              <tr>
                <th className="label-caps" style={{ padding: 'var(--spacing-sm) var(--spacing-md)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-outline)' }}>ID</th>
                <th className="label-caps" style={{ padding: 'var(--spacing-sm) var(--spacing-md)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-outline)' }}>Program Name</th>
                <th className="label-caps" style={{ padding: 'var(--spacing-sm) var(--spacing-md)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-outline)' }}>Date / Time</th>
                <th className="label-caps" style={{ padding: 'var(--spacing-sm) var(--spacing-md)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-outline)' }}>Location</th>
                <th className="label-caps" style={{ padding: 'var(--spacing-sm) var(--spacing-md)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-outline)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((item, index) => (
                <tr key={index} style={{ borderBottom: index !== schedule.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                  <td style={{ padding: 'var(--spacing-sm) var(--spacing-md)' }}><small className="text-dim">{item.Schedule_ID}</small></td>
                  <td style={{ padding: 'var(--spacing-sm) var(--spacing-md)', fontWeight: 600 }}>{item.Program_Name}</td>
                  <td style={{ padding: 'var(--spacing-sm) var(--spacing-md)' }}>
                    <small>{item.Date}</small><br />
                    <small className="text-dim">{item.Start_Time} - {item.End_Time}</small>
                  </td>
                  <td style={{ padding: 'var(--spacing-sm) var(--spacing-md)' }}>{item.Location}</td>
                  <td style={{ padding: 'var(--spacing-sm) var(--spacing-md)' }}>
                    <span style={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: item.Status?.toLowerCase() === 'ongoing' ? 'var(--color-vibrant-green)' : 'var(--color-outline)' 
                    }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
                      <span className="label-caps">{item.Status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
