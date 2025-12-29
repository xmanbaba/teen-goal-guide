import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  total_xp: number;
  current_level: number;
  current_streak: number;
  longest_streak: number;
  last_check_in: string | null;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  // Also refetch when component mounts to ensure fresh data
  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, []);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (!error) {
      setProfile(prev => prev ? { ...prev, ...updates } : null);
    }

    return { error };
  };

  const addXP = async (amount: number) => {
    if (!profile) return;
    
    const newXP = profile.total_xp + amount;
    const newLevel = calculateLevel(newXP);
    
    await updateProfile({ 
      total_xp: newXP, 
      current_level: newLevel 
    });
  };

  return { profile, loading, error, updateProfile, addXP, refetch: fetchProfile };
}

export function calculateLevel(xp: number): number {
  // Level formula: Each level requires progressively more XP
  // Level 1: 0 XP, Level 2: 100 XP, Level 3: 250 XP, etc.
  let level = 1;
  let xpRequired = 0;
  
  while (xp >= xpRequired) {
    level++;
    xpRequired += level * 50;
  }
  
  return level - 1;
}

export function getXPForNextLevel(currentLevel: number): number {
  let xpRequired = 0;
  for (let i = 1; i <= currentLevel; i++) {
    xpRequired += i * 50;
  }
  return xpRequired + (currentLevel + 1) * 50;
}

export function getXPForCurrentLevel(currentLevel: number): number {
  let xpRequired = 0;
  for (let i = 1; i <= currentLevel; i++) {
    xpRequired += i * 50;
  }
  return xpRequired;
}
