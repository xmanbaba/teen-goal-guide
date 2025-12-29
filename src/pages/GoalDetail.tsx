import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useGoals, useGoalDetails, CATEGORY_CONFIG, Goal } from '@/hooks/useGoals';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Target, Calendar, Trophy, Trash2, CheckCircle2, Pencil } from 'lucide-react';

export default function GoalDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const { goals, updateGoal, deleteGoal, completeGoal } = useGoals();
  const { details, milestones, toggleMilestone } = useGoalDetails(id);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [goal, setGoal] = useState<Goal | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const found = goals.find(g => g.id === id);
    setGoal(found || null);
  }, [goals, id]);

  const handleMilestoneToggle = async (milestoneId: string, isCompleted: boolean) => {
    await toggleMilestone(milestoneId, isCompleted);
    
    // Update goal progress based on milestones
    if (goal && milestones.length > 0) {
      const completedCount = milestones.filter(m => 
        m.id === milestoneId ? isCompleted : m.is_completed
      ).length;
      const newProgress = Math.round((completedCount / milestones.length) * 100);
      await updateGoal(goal.id, { progress: newProgress });
    }

    if (isCompleted) {
      toast({
        title: 'Milestone completed! ✨',
        description: '+10 XP earned!',
      });
    }
  };

  const handleComplete = async () => {
    if (!goal) return;
    await completeGoal(goal.id);
    toast({
      title: 'Goal Achieved! 🏆',
      description: 'Congratulations! You earned 100 XP!',
    });
    navigate('/dashboard');
  };

  const handleDelete = async () => {
    if (!goal) return;
    if (confirm('Are you sure you want to delete this goal?')) {
      await deleteGoal(goal.id);
      toast({
        title: 'Goal deleted',
        description: 'Your goal has been removed.',
      });
      navigate('/dashboard');
    }
  };

  if (!goal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const categoryConfig = CATEGORY_CONFIG[goal.category];

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
              <div className="flex items-center gap-2">
                <span className={`w-8 h-8 rounded-lg ${categoryConfig.color} flex items-center justify-center text-lg`}>
                  {categoryConfig.icon}
                </span>
                <span className="text-sm text-muted-foreground">{categoryConfig.label}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => navigate(`/goals/${id}/edit`)}>
                <Pencil className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleDelete} className="text-destructive hover:text-destructive">
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Title & Progress */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-4">{goal.title}</h1>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span className="font-medium">{goal.progress}%</span>
              </div>
              <Progress value={goal.progress} className="h-3" />
            </div>
            {goal.target_date && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{new Date(goal.target_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* S.M.A.R.T. Goal */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              S.M.A.R.T. Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">{goal.smart_goal}</p>
            {goal.initial_goal && (
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Initial idea:</strong> {goal.initial_goal}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Milestones */}
        {milestones.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-secondary" />
                Action Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                      milestone.is_completed ? 'bg-success/10' : 'bg-muted/50'
                    }`}
                  >
                    <Checkbox
                      checked={milestone.is_completed}
                      onCheckedChange={(checked) => 
                        handleMilestoneToggle(milestone.id, checked as boolean)
                      }
                    />
                    <span className={milestone.is_completed ? 'line-through text-muted-foreground' : ''}>
                      {milestone.title}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Details Sections */}
        {details && (
          <div className="space-y-6">
            {details.why_reasons && details.why_reasons.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Why This Matters</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {details.why_reasons.map((reason, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {i + 1}
                        </span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {details.support_people && details.support_people.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Support Team</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {details.support_people.map((person, i) => (
                      <span key={i} className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm">
                        {person}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {details.barriers && details.barriers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Potential Barriers</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {details.barriers.map((barrier, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-destructive">⚠️</span>
                        <span>{barrier}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {details.exciting_statement && (
              <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">✨ Vision Statement</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg italic">"{details.exciting_statement}"</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Complete Button */}
        {goal.status === 'active' && (
          <div className="mt-8 pt-8 border-t">
            <Button
              size="lg"
              className="w-full h-14 text-lg bg-gradient-hero"
              onClick={handleComplete}
            >
              <Trophy className="w-5 h-5 mr-2" />
              Mark as Complete 🎉
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
