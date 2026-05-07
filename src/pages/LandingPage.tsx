import React, { useEffect, useState } from 'react';
import { fetchScheduleData, type ScheduleItem } from '../services/googleSheets';
import { parseSheetDate, formatDateToDDMMYYYY } from '../utils/dateUtils';

const CAROUSEL_IMAGES = [
  'images/jumbotron_studio_control_1778141117172.png',
  'images/jumbotron_cameras_1778141133845.png',
  'images/jumbotron_audio_mixer_1778141150656.png'
];

const getStatusColor = (status?: string) => {
  const s = status?.toLowerCase() || '';
  if (s === 'ongoing') return 'var(--color-vibrant-green)';
  if (s === 'upcoming') return 'var(--color-outline)';
  if (s === 'done' || s === 'completed') return 'var(--color-primary)';
  if (s === 'cancelled') return 'var(--color-error)';
  return 'var(--color-outline)';
};

const getStatusBg = (status?: string) => {
  const s = status?.toLowerCase() || '';
  if (s === 'ongoing') return 'rgba(0, 255, 65, 0.1)';
  if (s === 'upcoming') return 'var(--color-surface-container-high)';
  if (s === 'done' || s === 'completed') return 'rgba(33, 150, 243, 0.1)';
  if (s === 'cancelled') return 'rgba(244, 67, 54, 0.1)';
  return 'var(--color-surface-container-high)';
};

