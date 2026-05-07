import React from 'react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login
    navigate('/admin');
  };

  return (
    <div className="flex-center" style={{ height: '100vh', backgroundColor: 'var(--color-surface-container-lowest)' }}>
      <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ marginBottom: 'var(--spacing-md)', textAlign: 'center' }}>Admin Authentication</h2>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
            <label className="label-caps" style={{ color: 'var(--color-outline)' }}>Username</label>
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
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
            <label className="label-caps" style={{ color: 'var(--color-outline)' }}>Password</label>
            <input 
              type="password" 
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

          <button 
            type="submit"
            style={{
              background: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
              padding: 'var(--spacing-sm)',
              border: 'none',
              borderRadius: 'var(--radius-base)',
              fontWeight: 700,
              marginTop: 'var(--spacing-sm)'
            }}
          >
            ENTER CONTROL ROOM
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
