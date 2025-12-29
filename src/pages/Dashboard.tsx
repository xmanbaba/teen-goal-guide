import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, getXPForNextLevel, getXPForCurrentLevel } from '@/hooks/useProfile';
import { useGoals, CATEGORY_CONFIG } from '@/hooks/useGoals';
import { useAchievements } from '@/hooks/useAchievements';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, Plus, Flame, Trophy, Zap, LogOut, User, Star } from 'lucide-react';

export default function Dashboard() {
  const { user, signOut, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { goals, loading: goalsLoading } = useGoals();
  const { earnedAchievements } = useAchievements();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || profileLoading || goalsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');
  
  const currentLevelXP = getXPForCurrentLevel(profile?.current_level || 1);
  const nextLevelXP = getXPForNextLevel(profile?.current_level || 1);
  const xpProgress = ((profile?.total_xp || 0) - currentLevelXP) / (nextLevelXP - currentLevelXP) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
              <Target className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl hidden sm:block">Goal Getter</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link to="/achievements">
              <Button variant="ghost" size="icon">
                <Trophy className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="ghost" size="icon">
                <User className="w-5 h-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-level/10 to-level/5 border-level/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-level mb-1">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">Level</span>
              </div>
              <p className="text-3xl font-display font-bold">{profile?.current_level || 1}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-xp/10 to-xp/5 border-xp/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xp mb-1">
                <Star className="w-4 h-4" />
                <span className="text-sm font-medium">Total XP</span>
              </div>
              <p className="text-3xl font-display font-bold">{profile?.total_xp || 0}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-streak/10 to-streak/5 border-streak/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-streak mb-1">
                <Flame className="w-4 h-4" />
                <span className="text-sm font-medium">Streak</span>
              </div>
              <p className="text-3xl font-display font-bold">{profile?.current_streak || 0}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-accent mb-1">
                <Trophy className="w-4 h-4" />
                <span className="text-sm font-medium">Badges</span>
              </div>
              <p className="text-3xl font-display font-bold">{earnedAchievements.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* XP Progress */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Level {profile?.current_level || 1} Progress</span>
              <span className="text-sm text-muted-foreground">{profile?.total_xp || 0} / {nextLevelXP} XP</span>
            </div>
            <Progress value={xpProgress} className="h-3" />
          </CardContent>
        </Card>

        {/* Goals Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold">Your Goals</h2>
          <Button onClick={() => navigate('/goals/new')} className="bg-gradient-hero">
            <Plus className="w-4 h-4 mr-2" /> New Goal
          </Button>
        </div>

        {activeGoals.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-display font-bold mb-2">No Goals Yet</h3>
              <p className="text-muted-foreground mb-4">Start your journey by setting your first S.M.A.R.T. goal!</p>
              <Button onClick={() => navigate('/goals/new')} className="bg-gradient-hero">
                <Plus className="w-4 h-4 mr-2" /> Create Your First Goal
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeGoals.map(goal => (
              <Card key={goal.id} className="hover:shadow-hover transition-all cursor-pointer" onClick={() => navigate(`/goals/${goal.id}`)}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-8 h-8 rounded-lg ${CATEGORY_CONFIG[goal.category].color} flex items-center justify-center text-lg`}>
                      {CATEGORY_CONFIG[goal.category].icon}
                    </span>
                    <span className="text-sm text-muted-foreground">{CATEGORY_CONFIG[goal.category].label}</span>
                  </div>
                  <CardTitle className="text-lg">{goal.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {completedGoals.length > 0 && (
          <div className="mt-12">
            <h3 className="text-lg font-display font-bold mb-4 text-muted-foreground">Completed ({completedGoals.length})</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-70">
              {completedGoals.slice(0, 3).map(goal => (
                <Card key={goal.id} className="bg-success/5 border-success/20">
                  <CardContent className="p-4 flex items-center gap-3">
                    <span className="text-2xl">🏆</span>
                    <div>
                      <p className="font-medium">{goal.title}</p>
                      <p className="text-sm text-muted-foreground">+{goal.xp_earned} XP earned</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
