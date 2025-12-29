import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useGoals, CATEGORY_CONFIG } from '@/hooks/useGoals';
import { useCheckIns } from '@/hooks/useCheckIns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Target, Flame, CheckCircle2, Sparkles, Calendar } from 'lucide-react';

export default function CheckIn() {
  const { user, loading: authLoading } = useAuth();
  const { profile, refetch: refetchProfile } = useProfile();
  const { goals } = useGoals();
  const { todayCheckIn, createCheckIn, hasCheckedInToday, refetch: refetchCheckIns } = useCheckIns();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [newStreak, setNewStreak] = useState(0);

  const activeGoals = goals.filter(g => g.status === 'active');
  const alreadyCheckedIn = hasCheckedInToday();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleCheckIn = async () => {
    setIsSubmitting(true);
    
    const result = await createCheckIn(selectedGoal, notes);
    
    setIsSubmitting(false);

    if (result.error) {
      toast({
        title: 'Check-in failed',
        description: result.error.message,
        variant: 'destructive',
      });
    } else {
      setEarnedXP(result.xpEarned || 15);
      setNewStreak(result.newStreak || 1);
      setShowSuccess(true);
      refetchProfile();
      refetchCheckIns();
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="relative mb-6">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-hero flex items-center justify-center animate-pulse-glow">
                <CheckCircle2 className="w-12 h-12 text-primary-foreground" />
              </div>
              <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-xp/20 flex items-center justify-center animate-float">
                <Sparkles className="w-6 h-6 text-xp" />
              </div>
            </div>
            
            <h2 className="text-2xl font-display font-bold mb-2">Check-in Complete!</h2>
            <p className="text-muted-foreground mb-6">Great job staying consistent with your goals!</p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-xp/10 border border-xp/20">
                <p className="text-3xl font-display font-bold text-xp">+{earnedXP}</p>
                <p className="text-sm text-muted-foreground">XP Earned</p>
              </div>
              <div className="p-4 rounded-xl bg-streak/10 border border-streak/20">
                <div className="flex items-center justify-center gap-1">
                  <Flame className="w-6 h-6 text-streak" />
                  <p className="text-3xl font-display font-bold text-streak">{newStreak}</p>
                </div>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
            </div>
            
            {newStreak >= 3 && (
              <div className="p-4 rounded-xl bg-gradient-hero/10 border border-primary/20 mb-6">
                <p className="text-sm font-medium text-primary">
                  🔥 {newStreak} day streak! Keep it up for bonus XP!
                </p>
              </div>
            )}
            
            <Button onClick={() => navigate('/dashboard')} className="w-full bg-gradient-hero">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (alreadyCheckedIn) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <h1 className="font-display font-bold">Daily Check-in</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="pt-8 pb-8">
              <div className="w-20 h-20 mx-auto rounded-full bg-success/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10 text-success" />
              </div>
              <h2 className="text-xl font-display font-bold mb-2">Already Checked In Today!</h2>
              <p className="text-muted-foreground mb-6">
                You've already completed your daily check-in. Come back tomorrow to continue your streak!
              </p>
              
              <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-streak/10 border border-streak/20 mb-6">
                <Flame className="w-6 h-6 text-streak" />
                <span className="text-2xl font-display font-bold">{profile?.current_streak || 0}</span>
                <span className="text-muted-foreground">day streak</span>
              </div>
              
              <Button onClick={() => navigate('/dashboard')} variant="outline" className="w-full">
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="font-display font-bold">Daily Check-in</h1>
              <p className="text-sm text-muted-foreground">Track your progress & earn XP</p>
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-streak/10 text-streak">
              <Flame className="w-4 h-4" />
              <span className="text-sm font-medium">{profile?.current_streak || 0}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-hero flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle>How's your progress?</CardTitle>
                <CardDescription>Select a goal you worked on today</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Goal Selection */}
            {activeGoals.length > 0 ? (
              <div className="space-y-3">
                <button
                  onClick={() => setSelectedGoal(null)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    selectedGoal === null
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">General Progress</p>
                      <p className="text-sm text-muted-foreground">Not tied to a specific goal</p>
                    </div>
                  </div>
                </button>

                {activeGoals.map(goal => (
                  <button
                    key={goal.id}
                    onClick={() => setSelectedGoal(goal.id)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      selectedGoal === goal.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${CATEGORY_CONFIG[goal.category].color} flex items-center justify-center text-lg`}>
                        {CATEGORY_CONFIG[goal.category].icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{goal.title}</p>
                        <p className="text-sm text-muted-foreground">{goal.progress}% complete</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">No active goals yet</p>
                <Link to="/goals/new">
                  <Button variant="outline" size="sm">Create a Goal</Button>
                </Link>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">What did you accomplish? (optional)</label>
              <Textarea
                placeholder="Share your progress, wins, or challenges..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">{notes.length}/500</p>
            </div>

            {/* XP Preview */}
            <div className="p-4 rounded-xl bg-xp/10 border border-xp/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-xp" />
                  <span className="font-medium">XP You'll Earn</span>
                </div>
                <div className="text-right">
                  <p className="text-xl font-display font-bold text-xp">
                    +{15 + ((profile?.current_streak || 0) > 0 ? Math.min(profile?.current_streak || 0, 7) * 5 : 0)}
                  </p>
                  {(profile?.current_streak || 0) > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Includes {Math.min(profile?.current_streak || 0, 7) * 5} streak bonus
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleCheckIn}
              disabled={isSubmitting}
              className="w-full bg-gradient-hero py-6"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Checking in...
                </span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Complete Check-in
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
