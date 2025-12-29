import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAchievements } from '@/hooks/useAchievements';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Target, Lock, Star } from 'lucide-react';

export default function Achievements() {
  const { user, loading: authLoading } = useAuth();
  const { earnedAchievements, lockedAchievements, loading } = useAchievements();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
              <h1 className="font-display font-bold text-xl">Achievements</h1>
              <p className="text-sm text-muted-foreground">
                {earnedAchievements.length} of {earnedAchievements.length + lockedAchievements.length} unlocked
              </p>
            </div>
            <Link to="/dashboard">
              <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
                <Target className="w-5 h-5 text-primary-foreground" />
              </div>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Earned Achievements */}
        {earnedAchievements.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-xp" />
              Earned Badges
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {earnedAchievements.map((achievement) => (
                <Card 
                  key={achievement.id} 
                  className="bg-gradient-to-br from-xp/10 to-accent/5 border-xp/30 animate-scale-in"
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl mb-3 animate-bounce-subtle">{achievement.icon}</div>
                    <h3 className="font-display font-bold mb-1">{achievement.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-xp/20 text-xp rounded-full text-xs font-medium">
                      +{achievement.xp_reward} XP
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Locked Achievements */}
        {lockedAchievements.length > 0 && (
          <div>
            <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-muted-foreground" />
              Locked Badges
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {lockedAchievements.map((achievement) => (
                <Card 
                  key={achievement.id} 
                  className="bg-muted/30 border-border opacity-60"
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl mb-3 grayscale">{achievement.icon}</div>
                    <h3 className="font-display font-bold mb-1">{achievement.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium">
                      <Lock className="w-3 h-3" />
                      +{achievement.xp_reward} XP
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {earnedAchievements.length === 0 && lockedAchievements.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-xl font-display font-bold mb-2">No Achievements Yet</h3>
              <p className="text-muted-foreground mb-4">Start setting goals to earn your first badge!</p>
              <Button onClick={() => navigate('/goals/new')} className="bg-gradient-hero">
                Create Your First Goal
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
