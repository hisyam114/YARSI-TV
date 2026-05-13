import { getSession } from '../utils/auth';

// 9Router configuration
// Use proxy path in development to avoid CORS issues
const NINEROUTER_URL = import.meta.env.DEV ? '/api/9router' : (import.meta.env.VITE_NINEROUTER_URL || '');
const NINEROUTER_KEY = import.meta.env.VITE_NINEROUTER_KEY || '';

/**
 * Smart Schedule Assistant - Helps users find optimal time slots and provides schedule insights
 */
export class SmartScheduleAssistant {
  /**
   * Find available time slots for a given date
   * @param date Date to check (YYYY-MM-DD format)
   * @param durationHours Desired duration in hours (default: 2)
   * @returns Array of available time slots
   */
  static async findAvailableSlots(date: string, durationHours: number = 2): Promise<Array<{start: string; end: string; reason: string}>> {
    try {
      // Get schedule data
      const schedules = await this.fetchScheduleData();
      
      // Get current session for auth
      const session = getSession();
      if (!session) {
        return [{start: '', end: '', reason: 'Please log in to use smart scheduling features'}];
      }

      // If no schedules, whole day is available
      if (schedules.length === 0) {
        return [{
          start: '09:00',
          end: '17:00',
          reason: 'No existing schedules - full day available'
        }];
      }

      // Convert schedules to time blocks
      const bookedSlots = schedules
        .filter(s => s.Date === date && s.Status?.toLowerCase() !== 'cancelled')
        .map(s => ({
          start: s.Start_Time,
          end: s.End_Time,
          program: s.Program_Name
        }));

      // Generate available slots (9 AM to 5 PM)
      const availableSlots = [];
      const workStart = 9; // 9 AM
      const workEnd = 17;  // 5 PM
      
      for (let hour = workStart; hour < workEnd; hour++) {
        const slotStart = `${hour.toString().padStart(2, '0')}:00`;
        const slotEnd = `${(hour + durationHours).toString().padStart(2, '0')}:00`;
        
        // Check if slot is available
        const isAvailable = !bookedSlots.some(booked => 
          this.timesOverlap(slotStart, slotEnd, booked.start, booked.end)
        );
        
        if (isAvailable) {
          availableSlots.push({
            start: slotStart,
            end: slotEnd,
            reason: `Available ${durationHours}h slot`
          });
        }
      }

      return availableSlots;
    } catch (error) {
      console.error('Error finding available slots:', error);
      return [{start: '', end: '', reason: 'Error checking availability'}];
    }
  }

