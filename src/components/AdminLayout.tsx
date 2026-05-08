import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, Package, LogOut, Users } from 'lucide-react';
import ToastContainer from './ToastContainer';

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('yarsi_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    // Close sidebar on navigation
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('yarsi_user');
    navigate('/');
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
          <div style={{ textAlign: 'right' }} className="mobile-hide">
            <div style={{ fontSize: '12px', fontWeight: 600 }}>{user.name}</div>
            <div className="label-caps" style={{ fontSize: '9px', color: user.role === 'Manager' ? 'var(--color-vibrant-green)' : 'var(--color-outline)' }}>{user.role}</div>
          </div>
          <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: 'var(--color-error)', cursor: 'pointer' }}>
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        {/* Sidebar */}
        <aside style={{ 
          width: '280px', 
          backgroundColor: 'var(--color-surface-container-low)',
          borderRight: '1px solid var(--color-border)',
          display: isSidebarOpen ? 'flex' : 'none',
          flexDirection: 'column',
          position: 'fixed',
          top: '60px',
          bottom: 0,
          left: 0,
          zIndex: 90,
          boxShadow: '20px 0 50px rgba(0,0,0,0.5)'
        }} className="responsive-sidebar">
          <nav style={{ flex: 1, padding: 'var(--spacing-md) 0' }}>
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
                      fontWeight: location.pathname === item.path ? 600 : 400
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div style={{ borderTop: '1px solid var(--color-border)', padding: 'var(--spacing-md)', backgroundColor: 'var(--color-surface-container)' }}>
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
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ flex: 1, padding: 'var(--spacing-md) 0', overflowY: 'auto' }}>
            <Outlet />
          </div>
        </main>
      </div>
      <ToastContainer />

      <style>{`
        @media (min-width: 1024px) {
          .responsive-sidebar {
            display: flex !important;
            position: static !important;
            box-shadow: none !important;
          }
          .tablet-hide { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
