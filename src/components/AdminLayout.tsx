import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, Package, LogOut, Users } from 'lucide-react';
import ToastContainer from './ToastContainer';

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('yarsi_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      // Force redirect to login if no valid session
      navigate('/login');
    }
  }, [navigate]);

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

  // Prevent flash of protected content
  if (!user) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-surface-container-lowest)' }}>
      {/* Sidebar - Fixed width desktop layout */}
      <aside style={{ 
        width: '280px', 
        minWidth: '280px',
        backgroundColor: 'var(--color-surface-container-low)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: 'var(--spacing-md)', borderBottom: '1px solid var(--color-border)' }}>
          <h3 style={{ color: 'var(--color-primary)' }}>YARSI TV</h3>
          <p className="label-caps" style={{ color: 'var(--color-outline)' }}>Control Room</p>
        </div>
        
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
                    padding: 'var(--spacing-sm) var(--spacing-md)',
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

        {/* Static Bottom Section for User Profile and Logout */}
        <div style={{ borderTop: '1px solid var(--color-border)', padding: 'var(--spacing-md)', backgroundColor: 'var(--color-surface-container)' }}>
          <div style={{ marginBottom: 'var(--spacing-sm)' }}>
            <div style={{ fontWeight: 600, color: 'var(--color-on-surface)' }}>{user.name}</div>
            <div className="label-caps" style={{ color: user.role === 'Manager' ? 'var(--color-vibrant-green)' : 'var(--color-outline)' }}>{user.role}</div>
          </div>
          
          <button 
            onClick={handleLogout}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: '100%',
              gap: 'var(--spacing-sm)', 
              color: 'var(--color-error)',
              background: 'transparent',
              border: '1px solid var(--color-error)',
              padding: 'var(--spacing-sm)',
              borderRadius: 'var(--radius-base)',
              cursor: 'pointer'
            }}
          >
            <LogOut size={18} />
            <span style={{ fontWeight: 600 }}>LOGOUT</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area - Fluid width */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{ 
          height: '60px', 
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 var(--spacing-md)',
          backgroundColor: 'var(--color-surface-container-low)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-vibrant-green)', boxShadow: '0 0 8px var(--color-vibrant-green)' }} />
            <span className="label-caps" style={{ color: 'var(--color-on-surface)' }}>SYSTEM ONLINE</span>
          </div>
        </header>
        
        <div style={{ flex: 1, padding: 'var(--spacing-lg)', overflowY: 'auto' }}>
          <Outlet />
        </div>
      </main>
      <ToastContainer />
    </div>
  );
};

export default AdminLayout;
