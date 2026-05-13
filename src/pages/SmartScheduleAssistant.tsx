import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, Clock, TrendingUp, MessageSquare, Loader } from 'lucide-react';
import SmartScheduleAssistant, { askScheduleAI } from '../services/nineRouter';
import { showToast } from '../utils/toast';

const SmartScheduleAssistantPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'insights' | 'suggest' | 'available' | 'chat'>('insights');
  const [loading, setLoading] = useState(false);
  
  // Insights state
  const [insights, setInsights] = useState<any>(null);
  
  // Suggest state
  const [programName, setProgramName] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [duration, setDuration] = useState(2);
  const [suggestion, setSuggestion] = useState<any>(null);
  
  // Available slots state
  const [checkDate, setCheckDate] = useState('');
  const [slotDuration, setSlotDuration] = useState(2);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant'; content: string}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Load insights on mount
  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const data = await SmartScheduleAssistant.getScheduleInsights();
      setInsights(data);
    } catch (error) {
      showToast('Failed to load insights', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestTime = async () => {
    if (!programName || !preferredDate) {
      showToast('Please enter program name and date', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const result = await SmartScheduleAssistant.suggestOptimalTime(programName, preferredDate, duration);
      setSuggestion(result);
      showToast('Suggestion generated!', 'success');
    } catch (error) {
      showToast('Failed to generate suggestion', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAvailability = async () => {
    if (!checkDate) {
      showToast('Please select a date', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const slots = await SmartScheduleAssistant.findAvailableSlots(checkDate, slotDuration);
      setAvailableSlots(slots);
      showToast(`Found ${slots.length} available slots`, 'success');
    } catch (error) {
      showToast('Failed to check availability', 'error');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="container-padding" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: 'var(--spacing-xl)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)' }}>
        <Sparkles size={28} style={{ color: 'var(--color-primary)' }} />
        <div>
          <h2 style={{ margin: 0, fontSize: 'clamp(20px, 4vw, 24px)' }}>Smart Schedule Assistant</h2>
          <p className="text-dim" style={{ margin: 0, fontSize: '14px' }}>AI-powered scheduling insights and recommendations</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: 'var(--spacing-xs)', 
        marginBottom: 'var(--spacing-lg)',
        borderBottom: '2px solid var(--color-border)',
        overflowX: 'auto'
      }}>
        {[
          { id: 'insights', label: 'Insights', icon: <TrendingUp size={18} /> },
          { id: 'suggest', label: 'Suggest Time', icon: <Sparkles size={18} /> },
          { id: 'available', label: 'Check Availability', icon: <Calendar size={18} /> },
          { id: 'chat', label: 'AI Chat', icon: <MessageSquare size={18} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-xs)',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '3px solid var(--color-primary)' : '3px solid transparent',
              color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-outline)',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? 600 : 400,
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div>
          {loading && !insights ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
              <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} />
              <p className="text-dim">Loading insights...</p>
            </div>
          ) : insights ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-md)' }}>
              <div className="glass-panel" style={{ padding: 'var(--spacing-md)' }}>
                <p className="label-caps text-dim">Total Programs</p>
                <h2 style={{ margin: 'var(--spacing-xs) 0 0 0', color: 'var(--color-primary)' }}>{insights.totalPrograms}</h2>
              </div>
              
              <div className="glass-panel" style={{ padding: 'var(--spacing-md)' }}>
                <p className="label-caps text-dim">Upcoming</p>
                <h2 style={{ margin: 'var(--spacing-xs) 0 0 0', color: 'var(--color-vibrant-green)' }}>{insights.upcomingPrograms}</h2>
              </div>
              
              <div className="glass-panel" style={{ padding: 'var(--spacing-md)' }}>
                <p className="label-caps text-dim">Completed</p>
                <h2 style={{ margin: 'var(--spacing-xs) 0 0 0' }}>{insights.completedPrograms}</h2>
              </div>
              
              <div className="glass-panel" style={{ padding: 'var(--spacing-md)' }}>
                <p className="label-caps text-dim">Avg Duration</p>
                <h2 style={{ margin: 'var(--spacing-xs) 0 0 0' }}>{insights.avgDuration} min</h2>
              </div>
              
              <div className="glass-panel" style={{ padding: 'var(--spacing-md)', gridColumn: 'span 2' }}>
                <p className="label-caps text-dim">Most Active PIC</p>
                <h3 style={{ margin: 'var(--spacing-xs) 0 0 0' }}>{insights.mostActivePIC.name}</h3>
                <p className="text-dim" style={{ fontSize: '14px', margin: '4px 0 0 0' }}>{insights.mostActivePIC.count} programs</p>
              </div>
              
              <div className="glass-panel" style={{ padding: 'var(--spacing-md)', gridColumn: 'span 2' }}>
                <p className="label-caps text-dim">Busiest Days</p>
                <div style={{ marginTop: 'var(--spacing-sm)' }}>
                  {insights.busyDays.map((day: any, i: number) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-xs)' }}>
                      <span>{day.day}</span>
                      <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{day.count} programs</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Suggest Time Tab */}
      {activeTab === 'suggest' && (
        <div>
          <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', marginBottom: 'var(--spacing-md)' }}>
            <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Get AI-Powered Time Suggestion</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <div>
                <label className="label-caps text-dim">Program Name</label>
                <input
                  type="text"
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                  placeholder="e.g., Morning Show"
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-sm)',
                    background: 'var(--color-surface-container)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-on-surface)',
                    marginTop: 'var(--spacing-xs)'
                  }}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                <div>
                  <label className="label-caps text-dim">Preferred Date</label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: 'var(--spacing-sm)',
                      background: 'var(--color-surface-container)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--color-on-surface)',
                      marginTop: 'var(--spacing-xs)',
                      colorScheme: 'dark'
                    }}
                  />
                </div>
                
                <div>
                  <label className="label-caps text-dim">Duration (hours)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    min="1"
                    max="8"
                    style={{
                      width: '100%',
                      padding: 'var(--spacing-sm)',
                      background: 'var(--color-surface-container)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--color-on-surface)',
                      marginTop: 'var(--spacing-xs)'
                    }}
                  />
                </div>
              </div>
              
              <button
                onClick={handleSuggestTime}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--spacing-xs)',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  background: 'var(--color-primary)',
                  color: 'var(--color-on-primary)',
                  border: 'none',
                  borderRadius: 'var(--radius-base)',
                  fontWeight: 600,
                  cursor: loading ? 'wait' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={18} />}
                {loading ? 'Analyzing...' : 'Get Suggestion'}
              </button>
            </div>
          </div>
          
          {suggestion && (
            <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', background: 'linear-gradient(135deg, var(--color-primary) 0%, #006400 100%)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
                <Sparkles size={24} />
                <h3 style={{ margin: 0 }}>AI Suggestion</h3>
                <span style={{ 
                  marginLeft: 'auto', 
                  padding: '4px 12px', 
                  background: 'rgba(255,255,255,0.2)', 
                  borderRadius: 'var(--radius-base)',
                  fontSize: '14px',
                  fontWeight: 600
                }}>
                  {suggestion.confidence}% Confidence
                </span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                <div>
                  <p className="label-caps" style={{ opacity: 0.8, fontSize: '11px' }}>Suggested Date</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: 600 }}>{suggestion.suggestedDate}</p>
                </div>
                <div>
                  <p className="label-caps" style={{ opacity: 0.8, fontSize: '11px' }}>Start Time</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: 600 }}>{suggestion.startTime}</p>
                </div>
                <div>
                  <p className="label-caps" style={{ opacity: 0.8, fontSize: '11px' }}>End Time</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: 600 }}>{suggestion.endTime}</p>
                </div>
              </div>
              
              <div>
                <p className="label-caps" style={{ opacity: 0.8, fontSize: '11px', marginBottom: 'var(--spacing-xs)' }}>Reasoning</p>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {suggestion.reasoning.map((reason: string, i: number) => (
                    <li key={i} style={{ marginBottom: '4px' }}>{reason}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Check Availability Tab */}
      {activeTab === 'available' && (
        <div>
          <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', marginBottom: 'var(--spacing-md)' }}>
            <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Check Available Time Slots</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 'var(--spacing-md)', alignItems: 'end' }}>
              <div>
                <label className="label-caps text-dim">Date</label>
                <input
                  type="date"
                  value={checkDate}
                  onChange={(e) => setCheckDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-sm)',
                    background: 'var(--color-surface-container)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-on-surface)',
                    marginTop: 'var(--spacing-xs)',
                    colorScheme: 'dark'
                  }}
                />
              </div>
              
              <div>
                <label className="label-caps text-dim">Duration (hours)</label>
                <input
                  type="number"
                  value={slotDuration}
                  onChange={(e) => setSlotDuration(parseInt(e.target.value))}
                  min="1"
                  max="8"
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-sm)',
                    background: 'var(--color-surface-container)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-on-surface)',
                    marginTop: 'var(--spacing-xs)'
                  }}
                />
              </div>
              
              <button
                onClick={handleCheckAvailability}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-xs)',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  background: 'var(--color-primary)',
                  color: 'var(--color-on-primary)',
                  border: 'none',
                  borderRadius: 'var(--radius-base)',
                  fontWeight: 600,
                  cursor: loading ? 'wait' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  whiteSpace: 'nowrap'
                }}
              >
                {loading ? <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Calendar size={18} />}
                Check
              </button>
            </div>
          </div>
          
          {availableSlots.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--spacing-sm)' }}>
              {availableSlots.map((slot, i) => (
                <div key={i} className="glass-panel" style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                  <Clock size={24} style={{ color: 'var(--color-primary)', margin: '0 auto var(--spacing-xs)' }} />
                  <p style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>{slot.start} - {slot.end}</p>
                  <p className="text-dim" style={{ margin: '4px 0 0 0', fontSize: '12px' }}>{slot.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI Chat Tab */}
      {activeTab === 'chat' && (
        <div>
          <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', height: '500px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Ask AI About Scheduling</h3>
            
            {/* Chat messages */}
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: 'var(--spacing-md)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              {chatMessages.length === 0 && (
                <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--color-outline)' }}>
                  <MessageSquare size={48} style={{ margin: '0 auto var(--spacing-md)', opacity: 0.5 }} />
                  <p>Ask me anything about scheduling!</p>
                  <p style={{ fontSize: '14px', marginTop: 'var(--spacing-xs)' }}>
                    Try: "When is the best time to schedule a morning show?"
                  </p>
                </div>
              )}
              
              {chatMessages.map((msg, i) => (
                <div key={i} style={{ 
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '70%',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  background: msg.role === 'user' ? 'var(--color-primary)' : 'var(--color-surface-container-high)',
                  borderRadius: 'var(--radius-base)',
                  wordBreak: 'break-word'
                }}>
                  {msg.content}
                </div>
              ))}
              
              {chatLoading && (
                <div style={{ alignSelf: 'flex-start', padding: 'var(--spacing-sm)' }}>
                  <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
                </div>
              )}
            </div>
            
            {/* Chat input */}
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                placeholder="Ask about scheduling..."
                disabled={chatLoading}
                style={{
                  flex: 1,
                  padding: 'var(--spacing-sm)',
                  background: 'var(--color-surface-container)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-base)',
                  color: 'var(--color-on-surface)'
                }}
              />
              <button
                onClick={handleSendChat}
                disabled={chatLoading || !chatInput.trim()}
                style={{
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  background: 'var(--color-primary)',
                  color: 'var(--color-on-primary)',
                  border: 'none',
                  borderRadius: 'var(--radius-base)',
                  fontWeight: 600,
                  cursor: chatLoading || !chatInput.trim() ? 'not-allowed' : 'pointer',
                  opacity: chatLoading || !chatInput.trim() ? 0.5 : 1
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SmartScheduleAssistantPage;
