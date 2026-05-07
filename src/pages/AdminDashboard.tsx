import React, { useEffect, useState } from 'react';
import { fetchScheduleData, fetchEquipmentData, executeApi, type ScheduleItem, type EquipmentItem } from '../services/googleSheets';
import { X, CheckCircle, Edit, Trash2, Save } from 'lucide-react';
import { showToast } from '../utils/toast';
import { parseSheetDate, normalizeDateToISO, formatDateToDDMMYYYY } from '../utils/dateUtils';

const getStatusColor = (status?: string) => {
  const s = status?.toLowerCase() || '';
  if (s === 'ongoing') return 'var(--color-vibrant-green)';
  if (s === 'upcoming') return 'var(--color-outline)';
  if (s === 'done' || s === 'completed') return 'var(--color-primary)';
  if (s === 'cancelled') return 'var(--color-error)';
  return 'var(--color-outline)';
};

const AdminDashboard: React.FC = () => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Get today in YYYY-MM-DD (internal format) for filtering
  const getTodayISO = () => new Date().toISOString().split('T')[0];
  
  // Filter starts OFF — empty string means show all (from today)
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('');  
  // For the custom DD/MM/YYYY input display
  const [filterDisplayValue, setFilterDisplayValue] = useState<string>('');
  
  const [selectedEvent, setSelectedEvent] = useState<ScheduleItem | null>(null);
  const [showChecklist, setShowChecklist] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<ScheduleItem | null>(null);
  // All authenticated users can edit schedules according to new rules

  useEffect(() => {
    const loadData = async () => {
      try {
        const [schedData, equipData] = await Promise.all([
          fetchScheduleData(),
          fetchEquipmentData()
        ]);
        
        // Sort: today & future first (ascending), past at the bottom
        const todayISO = getTodayISO();
        schedData.sort((a, b) => {
          const dateA = parseSheetDate(a.Date, a.Start_Time);
          const dateB = parseSheetDate(b.Date, b.Start_Time);
          const todayDate = new Date(todayISO + 'T00:00');
          const aIsPast = dateA < todayDate;
          const bIsPast = dateB < todayDate;
          if (aIsPast !== bIsPast) return aIsPast ? 1 : -1;
          return dateA.getTime() - dateB.getTime();
        });

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

  // Filter schedule by datepicker — no filter shows all from today onwards
  const todayISO = getTodayISO();
  const filteredSchedule = selectedDateFilter 
    ? schedule.filter(item => normalizeDateToISO(item.Date) === selectedDateFilter)
    : schedule.filter(item => normalizeDateToISO(item.Date) >= todayISO);

  const handleCloseEventClick = () => {
    setShowChecklist(true);
  };

  const handleConfirmChecklist = async () => {
    if (selectedEvent) {
      const updatedEvent = { ...selectedEvent, Status: 'Done' };
      const success = await executeApi('Schedules', 'update', updatedEvent);
      if (success) {
        setSchedule(prev => prev.map(item => 
          item.Schedule_ID === selectedEvent.Schedule_ID ? updatedEvent : item
        ));
        setShowChecklist(false);
        setSelectedEvent(null);
        showToast(`"${selectedEvent.Program_Name}" marked as Done.`, 'success');
      } else {
        showToast('Failed to update status.', 'error');
      }
    }
  };

  const handleSaveEdit = async () => {
    if (editFormData) {
      const success = await executeApi('Schedules', 'update', editFormData);
      if (success) {
        setSchedule(prev => prev.map(item => 
          item.Schedule_ID === editFormData.Schedule_ID ? editFormData : item
        ));
        setSelectedEvent(editFormData);
        setIsEditing(false);
        showToast(`"${editFormData.Program_Name}" updated.`, 'success');
      } else {
        showToast('Failed to save changes.', 'error');
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      if (selectedEvent) {
        const success = await executeApi('Schedules', 'delete', selectedEvent);
        if (success) {
          setSchedule(prev => prev.filter(item => item.Schedule_ID !== selectedEvent.Schedule_ID));
          showToast(`Schedule "${selectedEvent.Program_Name}" deleted.`, 'info');
          setSelectedEvent(null);
          setIsEditing(false);
        } else {
          showToast('Failed to delete schedule.', 'error');
        }
      }
    }
  };

  const openModal = (item: ScheduleItem) => {
    setSelectedEvent(item);
    setEditFormData(item);
    setIsEditing(false);
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
          <input 
            type="text"
            placeholder="DD/MM/YYYY"
            value={filterDisplayValue} 
            onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, '').slice(0, 8);
              let display = raw;
              if (raw.length >= 3) display = raw.slice(0,2) + '/' + raw.slice(2);
              if (raw.length >= 5) display = raw.slice(0,2) + '/' + raw.slice(2,4) + '/' + raw.slice(4);
              setFilterDisplayValue(display);
              // Convert DD/MM/YYYY → YYYY-MM-DD for internal filtering
              if (raw.length === 8) {
                const dd = raw.slice(0,2), mm = raw.slice(2,4), yyyy = raw.slice(4,8);
                setSelectedDateFilter(`${yyyy}-${mm}-${dd}`);
              } else {
                setSelectedDateFilter('');
              }
            }}
            style={{ 
              background: 'var(--color-surface-container)', 
              color: 'var(--color-on-surface)', 
              border: '1px solid var(--color-border)', 
              padding: 'var(--spacing-xs) var(--spacing-sm)', 
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-primary)',
              width: '110px',
              letterSpacing: '0.05em'
            }}
          />
          {selectedDateFilter && (
            <button 
              onClick={() => { setSelectedDateFilter(''); setFilterDisplayValue(''); }}
              style={{ background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-outline)', padding: 'var(--spacing-xs) var(--spacing-sm)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
            >
              Clear
            </button>
          )}
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
                <th className="label-caps" style={{ padding: 'var(--spacing-sm) var(--spacing-md)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-outline)', textAlign: 'center' }}>Date</th>
                <th className="label-caps" style={{ padding: 'var(--spacing-sm) var(--spacing-md)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-outline)', textAlign: 'center' }}>Time</th>
                <th className="label-caps" style={{ padding: 'var(--spacing-sm) var(--spacing-md)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-outline)' }}>Location</th>
                <th className="label-caps" style={{ padding: 'var(--spacing-sm) var(--spacing-md)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-outline)' }}>PIC</th>
                <th className="label-caps" style={{ padding: 'var(--spacing-sm) var(--spacing-md)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-outline)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedule.map((item, index) => {
                const sColor = getStatusColor(item.Status);
                const isDone = item.Status?.toLowerCase() === 'done' || item.Status?.toLowerCase() === 'completed';
                
                return (
                  <tr 
                    key={index} 
                    onClick={() => openModal(item)}
                    style={{ 
                      borderBottom: index !== filteredSchedule.length - 1 ? '1px solid var(--color-border)' : 'none',
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-container-high)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: 'var(--spacing-sm) var(--spacing-md)' }}><small className="text-dim">{item.Schedule_ID}</small></td>
                    <td style={{ padding: 'var(--spacing-sm) var(--spacing-md)', fontWeight: 600 }}>{item.Program_Name}</td>
                    <td style={{ padding: 'var(--spacing-sm) var(--spacing-md)', textAlign: 'center' }}>
                      <small>{formatDateToDDMMYYYY(item.Date)}</small>
                    </td>
                    <td style={{ padding: 'var(--spacing-sm) var(--spacing-md)', textAlign: 'center' }}>
                      <small className="text-dim">{item.Start_Time} - {item.End_Time}</small>
                    </td>
                    <td style={{ padding: 'var(--spacing-sm) var(--spacing-md)' }}>{item.Location}</td>
                    <td style={{ padding: 'var(--spacing-sm) var(--spacing-md)' }}>{item.PIC}</td>
                    <td style={{ padding: 'var(--spacing-sm) var(--spacing-md)' }}>
                      <span style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: sColor
                      }}>
                        {isDone ? <CheckCircle size={14} /> : <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }} />}
                        <span className="label-caps">{item.Status}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredSchedule.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: 'var(--spacing-md)', textAlign: 'center', color: 'var(--color-outline)' }}>No schedules found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* SCHEDULE DETAILS / EDIT MODAL */}
      {selectedEvent && !showChecklist && editFormData && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', width: '100%', maxWidth: '600px', backgroundColor: 'var(--color-surface-container-lowest)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
              <div>
                {isEditing ? (
                  <input 
                    value={editFormData.Program_Name} 
                    onChange={e => setEditFormData({...editFormData, Program_Name: e.target.value})}
                    style={{ fontSize: '18px', fontWeight: 'bold', background: 'var(--color-surface-container)', color: 'white', padding: '4px 8px', border: '1px solid var(--color-border)', borderRadius: '4px', width: '300px' }}
                  />
                ) : (
                  <h3 style={{ margin: 0 }}>{selectedEvent.Program_Name}</h3>
                )}
                <span className="label-caps text-dim" style={{ display: 'block', marginTop: '4px' }}>{selectedEvent.Schedule_ID}</span>
              </div>
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                {!isEditing && (
                  <>
                    <button onClick={() => setIsEditing(true)} style={{ background: 'var(--color-surface-container)', border: '1px solid var(--color-border)', color: 'var(--color-on-surface)', cursor: 'pointer', padding: '6px', borderRadius: '4px' }}><Edit size={18} /></button>
                    <button onClick={handleDelete} style={{ background: 'var(--color-error-container)', border: '1px solid var(--color-error)', color: 'var(--color-error)', cursor: 'pointer', padding: '6px', borderRadius: '4px' }}><Trash2 size={18} /></button>
                  </>
                )}
                <button onClick={() => setSelectedEvent(null)} style={{ background: 'transparent', border: 'none', color: 'var(--color-outline)', cursor: 'pointer', padding: '6px' }}><X size={24} /></button>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
              {/* DATE COLUMN */}
              <div style={{ background: 'var(--color-surface-container)', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-sm)' }}>
                <div className="label-caps text-dim">Date</div>
                {isEditing ? (
                  <input type="date" value={editFormData.Date} onChange={e => setEditFormData({...editFormData, Date: e.target.value})} style={{ background: 'var(--color-surface-container-high)', color: 'white', padding: '4px', border: '1px solid var(--color-border)', borderRadius: '4px', width: '100%', colorScheme: 'dark' }} />
                ) : (
                  <div>{formatDateToDDMMYYYY(selectedEvent.Date)}</div>
                )}
              </div>
              
              {/* TIME COLUMN */}
              <div style={{ background: 'var(--color-surface-container)', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-sm)' }}>
                <div className="label-caps text-dim">Time</div>
                {isEditing ? (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input type="time" value={editFormData.Start_Time} onChange={e => setEditFormData({...editFormData, Start_Time: e.target.value})} style={{ background: 'var(--color-surface-container-high)', color: 'white', padding: '4px', border: '1px solid var(--color-border)', borderRadius: '4px', width: '100%', colorScheme: 'dark' }} />
                    <span>-</span>
                    <input type="time" value={editFormData.End_Time} onChange={e => setEditFormData({...editFormData, End_Time: e.target.value})} style={{ background: 'var(--color-surface-container-high)', color: 'white', padding: '4px', border: '1px solid var(--color-border)', borderRadius: '4px', width: '100%', colorScheme: 'dark' }} />
                  </div>
                ) : (
                  <div>{selectedEvent.Start_Time} - {selectedEvent.End_Time}</div>
                )}
              </div>

              <div style={{ background: 'var(--color-surface-container)', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-sm)' }}>
                <div className="label-caps text-dim">Location</div>
                {isEditing ? (
                  <input value={editFormData.Location} onChange={e => setEditFormData({...editFormData, Location: e.target.value})} style={{ background: 'var(--color-surface-container-high)', color: 'white', padding: '4px', border: '1px solid var(--color-border)', borderRadius: '4px', width: '100%' }} />
                ) : (
                  <div>{selectedEvent.Location}</div>
                )}
              </div>
              <div style={{ background: 'var(--color-surface-container)', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-sm)' }}>
                <div className="label-caps text-dim">PIC</div>
                {isEditing ? (
                  <input value={editFormData.PIC} onChange={e => setEditFormData({...editFormData, PIC: e.target.value})} style={{ background: 'var(--color-surface-container-high)', color: 'white', padding: '4px', border: '1px solid var(--color-border)', borderRadius: '4px', width: '100%' }} />
                ) : (
                  <div>{selectedEvent.PIC}</div>
                )}
              </div>
              <div style={{ background: 'var(--color-surface-container)', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-sm)', gridColumn: '1 / -1' }}>
                <div className="label-caps text-dim">Status</div>
                {isEditing ? (
                  <select 
                    value={editFormData.Status} 
                    onChange={e => setEditFormData({...editFormData, Status: e.target.value})}
                    style={{ background: 'var(--color-surface-container-high)', color: 'white', padding: '6px', border: '1px solid var(--color-border)', borderRadius: '4px', width: '100%' }}
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Done">Done</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: getStatusColor(selectedEvent.Status), fontWeight: 600 }}>
                    {(selectedEvent.Status?.toLowerCase() === 'done' || selectedEvent.Status?.toLowerCase() === 'completed') ? <CheckCircle size={16} /> : <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'currentColor' }} />}
                    {selectedEvent.Status}
                  </div>
                )}
              </div>
            </div>

            {!isEditing && (
              <>
                <h4 style={{ marginBottom: 'var(--spacing-xs)' }}>Assigned Equipment</h4>
                <div style={{ background: 'var(--color-surface-container)', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-sm)', maxHeight: '150px', overflowY: 'auto' }}>
                   {equipment.slice(0, 4).map(eq => (
                     <div key={eq.Equipment_ID} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', padding: '4px 0' }}>
                       <span>{eq.Item_Name} <small className="text-dim">({eq.Category})</small></span>
                       <span className="text-dim">{eq.Equipment_ID}</span>
                     </div>
                   ))}
                </div>
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-lg)' }}>
              {isEditing ? (
                <>
                  <button onClick={() => { setIsEditing(false); setEditFormData(selectedEvent); }} style={{ padding: '8px 16px', background: 'transparent', color: 'var(--color-on-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-base)', cursor: 'pointer', fontWeight: 600 }}>CANCEL</button>
                  <button onClick={handleSaveEdit} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'var(--color-primary)', color: 'var(--color-on-primary)', border: 'none', borderRadius: 'var(--radius-base)', cursor: 'pointer', fontWeight: 600 }}>
                    <Save size={18} /> SAVE CHANGES
                  </button>
                </>
              ) : (
                selectedEvent.Status?.toLowerCase() === 'ongoing' && (
                  <button 
                    onClick={handleCloseEventClick} 
                    style={{ padding: '8px 16px', background: 'var(--color-error)', color: 'white', border: 'none', borderRadius: 'var(--radius-base)', cursor: 'pointer', fontWeight: 600 }}
                  >
                    CLOSE EVENT
                  </button>
                )
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
