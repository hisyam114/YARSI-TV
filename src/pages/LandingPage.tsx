import React, { useEffect, useState } from 'react';
import { fetchScheduleData, fetchBlogData, type ScheduleItem, type BlogArticle } from '../services/googleSheets';
import { parseSheetDate, formatDateToDDMMYYYY, getDayNameIndonesian, normalizeDateToISO } from '../utils/dateUtils';
import { clearLogoutTransition } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import FloatingAIAssistant from '../components/FloatingAIAssistant';

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
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('');
  const [showLogoutExit, setShowLogoutExit] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Get current month in YYYY-MM format
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  useEffect(() => {
    // Carousel Auto-play
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Handle scroll for sticky navbar
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Check if we need to show logout transition animation
    const showTransition = clearLogoutTransition();
    if (showTransition) {
      // Immediately show green overlay with text (from admin navigation)
      setShowLogoutExit(true);
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

  useEffect(() => {
    const loadArticles = async () => {
      try {
        const data = await fetchBlogData();
        // Sort by published date (newest first)
        const sorted = data.sort((a, b) => {
          const dateA = new Date(a.Published_Date);
          const dateB = new Date(b.Published_Date);
          return dateB.getTime() - dateA.getTime();
        });
        setArticles(sorted);
      } catch (error) {
        console.error("Failed to fetch blog data", error);
      } finally {
        setArticlesLoading(false);
      }
    };

    loadArticles();
  }, []);

  // Filter schedules by selected month or default to current month
  const getFilteredSchedules = () => {
    const currentMonth = getCurrentMonth();
    
    if (selectedMonthFilter) {
      // Filter by selected month
      return schedule.filter(item => {
        const itemDate = normalizeDateToISO(item.Date);
        const itemMonth = itemDate.substring(0, 7); // YYYY-MM
        return itemMonth === selectedMonthFilter;
      });
    } else {
      // Default: show current month only
      return schedule.filter(item => {
        const itemDate = normalizeDateToISO(item.Date);
        const itemMonth = itemDate.substring(0, 7); // YYYY-MM
        return itemMonth === currentMonth;
      });
    }
  };

  const filteredSchedule = getFilteredSchedules();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)', position: 'relative' }}>
      {/* Floating AI Assistant */}
      <FloatingAIAssistant />
      
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
        position: 'fixed', 
        top: 0, left: 0, right: 0, 
        zIndex: 1000,
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: isScrolled ? 'clamp(0.5rem, 3vw, 1rem) 5%' : 'clamp(1rem, 5vw, 2.5rem) 5%',
        background: isScrolled 
          ? 'linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.85) 100%)' 
          : 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)',
        backdropFilter: isScrolled ? 'blur(10px)' : 'none',
        boxShadow: isScrolled ? '0 4px 20px rgba(0,0,0,0.3)' : 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Logo - Left */}
        <div style={{ flex: '0 1 auto', transition: 'transform 0.3s ease' }}>
          <h1 style={{ 
            color: 'white', 
            textShadow: '0 2px 10px rgba(0,0,0,0.5)', 
            margin: 0, 
            fontSize: isScrolled ? 'clamp(20px, 5vw, 36px)' : 'clamp(24px, 6vw, 48px)',
            transition: 'font-size 0.3s ease'
          }}>YARSI TV</h1>
          <p 
            className="label-caps" 
            style={{ 
              color: 'rgba(255,255,255,0.8)', 
              textShadow: '0 1px 5px rgba(0,0,0,0.5)', 
              margin: 0,
              opacity: isScrolled ? 0 : 1,
              maxHeight: isScrolled ? '0px' : '30px',
              overflow: 'hidden',
              transition: 'all 0.3s ease'
            }}
          >Live Broadcast Network</p>
        </div>

        {/* Navigation Menu - Center */}
        <nav style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'clamp(1.5rem, 4vw, 3rem)',
          justifyContent: 'center',
          flex: '1 1 auto'
        }}>
          <button 
            onClick={() => scrollToSection('schedule-section')}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'rgba(255,255,255,0.9)',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 600,
              transition: 'all 0.2s ease',
              textDecoration: 'none',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              padding: '8px 0'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-vibrant-green)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Schedule
          </button>
          <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.3)' }} />
          <button 
            onClick={() => scrollToSection('articles-section')}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'rgba(255,255,255,0.9)',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 600,
              transition: 'all 0.2s ease',
              textDecoration: 'none',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              padding: '8px 0'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-vibrant-green)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Articles
          </button>
          <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.3)' }} />
          <button 
            onClick={() => scrollToSection('footer-section')}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'rgba(255,255,255,0.9)',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 600,
              transition: 'all 0.2s ease',
              textDecoration: 'none',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              padding: '8px 0'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-vibrant-green)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Contact
          </button>
        </nav>

        {/* Login Button - Right */}
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
          fontSize: '14px',
          flex: '0 1 auto'
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

      {/* Add padding to account for fixed header */}
      <div style={{ height: isScrolled ? '60px' : '120px', transition: 'height 0.3s ease' }} />
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
      <section id="schedule-section" className="container-padding" style={{ maxWidth: '1440px', margin: '-50px auto 0', position: 'relative', zIndex: 5, paddingBottom: 'var(--spacing-xl)' }}>
        <h2 style={{ marginBottom: 'var(--spacing-md)', textShadow: '0 2px 10px rgba(0,0,0,0.5)', textAlign: 'center' }}>Live & Upcoming Broadcasts</h2>
        
        {/* Month Filter */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'var(--spacing-sm)', 
          marginBottom: 'var(--spacing-md)',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <label className="label-caps text-dim" style={{ fontSize: '12px', color: 'var(--color-outline)' }}>Filter by Month:</label>
          <input 
            type="month"
            value={selectedMonthFilter || getCurrentMonth()}
            onChange={(e) => setSelectedMonthFilter(e.target.value)}
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
          {selectedMonthFilter && selectedMonthFilter !== getCurrentMonth() && (
            <button 
              onClick={() => setSelectedMonthFilter('')}
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
              Reset to Current Month
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
              gridTemplateColumns: '140px 110px 100px 2fr 1.5fr 1fr 120px', 
              padding: 'var(--spacing-sm) var(--spacing-md)', 
              color: 'var(--color-outline)',
              gap: 'var(--spacing-md)',
              textAlign: 'center',
              borderBottom: '2px solid var(--color-border)',
              backgroundColor: 'var(--color-surface-container-low)',
              borderRadius: 'var(--radius-sm)'
            }}>
              <span className="label-caps" style={{ fontSize: '11px' }}>Time</span>
              <span className="label-caps" style={{ fontSize: '11px' }}>Date</span>
              <span className="label-caps" style={{ fontSize: '11px' }}>Day</span>
              <span className="label-caps" style={{ textAlign: 'left', fontSize: '11px' }}>Program Name</span>
              <span className="label-caps" style={{ fontSize: '11px' }}>Location</span>
              <span className="label-caps" style={{ fontSize: '11px' }}>PIC</span>
              <span className="label-caps" style={{ fontSize: '11px' }}>Status</span>
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
                    gridTemplateColumns: '140px 110px 100px 2fr 1.5fr 1fr 120px',
                    alignItems: 'center',
                    gap: 'var(--spacing-md)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: isOngoing ? 'white' : 'var(--color-on-surface)', whiteSpace: 'nowrap' }}>
                      {item.Start_Time} - {item.End_Time}
                    </div>
                    <div className="text-dim" style={{ fontSize: '13px' }}>
                      {formatDateToDDMMYYYY(item.Date)}
                    </div>
                    <div style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '13px' }}>
                      {item.DayName || getDayNameIndonesian(item.Date)}
                    </div>
                    <h3 style={{ margin: 0, fontSize: '15px', color: isOngoing ? 'white' : 'var(--color-on-surface)', textAlign: 'left', fontWeight: 600 }}>
                      {item.Program_Name}
                    </h3>
                    <div className="text-dim" style={{ fontSize: '13px' }}>{item.Location}</div>
                    <div className="text-dim" style={{ fontSize: '13px' }}>{item.PIC}</div>
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
                No broadcasts scheduled for this month.
              </div>
            )}
          </div>
        )}
      </section>

      {/* Articles / Blog Section */}
      <section id="articles-section" style={{ 
        padding: 'var(--spacing-xl) 5%',
        background: 'linear-gradient(180deg, var(--color-background) 0%, var(--color-surface-container-lowest) 100%)'
      }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px',
              background: 'var(--color-surface-container)',
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              marginBottom: 'var(--spacing-md)'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
              <span className="label-caps" style={{ color: 'var(--color-primary)', fontSize: '12px' }}>Broadcast & Media Insights</span>
            </div>
            <h2 style={{ marginBottom: 'var(--spacing-xs)', fontSize: 'clamp(24px, 4vw, 36px)' }}>Latest Articles</h2>
            <p className="text-dim" style={{ maxWidth: '600px', margin: '0 auto' }}>
              Stay updated with the latest insights on broadcasting, cinematography, and media production from our team.
            </p>
          </div>

          {articlesLoading ? (
            /* Skeleton Loading */
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 'var(--spacing-md)'
            }}>
              {[1, 2, 3].map((i) => (
                <div 
                  key={i}
                  className="glass-panel"
                  style={{ 
                    background: 'var(--color-surface-container)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    animation: 'pulse 2s ease-in-out infinite'
                  }}
                >
                  <div style={{ height: '200px', backgroundColor: 'var(--color-surface-container-high)' }} />
                  <div style={{ padding: 'var(--spacing-md)' }}>
                    <div style={{ height: '20px', backgroundColor: 'var(--color-surface-container-high)', borderRadius: '4px', width: '60%', marginBottom: '12px' }} />
                    <div style={{ height: '24px', backgroundColor: 'var(--color-surface-container-high)', borderRadius: '4px', marginBottom: '12px' }} />
                    <div style={{ height: '60px', backgroundColor: 'var(--color-surface-container-high)', borderRadius: '4px' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : articles.length > 0 ? (
            /* Articles Grid */
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 'var(--spacing-md)'
            }}>
              {articles.slice(0, 3).map((article, index) => {
                const isFeatured = index === 0;
                return (
                  <article 
                    key={article.Article_ID}
                    onClick={() => navigate(`/article/${article.Article_ID}`)}
                    className="glass-panel"
                    style={{ 
                      background: 'var(--color-surface-container)',
                      borderRadius: 'var(--radius-lg)',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      border: isFeatured ? '1px solid var(--color-primary)' : '1px solid transparent',
                      boxShadow: isFeatured ? '0 8px 32px rgba(0, 155, 90, 0.15)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = isFeatured ? '0 8px 32px rgba(0, 155, 90, 0.15)' : 'none';
                    }}
                  >
                    {/* Article Image */}
                    <div style={{ 
                      height: '200px', 
                      backgroundImage: article.Image_URL ? `url(${article.Image_URL})` : 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-vibrant-green) 100%)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative'
                    }}>
                      {/* Category Badge */}
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(10px)',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-full)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span className="label-caps" style={{ color: 'white', fontSize: '10px', fontWeight: 600 }}>
                          {article.Category}
                        </span>
                      </div>
                      
                      {/* Featured Badge */}
                      {isFeatured && (
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          background: 'var(--color-primary)',
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                          </svg>
                          <span className="label-caps" style={{ color: 'white', fontSize: '10px', fontWeight: 700 }}>FEATURED</span>
                        </div>
                      )}
                    </div>

                    {/* Article Content */}
                    <div style={{ padding: 'var(--spacing-md)' }}>
                      {/* Meta Info */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px',
                        marginBottom: 'var(--spacing-sm)',
                        flexWrap: 'wrap'
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px',
                          color: 'var(--color-outline)'
                        }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                          <span style={{ fontSize: '12px' }}>{article.Published_Date || 'Recently published'}</span>
                        </div>
                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--color-outline)' }} />
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px',
                          color: 'var(--color-outline)'
                        }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                          </svg>
                          <span style={{ fontSize: '12px' }}>{article.Read_Time || '5 min read'}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 style={{ 
                        margin: '0 0 var(--spacing-sm) 0',
                        fontSize: '18px',
                        fontWeight: 700,
                        lineHeight: 1.4,
                        color: 'var(--color-on-surface)'
                      }}>
                        {article.Title}
                      </h3>

                      {/* Summary */}
                      <p style={{ 
                        margin: 0,
                        fontSize: '14px',
                        color: 'var(--color-outline)',
                        lineHeight: 1.6,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {article.Summary || article.Content?.substring(0, 150) + '...'}
                      </p>

                      {/* Footer */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        marginTop: 'var(--spacing-md)',
                        paddingTop: 'var(--spacing-md)',
                        borderTop: '1px solid var(--color-border)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'var(--color-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '14px'
                          }}>
                            {article.Author?.charAt(0) || 'A'}
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: 500 }}>{article.Author || 'YARSI TV Team'}</span>
                        </div>
                        
                        <button style={{
                          background: 'var(--color-surface-container-high)',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: 'var(--radius-base)',
                          color: 'var(--color-primary)',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.2s ease'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/article/${article.Article_ID}`);
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--color-primary)';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'var(--color-surface-container-high)';
                          e.currentTarget.style.color = 'var(--color-primary)';
                        }}>
                          Read More
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="5" y1="12" x2="19" y2="12"/>
                            <polyline points="12 5 19 12 12 19"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--color-outline)' }}>
              No articles available at the moment. Check back soon for new content!
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer id="footer-section" style={{
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
