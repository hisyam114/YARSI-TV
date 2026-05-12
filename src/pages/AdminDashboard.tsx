import React, { useEffect, useState } from 'react';
import { fetchScheduleData, fetchEquipmentData, executeApi, type ScheduleItem, type EquipmentItem } from '../services/googleSheets';
import { X, CheckCircle, Edit, Trash2, Save, Radio, FolderOpen } from 'lucide-react';
import { showToast } from '../utils/toast';
import { parseSheetDate, normalizeDateToISO, formatDateToDDMMYYYY, getDayNameIndonesian } from '../utils/dateUtils';
import { getSession } from '../utils/auth';

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
  const [isManager, setIsManager] = useState(false);
  const [isGoingLive, setIsGoingLive] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const getTodayISO = () => new Date().toISOString().split('T')[0];

  useEffect(() => {
    const session = getSession();
    setIsManager(session?.role === 'Manager');
  }, []);
  
  // const [selectedDateFilter, setSelectedDateFilter] = useState<string>('');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('');
  
  const [selectedEvent, setSelectedEvent] = useState<ScheduleItem | null>(null);
  const [showChecklist, setShowChecklist] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<ScheduleItem | null>(null);

  // Get current month in YYYY-MM format
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [schedData, equipData] = await Promise.all([
          fetchScheduleData(),
          fetchEquipmentData()
        ]);
        
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

  const todayISO = getTodayISO();
  const currentMonth = getCurrentMonth();
  
  // Filter by selected month or default to current month
  const filteredSchedule = selectedMonthFilter 
    ? schedule.filter(item => {
        const itemDate = normalizeDateToISO(item.Date);
        const itemMonth = itemDate.substring(0, 7); // YYYY-MM
        return itemMonth === selectedMonthFilter;
      })
    : schedule.filter(item => {
        const itemDate = normalizeDateToISO(item.Date);
        const itemMonth = itemDate.substring(0, 7); // YYYY-MM
        return itemMonth === currentMonth && normalizeDateToISO(item.Date) >= todayISO;
      });

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
        setIsDeleting(true);
        const success = await executeApi('Schedules', 'delete', selectedEvent);
        setIsDeleting(false);
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

  const handleGoLive = async () => {
    if (selectedEvent && window.confirm(`Go LIVE with "${selectedEvent.Program_Name}"? This will set the status to Ongoing.`)) {
      setIsGoingLive(true);
      const updatedEvent = { ...selectedEvent, Status: 'Ongoing' };
      const success = await executeApi('Schedules', 'update', updatedEvent);
      setIsGoingLive(false);
      if (success) {
        setSchedule(prev => prev.map(item => 
          item.Schedule_ID === selectedEvent.Schedule_ID ? updatedEvent : item
        ));
        setSelectedEvent(updatedEvent);
        showToast(`"${selectedEvent.Program_Name}" is now LIVE!`, 'success');
      } else {
        showToast('Failed to go live.', 'error');
      }
    }
  };

  const openModal = (item: ScheduleItem) => {
    setSelectedEvent(item);
    setEditFormData(item);
    setIsEditing(false);
  };

  return (
    <div className="container-padding" style={{ maxWidth: '1440px', margin: '0 auto', paddingBottom: 'var(--spacing-xl)' }}>
      <h2 style={{ marginBottom: 'var(--spacing-md)', fontSize: 'clamp(20px, 4vw, 24px)' }}>Dashboard Terpadu</h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: 'var(--spacing-md)', 
        marginBottom: 'var(--spacing-lg)' 
      }}>
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

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 'var(--spacing-sm)',
        flexWrap: 'wrap',
        gap: 'var(--spacing-sm)'
      }}>
        <h3 style={{ margin: 0 }}>Jadwal Operasional</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', flexWrap: 'wrap' }}>
          <label className="label-caps text-dim" style={{ fontSize: '12px', color: 'var(--color-outline)' }}>Filter Month:</label>
          <input 
            type="month"
            value={selectedMonthFilter || getCurrentMonth()}
            onChange={(e) => setSelectedMonthFilter(e.target.value)}
            style={{ 
              background: 'var(--color-surface-container)', 
              color: 'var(--color-on-surface)', 
              border: '1px solid var(--color-border)', 
              padding: 'var(--spacing-xs) var(--spacing-sm)', 
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-primary)',
              fontSize: '14px',
              colorScheme: 'dark'
            }}
          />
          {selectedMonthFilter && (
            <button 
              onClick={() => setSelectedMonthFilter('')}
              style={{ background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-outline)', padding: 'var(--spacing-xs) var(--spacing-sm)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '12px' }}
            >
              Reset to Current Month
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-panel" style={{ padding: 'var(--spacing-md)', animation: 'pulse 2s ease-in-out infinite' }}>
              <div style={{ height: '20px', backgroundColor: 'var(--color-surface-container-high)', borderRadius: '4px' }} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          <div className="desktop-grid" style={{ 
            gridTemplateColumns: '100px 2fr 80px 120px 150px 1.5fr 1fr 120px', 
            padding: 'var(--spacing-sm) var(--spacing-md)', 
            color: 'var(--color-outline)',
            gap: 'var(--spacing-md)',
            textAlign: 'center',
            borderBottom: '2px solid var(--color-border)',
            backgroundColor: 'var(--color-surface-container-low)',
            borderRadius: 'var(--radius-sm)'
          }}>
            <span className="label-caps">ID</span>
            <span className="label-caps" style={{ textAlign: 'left' }}>Program Name</span>
            <span className="label-caps">Day</span>
            <span className="label-caps">Date</span>
            <span className="label-caps">Time</span>
            <span className="label-caps">Location</span>
            <span className="label-caps">PIC</span>
            <span className="label-caps">Status</span>
          </div>

          {filteredSchedule.map((item, index) => {
            const sColor = getStatusColor(item.Status);
            const isDone = item.Status?.toLowerCase() === 'done' || item.Status?.toLowerCase() === 'completed';
            
            return (
              <div 
                key={index} 
                onClick={() => openModal(item)}
                className="glass-panel"
                style={{ 
                  padding: 'var(--spacing-md)', 
                  borderLeft: `4px solid ${sColor}`,
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  backgroundColor: 'var(--color-surface-container)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-surface-container-high)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-surface-container)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div className="desktop-grid" style={{
                  gridTemplateColumns: '100px 2fr 80px 120px 150px 1.5fr 1fr 120px',
                  alignItems: 'center',
                  gap: 'var(--spacing-md)',
                  textAlign: 'center'
                }}>
                  <small className="text-dim">{item.Schedule_ID}</small>
                  <div style={{ textAlign: 'left' }}>
                    <h3 style={{ margin: 0, fontSize: '16px' }}>{item.Program_Name}</h3>
                  </div>
                  <small style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{item.DayName || getDayNameIndonesian(item.Date)}</small>
                  <small className="text-dim">{formatDateToDDMMYYYY(item.Date)}</small>
                  <small className="text-dim">{item.Start_Time} - {item.End_Time}</small>
                  <div className="text-dim">{item.Location}</div>
                  <div className="text-dim">{item.PIC}</div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: sColor }}>
                      {isDone ? <CheckCircle size={14} /> : <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }} />}
                      <span className="label-caps" style={{ fontSize: '11px' }}>{item.Status}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          
          {filteredSchedule.length === 0 && (
            <div className="glass-panel" style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--color-outline)' }}>
              No schedules found.
            </div>
          )}
        </div>
      )}

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
                    {/* Manager-only: Go Live Button */}
                    {isManager && selectedEvent.Status?.toLowerCase() !== 'ongoing' && (
                      <button 
                        onClick={handleGoLive} 
                        disabled={isGoingLive}
                        style={{ 
                          background: 'var(--color-vibrant-green)', 
                          border: 'none', 
                          color: 'black', 
                          cursor: isGoingLive ? 'wait' : 'pointer', 
                          padding: '6px 12px', 
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontWeight: 600,
                          fontSize: '13px',
                          opacity: isGoingLive ? 0.7 : 1
                        }}
                      >
                        <Radio size={16} />
                        {isGoingLive ? 'GOING LIVE...' : 'GO LIVE'}
                      </button>
                    )}
                    <button onClick={() => setIsEditing(true)} style={{ background: 'var(--color-surface-container)', border: '1px solid var(--color-border)', color: 'var(--color-on-surface)', cursor: 'pointer', padding: '6px', borderRadius: '4px' }}><Edit size={18} /></button>
                    {/* Manager-only: Delete Button */}
                    {isManager && (
                      <button 
                        onClick={handleDelete} 
                        disabled={isDeleting}
                        style={{ 
                          background: 'var(--color-error-container)', 
                          border: '1px solid var(--color-error)', 
                          color: 'var(--color-error)', 
                          cursor: isDeleting ? 'wait' : 'pointer', 
                          padding: '6px', 
                          borderRadius: '4px',
                          opacity: isDeleting ? 0.7 : 1
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </>
                )}
                <button onClick={() => setSelectedEvent(null)} style={{ background: 'transparent', border: 'none', color: 'var(--color-outline)', cursor: 'pointer', padding: '6px' }}><X size={24} /></button>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
              <div style={{ background: 'var(--color-surface-container)', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-sm)' }}>
                <div className="label-caps text-dim">Date</div>
                {isEditing ? (
                  <div>
                    <input type="date" value={editFormData.Date} onChange={e => {
                      const dayName = getDayNameIndonesian(e.target.value);
                      setEditFormData({...editFormData, Date: e.target.value, DayName: dayName});
                    }} style={{ background: 'var(--color-surface-container-high)', color: 'white', padding: '4px', border: '1px solid var(--color-border)', borderRadius: '4px', width: '100%', colorScheme: 'dark' }} />
                    {editFormData.DayName && (
                      <small style={{ display: 'block', marginTop: '4px', color: 'var(--color-primary)', fontWeight: 600 }}>
                        {editFormData.DayName}
                      </small>
                    )}
                  </div>
                ) : (
                  <div>
                    <div>{formatDateToDDMMYYYY(selectedEvent.Date)}</div>
                    {(selectedEvent.DayName || getDayNameIndonesian(selectedEvent.Date)) && (
                      <small style={{ display: 'block', marginTop: '4px', color: 'var(--color-primary)', fontWeight: 600 }}>
                        {selectedEvent.DayName || getDayNameIndonesian(selectedEvent.Date)}
                      </small>
                    )}
                  </div>
                )}
              </div>
              
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

              {/* Google Drive Link Section */}
              {!isEditing && selectedEvent.Drive_Link && (
                <div style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, #006400 100%)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)', gridColumn: '1 / -1', color: 'white' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <FolderOpen size={24} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '11px', opacity: 0.9, marginBottom: '4px' }}>GOOGLE DRIVE FOLDER</div>
                      <a 
                        href={selectedEvent.Drive_Link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{ 
                          color: 'white', 
                          textDecoration: 'underline', 
                          fontWeight: 600,
                          fontSize: '14px',
                          display: 'block',
                          marginBottom: '4px'
                        }}
                      >
                        Open Folder in Google Drive →
                      </a>
                      <div style={{ fontSize: '11px', opacity: 0.7, wordBreak: 'break-all' }}>
                        {selectedEvent.Program_Name}
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
                    style={{ padding: '8px 16px', background: 'var(--color-error-container)', color: 'white', border: 'none', borderRadius: 'var(--radius-base)', cursor: 'pointer', fontWeight: 600 }}
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
