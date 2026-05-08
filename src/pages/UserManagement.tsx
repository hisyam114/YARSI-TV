import React, { useEffect, useState } from 'react';
import { fetchUsersData, executeApi, type UserItem } from '../services/googleSheets';
import { Edit, Trash2, Save, X, UserPlus, Shield } from 'lucide-react';
import { showToast } from '../utils/toast';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const initialFormState: UserItem = { Username: '', Password: '', Role: 'Admin', Name: '' };
  const [formData, setFormData] = useState<UserItem>(initialFormState);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchUsersData();
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleOpenModal = (user?: UserItem) => {
    if (user) {
      setFormData(user);
      setIsEditing(true);
    } else {
      setFormData(initialFormState);
      setIsEditing(false);
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.Username || !formData.Password || !formData.Name) {
      alert("Please fill all fields.");
      return;
    }

    setIsSaving(true);
    if (isEditing) {
      const success = await executeApi('Users', 'update', formData);
      if (success) {
        setUsers(prev => prev.map(u => u.Username === formData.Username ? formData : u));
        setShowModal(false);
        showToast(`User "${formData.Name}" updated successfully.`, 'success');
      } else {
        showToast('Failed to update user.', 'error');
      }
    } else {
      // Check if username exists locally first
      if (users.find(u => u.Username === formData.Username)) {
        alert("Username already exists!");
        setIsSaving(false);
        return;
      }
      
      const success = await executeApi('Users', 'create', formData);
      if (success) {
        setUsers(prev => [...prev, formData]);
        setShowModal(false);
        showToast(`User "${formData.Name}" created successfully.`, 'success');
      } else {
        showToast('Failed to create user.', 'error');
      }
    }
    setIsSaving(false);
  };

  const handleDelete = async (username: string) => {
    if (window.confirm(`Are you sure you want to delete user ${username}?`)) {
      const userToDelete = users.find(u => u.Username === username);
      if (userToDelete) {
        const success = await executeApi('Users', 'delete', userToDelete);
        if (success) {
          setUsers(prev => prev.filter(u => u.Username !== username));
          showToast(`User "${userToDelete.Name}" deleted.`, 'info');
        } else {
          showToast('Failed to delete user.', 'error');
        }
      }
    }
  };

  return (
    <div className="container-padding" style={{ maxWidth: '1440px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 'var(--spacing-lg)',
        flexWrap: 'wrap',
        gap: 'var(--spacing-md)'
      }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', fontSize: 'clamp(20px, 4vw, 24px)', margin: 0 }}>
            <Shield size={24} color="var(--color-primary)" />
            User Access Management
          </h2>
          <p className="text-dim" style={{ marginTop: '4px' }}>Manage dashboard access and role permissions.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            background: 'var(--color-primary)', color: 'var(--color-on-primary)', 
            border: 'none', padding: '10px 20px', borderRadius: 'var(--radius-base)', 
            cursor: 'pointer', fontWeight: 600,
            fontSize: '14px'
          }}
        >
          <UserPlus size={18} />
          ADD USER
        </button>
      </div>

      {loading ? (
        <div className="glass-panel" style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--color-outline)' }}>
          Loading System Users...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          {/* Desktop Header */}
          <div className="mobile-hide" style={{ 
            display: 'grid', 
            gridTemplateColumns: '1.5fr 1fr 1fr 120px', 
            padding: 'var(--spacing-sm) var(--spacing-md)', 
            color: 'var(--color-outline)',
            gap: 'var(--spacing-md)',
            textAlign: 'center'
          }}>
            <span className="label-caps" style={{ textAlign: 'left' }}>Name</span>
            <span className="label-caps">Username</span>
            <span className="label-caps">Role</span>
            <span className="label-caps" style={{ textAlign: 'right' }}>Actions</span>
          </div>

          {users.map((u, index) => (
            <div 
              key={index} 
              className="glass-panel responsive-grid" 
              style={{ 
                gridTemplateColumns: '1.5fr 1fr 1fr 120px',
                alignItems: 'center',
                padding: 'var(--spacing-md)', 
                gap: 'var(--spacing-md)',
                backgroundColor: 'var(--color-surface-container)',
                textAlign: 'center'
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ margin: 0, fontSize: '16px' }}>{u.Name}</h3>
                <div className="tablet-show text-dim" style={{ display: 'none', fontSize: '12px', marginTop: '2px' }}>
                  @{u.Username}
                </div>
              </div>

              <div className="mobile-hide text-dim">{u.Username}</div>

              <div>
                <span className="label-caps" style={{ color: u.Role === 'Manager' ? 'var(--color-vibrant-green)' : 'var(--color-primary)', fontSize: '11px' }}>
                  {u.Role}
                </span>
              </div>

              <div style={{ textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button onClick={() => handleOpenModal(u)} style={{ background: 'var(--color-surface-container-high)', border: '1px solid var(--color-border)', color: 'var(--color-on-surface)', cursor: 'pointer', padding: '6px', borderRadius: '4px' }}><Edit size={16} /></button>
                <button onClick={() => handleDelete(u.Username)} style={{ background: 'var(--color-surface-container-high)', border: '1px solid var(--color-border)', color: 'var(--color-error)', cursor: 'pointer', padding: '6px', borderRadius: '4px' }}><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
          
          {users.length === 0 && (
            <div className="glass-panel" style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--color-outline)' }}>
              No users found.
            </div>
          )}
        </div>
      )}

      {/* USER MODAL */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', width: '100%', maxWidth: '400px', backgroundColor: 'var(--color-surface-container-lowest)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
              <h3 style={{ margin: 0 }}>{isEditing ? 'Edit User' : 'Add New User'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--color-outline)', cursor: 'pointer', padding: '6px' }}><X size={24} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <div>
                <label className="label-caps text-dim" style={{ display: 'block', marginBottom: '4px' }}>Full Name</label>
                <input 
                  type="text" 
                  value={formData.Name} 
                  onChange={(e) => setFormData({...formData, Name: e.target.value})}
                  style={{ width: '100%', padding: '10px', background: 'var(--color-surface-container)', color: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} 
                />
              </div>
              <div>
                <label className="label-caps text-dim" style={{ display: 'block', marginBottom: '4px' }}>Username</label>
                <input 
                  type="text" 
                  value={formData.Username} 
                  disabled={isEditing}
                  onChange={(e) => setFormData({...formData, Username: e.target.value})}
                  style={{ width: '100%', padding: '10px', background: 'var(--color-surface-container)', color: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', opacity: isEditing ? 0.5 : 1 }} 
                />
              </div>
              <div>
                <label className="label-caps text-dim" style={{ display: 'block', marginBottom: '4px' }}>Password</label>
                <input 
                  type="text" 
                  value={formData.Password} 
                  onChange={(e) => setFormData({...formData, Password: e.target.value})}
                  style={{ width: '100%', padding: '10px', background: 'var(--color-surface-container)', color: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} 
                />
              </div>
              <div>
                <label className="label-caps text-dim" style={{ display: 'block', marginBottom: '4px' }}>Role</label>
                <select 
                  value={formData.Role} 
                  onChange={(e) => setFormData({...formData, Role: e.target.value})}
                  style={{ width: '100%', padding: '10px', background: 'var(--color-surface-container)', color: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}
                >
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-lg)' }}>
              <button onClick={() => setShowModal(false)} disabled={isSaving} style={{ padding: '8px 16px', background: 'transparent', color: 'var(--color-on-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-base)', cursor: isSaving ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: isSaving ? 0.5 : 1 }}>CANCEL</button>
              <button onClick={handleSave} disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'var(--color-primary)', color: 'var(--color-on-primary)', border: 'none', borderRadius: 'var(--radius-base)', cursor: isSaving ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: isSaving ? 0.5 : 1 }}>
                <Save size={18} /> {isSaving ? 'SAVING...' : (isEditing ? 'SAVE CHANGES' : 'CREATE USER')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
