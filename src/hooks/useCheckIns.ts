import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CheckIn {
  id: string;
  user_id: string;
  goal_id: string | null;
  notes: string | null;
  xp_earned: number;
  created_at: string;
}

const CHECK_IN_XP = 15;
const STREAK_BONUS_XP = 5;

export function useCheckIns() {
  const { user } = useAuth();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayCheckIn, setTodayCheckIn] = useState<CheckIn | null>(null);

  const fetchCheckIns = async () => {
    if (!user) {
      setCheckIns([]);
      setTodayCheckIn(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('check_ins')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setCheckIns(data || []);
      
      // Check if there's a check-in from today
      const today = new Date().toISOString().split('T')[0];
      const todaysCheckIn = data?.find(c => 
        c.created_at.split('T')[0] === today
      );
      setTodayCheckIn(todaysCheckIn || null);
    } catch (err) {
      console.error('Error fetching check-ins:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckIns();
  }, [user]);

  const createCheckIn = async (goalId: string | null, notes: string) => {
    if (!user) return { error: new Error('No user logged in'), data: null };

    // Calculate XP - base + streak bonus
    const { data: profileData } = await supabase
      .from('profiles')
      .select('current_streak, total_xp, current_level, last_check_in, longest_streak')
      .eq('id', user.id)
      .maybeSingle();

    const currentStreak = profileData?.current_streak || 0;
    const streakBonus = currentStreak > 0 ? STREAK_BONUS_XP * Math.min(currentStreak, 7) : 0;
    const totalXP = CHECK_IN_XP + streakBonus;

    // Create check-in
    const { data: checkIn, error: checkInError } = await supabase
      .from('check_ins')
      .insert({
        user_id: user.id,
        goal_id: goalId,
        notes: notes.trim() || null,
        xp_earned: totalXP,
      })
      .select()
      .single();

    if (checkInError) return { error: checkInError, data: null };

    // Calculate new streak
    const lastCheckIn = profileData?.last_check_in;
    let newStreak = 1;
    
    if (lastCheckIn) {
      const lastDate = new Date(lastCheckIn);
      const today = new Date();
      const diffTime = today.getTime() - lastDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // Consecutive day - increase streak
        newStreak = currentStreak + 1;
      } else if (diffDays === 0) {
        // Same day - keep current streak
        newStreak = currentStreak;
      }
      // Otherwise reset to 1
    }

    const longestStreak = Math.max(newStreak, profileData?.longest_streak || 0);

    // Update profile with new XP and streak
    await supabase
      .from('profiles')
      .update({
        total_xp: (profileData?.total_xp || 0) + totalXP,
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_check_in: new Date().toISOString(),
      })
      .eq('id', user.id);

    await fetchCheckIns();
    return { error: null, data: checkIn, xpEarned: totalXP, newStreak };
  };

  const hasCheckedInToday = () => {
    return todayCheckIn !== null;
  };

  return {
    checkIns,
    todayCheckIn,
    loading,
    createCheckIn,
    hasCheckedInToday,
    refetch: fetchCheckIns,
  };
}
