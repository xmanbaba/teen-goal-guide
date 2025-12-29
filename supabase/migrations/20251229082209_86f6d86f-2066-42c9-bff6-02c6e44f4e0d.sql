-- Create enums for goal categories and status
CREATE TYPE public.goal_category AS ENUM ('academics', 'financial', 'health_fitness', 'fun_recreation', 'career', 'custom');
CREATE TYPE public.goal_status AS ENUM ('active', 'completed', 'archived');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  avatar_url TEXT,
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_check_in TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create goals table
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category goal_category NOT NULL,
  custom_category_name TEXT,
  title TEXT NOT NULL,
  smart_goal TEXT NOT NULL,
  initial_goal TEXT,
  target_date DATE,
  status goal_status NOT NULL DEFAULT 'active',
  progress INTEGER NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create goal_details table for S.M.A.R.T. framework sections
CREATE TABLE public.goal_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  why_reasons TEXT[] DEFAULT '{}',
  action_steps TEXT[] DEFAULT '{}',
  support_people TEXT[] DEFAULT '{}',
  barriers TEXT[] DEFAULT '{}',
  sacrifices TEXT[] DEFAULT '{}',
  exciting_statement TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create milestones table
CREATE TABLE public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_achievements junction table
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Create check_ins table for daily progress
CREATE TABLE public.check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
  notes TEXT,
  xp_earned INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Goals policies
CREATE POLICY "Users can view their own goals"
  ON public.goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals"
  ON public.goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
  ON public.goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
  ON public.goals FOR DELETE
  USING (auth.uid() = user_id);

-- Goal details policies
CREATE POLICY "Users can view their own goal details"
  ON public.goal_details FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.goals WHERE goals.id = goal_details.goal_id AND goals.user_id = auth.uid()));

CREATE POLICY "Users can create their own goal details"
  ON public.goal_details FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.goals WHERE goals.id = goal_details.goal_id AND goals.user_id = auth.uid()));

CREATE POLICY "Users can update their own goal details"
  ON public.goal_details FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.goals WHERE goals.id = goal_details.goal_id AND goals.user_id = auth.uid()));

CREATE POLICY "Users can delete their own goal details"
  ON public.goal_details FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.goals WHERE goals.id = goal_details.goal_id AND goals.user_id = auth.uid()));

-- Milestones policies
CREATE POLICY "Users can view their own milestones"
  ON public.milestones FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.goals WHERE goals.id = milestones.goal_id AND goals.user_id = auth.uid()));

CREATE POLICY "Users can create their own milestones"
  ON public.milestones FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.goals WHERE goals.id = milestones.goal_id AND goals.user_id = auth.uid()));

CREATE POLICY "Users can update their own milestones"
  ON public.milestones FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.goals WHERE goals.id = milestones.goal_id AND goals.user_id = auth.uid()));

CREATE POLICY "Users can delete their own milestones"
  ON public.milestones FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.goals WHERE goals.id = milestones.goal_id AND goals.user_id = auth.uid()));

-- Achievements policies (public read, admin insert)
CREATE POLICY "Anyone can view achievements"
  ON public.achievements FOR SELECT
  TO authenticated
  USING (true);

-- User achievements policies
CREATE POLICY "Users can view their own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can earn achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Check-ins policies
CREATE POLICY "Users can view their own check-ins"
  ON public.check_ins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own check-ins"
  ON public.check_ins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_goal_details_updated_at
  BEFORE UPDATE ON public.goal_details
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'username');
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default achievements
INSERT INTO public.achievements (name, description, icon, xp_reward, requirement_type, requirement_value) VALUES
  ('First Steps', 'Set your first goal', '🎯', 50, 'goals_created', 1),
  ('Goal Setter', 'Set 5 goals', '🌟', 100, 'goals_created', 5),
  ('Dream Big', 'Set 10 goals', '🚀', 200, 'goals_created', 10),
  ('Achiever', 'Complete your first goal', '🏆', 100, 'goals_completed', 1),
  ('Unstoppable', 'Complete 5 goals', '💪', 250, 'goals_completed', 5),
  ('Champion', 'Complete 10 goals', '👑', 500, 'goals_completed', 10),
  ('Consistent', 'Maintain a 7-day streak', '🔥', 150, 'streak', 7),
  ('Dedicated', 'Maintain a 30-day streak', '💎', 500, 'streak', 30),
  ('Legend', 'Maintain a 100-day streak', '🌈', 1000, 'streak', 100),
  ('Rising Star', 'Reach level 5', '⭐', 100, 'level', 5),
  ('Pro', 'Reach level 10', '🎖️', 250, 'level', 10),
  ('Master', 'Reach level 25', '🏅', 500, 'level', 25);