import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, getXPForNextLevel, getXPForCurrentLevel } from '@/hooks/useProfile';
import { useGoals } from '@/hooks/useGoals';
import { useAchievements } from '@/hooks/useAchievements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Target, User, Zap, Star, Flame, Trophy, Calendar, Save } from 'lucide-react';

export default function Profile() {
  const { user, signOut, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const { goals } = useGoals();
  const { earnedAchievements } = useAchievements();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [username, setUsername] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
    }
  }, [profile]);

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await updateProfile({ username });
    setIsSaving(false);
    
    if (error) {
      toast({
        title: 'Failed to update profile',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Profile updated! ✨',
        description: 'Your changes have been saved.',
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const currentLevelXP = getXPForCurrentLevel(profile?.current_level || 1);
  const nextLevelXP = getXPForNextLevel(profile?.current_level || 1);
  const xpProgress = ((profile?.total_xp || 0) - currentLevelXP) / (nextLevelXP - currentLevelXP) * 100;

  const activeGoals = goals.filter(g => g.status === 'active').length;
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const memberSince = profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="font-display font-bold text-xl">Profile</h1>
            </div>
            <Link to="/dashboard">
              <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
                <Target className="w-5 h-5 text-primary-foreground" />
              </div>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Profile Card */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-hero flex items-center justify-center">
                <User className="w-10 h-10 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-display font-bold">{profile?.username || 'Goal Getter'}</h2>
                <p className="text-muted-foreground">{user?.email}</p>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Member since {memberSince}
                </div>
              </div>
            </div>

            {/* Level Progress */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-level/10 to-primary/5 mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-level" />
                  <span className="font-display font-bold">Level {profile?.current_level || 1}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {profile?.total_xp || 0} / {nextLevelXP} XP
                </span>
              </div>
              <Progress value={xpProgress} className="h-3" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-xl bg-xp/10">
                <Star className="w-5 h-5 text-xp mx-auto mb-1" />
                <p className="text-2xl font-display font-bold">{profile?.total_xp || 0}</p>
                <p className="text-xs text-muted-foreground">Total XP</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-streak/10">
                <Flame className="w-5 h-5 text-streak mx-auto mb-1" />
                <p className="text-2xl font-display font-bold">{profile?.current_streak || 0}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-success/10">
                <Trophy className="w-5 h-5 text-success mx-auto mb-1" />
                <p className="text-2xl font-display font-bold">{completedGoals}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-primary/10">
                <Target className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-2xl font-display font-bold">{activeGoals}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Achievements */}
        {earnedAchievements.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Badges</span>
                <Link to="/achievements" className="text-sm text-primary font-normal">
                  View all →
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {earnedAchievements.slice(0, 5).map((achievement) => (
                  <div key={achievement.id} className="flex-shrink-0 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-xp/10 flex items-center justify-center text-3xl mb-1">
                      {achievement.icon}
                    </div>
                    <p className="text-xs font-medium truncate w-16">{achievement.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Profile */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your display name"
              />
            </div>
            <Button onClick={handleSave} disabled={isSaving} className="w-full">
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Sign Out */}
        <Button 
          variant="outline" 
          className="w-full text-destructive hover:text-destructive" 
          onClick={handleSignOut}
        >
          Sign Out
        </Button>
      </main>
    </div>
  );
}
