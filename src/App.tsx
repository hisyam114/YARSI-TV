import { HashRouter, Routes, Route } from 'react-router-dom';
import './App.css';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import InventoryManagement from './pages/InventoryManagement';
import ScheduleForm from './pages/ScheduleForm';
import UserManagement from './pages/UserManagement';
import ChangePassword from './pages/ChangePassword';
import BlogManagement from './pages/BlogManagement';

// Components
import AdminLayout from './components/AdminLayout';

function App() {
  return (
    <HashRouter>
      <div className="app-container">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />

          {/* Admin Routes with Layout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="inventory" element={<InventoryManagement />} />
            <Route path="schedule/new" element={<ScheduleForm />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="change-password" element={<ChangePassword />} />
            <Route path="blogs" element={<BlogManagement />} />
          </Route>
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;
