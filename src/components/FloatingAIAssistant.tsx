import React, { useState } from 'react';
import { Sparkles, X, MessageSquare, TrendingUp, Calendar, Loader } from 'lucide-react';
import { askScheduleAI, SmartScheduleAssistant } from '../services/nineRouter';
import { showToast } from '../utils/toast';

const FloatingAIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'insights'>('chat');
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant'; content: string}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatLoading(true);
    
    try {
      const response = await askScheduleAI(userMessage);
      setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      showToast('Failed to get AI response', 'error');
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const loadInsights = async () => {
    setInsightsLoading(true);
    try {
      const data = await SmartScheduleAssistant.getScheduleInsights();
      setInsights(data);
    } catch (error) {
      showToast('Failed to load insights', 'error');
    } finally {
      setInsightsLoading(false);
    }
  };

  const handleOpenInsights = () => {
    setActiveTab('insights');
    if (!insights) {
      loadInsights();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: isOpen ? 'var(--color-error)' : 'linear-gradient(135deg, var(--color-primary) 0%, #006400 100%)',
          border: 'none',
          boxShadow: '0 4px 20px rgba(0, 255, 65, 0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          animation: isOpen ? 'none' : 'pulse-glow 2s ease-in-out infinite'
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 30px rgba(0, 255, 65, 0.6)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 255, 65, 0.4)';
          }
        }}
      >
        {isOpen ? <X size={28} color="white" /> : <Sparkles size={28} color="white" />}
      </button>

      {/* Modal Panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '96px',
            right: '24px',
            width: '380px',
            maxHeight: '500px',
            backgroundColor: 'var(--color-surface-container-lowest)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 8px 40px rgba(0, 0, 0, 0.5)',
            zIndex: 998,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideInUp 0.3s ease-out'
          }}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, var(--color-primary) 0%, #006400 100%)',
            padding: 'var(--spacing-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-sm)'
          }}>
            <Sparkles size={24} color="white" />
            <div>
              <h3 style={{ margin: 0, color: 'white', fontSize: '16px' }}>AI Schedule Assistant</h3>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>Powered by 9Router</p>
            </div>
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface-container-low)'
          }}>
            <button
              onClick={() => setActiveTab('chat')}
              style={{
                flex: 1,
                padding: 'var(--spacing-sm)',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'chat' ? '2px solid var(--color-primary)' : '2px solid transparent',
                color: activeTab === 'chat' ? 'var(--color-primary)' : 'var(--color-outline)',
                cursor: 'pointer',
                fontWeight: activeTab === 'chat' ? 600 : 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--spacing-xs)',
                fontSize: '13px'
              }}
            >
              <MessageSquare size={16} />
              Chat
            </button>
            <button
              onClick={handleOpenInsights}
              style={{
                flex: 1,
                padding: 'var(--spacing-sm)',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'insights' ? '2px solid var(--color-primary)' : '2px solid transparent',
                color: activeTab === 'insights' ? 'var(--color-primary)' : 'var(--color-outline)',
                cursor: 'pointer',
                fontWeight: activeTab === 'insights' ? 600 : 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--spacing-xs)',
                fontSize: '13px'
              }}
            >
              <TrendingUp size={16} />
              Insights
            </button>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Chat Tab */}
            {activeTab === 'chat' && (
              <>
                {/* Messages */}
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: 'var(--spacing-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--spacing-xs)'
                }}>
                  {chatMessages.length === 0 && (
                    <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)', color: 'var(--color-outline)' }}>
                      <MessageSquare size={32} style={{ margin: '0 auto var(--spacing-sm)', opacity: 0.5 }} />
                      <p style={{ margin: 0, fontSize: '13px' }}>Ask me about scheduling!</p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '11px' }}>
                        Try: "When's the best time for a morning show?"
                      </p>
                    </div>
                  )}
                  
                  {chatMessages.map((msg, i) => (
                    <div key={i} style={{
                      alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                      padding: 'var(--spacing-xs) var(--spacing-sm)',
                      background: msg.role === 'user' ? 'var(--color-primary)' : 'var(--color-surface-container)',
                      borderRadius: 'var(--radius-base)',
                      fontSize: '13px',
                      lineHeight: 1.4,
                      wordBreak: 'break-word'
                    }}>
                      {msg.content}
                    </div>
                  ))}
                  
                  {chatLoading && (
                    <div style={{ alignSelf: 'flex-start', padding: 'var(--spacing-xs)' }}>
                      <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    </div>
                  )}
                </div>

                {/* Input */}
                <div style={{ padding: 'var(--spacing-sm)', borderTop: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                      placeholder="Ask about scheduling..."
                      disabled={chatLoading}
                      style={{
                        flex: 1,
                        padding: 'var(--spacing-xs) var(--spacing-sm)',
                        background: 'var(--color-surface-container)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-base)',
                        color: 'var(--color-on-surface)',
                        fontSize: '13px'
                      }}
                    />
                    <button
                      onClick={handleSendChat}
                      disabled={chatLoading || !chatInput.trim()}
                      style={{
                        padding: 'var(--spacing-xs) var(--spacing-sm)',
                        background: 'var(--color-primary)',
                        color: 'var(--color-on-primary)',
                        border: 'none',
                        borderRadius: 'var(--radius-base)',
                        fontWeight: 600,
                        cursor: chatLoading || !chatInput.trim() ? 'not-allowed' : 'pointer',
                        opacity: chatLoading || !chatInput.trim() ? 0.5 : 1,
                        fontSize: '13px'
                      }}
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Insights Tab */}
            {activeTab === 'insights' && (
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: 'var(--spacing-sm)'
              }}>
                {insightsLoading ? (
                  <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                    <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
                    <p style={{ margin: 'var(--spacing-sm) 0 0 0', fontSize: '13px', color: 'var(--color-outline)' }}>Loading insights...</p>
                  </div>
                ) : insights ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                    <div style={{
                      background: 'var(--color-surface-container)',
                      padding: 'var(--spacing-sm)',
                      borderRadius: 'var(--radius-sm)'
                    }}>
                      <p className="label-caps text-dim" style={{ fontSize: '10px', marginBottom: '2px' }}>Total Programs</p>
                      <h3 style={{ margin: 0, color: 'var(--color-primary)' }}>{insights.totalPrograms}</h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-sm)' }}>
                      <div style={{
                        background: 'var(--color-surface-container)',
                        padding: 'var(--spacing-sm)',
                        borderRadius: 'var(--radius-sm)'
                      }}>
                        <p className="label-caps text-dim" style={{ fontSize: '10px', marginBottom: '2px' }}>Upcoming</p>
                        <h3 style={{ margin: 0, color: 'var(--color-vibrant-green)' }}>{insights.upcomingPrograms}</h3>
                      </div>
                      <div style={{
                        background: 'var(--color-surface-container)',
                        padding: 'var(--spacing-sm)',
                        borderRadius: 'var(--radius-sm)'
                      }}>
                        <p className="label-caps text-dim" style={{ fontSize: '10px', marginBottom: '2px' }}>Completed</p>
                        <h3 style={{ margin: 0 }}>{insights.completedPrograms}</h3>
                      </div>
                    </div>

                    <div style={{
                      background: 'var(--color-surface-container)',
                      padding: 'var(--spacing-sm)',
                      borderRadius: 'var(--radius-sm)'
                    }}>
                      <p className="label-caps text-dim" style={{ fontSize: '10px', marginBottom: '2px' }}>Most Active PIC</p>
                      <h4 style={{ margin: 0 }}>{insights.mostActivePIC.name}</h4>
                      <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: 'var(--color-outline)' }}>
                        {insights.mostActivePIC.count} programs
                      </p>
                    </div>

                    <div style={{
                      background: 'var(--color-surface-container)',
                      padding: 'var(--spacing-sm)',
                      borderRadius: 'var(--radius-sm)'
                    }}>
                      <p className="label-caps text-dim" style={{ fontSize: '10px', marginBottom: '4px' }}>Busiest Days</p>
                      {insights.busyDays.map((day: any, i: number) => (
                        <div key={i} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '2px',
                          fontSize: '12px'
                        }}>
                          <span>{day.day}</span>
                          <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{day.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)', color: 'var(--color-outline)' }}>
                    <p>No insights available</p>
                    <button
                      onClick={loadInsights}
                      style={{
                        marginTop: 'var(--spacing-sm)',
                        padding: 'var(--spacing-xs) var(--spacing-sm)',
                        background: 'var(--color-primary)',
                        color: 'var(--color-on-primary)',
                        border: 'none',
                        borderRadius: 'var(--radius-base)',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      Load Insights
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 4px 20px rgba(0, 255, 65, 0.4);
          }
          50% {
            box-shadow: 0 4px 30px rgba(0, 255, 65, 0.7);
          }
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default FloatingAIAssistant;
