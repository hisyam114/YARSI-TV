// Session management utilities

export interface UserSession {
  name: string;
  role: string;
  username?: string;
  timestamp: number;
}

// Session timeout in milliseconds (24 hours)
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;

/**
 * Get the current user session from localStorage
 */
export const getSession = (): UserSession | null => {
  try {
    const stored = localStorage.getItem('yarsi_user');
    if (!stored) return null;
    
    const session = JSON.parse(stored) as UserSession;
    
    // Check if session is expired
    const now = new Date().getTime();
    if (session.timestamp && (now - session.timestamp > SESSION_TIMEOUT)) {
      clearSession();
      return null;
    }
    
    return session;
  } catch (e) {
    console.error('Failed to parse session', e);
    clearSession();
    return null;
  }
};

/**
 * Set the user session in localStorage
 */
export const setSession = (user: UserSession): void => {
  localStorage.setItem('yarsi_user', JSON.stringify({
    ...user,
    timestamp: new Date().getTime()
  }));
};

/**
 * Clear the user session
 */
export const clearSession = (): void => {
  localStorage.removeItem('yarsi_user');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return getSession() !== null;
};

/**
 * Get user role from session
 */
export const getUserRole = (): string | null => {
  const session = getSession();
  return session?.role || null;
};

/**
 * Check if user is Manager role
 */
export const isManager = (): boolean => {
  return getUserRole() === 'Manager';
};

/**
 * Set transition flags for animations
 */
export const setLoginTransition = (): void => {
  localStorage.setItem('show_login_transition', 'true');
};

export const setLogoutTransition = (): void => {
  localStorage.setItem('show_logout_transition', 'true');
};

export const clearLoginTransition = (): boolean => {
  const show = localStorage.getItem('show_login_transition') === 'true';
  if (show) {
    localStorage.removeItem('show_login_transition');
  }
  return show;
};

export const clearLogoutTransition = (): boolean => {
  const show = localStorage.getItem('show_logout_transition') === 'true';
  if (show) {
    localStorage.removeItem('show_logout_transition');
  }
  return show;
};