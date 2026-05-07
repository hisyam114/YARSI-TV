import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Package, LogOut } from 'lucide-react';

const AdminLayout: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: <Home size={18} /> },
    { path: '/admin/schedule/new', label: 'Schedule', icon: <Calendar size={18} /> },
    { path: '/admin/inventory', label: 'Inventory', icon: <Package size={18} /> },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-surface-container-lowest)' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: '250px', 
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

        <div style={{ padding: 'var(--spacing-md)' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', color: 'var(--color-outline)' }}>
            <LogOut size={18} />
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
        
        <div style={{ flex: 1, padding: 'var(--spacing-md)', overflowY: 'auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
