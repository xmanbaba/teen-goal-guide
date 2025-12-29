import { useProfile, getXPForNextLevel, getXPForCurrentLevel } from '@/hooks/useProfile';
import { useGoals, CATEGORY_CONFIG } from '@/hooks/useGoals';
import { useCheckIns } from '@/hooks/useCheckIns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target, CheckCircle2, Flame, Trophy, Calendar } from 'lucide-react';

export function ProgressReport() {
  const { profile } = useProfile();
  const { goals } = useGoals();
  const { checkIns } = useCheckIns();

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');
  
  // Calculate this week's check-ins
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weeklyCheckIns = checkIns.filter(c => new Date(c.created_at) >= oneWeekAgo);
  
  // Calculate XP earned this week
  const weeklyXP = weeklyCheckIns.reduce((sum, c) => sum + c.xp_earned, 0);
  
  // Calculate average goal progress
  const avgProgress = activeGoals.length > 0 
    ? Math.round(activeGoals.reduce((sum, g) => sum + g.progress, 0) / activeGoals.length)
    : 0;

  // XP progress to next level
  const currentLevelXP = getXPForCurrentLevel(profile?.current_level || 1);
  const nextLevelXP = getXPForNextLevel(profile?.current_level || 1);
  const xpProgress = ((profile?.total_xp || 0) - currentLevelXP) / (nextLevelXP - currentLevelXP) * 100;
  const xpToNextLevel = nextLevelXP - (profile?.total_xp || 0);

  // Get goals by category
  const goalsByCategory = activeGoals.reduce((acc, goal) => {
    acc[goal.category] = (acc[goal.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-display font-bold">Progress Report</h2>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-primary mb-1">
              <Target className="w-4 h-4" />
              <span className="text-sm font-medium">Active Goals</span>
            </div>
            <p className="text-2xl font-display font-bold">{activeGoals.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-success mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-medium">Completed</span>
            </div>
            <p className="text-2xl font-display font-bold">{completedGoals.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-xp/10 to-xp/5 border-xp/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xp mb-1">
              <Trophy className="w-4 h-4" />
              <span className="text-sm font-medium">Weekly XP</span>
            </div>
            <p className="text-2xl font-display font-bold">+{weeklyXP}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-streak/10 to-streak/5 border-streak/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-streak mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Check-ins</span>
            </div>
            <p className="text-2xl font-display font-bold">{weeklyCheckIns.length}/7</p>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Flame className="w-4 h-4 text-primary" />
            Level {profile?.current_level || 1} Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Progress value={xpProgress} className="h-3" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {profile?.total_xp || 0} XP total
              </span>
              <span className="font-medium text-primary">
                {xpToNextLevel} XP to Level {(profile?.current_level || 1) + 1}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals by Category */}
      {activeGoals.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Goals by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(goalsByCategory).map(([category, count]) => {
                const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG];
                return (
                  <div key={category} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${config.color} flex items-center justify-center text-sm`}>
                      {config.icon}
                    </div>
                    <span className="flex-1 font-medium">{config.label}</span>
                    <span className="text-muted-foreground">{count} goal{count !== 1 ? 's' : ''}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Average Progress */}
      {activeGoals.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Average Goal Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Progress value={avgProgress} className="flex-1 h-3" />
              <span className="font-display font-bold text-xl">{avgProgress}%</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Streak Info */}
      {(profile?.current_streak || 0) > 0 && (
        <Card className="bg-gradient-to-br from-streak/10 to-streak/5 border-streak/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-streak/20 flex items-center justify-center">
                <Flame className="w-8 h-8 text-streak" />
              </div>
              <div>
                <p className="text-3xl font-display font-bold">{profile?.current_streak} day streak!</p>
                <p className="text-muted-foreground">
                  {profile?.current_streak === profile?.longest_streak 
                    ? "This is your best streak ever! 🔥"
                    : `Your longest streak: ${profile?.longest_streak} days`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
