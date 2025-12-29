import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
  requirement_type: string;
  requirement_value: number;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  achievement?: Achievement;
}

export function useAchievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all achievements
        const { data: allAchievements } = await supabase
          .from('achievements')
          .select('*')
          .order('requirement_value', { ascending: true });

        setAchievements(allAchievements || []);

        // Fetch user's earned achievements
        if (user) {
          const { data: earned } = await supabase
            .from('user_achievements')
            .select('*, achievement:achievements(*)')
            .eq('user_id', user.id);

          setUserAchievements(earned || []);
        }
      } catch (err) {
        console.error('Error fetching achievements:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const earnedIds = new Set(userAchievements.map(ua => ua.achievement_id));

  const earnedAchievements = achievements.filter(a => earnedIds.has(a.id));
  const lockedAchievements = achievements.filter(a => !earnedIds.has(a.id));

  const checkAndAwardAchievements = async (stats: {
    goalsCreated?: number;
    goalsCompleted?: number;
    streak?: number;
    level?: number;
  }) => {
    if (!user) return [];

    const newlyEarned: Achievement[] = [];

    for (const achievement of lockedAchievements) {
      let earned = false;

      switch (achievement.requirement_type) {
        case 'goals_created':
          earned = (stats.goalsCreated || 0) >= achievement.requirement_value;
          break;
        case 'goals_completed':
          earned = (stats.goalsCompleted || 0) >= achievement.requirement_value;
          break;
        case 'streak':
          earned = (stats.streak || 0) >= achievement.requirement_value;
          break;
        case 'level':
          earned = (stats.level || 0) >= achievement.requirement_value;
          break;
      }

      if (earned) {
        const { error } = await supabase
          .from('user_achievements')
          .insert({
            user_id: user.id,
            achievement_id: achievement.id,
          });

        if (!error) {
          newlyEarned.push(achievement);
        }
      }
    }

    if (newlyEarned.length > 0) {
      setUserAchievements(prev => [
        ...prev,
        ...newlyEarned.map(a => ({
          id: crypto.randomUUID(),
          user_id: user.id,
          achievement_id: a.id,
          earned_at: new Date().toISOString(),
        })),
      ]);
    }

    return newlyEarned;
  };

  return {
    achievements,
    earnedAchievements,
    lockedAchievements,
    userAchievements,
    loading,
    checkAndAwardAchievements,
  };
}
