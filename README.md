# YARSI TV Crew Portal 📺

A professional, real-time management system designed for the YARSI TV crew to coordinate broadcast schedules, track equipment inventory, and manage personnel.

![Live Status](https://img.shields.io/badge/Status-Live-success)
![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite)
![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react)
![Google Sheets](https://img.shields.io/badge/Database-Google%20Sheets-34A853?logo=google-sheets)

## 🚀 Key Features

### 📅 Broadcast Scheduling
- **Dynamic Sorting**: Intelligent sorting that prioritizes today's events and future programs.
- **Sequential ID Generation**: Automatic tracking of schedules with sequential formatting (e.g., `SCH-001`).
- **Real-time Updates**: Instant synchronization with Google Sheets backend.

### 🛠️ Inventory Management
- **Master Equipment Tracking**: Comprehensive database of studio assets.
- **Status Monitoring**: Live tracking of equipment condition and availability.
- **Audit Ready**: Every change is recorded in the centralized log.

### 🔐 Security & Access Control
- **Role-Based Access**: Specialized views and permissions for **Managers**, **Admins**, and **Users**.
- **Session Management**: Automated session resets to ensure security on public terminals.
- **Route Protection**: Secured admin dashboard accessible only to authenticated personnel.

### 📝 Activity Logging
- **Audit Trail**: Every creation, update, or deletion is automatically logged to the `Activity_Log` sheet.
- **Forensic Detail**: Logs include Timestamp, User identity, Action performed, and affected Record IDs.

---

## 🛠️ Built With

- **Frontend**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Backend**: [Google Apps Script API](https://developers.google.com/apps-script)
- **Styling**: Premium CSS Design System (Glassmorphism & Dynamic Animations)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Deployment**: [GitHub Pages](https://pages.github.com/)

---

## 📅 Data Standards

- **Date Format**: Standardized `DD/MM/YYYY` across the entire platform.
- **Time Format**: `HH:MM` (24-hour format).
- **Backend**: All data mutations are routed through a secure Google Apps Script gateway.

## 👨‍💻 Project Maintainer
Developed for **YARSI TV Crew**.

---

*This project is private and intended for use by YARSI TV personnel only.*
