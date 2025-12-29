import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useGoals, useGoalDetails, GoalCategory, CATEGORY_CONFIG } from '@/hooks/useGoals';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';

export default function EditGoal() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const { goals, updateGoal, refetch: refetchGoals } = useGoals();
  const { details, milestones } = useGoalDetails(id);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [smartGoal, setSmartGoal] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState<GoalCategory>('academics');
  const [customCategory, setCustomCategory] = useState('');
  
  // Details
  const [whyReasons, setWhyReasons] = useState<string[]>(['']);
  const [actionSteps, setActionSteps] = useState<string[]>(['']);
  const [supportPeople, setSupportPeople] = useState<string[]>(['']);
  const [barriers, setBarriers] = useState<string[]>(['']);
  const [sacrifices, setSacrifices] = useState<string[]>(['']);
  const [excitingStatement, setExcitingStatement] = useState('');

  // Milestones
  const [editedMilestones, setEditedMilestones] = useState<{ id?: string; title: string; isNew?: boolean }[]>([]);

  const goal = goals.find(g => g.id === id);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setSmartGoal(goal.smart_goal);
      setTargetDate(goal.target_date || '');
      setCategory(goal.category);
      setCustomCategory(goal.custom_category_name || '');
    }
  }, [goal]);

  useEffect(() => {
    if (details) {
      setWhyReasons(details.why_reasons?.length ? details.why_reasons : ['']);
      setActionSteps(details.action_steps?.length ? details.action_steps : ['']);
      setSupportPeople(details.support_people?.length ? details.support_people : ['']);
      setBarriers(details.barriers?.length ? details.barriers : ['']);
      setSacrifices(details.sacrifices?.length ? details.sacrifices : ['']);
      setExcitingStatement(details.exciting_statement || '');
    }
  }, [details]);

  useEffect(() => {
    if (milestones.length > 0) {
      setEditedMilestones(milestones.map(m => ({ id: m.id, title: m.title })));
    }
  }, [milestones]);

  const handleAddItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => [...prev, '']);
  };

  const handleRemoveItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number, value: string) => {
    setter(prev => prev.map((item, i) => i === index ? value : item));
  };

  const handleAddMilestone = () => {
    setEditedMilestones(prev => [...prev, { title: '', isNew: true }]);
  };

  const handleRemoveMilestone = (index: number) => {
    setEditedMilestones(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateMilestone = (index: number, title: string) => {
    setEditedMilestones(prev => prev.map((m, i) => i === index ? { ...m, title } : m));
  };

  const handleSubmit = async () => {
    if (!goal || !id) return;

    setIsSubmitting(true);

    try {
      // Update goal
      await updateGoal(id, {
        title,
        smart_goal: smartGoal,
        target_date: targetDate || null,
        category,
        custom_category_name: category === 'custom' ? customCategory : null,
      });

      // Update details
      const filteredWhyReasons = whyReasons.filter(r => r.trim());
      const filteredActionSteps = actionSteps.filter(s => s.trim());
      const filteredSupportPeople = supportPeople.filter(p => p.trim());
      const filteredBarriers = barriers.filter(b => b.trim());
      const filteredSacrifices = sacrifices.filter(s => s.trim());

      if (details) {
        await supabase
          .from('goal_details')
          .update({
            why_reasons: filteredWhyReasons,
            action_steps: filteredActionSteps,
            support_people: filteredSupportPeople,
            barriers: filteredBarriers,
            sacrifices: filteredSacrifices,
            exciting_statement: excitingStatement || null,
          })
          .eq('goal_id', id);
      } else {
        await supabase
          .from('goal_details')
          .insert({
            goal_id: id,
            why_reasons: filteredWhyReasons,
            action_steps: filteredActionSteps,
            support_people: filteredSupportPeople,
            barriers: filteredBarriers,
            sacrifices: filteredSacrifices,
            exciting_statement: excitingStatement || null,
          });
      }

      // Handle milestones
      const existingIds = milestones.map(m => m.id);
      const editedIds = editedMilestones.filter(m => m.id).map(m => m.id);
      
      // Delete removed milestones
      const toDelete = existingIds.filter(id => !editedIds.includes(id));
      if (toDelete.length > 0) {
        await supabase
          .from('milestones')
          .delete()
          .in('id', toDelete);
      }

      // Update existing and add new milestones
      for (let i = 0; i < editedMilestones.length; i++) {
        const milestone = editedMilestones[i];
        if (!milestone.title.trim()) continue;

        if (milestone.id) {
          await supabase
            .from('milestones')
            .update({ title: milestone.title, order_index: i })
            .eq('id', milestone.id);
        } else {
          await supabase
            .from('milestones')
            .insert({
              goal_id: id,
              title: milestone.title,
              order_index: i,
            });
        }
      }

      await refetchGoals();
      
      toast({
        title: 'Goal Updated!',
        description: 'Your changes have been saved.',
      });
      
      navigate(`/goals/${id}`);
    } catch (error) {
      toast({
        title: 'Failed to update goal',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!goal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/goals/${id}`)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="font-display font-bold">Edit Goal</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          {/* Category */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {(Object.keys(CATEGORY_CONFIG) as GoalCategory[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      category === cat
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <span className="text-2xl mb-2 block">{CATEGORY_CONFIG[cat].icon}</span>
                    <span className="text-sm font-medium">{CATEGORY_CONFIG[cat].label}</span>
                  </button>
                ))}
              </div>
              {category === 'custom' && (
                <Input
                  placeholder="Custom category name..."
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="mt-3"
                />
              )}
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Goal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Goal title..."
                />
              </div>
              <div className="space-y-2">
                <Label>S.M.A.R.T. Goal Statement</Label>
                <Textarea
                  value={smartGoal}
                  onChange={(e) => setSmartGoal(e.target.value)}
                  placeholder="Your S.M.A.R.T. goal..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Target Date</Label>
                <Input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Steps / Milestones */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Action Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {editedMilestones.map((milestone, i) => (
                <div key={milestone.id || `new-${i}`} className="flex items-center gap-2">
                  <Input
                    value={milestone.title}
                    onChange={(e) => handleUpdateMilestone(i, e.target.value)}
                    placeholder={`Step ${i + 1}...`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveMilestone(i)}
                    className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={handleAddMilestone}>
                <Plus className="w-4 h-4 mr-2" /> Add Step
              </Button>
            </CardContent>
          </Card>

          {/* Why Reasons */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Why This Matters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {whyReasons.map((reason, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={reason}
                    onChange={(e) => handleUpdateItem(setWhyReasons, i, e.target.value)}
                    placeholder={`Reason ${i + 1}...`}
                  />
                  {whyReasons.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(setWhyReasons, i)}
                      className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => handleAddItem(setWhyReasons)}>
                <Plus className="w-4 h-4 mr-2" /> Add Reason
              </Button>
            </CardContent>
          </Card>

          {/* Support People */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Support Team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {supportPeople.map((person, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={person}
                    onChange={(e) => handleUpdateItem(setSupportPeople, i, e.target.value)}
                    placeholder={`Person ${i + 1}...`}
                  />
                  {supportPeople.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(setSupportPeople, i)}
                      className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => handleAddItem(setSupportPeople)}>
                <Plus className="w-4 h-4 mr-2" /> Add Person
              </Button>
            </CardContent>
          </Card>

          {/* Barriers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Potential Barriers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {barriers.map((barrier, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={barrier}
                    onChange={(e) => handleUpdateItem(setBarriers, i, e.target.value)}
                    placeholder={`Barrier ${i + 1}...`}
                  />
                  {barriers.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(setBarriers, i)}
                      className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => handleAddItem(setBarriers)}>
                <Plus className="w-4 h-4 mr-2" /> Add Barrier
              </Button>
            </CardContent>
          </Card>

          {/* Sacrifices */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sacrifices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sacrifices.map((sacrifice, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={sacrifice}
                    onChange={(e) => handleUpdateItem(setSacrifices, i, e.target.value)}
                    placeholder={`Sacrifice ${i + 1}...`}
                  />
                  {sacrifices.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(setSacrifices, i)}
                      className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => handleAddItem(setSacrifices)}>
                <Plus className="w-4 h-4 mr-2" /> Add Sacrifice
              </Button>
            </CardContent>
          </Card>

          {/* Vision Statement */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vision Statement</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={excitingStatement}
                onChange={(e) => setExcitingStatement(e.target.value)}
                placeholder="When I achieve this goal, I will feel..."
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button
            size="lg"
            className="w-full bg-gradient-hero"
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim() || !smartGoal.trim()}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
