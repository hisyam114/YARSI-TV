import React, { useState, useEffect } from 'react';
import { Plus, X, Edit, Trash2, Eye } from 'lucide-react';
import { fetchBlogData, executeApi, type BlogArticle } from '../services/googleSheets';
import { showToast } from '../utils/toast';

const formatDateToDDMMYYYY = (dateString?: string) => {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateString;
};

const BlogManagement: React.FC = () => {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewArticle, setPreviewArticle] = useState<BlogArticle | null>(null);

  const initialFormState: BlogArticle = {
    Article_ID: '',
    Title: '',
    Category: 'Broadcasting',
    Author: '',
    Published_Date: new Date().toISOString().split('T')[0],
    Summary: '',
    Content: '',
    Image_URL: '',
    Read_Time: '5 min'
  };
  const [formData, setFormData] = useState<BlogArticle>(initialFormState);

  useEffect(() => {
    const loadData = async () => {
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
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getNextArticleId = (existingArticles: BlogArticle[]): string => {
    if (existingArticles.length === 0) return 'ART_001';
    
    // Extract numeric part from existing IDs (e.g., ART_001, ART_002)
    const ids = existingArticles
      .map(a => {
        const match = a.Article_ID.match(/ART_?(\d+)/i);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(num => num > 0);
    
    if (ids.length === 0) return 'ART_001';
    
    const maxId = Math.max(...ids);
    const nextNum = maxId + 1;
    return `ART_${nextNum.toString().padStart(3, '0')}`;
  };

  const handleOpenModal = (article?: BlogArticle) => {
    if (article) {
      setFormData(article);
      setIsEditing(true);
    } else {
      // Get current user for author field
      const session = localStorage.getItem('yarsi_user');
      const userName = session ? JSON.parse(session).name : 'YARSI TV Team';
      
      // Auto-generate next sequential Article ID
      const nextId = getNextArticleId(articles);
      
      setFormData({ 
        ...initialFormState, 
        Author: userName,
        Article_ID: nextId
      });
      setIsEditing(false);
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.Title || !formData.Summary) {
      showToast('Please fill Title and Summary', 'error');
      return;
    }
    setIsSaving(true);
    
    if (isEditing) {
      const success = await executeApi('Articles', 'update', formData);
      if (success) {
        setArticles(prev => prev.map(a => a.Article_ID === formData.Article_ID ? formData : a));
        setShowModal(false);
        showToast(`Article "${formData.Title}" updated.`, 'success');
      } else {
        showToast('Failed to update article.', 'error');
      }
    } else {
      const success = await executeApi('Articles', 'create', formData);
      if (success) {
        setArticles(prev => [formData, ...prev]);
        setShowModal(false);
        showToast(`Article "${formData.Title}" published.`, 'success');
      } else {
        showToast('Failed to publish article.', 'error');
      }
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(`Are you sure you want to delete this article?`)) {
      const articleToDelete = articles.find(a => a.Article_ID === id);
      if (articleToDelete) {
        const success = await executeApi('Articles', 'delete', articleToDelete);
        if (success) {
          setArticles(prev => prev.filter(a => a.Article_ID !== id));
          showToast(`Article deleted.`, 'info');
        } else {
          showToast('Failed to delete article.', 'error');
        }
      }
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Broadcasting': 'var(--color-primary)',
      'Cinematography': 'var(--color-vibrant-green)',
      'Media Production': '#FF6B35',
      'Technology': '#4ECDC4',
      'Tutorial': '#FFD93D'
    };
    return colors[category] || 'var(--color-outline)';
  };

  return (
    <div className="container-padding" style={{ maxWidth: '1440px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 'var(--spacing-md)',
        flexWrap: 'wrap',
        gap: 'var(--spacing-sm)'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 'clamp(20px, 4vw, 24px)' }}>Blog Articles</h2>
          <p className="text-dim" style={{ margin: '4px 0 0 0', fontSize: '14px' }}>Manage articles and insights</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'var(--spacing-xs)',
            background: 'var(--color-primary)',
            color: 'var(--color-on-primary)',
            border: 'none',
            padding: 'var(--spacing-sm) var(--spacing-md)',
            borderRadius: 'var(--radius-base)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <Plus size={18} />
          <span>NEW ARTICLE</span>
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          {[1, 2, 3].map((i) => (
            <div 
              key={i}
              className="glass-panel" 
              style={{ 
                padding: 'var(--spacing-md)', 
                animation: 'pulse 2s ease-in-out infinite'
              }}
            >
              <div style={{ height: '80px', backgroundColor: 'var(--color-surface-container-high)', borderRadius: '4px' }} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 'var(--spacing-md)' }}>
          {articles.map((article) => (
            <div 
              key={article.Article_ID} 
              className="glass-panel" 
              style={{ 
                padding: 0,
                overflow: 'hidden',
                backgroundColor: 'var(--color-surface-container)',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-surface-container-high)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-surface-container)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Article Image */}
              <div style={{ 
                height: '160px', 
                backgroundImage: article.Image_URL ? `url(${article.Image_URL})` : 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-vibrant-green) 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: getCategoryColor(article.Category),
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'white'
                }}>
                  {article.Category}
                </div>
              </div>

              {/* Article Content */}
              <div style={{ padding: 'var(--spacing-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--spacing-xs)', color: 'var(--color-outline)', fontSize: '12px' }}>
                  <span>{formatDateToDDMMYYYY(article.Published_Date)}</span>
                  <span>•</span>
                  <span>{article.Read_Time}</span>
                </div>

                <h3 style={{ 
                  margin: '0 0 var(--spacing-xs) 0', 
                  fontSize: '16px',
                  lineHeight: 1.4,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {article.Title}
                </h3>

                <p style={{ 
                  margin: '0 0 var(--spacing-sm) 0',
                  fontSize: '13px',
                  color: 'var(--color-outline)',
                  lineHeight: 1.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {article.Summary}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 'var(--spacing-sm)', borderTop: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--color-outline)' }}>
                    By {article.Author}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewArticle(article);
                      }}
                      style={{ 
                        background: 'var(--color-surface-container-high)', 
                        border: '1px solid var(--color-border)', 
                        color: 'var(--color-on-surface)', 
                        cursor: 'pointer', 
                        padding: '6px', 
                        borderRadius: '4px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--color-primary)';
                        e.currentTarget.style.color = 'var(--color-on-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--color-surface-container-high)';
                        e.currentTarget.style.color = 'var(--color-on-surface)';
                      }}
                    >
                      <Eye size={14} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(article);
                      }}
                      style={{ 
                        background: 'var(--color-surface-container-high)', 
                        border: '1px solid var(--color-border)', 
                        color: 'var(--color-on-surface)', 
                        cursor: 'pointer', 
                        padding: '6px', 
                        borderRadius: '4px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--color-primary)';
                        e.currentTarget.style.color = 'var(--color-on-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--color-surface-container-high)';
                        e.currentTarget.style.color = 'var(--color-on-surface)';
                      }}
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(article.Article_ID);
                      }}
                      style={{ 
                        background: 'var(--color-surface-container-high)', 
                        border: '1px solid var(--color-border)', 
                        color: 'var(--color-error)', 
                        cursor: 'pointer', 
                        padding: '6px', 
                        borderRadius: '4px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--color-error)';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--color-surface-container-high)';
                        e.currentTarget.style.color = 'var(--color-error)';
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {articles.length === 0 && (
            <div className="glass-panel" style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--color-outline)', gridColumn: '1 / -1' }}>
              No articles found. Create your first article!
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Article Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          overflowY: 'auto', padding: 'var(--spacing-md)'
        }}>
          <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', width: '100%', maxWidth: '700px', backgroundColor: 'var(--color-surface-container-lowest)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
              <h3>{isEditing ? 'Edit Article' : 'Create New Article'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--color-outline)', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            
            <form style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                  <label className="label-caps text-dim" style={{ color: 'var(--color-outline)' }}>Article ID <span style={{ color: 'var(--color-primary)', fontSize: '10px' }}>(auto-generated)</span></label>
                  <input type="text" value={formData.Article_ID} readOnly placeholder="Auto-generated" style={{ background: 'var(--color-surface-container)', color: 'var(--color-primary)', padding: 'var(--spacing-sm)', border: '1px solid var(--color-primary)', borderRadius: 'var(--radius-sm)', fontWeight: 600 }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                  <label className="label-caps text-dim" style={{ color: 'var(--color-outline)' }}>Category</label>
                  <select value={formData.Category} onChange={e => setFormData({...formData, Category: e.target.value})} style={{ background: 'var(--color-surface-container)', color: 'var(--color-on-surface)', padding: 'var(--spacing-sm)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                    <option>Broadcasting</option>
                    <option>Cinematography</option>
                    <option>Media Production</option>
                    <option>Technology</option>
                    <option>Tutorial</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                <label className="label-caps text-dim" style={{ color: 'var(--color-outline)' }}>Title *</label>
                <input type="text" value={formData.Title} onChange={e => setFormData({...formData, Title: e.target.value})} placeholder="Enter article title" style={{ background: 'var(--color-surface-container)', color: 'var(--color-on-surface)', padding: 'var(--spacing-sm)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                  <label className="label-caps text-dim" style={{ color: 'var(--color-outline)' }}>Author</label>
                  <input type="text" value={formData.Author} onChange={e => setFormData({...formData, Author: e.target.value})} placeholder="Author name" style={{ background: 'var(--color-surface-container)', color: 'var(--color-on-surface)', padding: 'var(--spacing-sm)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                  <label className="label-caps text-dim" style={{ color: 'var(--color-outline)' }}>Published Date</label>
                  <input type="date" value={formData.Published_Date} onChange={e => setFormData({...formData, Published_Date: e.target.value})} style={{ background: 'var(--color-surface-container)', color: 'var(--color-on-surface)', padding: 'var(--spacing-sm)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', colorScheme: 'dark' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                <label className="label-caps text-dim" style={{ color: 'var(--color-outline)' }}>Summary *</label>
                <textarea value={formData.Summary} onChange={e => setFormData({...formData, Summary: e.target.value})} placeholder="Brief summary of the article" rows={3} style={{ background: 'var(--color-surface-container)', color: 'var(--color-on-surface)', padding: 'var(--spacing-sm)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontFamily: 'inherit', resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                <label className="label-caps text-dim" style={{ color: 'var(--color-outline)' }}>Content</label>
                <textarea value={formData.Content} onChange={e => setFormData({...formData, Content: e.target.value})} placeholder="Full article content" rows={8} style={{ background: 'var(--color-surface-container)', color: 'var(--color-on-surface)', padding: 'var(--spacing-sm)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontFamily: 'inherit', resize: 'vertical' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-md)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                  <label className="label-caps text-dim" style={{ color: 'var(--color-outline)' }}>Image URL</label>
                  <input type="text" value={formData.Image_URL} onChange={e => setFormData({...formData, Image_URL: e.target.value})} placeholder="https://example.com/image.jpg" style={{ background: 'var(--color-surface-container)', color: 'var(--color-on-surface)', padding: 'var(--spacing-sm)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                  <label className="label-caps text-dim" style={{ color: 'var(--color-outline)' }}>Read Time</label>
                  <input type="text" value={formData.Read_Time} onChange={e => setFormData({...formData, Read_Time: e.target.value})} placeholder="5 min" style={{ background: 'var(--color-surface-container)', color: 'var(--color-on-surface)', padding: 'var(--spacing-sm)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)' }}>
                <button type="button" onClick={() => setShowModal(false)} disabled={isSaving} style={{ padding: '8px 16px', background: 'transparent', color: 'var(--color-on-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-base)', cursor: isSaving ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: isSaving ? 0.5 : 1 }}>CANCEL</button>
                <button type="button" onClick={handleSave} disabled={isSaving} style={{ padding: '8px 16px', background: 'var(--color-primary)', color: 'var(--color-on-primary)', border: 'none', borderRadius: 'var(--radius-base)', cursor: isSaving ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: isSaving ? 0.5 : 1 }}>
                  {isSaving ? 'SAVING...' : (isEditing ? 'UPDATE ARTICLE' : 'PUBLISH ARTICLE')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewArticle && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          overflowY: 'auto', padding: 'var(--spacing-md)'
        }}>
          <div className="glass-panel" style={{ padding: 0, width: '100%', maxWidth: '800px', backgroundColor: 'var(--color-surface-container-lowest)', maxHeight: '90vh', overflowY: 'auto' }}>
            {/* Header Image */}
            <div style={{ 
              height: '300px', 
              backgroundImage: previewArticle.Image_URL ? `url(${previewArticle.Image_URL})` : 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-vibrant-green) 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative'
            }}>
              <button 
                onClick={() => setPreviewArticle(null)} 
                style={{ 
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(0,0,0,0.7)', 
                  backdropFilter: 'blur(10px)',
                  border: 'none', 
                  color: 'white', 
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={20} />
              </button>
              <div style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                background: getCategoryColor(previewArticle.Category),
                padding: '6px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: '12px',
                fontWeight: 700,
                color: 'white'
              }}>
                {previewArticle.Category}
              </div>
            </div>

            <div style={{ padding: 'var(--spacing-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--spacing-md)', color: 'var(--color-outline)', fontSize: '13px' }}>
                <span>{formatDateToDDMMYYYY(previewArticle.Published_Date)}</span>
                <span>•</span>
                <span>{previewArticle.Read_Time}</span>
                <span>•</span>
                <span>By {previewArticle.Author}</span>
              </div>

              <h2 style={{ margin: '0 0 var(--spacing-md) 0', fontSize: '28px', lineHeight: 1.3 }}>
                {previewArticle.Title}
              </h2>

              <p style={{ 
                fontSize: '16px',
                color: 'var(--color-outline)',
                lineHeight: 1.7,
                marginBottom: 'var(--spacing-lg)',
                fontStyle: 'italic'
              }}>
                {previewArticle.Summary}
              </p>

              <div style={{ 
                fontSize: '15px',
                lineHeight: 1.8,
                color: 'var(--color-on-surface)',
                whiteSpace: 'pre-wrap'
              }}>
                {previewArticle.Content}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManagement;
