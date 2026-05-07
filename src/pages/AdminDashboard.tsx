import React, { useEffect, useState } from 'react';
import { fetchScheduleData, fetchEquipmentData, type ScheduleItem, type EquipmentItem } from '../services/googleSheets';
import { X, CheckCircle } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<ScheduleItem | null>(null);
  const [showChecklist, setShowChecklist] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [schedData, equipData] = await Promise.all([
          fetchScheduleData(),
          fetchEquipmentData()
        ]);
        setSchedule(schedData);
        setEquipment(equipData);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const ongoingProgram = schedule.find(item => item.Status?.toLowerCase() === 'ongoing');
  const upcomingPrograms = schedule.filter(item => item.Status?.toLowerCase() === 'upcoming');

  // Filter schedule by date
  const filteredSchedule = selectedDateFilter 
    ? schedule.filter(item => item.Date === selectedDateFilter)
    : schedule;

  const uniqueDates = Array.from(new Set(schedule.map(item => item.Date).filter(Boolean)));

  const handleCloseEventClick = () => {
    setShowChecklist(true);
  };

  const handleConfirmChecklist = () => {
    if (selectedEvent) {
      setSchedule(prev => prev.map(item => 
        item.Schedule_ID === selectedEvent.Schedule_ID 
          ? { ...item, Status: 'Completed' } 
          : item
      ));
    }
    setShowChecklist(false);
    setSelectedEvent(null);
  };

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
          <h3 style={{ marginTop: 'var(--spacing-xs)', color: 'var(--color-error)' }}>2 Items Needs Repair</h3>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
        <h3>Jadwal Operasional</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
          <label className="label-caps text-dim" style={{ fontSize: '12px', color: 'var(--color-outline)' }}>Filter Date:</label>
          <select 
            value={selectedDateFilter} 
            onChange={(e) => setSelectedDateFilter(e.target.value)}
            style={{ 
              background: 'var(--color-surface-container)', 
              color: 'var(--color-on-surface)', 
              border: '1px solid var(--color-border)', 
              padding: 'var(--spacing-xs) var(--spacing-sm)', 
              borderRadius: 'var(--radius-sm)' 
            }}
          >
            <option value="">All Days</option>
            {uniqueDates.map(date => (
              <option key={date} value={date}>{date}</option>
            ))}
          </select>
        </div>
      </div>

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
              {filteredSchedule.map((item, index) => (
                <tr 
                  key={index} 
                  onClick={() => setSelectedEvent(item)}
                  style={{ 
                    borderBottom: index !== filteredSchedule.length - 1 ? '1px solid var(--color-border)' : 'none',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-container-high)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
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
                      color: item.Status?.toLowerCase() === 'ongoing' ? 'var(--color-vibrant-green)' : item.Status?.toLowerCase() === 'completed' ? 'var(--color-outline)' : 'var(--color-primary)' 
                    }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
                      <span className="label-caps">{item.Status}</span>
                    </span>
                  </td>
                </tr>
              ))}
              {filteredSchedule.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: 'var(--spacing-md)', textAlign: 'center', color: 'var(--color-outline)' }}>No schedules found for this date.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* SCHEDULE DETAILS MODAL */}
      {selectedEvent && !showChecklist && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', width: '100%', maxWidth: '600px', backgroundColor: 'var(--color-surface-container-lowest)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
              <div>
                <h3 style={{ margin: 0 }}>{selectedEvent.Program_Name}</h3>
                <span className="label-caps text-dim">{selectedEvent.Schedule_ID}</span>
              </div>
              <button onClick={() => setSelectedEvent(null)} style={{ background: 'transparent', border: 'none', color: 'var(--color-outline)', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
              <div style={{ background: 'var(--color-surface-container)', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-sm)' }}>
                <div className="label-caps text-dim">Time</div>
                <div>{selectedEvent.Date} | {selectedEvent.Start_Time} - {selectedEvent.End_Time}</div>
              </div>
              <div style={{ background: 'var(--color-surface-container)', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-sm)' }}>
                <div className="label-caps text-dim">Location</div>
                <div>{selectedEvent.Location}</div>
              </div>
              <div style={{ background: 'var(--color-surface-container)', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-sm)' }}>
                <div className="label-caps text-dim">PIC</div>
                <div>{selectedEvent.PIC}</div>
              </div>
              <div style={{ background: 'var(--color-surface-container)', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-sm)' }}>
                <div className="label-caps text-dim">Status</div>
                <div style={{ color: selectedEvent.Status?.toLowerCase() === 'ongoing' ? 'var(--color-vibrant-green)' : 'var(--color-primary)', fontWeight: 600 }}>{selectedEvent.Status}</div>
              </div>
            </div>

            <h4 style={{ marginBottom: 'var(--spacing-xs)' }}>Assigned Equipment</h4>
            <div style={{ background: 'var(--color-surface-container)', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-sm)', maxHeight: '150px', overflowY: 'auto' }}>
               {equipment.slice(0, 4).map(eq => (
                 <div key={eq.Equipment_ID} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', padding: '4px 0' }}>
                   <span>{eq.Item_Name} <small className="text-dim">({eq.Category})</small></span>
                   <span className="text-dim">{eq.Equipment_ID}</span>
                 </div>
               ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-lg)' }}>
              {selectedEvent.Status?.toLowerCase() === 'ongoing' && (
                <button 
                  onClick={handleCloseEventClick} 
                  style={{ padding: '8px 16px', background: 'var(--color-error)', color: 'white', border: 'none', borderRadius: 'var(--radius-base)', cursor: 'pointer', fontWeight: 600 }}
                >
                  CLOSE EVENT
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EQUIPMENT CHECKLIST MODAL */}
      {showChecklist && selectedEvent && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', width: '100%', maxWidth: '500px', backgroundColor: 'var(--color-surface-container-lowest)' }}>
            <h3 style={{ marginBottom: 'var(--spacing-xs)', color: 'var(--color-error)' }}>Return Checklist</h3>
            <p className="text-dim" style={{ marginBottom: 'var(--spacing-md)' }}>Verify all assigned equipment is returned in good condition before closing the event.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)' }}>
              {equipment.slice(0, 4).map((eq, i) => (
                <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', background: 'var(--color-surface-container)', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>{eq.Item_Name}</div>
                    <div className="text-dim" style={{ fontSize: '12px' }}>{eq.Equipment_ID}</div>
                  </div>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-sm)' }}>
              <button 
                onClick={() => setShowChecklist(false)} 
                style={{ padding: '8px 16px', background: 'transparent', color: 'var(--color-on-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-base)', cursor: 'pointer', fontWeight: 600 }}
              >
                CANCEL
              </button>
              <button 
                onClick={handleConfirmChecklist} 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'var(--color-vibrant-green)', color: 'black', border: 'none', borderRadius: 'var(--radius-base)', cursor: 'pointer', fontWeight: 600 }}
              >
                <CheckCircle size={18} />
                CONFIRM & CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
