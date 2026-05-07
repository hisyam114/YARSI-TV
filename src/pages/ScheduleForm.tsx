import React from 'react';

const ScheduleForm: React.FC = () => {
  return (
    <div>
      <h2 style={{ marginBottom: 'var(--spacing-md)' }}>Entri Jadwal Operasional</h2>
      
      <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', maxWidth: '800px', margin: '0 auto' }}>
        <form style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', flex: 1 }}>
              <label className="label-caps" style={{ color: 'var(--color-outline)' }}>Schedule ID</label>
              <input 
                type="text" 
                placeholder="SCH-001"
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', flex: 2 }}>
              <label className="label-caps" style={{ color: 'var(--color-outline)' }}>Program Name</label>
              <input 
                type="text" 
                required
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
              style={{
                background: 'transparent',
                color: 'var(--color-on-surface)',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-base)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              BATAL
            </button>
            <button 
              type="submit"
              style={{
                background: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                border: 'none',
                borderRadius: 'var(--radius-base)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              SIMPAN JADWAL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleForm;
