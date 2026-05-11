import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchBlogData, type BlogArticle } from '../services/googleSheets';
import { ArrowLeft, Calendar, Clock, User, Share2 } from 'lucide-react';

const ArticleDetail: React.FC = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<BlogArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedArticles, setRelatedArticles] = useState<BlogArticle[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loadArticle = async () => {
      try {
        const articles = await fetchBlogData();
        const found = articles.find(a => a.Article_ID === articleId);
        
        if (found) {
          setArticle(found);
          // Get related articles (same category, excluding current)
          const related = articles
            .filter(a => a.Category === found.Category && a.Article_ID !== articleId)
            .slice(0, 3);
          setRelatedArticles(related);
        }
      } catch (error) {
        console.error("Failed to fetch article", error);
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [articleId]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '3px solid var(--color-surface-container)', 
            borderTop: '3px solid var(--color-primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: 'var(--color-outline)' }}>Loading article...</p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-panel" style={{ padding: 'var(--spacing-xl)', textAlign: 'center', maxWidth: '400px' }}>
          <h2 style={{ marginBottom: 'var(--spacing-md)' }}>Article Not Found</h2>
          <p className="text-dim" style={{ marginBottom: 'var(--spacing-lg)' }}>The article you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/')}
            style={{
              background: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: 'var(--radius-base)',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,155,90,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      {/* Sticky Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
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
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'transparent',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-vibrant-green)';
            e.currentTarget.style.transform = 'translateX(-4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <h1 style={{
          color: 'white',
          fontSize: isScrolled ? '18px' : '24px',
          fontWeight: 700,
          margin: 0,
          transition: 'font-size 0.3s ease',
          maxWidth: '60%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          YARSI TV
        </h1>
        <div style={{ width: '40px' }} />
      </header>

      {/* Add padding for fixed header */}
      <div style={{ height: isScrolled ? '60px' : '120px', transition: 'height 0.3s ease' }} />

      {/* Hero Image */}
      <div style={{
        height: 'clamp(300px, 50vh, 500px)',
        backgroundImage: article.Image_URL ? `url(${article.Image_URL})` : 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-vibrant-green) 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)'
        }} />

        {/* Category Badge */}
        <div style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          background: 'rgba(0, 155, 90, 0.9)',
          backdropFilter: 'blur(10px)',
          padding: '8px 16px',
          borderRadius: 'var(--radius-full)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span className="label-caps" style={{ color: 'white', fontSize: '12px', fontWeight: 700 }}>
            {article.Category}
          </span>
        </div>

        {/* Title Overlay */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '40px 5%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: 'clamp(28px, 6vw, 48px)',
            fontWeight: 900,
            color: 'white',
            lineHeight: 1.2,
            textShadow: '0 4px 20px rgba(0,0,0,0.5)'
          }}>
            {article.Title}
          </h1>
        </div>
      </div>

      {/* Article Meta */}
      <div style={{
        background: 'var(--color-surface-container-low)',
        padding: 'var(--spacing-lg) 5%',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-md)',
        flexWrap: 'wrap',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
          {/* Author */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: '18px'
            }}>
              {article.Author?.charAt(0) || 'A'}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'white' }}>{article.Author || 'YARSI TV Team'}</div>
              <div className="text-dim" style={{ fontSize: '12px' }}>Author</div>
            </div>
          </div>

          <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--color-border)' }} />

          {/* Date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-outline)' }}>
            <Calendar size={16} />
            <span style={{ fontSize: '14px' }}>{article.Published_Date || 'Recently published'}</span>
          </div>

          {/* Read Time */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-outline)' }}>
            <Clock size={16} />
            <span style={{ fontSize: '14px' }}>{article.Read_Time || '5 min read'}</span>
          </div>
        </div>

        {/* Share Button */}
        <button
          onClick={() => {
            const url = window.location.href;
            navigator.clipboard.writeText(url);
            alert('Article link copied to clipboard!');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--color-surface-container)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-primary)',
            padding: '8px 16px',
            borderRadius: 'var(--radius-base)',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '13px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-primary)';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--color-surface-container)';
            e.currentTarget.style.color = 'var(--color-primary)';
          }}
        >
          <Share2 size={16} />
          Share
        </button>
      </div>

      {/* Main Content */}
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: 'var(--spacing-xl) 5%' }}>
        {/* Summary */}
        {article.Summary && (
          <div style={{
            background: 'var(--color-surface-container)',
            padding: 'var(--spacing-lg)',
            borderRadius: 'var(--radius-lg)',
            borderLeft: '4px solid var(--color-primary)',
            marginBottom: 'var(--spacing-xl)',
            fontSize: '16px',
            fontStyle: 'italic',
            color: 'var(--color-on-surface)',
            lineHeight: 1.8
          }}>
            {article.Summary}
          </div>
        )}

        {/* Article Content */}
        <div style={{
          fontSize: '16px',
          lineHeight: 1.8,
          color: 'var(--color-on-surface)',
          wordBreak: 'break-word'
        }}>
          {article.Content ? (
            article.Content.split('\n').map((paragraph, idx) => (
              <p key={idx} style={{ marginBottom: 'var(--spacing-md)', textAlign: 'justify' }}>
                {paragraph}
              </p>
            ))
          ) : (
            <p style={{ color: 'var(--color-outline)' }}>No content available for this article.</p>
          )}
        </div>
      </main>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section style={{
          padding: 'var(--spacing-xl) 5%',
          background: 'linear-gradient(180deg, var(--color-background) 0%, var(--color-surface-container-lowest) 100%)',
          borderTop: '1px solid var(--color-border)'
        }}>
          <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: 'var(--spacing-lg)', fontSize: 'clamp(24px, 4vw, 32px)' }}>Related Articles</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 'var(--spacing-md)'
            }}>
              {relatedArticles.map((relArticle) => (
                <article
                  key={relArticle.Article_ID}
                  onClick={() => navigate(`/article/${relArticle.Article_ID}`)}
                  className="glass-panel"
                  style={{
                    background: 'var(--color-surface-container)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    border: '1px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  <div style={{
                    height: '160px',
                    backgroundImage: relArticle.Image_URL ? `url(${relArticle.Image_URL})` : 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-vibrant-green) 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }} />
                  <div style={{ padding: 'var(--spacing-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--spacing-sm)' }}>
                      <span className="label-caps" style={{ fontSize: '10px', color: 'var(--color-primary)', fontWeight: 700 }}>
                        {relArticle.Category}
                      </span>
                      <span className="text-dim" style={{ fontSize: '11px' }}>
                        {relArticle.Published_Date}
                      </span>
                    </div>
                    <h3 style={{
                      margin: '0 0 var(--spacing-sm) 0',
                      fontSize: '16px',
                      fontWeight: 700,
                      lineHeight: 1.4,
                      color: 'var(--color-on-surface)',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {relArticle.Title}
                    </h3>
                    <p style={{
                      margin: 0,
                      fontSize: '13px',
                      color: 'var(--color-outline)',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {relArticle.Summary}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

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

export default ArticleDetail;
