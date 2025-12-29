import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type GoalCategory = 'academics' | 'financial' | 'health_fitness' | 'fun_recreation' | 'career' | 'custom';
export type GoalStatus = 'active' | 'completed' | 'archived';

export interface Goal {
  id: string;
  user_id: string;
  category: GoalCategory;
  custom_category_name: string | null;
  title: string;
  smart_goal: string;
  initial_goal: string | null;
  target_date: string | null;
  status: GoalStatus;
  progress: number;
  xp_earned: number;
  created_at: string;
  updated_at: string;
}

export interface GoalDetails {
  id: string;
  goal_id: string;
  why_reasons: string[];
  action_steps: string[];
  support_people: string[];
  barriers: string[];
  sacrifices: string[];
  exciting_statement: string | null;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  goal_id: string;
  title: string;
  is_completed: boolean;
  completed_at: string | null;
  order_index: number;
  created_at: string;
}

export function useGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGoals = async () => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  const createGoal = async (
    goalData: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'xp_earned'>,
    details?: Partial<Omit<GoalDetails, 'id' | 'goal_id' | 'created_at' | 'updated_at'>>,
    milestones?: string[]
  ) => {
    if (!user) return { error: new Error('No user logged in'), data: null };

    // Create the goal
    const { data: goal, error: goalError } = await supabase
      .from('goals')
      .insert({
        ...goalData,
        user_id: user.id,
      })
      .select()
      .single();

    if (goalError) return { error: goalError, data: null };

    // Create goal details if provided
    if (details && goal) {
      await supabase
        .from('goal_details')
        .insert({
          goal_id: goal.id,
          ...details,
        });
    }

    // Create milestones if provided
    if (milestones && milestones.length > 0 && goal) {
      await supabase
        .from('milestones')
        .insert(
          milestones.map((title, index) => ({
            goal_id: goal.id,
            title,
            order_index: index,
          }))
        );
    }

    await fetchGoals();
    return { error: null, data: goal };
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    const { error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', id);

    if (!error) {
      await fetchGoals();
    }

    return { error };
  };

  const deleteGoal = async (id: string) => {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    if (!error) {
      await fetchGoals();
    }

    return { error };
  };

  const completeGoal = async (id: string) => {
    return updateGoal(id, { status: 'completed', progress: 100 });
  };

  return { 
    goals, 
    loading, 
    error, 
    createGoal, 
    updateGoal, 
    deleteGoal, 
    completeGoal,
    refetch: fetchGoals 
  };
}

export function useGoalDetails(goalId: string | undefined) {
  const [details, setDetails] = useState<GoalDetails | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!goalId) {
      setDetails(null);
      setMilestones([]);
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      try {
        const [detailsRes, milestonesRes] = await Promise.all([
          supabase
            .from('goal_details')
            .select('*')
            .eq('goal_id', goalId)
            .single(),
          supabase
            .from('milestones')
            .select('*')
            .eq('goal_id', goalId)
            .order('order_index', { ascending: true }),
        ]);

        if (!detailsRes.error) setDetails(detailsRes.data);
        if (!milestonesRes.error) setMilestones(milestonesRes.data || []);
      } catch (err) {
        console.error('Error fetching goal details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [goalId]);

  const toggleMilestone = async (milestoneId: string, isCompleted: boolean) => {
    const { error } = await supabase
      .from('milestones')
      .update({ 
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null
      })
      .eq('id', milestoneId);

    if (!error) {
      setMilestones(prev => 
        prev.map(m => 
          m.id === milestoneId 
            ? { ...m, is_completed: isCompleted, completed_at: isCompleted ? new Date().toISOString() : null }
            : m
        )
      );
    }

    return { error };
  };

  return { details, milestones, loading, toggleMilestone };
}

export const CATEGORY_CONFIG: Record<GoalCategory, { label: string; color: string; icon: string }> = {
  academics: { label: 'Academics', color: 'bg-category-academics', icon: '📚' },
  financial: { label: 'Financial', color: 'bg-category-financial', icon: '💰' },
  health_fitness: { label: 'Health & Fitness', color: 'bg-category-health', icon: '💪' },
  fun_recreation: { label: 'Fun & Recreation', color: 'bg-category-fun', icon: '🎮' },
  career: { label: 'Career', color: 'bg-category-career', icon: '💼' },
  custom: { label: 'Custom', color: 'bg-category-custom', icon: '✨' },
};