  /**
   * Suggest optimal time for a new program based on similar past schedules
   * @param programName Name of the program to schedule
   * @param preferredDate Preferred date (YYYY-MM-DD)
   * @param durationHours Desired duration
   * @returns Suggestion with reasoning
   */
  static async suggestOptimalTime(programName: string, preferredDate: string, durationHours: number = 2): Promise<{suggestedDate: string; startTime: string; endTime: string; confidence: number; reasoning: string[]}> {
    try {
      const schedules = await this.fetchScheduleData();
      
      // Find similar past programs
      const similarPrograms = schedules.filter(s => 
        s.Program_Name.toLowerCase().includes(programName.toLowerCase()) && 
        s.Status?.toLowerCase() === 'done'
      );
      
      let suggestedDate = preferredDate;
      let startTime = '09:00';
      let endTime = `${9 + durationHours}:00`;
      const reasoning: string[] = [];
      let confidence = 50; // Base confidence
      
      if (similarPrograms.length > 0) {
        // Analyze patterns from similar programs
        const daysOfWeek = similarPrograms.map(s => new Date(s.Date).getDay());
        const hours = similarPrograms.map(s => parseInt(s.Start_Time.split(':')[0]));
        
        // Most common day
        const dayFreq: Record<number, number> = {};
        daysOfWeek.forEach(d => dayFreq[d] = (dayFreq[d] || 0) + 1);
        const mostCommonDay = parseInt(Object.entries(dayFreq).reduce((a, b) => 
          a[1] > b[1] ? a : b
        )[0]);
        
        // Most common start time
        const hourFreq: Record<number, number> = {};
        hours.forEach(h => hourFreq[h] = (hourFreq[h] || 0) + 1);
        const mostCommonHour = parseInt(Object.entries(hourFreq).reduce((a, b) => 
          a[1] > b[1] ? a : b
        )[0]);
        
        const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const preferredDay = new Date(preferredDate).getDay();
        
        if (mostCommonDay === preferredDay) {
          reasoning.push(`Similar programs usually scheduled on ${dayNames[mostCommonDay]}`);
          confidence += 20;
        } else {
          reasoning.push(`Similar programs usually on ${dayNames[mostCommonDay]}, you selected ${dayNames[preferredDay]}`);
          // Suggest the most common day instead
          const prefDate = new Date(preferredDate);
          const diff = ((mostCommonDay - prefDate.getDay() + 7) % 7);
          suggestedDate = new Date(prefDate.getTime() + diff * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          reasoning.push(`Suggested date adjusted to ${dayNames[mostCommonDay]}`);
          confidence += 10;
        }
        
        startTime = `${mostCommonHour.toString().padStart(2, '0')}:00`;
        endTime = `${(mostCommonHour + durationHours).toString().padStart(2, '0')}:00`;
        reasoning.push(`Based on ${similarPrograms.length} similar past programs`);
        confidence += 20;
      } else {
        reasoning.push('No similar programs found - using general availability');
      }
      
      // Check if suggested time is available
      const slots = await this.findAvailableSlots(suggestedDate, durationHours);
      const isSlotAvailable = slots.some(s => s.start === startTime);
      
      if (!isSlotAvailable && slots.length > 0) {
        // Use first available slot
        const bestSlot = slots[0];
        startTime = bestSlot.start;
        endTime = bestSlot.end;
        reasoning.push(`Adjusted to first available slot`);
        confidence = Math.max(confidence - 10, 30);
      }
      
      return {
        suggestedDate,
        startTime,
        endTime,
        confidence: Math.min(confidence, 95),
        reasoning
      };
    } catch (error) {
      console.error('Error suggesting optimal time:', error);
      return {
        suggestedDate: preferredDate,
        startTime: '09:00',
        endTime: `${9 + durationHours}:00`,
        confidence: 30,
        reasoning: ['Error in analysis - using default time']
      };
    }
  }

  /**
   * Get schedule insights and statistics
   * @returns Object with various statistics
   */
  static async getScheduleInsights(): Promise<{
    totalPrograms: number;
    upcomingPrograms: number;
    completedPrograms: number;
    mostActivePIC: {name: string; count: number};
    avgDuration: number;
    busyDays: Array<{day: string; count: number}>
  }> {
    try {
      const schedules = await this.fetchScheduleData();
      
      const totalPrograms = schedules.length;
      const today = new Date().toISOString().split('T')[0];
      
      const upcomingPrograms = schedules.filter(s => 
        s.Date >= today && 
        s.Status?.toLowerCase() !== 'cancelled'
      ).length;
      
      const completedPrograms = schedules.filter(s => 
        s.Status?.toLowerCase() === 'done' || 
        s.Status?.toLowerCase() === 'completed'
      ).length;
      
      // Most active PIC
      const picCount: Record<string, number> = {};
      schedules.forEach(s => {
        if (s.PIC) {
          picCount[s.PIC] = (picCount[s.PIC] || 0) + 1;
        }
      });
      
      const mostActivePIC = Object.entries(picCount).reduce((a, b) => 
        a[1] > b[1] ? a : b
      ) || ['Tidak diketahui', 0];
      
      // Average duration
      const durations = schedules.map(s => {
        const start = s.Start_Time.split(':').map(Number);
        const end = s.End_Time.split(':').map(Number);
        return (end[0] * 60 + end[1]) - (start[0] * 60 + start[1]);
      }).filter(d => d > 0);
      
      const avgDuration = durations.length > 0 ? 
        Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
      
      // Busiest days
      const dayCount: Record<string, number> = {};
      schedules.forEach(s => {
        if (s.Date) {
          const date = new Date(s.Date);
          const dayName = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][date.getDay()];
          dayCount[dayName] = (dayCount[dayName] || 0) + 1;
        }
      });
      
      const busyDays = Object.entries(dayCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([day, count]) => ({day, count}));
      
      return {
        totalPrograms,
        upcomingPrograms,
        completedPrograms,
        mostActivePIC: {name: mostActivePIC[0], count: mostActivePIC[1]},
        avgDuration,
        busyDays
      };
    } catch (error) {
      console.error('Error getting schedule insights:', error);
      return {
        totalPrograms: 0,
        upcomingPrograms: 0,
        completedPrograms: 0,
        mostActivePIC: {name: 'Error', count: 0},
        avgDuration: 0,
        busyDays: []
      };
    }
  }

  /**
   * Check if two time slots overlap
   */
  private static timesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
    const s1 = start1.split(':').map(Number);
    const e1 = end1.split(':').map(Number);
    const s2 = start2.split(':').map(Number);
    const e2 = end2.split(':').map(Number);
    
    const time1Start = s1[0] * 60 + s1[1];
    const time1End = e1[0] * 60 + e1[1];
    const time2Start = s2[0] * 60 + s2[1];
    const time2End = e2[0] * 60 + e2[1];
    
