import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, Package, LogOut, Users, X, Shield } from 'lucide-react';
import ToastContainer from './ToastContainer';

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; role: string; username?: string } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLoginExit, setShowLoginExit] = useState(false);
  const [showLogoutExit, setShowLogoutExit] = useState(false);
  const [logoutText, setLogoutText] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('yarsi_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error('Failed to parse user session', e);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
    
    // Check if we need to show login exit animation
    const showTransition = localStorage.getItem('show_login_transition');
    if (showTransition === 'true') {
      setShowLoginExit(true);
      localStorage.removeItem('show_login_transition');
      // Remove the overlay after animation completes
      setTimeout(() => {
        setShowLoginExit(false);
      }, 1500);
    }
    
    // Check if mobile
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [navigate]);

  useEffect(() => {
    // Close sidebar on navigation
    setIsSidebarOpen(false);
    // Reset profile modal on navigation
    setShowProfileModal(false);
  }, [location.pathname]);

  const handleLogout = () => {
    // Set flag for landing page to know we're logging out
    localStorage.setItem('show_logout_transition', 'true');
    localStorage.removeItem('yarsi_user');
    
    // Show logout animation on admin page first (circle-IN: expand from 0% to 125%)
    setShowLogoutExit(true);
    
    // Show text after circle expands
    setTimeout(() => {
      setLogoutText(true);
    }, 900);
    
    // Navigate to landing after animation completes (1.5s)
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  const handleProfileClick = () => {
    setShowProfileModal(true);
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: <Home size={18} /> },
    { path: '/admin/schedule/new', label: 'Schedule Entry', icon: <Calendar size={18} /> },
    { path: '/admin/inventory', label: 'Inventory', icon: <Package size={18} /> },
  ];

  if (user?.role === 'Manager') {
    navItems.push({ path: '/admin/users', label: 'Users', icon: <Users size={18} /> });
  }

  if (!user) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-surface-container-lowest)' }}>
      {/* Login Exit Animation Overlay */}
      {showLoginExit && (
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
            clipPath: 'circle(125% at 50% 50%)',
            animation: 'circle-out-hesitate 1.5s cubic-bezier(.25, 1, .30, 1) forwards'
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
            textAlign: 'center'
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
      
      {/* Logout Exit Animation Overlay */}
      {showLogoutExit && (
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
          
          {/* Logout Text */}
          <div style={{
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
            opacity: logoutText ? 1 : 0,
            transform: logoutText ? 'scale(1)' : 'scale(0.8)',
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
              SIGNING OUT
            </div>
            <div style={{
              color: 'rgba(255, 255, 255, 0.95)',
              fontSize: 'clamp(14px, 3vw, 20px)',
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
            }}>
              Session Terminated
            </div>
          </div>
        </div>
      )}
      {/* Mobile Top Nav */}
      <header style={{ 
        height: '60px', 
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--spacing-md)',
        backgroundColor: 'var(--color-surface-container-low)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="tablet-hide"
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--color-on-surface)', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {isSidebarOpen ? <X size={24} /> : <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ width: '20px', height: '2px', backgroundColor: 'currentColor' }} />
              <div style={{ width: '20px', height: '2px', backgroundColor: 'currentColor' }} />
              <div style={{ width: '20px', height: '2px', backgroundColor: 'currentColor' }} />
            </div>}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
            <h3 style={{ color: 'var(--color-primary)', margin: 0, fontSize: '18px' }}>YARSI TV</h3>
            <div className="mobile-hide" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-vibrant-green)', boxShadow: '0 0 8px var(--color-vibrant-green)' }} />
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
          <button onClick={handleLogout} style={{ 
            background: 'var(--color-error-container)', 
            border: '1px solid var(--color-error)', 
            color: 'var(--color-error)', 
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: 'var(--radius-base)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: 600,
            fontSize: '13px'
          }}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        {/* Sidebar */}
        <aside style={{ 
          width: isMobile ? '100%' : '280px',
          backgroundColor: 'var(--color-surface-container-low)',
          borderRight: isMobile ? 'none' : '1px solid var(--color-border)',
          borderBottom: isMobile ? '1px solid var(--color-border)' : 'none',
          display: isSidebarOpen ? 'flex' : 'none',
          flexDirection: 'column',
          position: 'fixed',
          top: '60px',
          bottom: isMobile ? 'auto' : 0,
          left: 0,
          right: isMobile ? 0 : 'auto',
          zIndex: 90,
          boxShadow: isMobile ? '0 20px 50px rgba(0,0,0,0.5)' : 'none',
          overflowY: 'hidden'
        }} className="responsive-sidebar">
          <nav style={{ flex: 1, padding: 'var(--spacing-md) 0', overflowY: 'auto' }}>
            <ul style={{ listStyle: 'none' }}>
              {navItems.map(item => (
                <li key={item.path}>
                  <Link 
                    to={item.path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-sm)',
                      padding: 'var(--spacing-md) var(--spacing-lg)',
                      color: location.pathname === item.path ? 'var(--color-primary)' : 'var(--color-on-surface)',
                      backgroundColor: location.pathname === item.path ? 'var(--color-surface-container-high)' : 'transparent',
                      borderLeft: location.pathname === item.path ? '3px solid var(--color-primary)' : '3px solid transparent',
                      textDecoration: 'none',
                      fontWeight: location.pathname === item.path ? 600 : 400,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (location.pathname !== item.path) {
                        e.currentTarget.style.backgroundColor = 'var(--color-surface-container-high)';
                        e.currentTarget.style.color = 'var(--color-primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (location.pathname !== item.path) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--color-on-surface)';
                      }
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div 
            onClick={handleProfileClick}
            style={{ 
              borderTop: '1px solid var(--color-border)', 
              padding: 'var(--spacing-md)', 
              backgroundColor: 'var(--color-surface-container)',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-container-high)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-container)'}
          >
             <div style={{ fontWeight: 600 }}>{user.name}</div>
             <div className="label-caps" style={{ color: user.role === 'Manager' ? 'var(--color-vibrant-green)' : 'var(--color-outline)', fontSize: '10px' }}>{user.role}</div>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div 
            onClick={() => setIsSidebarOpen(false)}
            style={{ position: 'fixed', top: '60px', left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 80 }} 
          />
        )}

        {/* Main Content Area */}
        <main style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          minWidth: 0,
          marginLeft: isMobile ? 0 : '280px'
        }}>
          <div style={{ flex: 1, padding: 'var(--spacing-md) 0', overflowY: 'auto' }}>
            <Outlet />
          </div>
        </main>
      </div>
      <ToastContainer />

      {/* PROFILE MODAL */}
      {showProfileModal && user && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', width: '100%', maxWidth: '500px', backgroundColor: 'var(--color-surface-container-lowest)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
              <h2 style={{ margin: 0 }}>My Profile</h2>
              <button onClick={() => setShowProfileModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--color-outline)', cursor: 'pointer', padding: '6px' }}><X size={24} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              {/* User Info */}
              <div style={{ background: 'var(--color-surface-container)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-sm)' }}>
                <div className="label-caps text-dim" style={{ marginBottom: '4px' }}>Full Name</div>
                <div style={{ fontSize: '16px', fontWeight: 600 }}>{user.name}</div>
              </div>

              <div style={{ background: 'var(--color-surface-container)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-sm)' }}>
                <div className="label-caps text-dim" style={{ marginBottom: '4px' }}>Username</div>
                <div style={{ fontSize: '16px', fontWeight: 600 }}>{user.username || 'N/A'}</div>
              </div>

              <div style={{ background: 'var(--color-surface-container)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-sm)' }}>
                <div className="label-caps text-dim" style={{ marginBottom: '4px' }}>Role</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: user.role === 'Manager' ? 'var(--color-vibrant-green)' : 'var(--color-primary)' }}>{user.role}</div>
              </div>

              {/* Change Password Button */}
              <button 
                onClick={() => {
                  setShowProfileModal(false);
                  navigate('/admin/change-password');
                }}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: 'var(--spacing-md)', 
                  background: 'var(--color-surface-container)', 
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-on-surface)', 
                  borderRadius: 'var(--radius-sm)', 
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-container-high)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-container)'}
              >
                <Shield size={18} />
                Change Password
              </button>

              {/* Logout Button */}
              <button 
                onClick={() => {
                  setShowProfileModal(false);
                  handleLogout();
                }}
                style={{ 
                  padding: 'var(--spacing-md)', 
                  background: 'var(--color-error-container)', 
                  border: '1px solid var(--color-error)',
                  color: 'var(--color-error)', 
                  borderRadius: 'var(--radius-sm)', 
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
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
        
        @keyframes gridSlide {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        
        @media (min-width: 1024px) {
          .responsive-sidebar {
            display: flex !important;
            position: fixed !important;
            box-shadow: none !important;
          }
          .tablet-hide { display: none !important; }
        }

        /* Global hover animations */
        button, a {
          transition: all 0.2s ease;
        }

        button:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        button:active:not(:disabled) {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
