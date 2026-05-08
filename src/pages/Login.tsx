import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUsersData } from '../services/googleSheets';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const users = await fetchUsersData();
      const user = users.find(u => u.Username === username && u.Password === password);

      if (user) {
        localStorage.setItem('yarsi_user', JSON.stringify({ name: user.Name, role: user.Role }));
        navigate('/admin');
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('Failed to connect to authentication server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center container-padding" style={{ height: '100vh', backgroundColor: 'var(--color-surface-container-lowest)' }}>
      <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ marginBottom: 'var(--spacing-md)', textAlign: 'center' }}>Admin Authentication</h2>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          {error && <div style={{ color: 'var(--color-error)', backgroundColor: 'var(--color-error-container)', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-sm)', fontSize: '14px', textAlign: 'center' }}>{error}</div>}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
            <label className="label-caps" style={{ color: 'var(--color-outline)' }}>Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
            <label className="label-caps" style={{ color: 'var(--color-outline)' }}>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          <button 
            type="submit"
            disabled={loading}
            style={{
              background: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
              padding: 'var(--spacing-sm)',
              border: 'none',
              borderRadius: 'var(--radius-base)',
              fontWeight: 700,
              marginTop: 'var(--spacing-sm)',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'wait' : 'pointer'
            }}
          >
            {loading ? 'AUTHENTICATING...' : 'ENTER CONTROL ROOM'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
