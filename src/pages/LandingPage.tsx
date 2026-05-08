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
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>(''); // YYYY-MM-DD format
  const [showLogoutExit, setShowLogoutExit] = useState(false);

  useEffect(() => {
    // Carousel Auto-play
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check if we need to show logout transition animation
    const showTransition = localStorage.getItem('show_logout_transition');
    if (showTransition === 'true') {
      // Immediately show green overlay with text (from admin navigation)
      setShowLogoutExit(true);
      // Remove the flag so it doesn't replay
      localStorage.removeItem('show_logout_transition');
      // Start circle-out animation after a brief delay (1s total)
      setTimeout(() => {
        setShowLogoutExit(false);
      }, 1800);
    }
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

  // Filter schedules by selected date
  const getFilteredSchedules = () => {
    if (!selectedDateFilter) return schedule;
    
    return schedule.filter(item => {
      // Normalize item date to YYYY-MM-DD format for comparison
      const itemDate = item.Date;
      // Handle both DD/MM/YYYY and YYYY-MM-DD formats
      if (itemDate.includes('/')) {
        // DD/MM/YYYY format
        const parts = itemDate.split('/');
        if (parts.length === 3) {
          return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}` === selectedDateFilter;
        }
      } else if (itemDate.includes('-')) {
        // YYYY-MM-DD format - just compare directly
        return itemDate === selectedDateFilter;
      }
      return false;
    });
  };

  const filteredSchedule = getFilteredSchedules();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)', position: 'relative' }}>
      
      {/* Logout Exit Animation Overlay - Circle OUT (contract) */}
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
          
          {/* Logout Text */}
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
      
      {/* Floating Header */}
      <header style={{ 
        position: 'absolute', 
        top: 0, left: 0, right: 0, 
        zIndex: 10,
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: 'clamp(1rem, 5vw, 2.5rem) 5%',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ flex: '1 1 auto' }}>
          <h1 style={{ color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.5)', margin: 0, fontSize: 'clamp(24px, 6vw, 48px)' }}>YARSI TV</h1>
          <p className="label-caps" style={{ color: 'rgba(255,255,255,0.8)', textShadow: '0 1px 5px rgba(0,0,0,0.5)', margin: 0 }}>Live Broadcast Network</p>
        </div>
        <a href="#/login" style={{ 
          background: 'rgba(0, 155, 90, 0.5)', 
          backdropFilter: 'blur(10px)',
          color: 'white',
          border: '1px solid rgba(2, 122, 72, 0.5)',
          padding: 'var(--spacing-sm) var(--spacing-md)',
          borderRadius: 'var(--radius-base)',
          fontWeight: 600,
          textDecoration: 'none',
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          fontSize: '14px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0, 155, 90, 0.8)';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(0, 155, 90, 0.5)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
        }}
        >
          YARSI TV Login
        </a>
      </header>

      {/* Jumbotron Carousel */}
      <div style={{ 
        height: 'min(60vh, 400px)', 
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
      <section className="container-padding" style={{ maxWidth: '1440px', margin: '-50px auto 0', position: 'relative', zIndex: 5, paddingBottom: 'var(--spacing-xl)' }}>
        <h2 style={{ marginBottom: 'var(--spacing-md)', textShadow: '0 2px 10px rgba(0,0,0,0.5)', textAlign: 'center' }}>Live & Upcoming Broadcasts</h2>
        
        {/* Date Filter */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'var(--spacing-sm)', 
          marginBottom: 'var(--spacing-md)',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <label className="label-caps text-dim" style={{ fontSize: '12px', color: 'var(--color-outline)' }}>Filter by Date:</label>
          <input 
            type="date"
            value={selectedDateFilter}
            onChange={(e) => setSelectedDateFilter(e.target.value)}
            style={{ 
              background: 'var(--color-surface-container)', 
              color: 'var(--color-on-surface)', 
              border: '1px solid var(--color-border)', 
              padding: 'var(--spacing-xs) var(--spacing-sm)', 
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-primary)',
              fontSize: '14px',
              transition: 'all 0.2s ease',
              colorScheme: 'dark'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
          />
          {selectedDateFilter && (
            <button 
              onClick={() => setSelectedDateFilter('')}
              style={{ 
                background: 'transparent', 
                border: '1px solid var(--color-border)', 
                color: 'var(--color-outline)', 
                padding: 'var(--spacing-xs) var(--spacing-sm)', 
                borderRadius: 'var(--radius-sm)', 
                cursor: 'pointer', 
                fontSize: '12px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-surface-container-high)';
                e.currentTarget.style.borderColor = 'var(--color-outline)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'var(--color-border)';
              }}
            >
              Clear
            </button>
          )}
        </div>
        
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {/* Skeleton Loading Animation */}
            {[1, 2, 3].map((i) => (
              <div 
                key={i}
                className="glass-panel" 
                style={{ 
                  padding: 'var(--spacing-md)', 
                  borderLeft: '4px solid var(--color-surface-container-high)',
                  animation: 'pulse 2s ease-in-out infinite'
                }}
              >
                <div className="desktop-grid" style={{
                  gridTemplateColumns: '160px 110px 2fr 1.5fr 1fr 120px',
                  alignItems: 'center',
                  gap: 'var(--spacing-md)',
                  textAlign: 'center'
                }}>
                  <div style={{ height: '16px', backgroundColor: 'var(--color-surface-container-high)', borderRadius: '4px' }} />
                  <div style={{ height: '16px', backgroundColor: 'var(--color-surface-container-high)', borderRadius: '4px' }} />
                  <div style={{ height: '16px', backgroundColor: 'var(--color-surface-container-high)', borderRadius: '4px' }} />
                  <div style={{ height: '16px', backgroundColor: 'var(--color-surface-container-high)', borderRadius: '4px' }} />
                  <div style={{ height: '16px', backgroundColor: 'var(--color-surface-container-high)', borderRadius: '4px' }} />
                  <div style={{ height: '16px', backgroundColor: 'var(--color-surface-container-high)', borderRadius: '4px' }} />
                </div>
              </div>
            ))}
            <style>{`
              @keyframes pulse {
                0%, 100% { opacity: 0.6; }
                50% { opacity: 1; }
              }
            `}</style>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {/* Desktop Header Row */}
            <div className="desktop-grid" style={{ 
              gridTemplateColumns: '160px 110px 2fr 1.5fr 1fr 120px', 
              padding: 'var(--spacing-sm) var(--spacing-md)', 
              color: 'var(--color-outline)',
              gap: 'var(--spacing-md)',
              textAlign: 'center',
              borderBottom: '2px solid var(--color-border)',
              backgroundColor: 'var(--color-surface-container-low)',
              borderRadius: 'var(--radius-sm)'
            }}>
              <span className="label-caps">Time</span>
              <span className="label-caps">Date</span>
              <span className="label-caps" style={{ textAlign: 'left' }}>Program Name</span>
              <span className="label-caps">Location</span>
              <span className="label-caps">PIC</span>
              <span className="label-caps">Status</span>
            </div>

            {filteredSchedule.map((item, index) => {
              const statusColor = getStatusColor(item.Status);
              const statusBg = getStatusBg(item.Status);
              const isOngoing = item.Status?.toLowerCase() === 'ongoing';
              
              return (
                <div 
                  key={index} 
                  className="glass-panel" 
                  style={{ 
                    padding: 'var(--spacing-md)', 
                    borderLeft: `4px solid ${statusColor}`,
                    transition: 'all 0.2s ease',
                    cursor: 'default',
                    backgroundColor: isOngoing ? 'var(--color-surface-container-high)' : 'var(--color-surface-container)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-surface-container-high)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isOngoing ? 'var(--color-surface-container-high)' : 'var(--color-surface-container)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  {/* Desktop layout: full grid */}
                  <div className="desktop-grid" style={{ 
                    gridTemplateColumns: '160px 110px 2fr 1.5fr 1fr 120px',
                    alignItems: 'center',
                    gap: 'var(--spacing-md)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: isOngoing ? 'white' : 'var(--color-on-surface)' }}>
                      {item.Start_Time} - {item.End_Time}
                    </div>
                    <div className="text-dim label-caps" style={{ fontSize: '12px' }}>
                      {formatDateToDDMMYYYY(item.Date)}
                    </div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: isOngoing ? 'white' : 'var(--color-on-surface)', textAlign: 'left' }}>
                      {item.Program_Name}
                    </h3>
                    <div className="text-dim">{item.Location}</div>
                    <div className="text-dim">{item.PIC}</div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <span className="label-caps" style={{ 
                        padding: 'var(--spacing-xs) var(--spacing-sm)', 
                        backgroundColor: statusBg, color: statusColor,
                        borderRadius: 'var(--radius-full)',
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        boxShadow: isOngoing ? `0 0 10px ${statusBg}` : 'none'
                      }}>
                        {isOngoing && <div className="pulse-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }} />}
                        {item.Status}
                      </span>
                    </div>
                  </div>

                  {/* Mobile layout: 2-row card — Program Name + Status / Date + Time */}
                  <div className="mobile-only-flex" style={{ flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div style={{ fontWeight: 600, fontSize: '15px', color: isOngoing ? 'white' : 'var(--color-on-surface)', flex: 1, lineHeight: 1.3 }}>
                        {item.Program_Name}
                      </div>
                      <span className="label-caps" style={{ 
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        color: statusColor, fontSize: '10px', flexShrink: 0,
                        backgroundColor: statusBg, padding: '2px 6px', borderRadius: '99px'
                      }}>
                        {isOngoing && <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'currentColor' }} />}
                        {item.Status}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-outline)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span>{formatDateToDDMMYYYY(item.Date)}</span>
                      <span>·</span>
                      <span>{item.Start_Time} – {item.End_Time}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredSchedule.length === 0 && (
              <div className="glass-panel" style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--color-outline)' }}>
                {selectedDateFilter ? `No events registered for ${new Date(selectedDateFilter + 'T00:00').toLocaleDateString('en-GB')}.` : 'No active broadcasts scheduled at this time.'}
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
        gap: 'var(--spacing-xl)'
      }}>
        {/* Main Footer Grid */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--spacing-xl)',
          alignItems: 'start'
        }}>
          {/* Logo and Branding Section */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-md)', textAlign: 'center' }}>
            <div style={{ 
              width: '70px', 
              height: '70px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(0,155,90,0.4)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,155,90,0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,155,90,0.4)';
            }}>
              <span style={{ color: 'white', fontSize: '32px', fontWeight: 'bold' }}>Y</span>
            </div>
            <div>
              <h3 style={{ margin: 0, color: 'white', fontSize: '18px', fontWeight: 700 }}>YARSI TV</h3>
              <p className="text-dim" style={{ margin: '4px 0 0 0', fontSize: '13px' }}>Broadcast Network</p>
            </div>
          </div>
          
          {/* Address Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            <h4 style={{ margin: 0, color: 'var(--color-primary)', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              📍 Location
            </h4>
            <p style={{ margin: 0, color: 'var(--color-outline)', fontSize: '13px', lineHeight: 1.6 }}>
              Menara Yarsi<br />
              Jl. Letjen Suprapto No.Kav.13<br />
              RT.10/RW.5, Cemp. Putih Tim.<br />
              Kec. Cempaka Putih<br />
              Jakarta Pusat 10510
            </p>
          </div>
          
          {/* Quick Links Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            <h4 style={{ margin: 0, color: 'var(--color-primary)', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              🔗 Quick Links
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
              <a href="https://www.yarsi.ac.id/" target="_blank" rel="noopener noreferrer" 
                 style={{ 
                   color: 'var(--color-outline)', 
                   textDecoration: 'none', 
                   fontSize: '13px',
                   transition: 'all 0.2s ease',
                   display: 'inline-flex',
                   alignItems: 'center',
                   gap: '6px'
                 }}
                 onMouseEnter={(e) => {
                   e.currentTarget.style.color = 'var(--color-vibrant-green)';
                   e.currentTarget.style.transform = 'translateX(4px)';
                 }}
                 onMouseLeave={(e) => {
                   e.currentTarget.style.color = 'var(--color-outline)';
                   e.currentTarget.style.transform = 'translateX(0)';
                 }}
              >
                → yarsi.ac.id
              </a>
              <a href="#/login" 
                 style={{ 
                   color: 'var(--color-outline)', 
                   textDecoration: 'none', 
                   fontSize: '13px',
                   transition: 'all 0.2s ease',
                   display: 'inline-flex',
                   alignItems: 'center',
                   gap: '6px'
                 }}
                 onMouseEnter={(e) => {
                   e.currentTarget.style.color = 'var(--color-primary)';
                   e.currentTarget.style.transform = 'translateX(4px)';
                 }}
                 onMouseLeave={(e) => {
                   e.currentTarget.style.color = 'var(--color-outline)';
                   e.currentTarget.style.transform = 'translateX(0)';
                 }}
              >
                → Admin Portal
              </a>
              <a href="#" 
                 style={{ 
                   color: 'var(--color-outline)', 
                   textDecoration: 'none', 
                   fontSize: '13px',
                   transition: 'all 0.2s ease',
                   display: 'inline-flex',
                   alignItems: 'center',
                   gap: '6px'
                 }}
                 onMouseEnter={(e) => {
                   e.currentTarget.style.color = 'var(--color-primary)';
                   e.currentTarget.style.transform = 'translateX(4px)';
                 }}
                 onMouseLeave={(e) => {
                   e.currentTarget.style.color = 'var(--color-outline)';
                   e.currentTarget.style.transform = 'translateX(0)';
                 }}
              >
                → Contact
              </a>
            </div>
          </div>

          {/* Info Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            <h4 style={{ margin: 0, color: 'var(--color-primary)', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ℹ️ About
            </h4>
            <p style={{ margin: 0, color: 'var(--color-outline)', fontSize: '13px', lineHeight: 1.6 }}>
              YARSI TV is the official broadcast network of Universitas YARSI, delivering quality content and live programming.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', backgroundColor: 'var(--color-border)', opacity: 0.5 }} />

        {/* Copyright Section */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--spacing-md)',
          textAlign: 'center'
        }}>
          <div className="text-dim label-caps" style={{ fontSize: '12px' }}>
            © {new Date().getFullYear()} Universitas YARSI. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)', fontSize: '12px' }}>
            <span className="text-dim">Made with ❤️ by YARSI TV</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
