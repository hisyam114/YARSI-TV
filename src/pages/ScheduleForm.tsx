import React, { useState, useEffect } from 'react';
import { executeApi, fetchScheduleData, type ScheduleItem } from '../services/googleSheets';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../utils/toast';

const generateScheduleId = (count: number): string => {
  return `SCH-${String(count).padStart(3, '0')}`;
};

const ScheduleForm: React.FC = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [nextId, setNextId] = useState('SCH-001');
  const [formData, setFormData] = useState<ScheduleItem>({
    Schedule_ID: 'SCH-001',
    Program_Name: '',
    Date: '',
    Start_Time: '',
    End_Time: '',
    Location: '',
    PIC: '',
    Status: 'Upcoming'
  });

  useEffect(() => {
    fetchScheduleData().then(data => {
      const id = generateScheduleId(data.length + 1);
      setNextId(id);
      setFormData(prev => ({ ...prev, Schedule_ID: id }));
    }).catch(() => {
      // Keep default SCH-001 if fetch fails
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.Schedule_ID || !formData.Program_Name || !formData.Date || !formData.Start_Time || !formData.End_Time) {
      alert("Please fill all required fields");
      return;
    }
    
    setIsSaving(true);
    const success = await executeApi('Schedules', 'create', formData);
    setIsSaving(false);
    
    if (success) {
      showToast(`Schedule "${formData.Program_Name}" saved!`, 'success');
      navigate('/admin');
    } else {
      showToast('Failed to save schedule.', 'error');
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: 'var(--spacing-md)' }}>Entri Jadwal Operasional</h2>
      
      <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', maxWidth: '800px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', flex: 1 }}>
              <label className="label-caps" style={{ color: 'var(--color-outline)' }}>Schedule ID</label>
              <input 
                type="text" 
                readOnly
                value={nextId}
                style={{
                  background: 'var(--color-surface-container)',
                  border: '1px solid var(--color-border)',
                  borderBottom: '2px solid var(--color-outline)',
                  color: 'var(--color-outline)',
                  padding: 'var(--spacing-sm)',
                  borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                  outline: 'none',
                  fontFamily: 'var(--font-primary)',
                  cursor: 'not-allowed'
                }} 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', flex: 2 }}>
              <label className="label-caps" style={{ color: 'var(--color-outline)' }}>Program Name</label>
              <input 
                type="text" 
                required
                value={formData.Program_Name}
                onChange={e => setFormData({...formData, Program_Name: e.target.value})}
                style={{
                  background: 'var(--color-surface-container)',
                  border: '1px solid var(--color-border)',
                  borderBottom: '2px solid var(--color-primary)',
                  color: 'var(--color-on-surface)',
                  padding: 'var(--spacing-sm)',
                  borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                  outline: 'none',
                  fontFamily: 'var(--font-primary)'
                }} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', flex: 1 }}>
              <label className="label-caps" style={{ color: 'var(--color-outline)' }}>Date</label>
              <input 
                type="date" 
                required
                value={formData.Date}
                onChange={e => setFormData({...formData, Date: e.target.value})}
                style={{
                  background: 'var(--color-surface-container)',
                  border: '1px solid var(--color-border)',
                  borderBottom: '2px solid var(--color-primary)',
                  color: 'var(--color-on-surface)',
                  padding: 'var(--spacing-sm)',
                  borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                  outline: 'none',
                  fontFamily: 'var(--font-primary)',
                  colorScheme: 'dark'
                }} 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', flex: 1 }}>
              <label className="label-caps" style={{ color: 'var(--color-outline)' }}>Start Time</label>
              <input 
                type="time" 
                required
                value={formData.Start_Time}
                onChange={e => setFormData({...formData, Start_Time: e.target.value})}
                style={{
                  background: 'var(--color-surface-container)',
                  border: '1px solid var(--color-border)',
                  borderBottom: '2px solid var(--color-primary)',
                  color: 'var(--color-on-surface)',
                  padding: 'var(--spacing-sm)',
                  borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                  outline: 'none',
                  fontFamily: 'var(--font-primary)',
                  colorScheme: 'dark'
                }} 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', flex: 1 }}>
              <label className="label-caps" style={{ color: 'var(--color-outline)' }}>End Time</label>
              <input 
                type="time" 
                required
                value={formData.End_Time}
                onChange={e => setFormData({...formData, End_Time: e.target.value})}
                style={{
                  background: 'var(--color-surface-container)',
                  border: '1px solid var(--color-border)',
                  borderBottom: '2px solid var(--color-primary)',
                  color: 'var(--color-on-surface)',
                  padding: 'var(--spacing-sm)',
                  borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                  outline: 'none',
                  fontFamily: 'var(--font-primary)',
                  colorScheme: 'dark'
                }} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', flex: 1 }}>
              <label className="label-caps" style={{ color: 'var(--color-outline)' }}>Location</label>
              <input 
                type="text" 
                placeholder="Studio Utama"
                value={formData.Location}
                onChange={e => setFormData({...formData, Location: e.target.value})}
                style={{
                  background: 'var(--color-surface-container)',
                  border: '1px solid var(--color-border)',
                  borderBottom: '2px solid var(--color-primary)',
                  color: 'var(--color-on-surface)',
                  padding: 'var(--spacing-sm)',
                  borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                  outline: 'none',
                  fontFamily: 'var(--font-primary)'
                }} 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', flex: 1 }}>
              <label className="label-caps" style={{ color: 'var(--color-outline)' }}>PIC (Person in Charge)</label>
              <input 
                type="text" 
                placeholder="Achmad Hisyam"
                value={formData.PIC}
                onChange={e => setFormData({...formData, PIC: e.target.value})}
                style={{
                  background: 'var(--color-surface-container)',
                  border: '1px solid var(--color-border)',
                  borderBottom: '2px solid var(--color-primary)',
                  color: 'var(--color-on-surface)',
                  padding: 'var(--spacing-sm)',
                  borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                  outline: 'none',
                  fontFamily: 'var(--font-primary)'
                }} 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', flex: 1 }}>
              <label className="label-caps" style={{ color: 'var(--color-outline)' }}>Status</label>
              <select 
                value={formData.Status}
                onChange={e => setFormData({...formData, Status: e.target.value})}
                style={{
                  background: 'var(--color-surface-container)',
                  border: '1px solid var(--color-border)',
                  borderBottom: '2px solid var(--color-primary)',
                  color: 'var(--color-on-surface)',
                  padding: 'var(--spacing-sm)',
                  borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                  outline: 'none',
                  fontFamily: 'var(--font-primary)',
                  height: '42px'
                }} 
              >
                <option value="Upcoming">Upcoming</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)', paddingTop: 'var(--spacing-md)', borderTop: '1px solid var(--color-border)' }}>
            <button 
              type="button"
              onClick={() => navigate('/admin')}
              disabled={isSaving}
              style={{
                background: 'transparent',
                color: 'var(--color-on-surface)',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-base)',
                fontWeight: 600,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.5 : 1
              }}
            >
              BATAL
            </button>
            <button 
              type="submit"
              disabled={isSaving}
              style={{
                background: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                border: 'none',
                borderRadius: 'var(--radius-base)',
                fontWeight: 600,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.5 : 1
              }}
            >
              {isSaving ? 'MENYIMPAN...' : 'SIMPAN JADWAL'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleForm;
