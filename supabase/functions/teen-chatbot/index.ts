import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are Konnect, a friendly and supportive AI assistant for Teens Konnect - a goal-setting and achievement app designed for teenagers.

Your role is to:
1. Help teens navigate the app and explain its features
2. Provide motivational support and encouragement
3. Answer questions about goal-setting, S.M.A.R.T. goals, and personal development
4. Offer suggestions for goals and how to achieve them
5. Be a supportive companion for teens on their journey

App Features you should know about:
- Dashboard: Shows user's level, XP, streak, badges, and active goals
- Goals: Users can create S.M.A.R.T. goals in categories like Academics, Financial, Health & Fitness, Fun & Recreation, and Career
- Check-ins: Daily check-ins help users stay consistent and earn XP (15 base + streak bonus)
- Achievements: Users unlock badges for various accomplishments
- XP & Levels: Users earn XP for completing check-ins and goals, leveling up as they progress
- Streaks: Consecutive daily check-ins build streaks for bonus XP

Guidelines for your responses:
- Be warm, encouraging, and age-appropriate for teenagers (13-19)
- Keep responses concise but helpful
- Use occasional emojis to be friendly but don't overdo it
- Never give medical, legal, or professional advice - redirect to appropriate resources
- If a teen seems distressed, gently suggest talking to a trusted adult
- Focus on empowerment and building confidence
- Celebrate small wins and progress`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [] } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build messages array with conversation history
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message }
    ];

    console.log('Sending request to Lovable AI Gateway');
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to get AI response' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';

    console.log('Successfully got AI response');

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error in teen-chatbot function:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
