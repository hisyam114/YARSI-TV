import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Key, Save, ArrowLeft } from 'lucide-react';
import { showToast } from '../utils/toast';
import { fetchUsersData, executeApi, type UserItem } from '../services/googleSheets';
import { hashPassword, comparePassword } from '../utils/password';

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string; username?: string } | null>(null);
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Get current user from localStorage
  React.useEffect(() => {
    const savedUser = localStorage.getItem('yarsi_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setCurrentUser(parsedUser);
      } catch (e) {
        console.error('Failed to parse user session', e);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    if (newPassword.length < 4) {
      setError('New password must be at least 4 characters.');
      return;
    }

    setLoading(true);

    try {
      // Fetch current users to find this user and verify old password
      const users = await fetchUsersData();
      // Use username if available, otherwise fallback to name
      const userData = users.find(u => u.Username === currentUser?.username || u.Name === currentUser?.name);
      
      if (!userData) {
        setError('User not found. Please login again.');
        setLoading(false);
        return;
      }

      // Verify old password matches (compare with hashed password)
      const isValidPassword = await comparePassword(oldPassword, userData.Password || '');
      if (!isValidPassword) {
        setError('Old password is incorrect.');
        setLoading(false);
        return;
      }

      // Hash the new password before saving
      const hashedPassword = await hashPassword(newPassword);

      // Update password in spreadsheet
      const updatedUser: UserItem = {
        ...userData,
        Password: hashedPassword
      };

      const success = await executeApi('Users', 'update', updatedUser);
      
      if (success) {
        showToast('Password updated successfully!', 'success');
        // Clear form
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError('Failed to update password. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Password update error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="container-padding" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate(-1)}
        style={{ 
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'transparent', border: 'none', 
          color: 'var(--color-on-surface)', cursor: 'pointer',
          padding: '8px 0', marginBottom: 'var(--spacing-md)'
        }}
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="glass-panel" style={{ padding: 'var(--spacing-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)' }}>
          <Key size={28} color="var(--color-primary)" />
          <h2 style={{ margin: 0 }}>Change Password</h2>
        </div>

        <p className="text-dim" style={{ marginBottom: 'var(--spacing-lg)', fontSize: '14px' }}>
          Update your password for security. Make sure to remember your new password.
        </p>

        {error && (
          <div style={{ 
            color: 'var(--color-error)', 
            backgroundColor: 'var(--color-error-container)', 
            padding: 'var(--spacing-sm)', 
            borderRadius: 'var(--radius-sm)', 
            fontSize: '14px',
            marginBottom: 'var(--spacing-md)'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <div>
              <label className="label-caps text-dim" style={{ display: 'block', marginBottom: '4px' }}>Current Password</label>
              <input 
                type="password" 
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                placeholder="Enter your current password"
                style={{ 
                  width: '100%', 
                  padding: '12px 10px', 
                  background: 'var(--color-surface-container)', 
                  color: 'white', 
                  border: '1px solid var(--color-border)', 
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '16px'
                }} 
              />
            </div>

            <div>
              <label className="label-caps text-dim" style={{ display: 'block', marginBottom: '4px' }}>New Password</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Enter your new password (min 4 characters)"
                style={{ 
                  width: '100%', 
                  padding: '12px 10px', 
                  background: 'var(--color-surface-container)', 
                  color: 'white', 
                  border: '1px solid var(--color-border)', 
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '16px'
                }} 
              />
            </div>

            <div>
              <label className="label-caps text-dim" style={{ display: 'block', marginBottom: '4px' }}>Confirm New Password</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Re-enter your new password"
                style={{ 
                  width: '100%', 
                  padding: '12px 10px', 
                  background: 'var(--color-surface-container)', 
                  color: 'white', 
                  border: '1px solid var(--color-border)', 
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '16px'
                }} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-lg)' }}>
            <button 
              type="button"
              onClick={() => {
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setError('');
              }}
              style={{ 
                padding: '10px 20px', 
                background: 'transparent', 
                color: 'var(--color-on-surface)', 
                border: '1px solid var(--color-border)', 
                borderRadius: 'var(--radius-base)', 
                cursor: 'pointer', 
                fontWeight: 600 
              }}
            >
              Clear
            </button>
            <button 
              type="submit"
              disabled={loading}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '10px 20px', 
                background: 'var(--color-primary)', 
                color: 'var(--color-on-primary)', 
                border: 'none', 
                borderRadius: 'var(--radius-base)', 
                cursor: loading ? 'not-allowed' : 'pointer', 
                fontWeight: 600,
                opacity: loading ? 0.7 : 1
              }}
            >
              <Save size={18} />
              {loading ? 'UPDATING...' : 'UPDATE PASSWORD'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;