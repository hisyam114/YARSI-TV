import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUsersData } from '../services/googleSheets';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showText, setShowText] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const users = await fetchUsersData();
      const user = users.find(u => u.Username === username && u.Password === password);

      if (user) {
        localStorage.setItem('yarsi_user', JSON.stringify({ 
          name: user.Name, 
          role: user.Role, 
          username: user.Username,
          timestamp: new Date().getTime()
        }));
        
        // Set flag for admin page to show exit animation
        localStorage.setItem('show_login_transition', 'true');
        
        // Start the circle transition animation
        setIsTransitioning(true);
        
        // Show the text after the circle expands
        setTimeout(() => {
          setShowText(true);
        }, 900); // Show text after circle expands
        
        // Navigate to admin while showing the text
        setTimeout(() => {
          navigate('/admin');
        }, 2000); // Navigate while text is visible
        
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
    <>
      {/* Login Circle Transition Overlay - Only show when transitioning */}
      {isTransitioning && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #003d14 0%, #002910 50%, #001a0d 100%)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            clipPath: 'circle(0% at 50% 50%)',
            animation: 'circle-in-hesitate 1.5s cubic-bezier(.25, 1, .30, 1) forwards'
          } as React.CSSProperties}
        >
        {/* Animated Grid Background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(rgba(0, 255, 65, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 65, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          opacity: 0.4,
          animation: 'gridSlide 20s linear infinite'
        }} />
        
        {/* Glow Effect */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '800px',
          height: '800px',
          background: 'radial-gradient(circle, rgba(0, 255, 65, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'pulse 3s ease-in-out infinite'
        }} />
        
        {/* Welcome Text */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          opacity: showText ? 1 : 0,
          transform: showText ? 'scale(1)' : 'scale(0.8)',
          transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}>
          <div style={{
            color: '#00FF41',
            fontSize: 'clamp(32px, 8vw, 56px)',
            fontWeight: 900,
            letterSpacing: '0.08em',
            textShadow: '0 0 30px rgba(0, 255, 65, 0.6), 0 0 60px rgba(0, 255, 65, 0.3), 0 0 100px rgba(0, 255, 65, 0.1)',
            marginBottom: '16px',
            textTransform: 'uppercase'
          }}>
            YARSI TV
          </div>
          <div style={{
            color: 'rgba(255, 255, 255, 0.95)',
            fontSize: 'clamp(14px, 3vw, 20px)',
            fontWeight: 600,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
          }}>
            Control Room Access Granted
          </div>
        </div>
        </div>
      )}
      
      <style>{`
        @keyframes gridSlide {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        
        @keyframes circle-in-hesitate {
          0% { clip-path: circle(0% at 50% 50%); }
          40% { clip-path: circle(40% at 50% 50%); }
          100% { clip-path: circle(125% at 50% 50%); }
        }
        
        @keyframes circle-out-hesitate {
          0% { clip-path: circle(125% at 50% 50%); }
          40% { clip-path: circle(40% at 50% 50%); }
          100% { clip-path: circle(0% at 50% 50%); }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>

      <div className="flex-center container-padding" style={{ 
        height: '100vh', 
        backgroundColor: 'var(--color-surface-container-lowest)',
        animation: 'fadeInUp 0.6s ease'
      }}>
        <div className="glass-panel" style={{ 
          padding: 'var(--spacing-lg)', 
          width: '100%', 
          maxWidth: '400px',
          animation: 'scaleIn 0.5s ease'
        }}>
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
                cursor: loading ? 'wait' : 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,155,90,0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {loading ? 'AUTHENTICATING...' : 'ENTER CONTROL ROOM'}
            </button>
          </form>
        </div>
        
        <style>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default Login;
