import React from 'react';

const ScheduleForm: React.FC = () => {
  return (
    <div>
      <h2 style={{ marginBottom: 'var(--spacing-md)' }}>Entri Jadwal Operasional</h2>
      
      <div className="glass-panel" style={{ padding: 'var(--spacing-md)', maxWidth: '600px' }}>
        <form style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
            <label className="label-caps" style={{ color: 'var(--color-outline)' }}>Nama Program</label>
            <input 
              type="text" 
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

          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', flex: 1 }}>
              <label className="label-caps" style={{ color: 'var(--color-outline)' }}>Mulai</label>
              <input 
                type="datetime-local" 
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
              <label className="label-caps" style={{ color: 'var(--color-outline)' }}>Selesai</label>
              <input 
                type="datetime-local" 
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
            <label className="label-caps" style={{ color: 'var(--color-outline)' }}>Kru Bertugas</label>
            <input 
              type="text" 
              placeholder="Pisahkan dengan koma"
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-sm)' }}>
            <button 
              type="button"
              style={{
                background: 'transparent',
                color: 'var(--color-on-surface)',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-base)',
                fontWeight: 600,
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