const LandingPage: React.FC = () => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // Carousel Auto-play
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchScheduleData();
        const activeSchedules = data.filter(item => {
           const s = item.Status?.toLowerCase();
           return s !== 'completed' && s !== 'done';
        });
        
        // Sort: ascending by date/time, handles DD/MM/YYYY and YYYY-MM-DD
        activeSchedules.sort((a, b) => {
          return parseSheetDate(a.Date, a.Start_Time).getTime() - 
                 parseSheetDate(b.Date, b.Start_Time).getTime();
        });
        
        setSchedule(activeSchedules);
      } catch (error) {
        console.error("Failed to fetch schedule data", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)', position: 'relative' }}>
      
      {/* Floating Header */}
      <header style={{ 
        position: 'absolute', 
        top: 0, left: 0, right: 0, 
        zIndex: 10,
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: 'var(--spacing-lg) 5%',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)'
      }}>
        <div>
          <h1 style={{ color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.5)', margin: 0 }}>YARSI TV</h1>
          <p className="label-caps" style={{ color: 'rgba(255,255,255,0.8)', textShadow: '0 1px 5px rgba(0,0,0,0.5)', margin: 0 }}>Live Broadcast Network</p>
        </div>
        <a href="#/login" style={{ 
          background: 'rgba(0,0,0,0.5)', 
          backdropFilter: 'blur(10px)',
          color: 'white',
          border: '1px solid rgba(255,255,255,0.2)',
          padding: 'var(--spacing-sm) var(--spacing-md)',
          borderRadius: 'var(--radius-base)',
          fontWeight: 600,
          textDecoration: 'none',
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
        }}>
          Control Room Login
        </a>
      </header>

      {/* Jumbotron Carousel */}
      <div style={{ 
        height: '60vh', 
        width: '100%', 
        position: 'relative', 
        overflow: 'hidden',
        backgroundColor: '#000'
      }}>
        {CAROUSEL_IMAGES.map((img, idx) => (
          <div 
            key={idx}
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundImage: `url(${img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: currentImageIndex === idx ? 0.6 : 0,
              transition: 'opacity 1s ease-in-out'
            }}
          />
        ))}
        {/* Gradient Overlay for smooth transition to content */}
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0, height: '150px',
          background: 'linear-gradient(to top, var(--color-background) 0%, transparent 100%)'
        }} />
      </div>

      {/* Main Content - Schedules List Mode */}
      <section style={{ padding: '0 5%', maxWidth: '1440px', margin: '-50px auto 0', position: 'relative', zIndex: 5, paddingBottom: 'var(--spacing-xl)' }}>
        <h2 style={{ marginBottom: 'var(--spacing-md)', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>Live & Upcoming Broadcasts</h2>
        
        {loading ? (
          <div className="glass-panel" style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--color-outline)' }}>
            Loading Live Schedule...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {/* Header Row for the Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '180px 120px 2fr 1.5fr 1fr 120px', 
              padding: 'var(--spacing-sm) var(--spacing-md)', 
              color: 'var(--color-outline)',
              gap: 'var(--spacing-md)',
              textAlign: 'center'
            }}>
              <span className="label-caps">Time</span>
              <span className="label-caps">Date</span>
              <span className="label-caps" style={{ textAlign: 'left' }}>Program Name</span>
              <span className="label-caps">Location</span>
              <span className="label-caps">PIC</span>
              <span className="label-caps">Status</span>
            </div>

            {schedule.map((item, index) => {
              const statusColor = getStatusColor(item.Status);
              const statusBg = getStatusBg(item.Status);
              const isOngoing = item.Status?.toLowerCase() === 'ongoing';
              
              return (
                <div key={index} className="glass-panel" style={{ 
                  display: 'grid',
                  gridTemplateColumns: '180px 120px 2fr 1.5fr 1fr 120px',
                  alignItems: 'center',
                  padding: 'var(--spacing-md)', 
                  borderLeft: `4px solid ${statusColor}`,
                  gap: 'var(--spacing-md)',
                  transition: 'transform 0.2s ease, background-color 0.2s ease',
                  cursor: 'default',
                  backgroundColor: isOngoing ? 'var(--color-surface-container-high)' : 'var(--color-surface-container)',
                  textAlign: 'center'
                }}>
                  {/* Time */}
                  <div style={{ fontWeight: 600, fontSize: '16px', color: isOngoing ? 'white' : 'var(--color-on-surface)' }}>
                    {item.Start_Time} - {item.End_Time}
                  </div>

                  {/* Date */}
                  <div className="text-dim label-caps">
                    {formatDateToDDMMYYYY(item.Date)}
                  </div>

                  {/* Program Name */}
                  <h3 style={{ margin: 0, fontSize: '18px', color: isOngoing ? 'white' : 'var(--color-on-surface)', textAlign: 'left' }}>
                    {item.Program_Name}
                  </h3>

                  {/* Location */}
                  <div className="text-dim">
                    {item.Location}
                  </div>

                  {/* PIC */}
                  <div className="text-dim">
                    {item.PIC}
                  </div>

                  {/* Status Indicator */}
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <span className="label-caps" style={{ 
                      padding: 'var(--spacing-xs) var(--spacing-sm)', 
                      backgroundColor: statusBg,
                      color: statusColor,
                      borderRadius: 'var(--radius-full)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: isOngoing ? `0 0 10px ${statusBg}` : 'none'
                    }}>
                      {isOngoing && <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }} />}
                      {item.Status}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {schedule.length === 0 && (
              <div className="glass-panel" style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--color-outline)' }}>
                No active broadcasts scheduled at this time.
              </div>
            )}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--color-border)',
        padding: 'var(--spacing-xl) 5%',
        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, var(--color-surface-container-lowest) 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--spacing-md)'
      }}>
        <div style={{ display: 'flex', gap: 'var(--spacing-xl)', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, color: 'white' }}>YARSI TV</h2>
            <p className="text-dim" style={{ margin: 0 }}>Universitas YARSI Broadcast Network</p>
          </div>
          <div style={{ height: '40px', width: '1px', backgroundColor: 'var(--color-border)' }} />
          <div style={{ display: 'flex', gap: 'var(--spacing-lg)' }}>
            <a href="https://www.yarsi.ac.id/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>yarsi.ac.id</a>
            <a href="#/login" style={{ color: 'var(--color-outline)', textDecoration: 'none' }}>Admin Portal</a>
            <a href="#" style={{ color: 'var(--color-outline)', textDecoration: 'none' }}>Schedule Contact</a>
          </div>
        </div>
        <div className="text-dim label-caps" style={{ fontSize: '12px', marginTop: 'var(--spacing-md)' }}>
          © {new Date().getFullYear()} Universitas YARSI. All rights reserved.
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