    return Math.max(time1Start, time2Start) < Math.min(time1End, time2End);
  }

  /**
   * Fetch schedule data (internal helper)
   */
  private static async fetchScheduleData(): Promise<any[]> {
    try {
      // Reuse existing fetch function but we need to import it
      // For now, we'll make a direct fetch since this is a service
      const response = await fetch(`${import.meta.env.VITE_SCRIPT_URL}`, {
        method: "POST",
        body: JSON.stringify({
          action: 'read',
          sheetName: 'Schedules',
          apiKey: import.meta.env.VITE_API_KEY
        }),
        headers: { "Content-Type": "text/plain;charset=utf-8" }
      });
      
      const result = await response.json();
      return result.status === 'success' ? result.data : [];
    } catch (error) {
      console.error('Error fetching schedule data:', error);
      return [];
    }
  }
}

/**
 * Helper function to ask 9Router for schedule advice
 * @param prompt User's question about scheduling
 * @returns AI response
 */
export async function askScheduleAI(prompt: string): Promise<string> {
  try {
    const session = getSession();
    if (!session) {
      return 'Please log in to use AI scheduling features';
    }

    if (!NINEROUTER_URL) {
      return '9Router not configured. Please set VITE_NINEROUTER_URL in .env.local and restart the dev server.';
    }

    const scheduleContext = await SmartScheduleAssistant.getScheduleInsights();
    
    const systemPrompt = `You are a smart scheduling assistant for YARSI-TV, a TV production company based in Indonesia.

## YOUR ROLE:
You ONLY answer questions related to:
1. Scheduling TV programs and broadcasts
2. YARSI-TV operations, equipment, and staff
3. Schedule availability and optimal timing
4. Broadcast production planning
5. PIC (Person In Charge) assignments
6. Equipment availability for schedules

## STRICT RULES:
- DO NOT answer questions about unrelated topics (politics, weather, news, entertainment outside YARSI-TV, general knowledge, etc.)
- DO NOT provide opinions or advice outside of TV scheduling and YARSI-TV operations
- DO NOT answer personal questions unrelated to your role
- If asked about something unrelated, respond with: "I can only help with YARSI-TV scheduling and broadcast operations. How can I assist with your TV production schedule?"
- Keep responses concise and focused on scheduling advice

## CURRENT SCHEDULE DATA:
- Total programs: ${scheduleContext.totalPrograms}
- Upcoming programs: ${scheduleContext.upcomingPrograms}
- Completed programs: ${scheduleContext.completedPrograms}
- Most active PIC: ${scheduleContext.mostActivePIC.name} (${scheduleContext.mostActivePIC.count} programs)
- Average program duration: ${scheduleContext.avgDuration} minutes
- Busiest days: ${scheduleContext.busyDays.map(d => `${d.day} (${d.count})`).join(', ')}

## RESPONSE GUIDELINES:
- Use Indonesian language for local context (YARSI-TV is Indonesian)
- Provide specific, actionable scheduling advice
- Reference actual schedule data when available
- Suggest optimal time slots based on patterns
- Help users find available time for new programs`;
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    
    // Only add Authorization header if API key is provided
    if (NINEROUTER_KEY && NINEROUTER_KEY !== 'sk-your-9router-key-here') {
      headers["Authorization"] = `Bearer ${NINEROUTER_KEY}`;
    }
    
    // Use combo model that auto-fallbacks through multiple providers
    const response = await fetch(`${NINEROUTER_URL}/v1/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: "simple-combo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('9Router error response:', errorText);
      
      if (response.status === 401) {
        return 'Invalid 9Router API key. Please check VITE_NINEROUTER_KEY in .env.local';
      } else if (response.status === 404 || response.status === 400) {
        return `AI model not available. Please check your 9Router configuration:\n\n` +
               `1. Open 9Router dashboard: http://localhost:20128\n` +
               `2. Make sure you have at least one AI provider configured\n` +
               `3. Verify the combo model "vip" exists in /v1/models\n\n` +
               `Error: ${errorText}`;
      }
      
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
  } catch (error) {
    console.error('Error querying 9Router:', error);
    
    // Check if it's a CORS error
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError') || errorMessage.includes('CORS')) {
      return `CORS Error: Cannot connect from browser to 9Router at ${NINEROUTER_URL}.\n\n` +
             `This is a browser security restriction. Solution:\n` +
             `1. Make sure 9Router is running: 9router\n` +
             `2. Check 9Router has CORS enabled or\n` +
             `3. Use Vite proxy (recommended for dev)`;
    }
    
    return `Sorry, I encountered an error: ${errorMessage}`;
  }
}

// Export for use in components
export default SmartScheduleAssistant;