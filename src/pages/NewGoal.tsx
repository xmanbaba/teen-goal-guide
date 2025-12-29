import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useGoals, GoalCategory, CATEGORY_CONFIG } from '@/hooks/useGoals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Target, Sparkles, Check } from 'lucide-react';
import GoalTemplatesPicker from '@/components/GoalTemplatesPicker';
import { GoalTemplate } from '@/data/goalTemplates';

const STEPS = [
  { id: 'category', title: 'Category', description: 'What area of life is this goal for?' },
  { id: 'what', title: 'What', description: 'Define your S.M.A.R.T. goal' },
  { id: 'why', title: 'Why', description: 'Why is this goal important to you?' },
  { id: 'how', title: 'How', description: 'What actions will you take?' },
  { id: 'who', title: 'Who', description: 'Who will support you?' },
  { id: 'barriers', title: 'Barriers', description: 'What obstacles might you face?' },
  { id: 'cost', title: 'Cost', description: 'What are you willing to sacrifice?' },
  { id: 'exciting', title: 'Visualize', description: 'Make it exciting!' },
];

export default function NewGoal() {
  const { user, loading: authLoading } = useAuth();
  const { createGoal } = useGoals();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [showTemplates, setShowTemplates] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [category, setCategory] = useState<GoalCategory | null>(null);
  const [customCategory, setCustomCategory] = useState('');
  const [initialGoal, setInitialGoal] = useState('');
  const [smartGoal, setSmartGoal] = useState('');
  const [title, setTitle] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [whyReasons, setWhyReasons] = useState(['', '', '', '', '']);
  const [actionSteps, setActionSteps] = useState(['', '', '']);
  const [supportPeople, setSupportPeople] = useState(['', '']);
  const [barriers, setBarriers] = useState(['', '', '']);
  const [sacrifices, setSacrifices] = useState(['', '', '']);
  const [excitingStatement, setExcitingStatement] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleSelectTemplate = (template: GoalTemplate) => {
    setCategory(template.category);
    setTitle(template.title);
    setSmartGoal(template.smartGoal);
    setWhyReasons(template.whyReasons);
    setActionSteps(template.actionSteps);
    setBarriers(template.barriers);
    setSacrifices(template.sacrifices);
    setExcitingStatement(template.excitingStatement);
    setShowTemplates(false);
  };

  const handleStartFromScratch = () => {
    setShowTemplates(false);
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const canProceed = () => {
    switch (STEPS[currentStep].id) {
      case 'category':
        return category !== null && (category !== 'custom' || customCategory.trim());
      case 'what':
        return title.trim() && smartGoal.trim();
      case 'why':
        return whyReasons.filter(r => r.trim()).length >= 1;
      case 'how':
        return actionSteps.filter(s => s.trim()).length >= 1;
      case 'who':
        return true; // Optional
      case 'barriers':
        return true; // Optional
      case 'cost':
        return true; // Optional
      case 'exciting':
        return true; // Optional
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else if (!showTemplates) {
      setShowTemplates(true);
    } else {
      navigate('/dashboard');
    }
  };

  const handleSubmit = async () => {
    if (!category) return;
    
    setIsSubmitting(true);
    
    const { error } = await createGoal(
      {
        category,
        custom_category_name: category === 'custom' ? customCategory : null,
        title,
        smart_goal: smartGoal,
        initial_goal: initialGoal || null,
        target_date: targetDate || null,
        status: 'active',
        progress: 0,
      },
      {
        why_reasons: whyReasons.filter(r => r.trim()),
        action_steps: actionSteps.filter(s => s.trim()),
        support_people: supportPeople.filter(p => p.trim()),
        barriers: barriers.filter(b => b.trim()),
        sacrifices: sacrifices.filter(s => s.trim()),
        exciting_statement: excitingStatement || null,
      },
      actionSteps.filter(s => s.trim()) // Use action steps as milestones
    );

    setIsSubmitting(false);

    if (error) {
      toast({
        title: 'Failed to create goal',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Goal Created! 🎯',
        description: 'You earned 50 XP for setting a new goal!',
      });
      navigate('/dashboard');
    }
  };

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case 'category':
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(Object.keys(CATEGORY_CONFIG) as GoalCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`p-6 rounded-2xl border-2 transition-all text-left ${
                  category === cat
                    ? 'border-primary bg-primary/10 shadow-glow'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <span className="text-4xl mb-3 block">{CATEGORY_CONFIG[cat].icon}</span>
                <span className="font-semibold">{CATEGORY_CONFIG[cat].label}</span>
              </button>
            ))}
            {category === 'custom' && (
              <div className="col-span-2 md:col-span-3 mt-2">
                <Input
                  placeholder="Enter custom category name..."
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                />
              </div>
            )}
          </div>
        );

      case 'what':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Goal Title</Label>
              <Input
                placeholder="e.g., Get an A in Math"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Initial Goal Idea (optional)</Label>
              <Textarea
                placeholder="Write your initial goal idea here..."
                value={initialGoal}
                onChange={(e) => setInitialGoal(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>S.M.A.R.T. Goal Statement *</Label>
              <p className="text-sm text-muted-foreground">
                Make it Specific, Measurable, Achievable, Relevant, and Time-bound
              </p>
              <Textarea
                placeholder="I will [specific action] by [date] so that [outcome]..."
                value={smartGoal}
                onChange={(e) => setSmartGoal(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Target Date (optional)</Label>
              <Input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>
          </div>
        );

      case 'why':
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">List 5 reasons why achieving this goal is important to you:</p>
            {whyReasons.map((reason, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  {i + 1}
                </span>
                <Input
                  placeholder={`E.g., ${i === 0 ? "It will help me succeed in my future career" : i === 1 ? "I want to make my family proud" : i === 2 ? "It will boost my confidence" : i === 3 ? "It aligns with my values" : "I want to prove it to myself"}`}
                  value={reason}
                  onChange={(e) => {
                    const updated = [...whyReasons];
                    updated[i] = e.target.value;
                    setWhyReasons(updated);
                  }}
                />
              </div>
            ))}
          </div>
        );

      case 'how':
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">What specific actions will you take to achieve this goal?</p>
            {actionSteps.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </span>
                <Input
                  placeholder={`E.g., ${i === 0 ? "Create a daily schedule and stick to it" : i === 1 ? "Find an accountability partner" : "Track my progress weekly"}`}
                  value={step}
                  onChange={(e) => {
                    const updated = [...actionSteps];
                    updated[i] = e.target.value;
                    setActionSteps(updated);
                  }}
                />
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActionSteps([...actionSteps, ''])}
            >
              + Add Another Step
            </Button>
          </div>
        );

      case 'who':
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">Who can help support you on this journey?</p>
            {supportPeople.map((person, i) => (
              <Input
                key={i}
                placeholder={`E.g., ${i === 0 ? "My parent or guardian" : "My best friend who shares similar goals"}`}
                value={person}
                onChange={(e) => {
                  const updated = [...supportPeople];
                  updated[i] = e.target.value;
                  setSupportPeople(updated);
                }}
              />
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSupportPeople([...supportPeople, ''])}
            >
              + Add Another Person
            </Button>
          </div>
        );

      case 'barriers':
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">What obstacles might get in your way?</p>
            {barriers.map((barrier, i) => (
              <Input
                key={i}
                placeholder={`E.g., ${i === 0 ? "Procrastination and getting distracted" : i === 1 ? "Lack of motivation on tough days" : "Time management challenges"}`}
                value={barrier}
                onChange={(e) => {
                  const updated = [...barriers];
                  updated[i] = e.target.value;
                  setBarriers(updated);
                }}
              />
            ))}
          </div>
        );

      case 'cost':
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">What are you willing to sacrifice to achieve this goal?</p>
            {sacrifices.map((sacrifice, i) => (
              <Input
                key={i}
                placeholder={`E.g., ${i === 0 ? "Less time on social media" : i === 1 ? "Fewer late nights with friends" : "Some weekend relaxation time"}`}
                value={sacrifice}
                onChange={(e) => {
                  const updated = [...sacrifices];
                  updated[i] = e.target.value;
                  setSacrifices(updated);
                }}
              />
            ))}
          </div>
        );

      case 'exciting':
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Write an exciting statement about how you'll feel when you achieve this goal!
            </p>
            <Textarea
              placeholder="When I achieve this goal, I will feel..."
              value={excitingStatement}
              onChange={(e) => setExcitingStatement(e.target.value)}
              rows={4}
            />
            <div className="p-4 rounded-xl bg-gradient-hero/10 border border-primary/20">
              <p className="text-sm font-medium text-primary">💡 Tip</p>
              <p className="text-sm text-muted-foreground">
                Visualize yourself achieving this goal. How does it feel? What does success look like?
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="font-display font-bold">Create New Goal</h1>
              <p className="text-sm text-muted-foreground">Step {currentStep + 1} of {STEPS.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
              <Target className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="container mx-auto px-4 py-4">
        <Progress value={progress} className="h-2" />
      </div>

      <main className="container mx-auto px-4 pb-8">
        <Card className="max-w-2xl mx-auto">
          {showTemplates ? (
            <CardContent className="pt-6">
              <GoalTemplatesPicker
                onSelectTemplate={handleSelectTemplate}
                onStartFromScratch={handleStartFromScratch}
              />
            </CardContent>
          ) : (
            <>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-hero flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{STEPS[currentStep].title}</CardTitle>
                    <CardDescription>{STEPS[currentStep].description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {renderStep()}

                <div className="flex justify-between mt-8 pt-6 border-t">
                  <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {currentStep === 0 ? 'Templates' : 'Back'}
                  </Button>
                  
                  {currentStep === STEPS.length - 1 ? (
                    <Button
                      onClick={handleSubmit}
                      disabled={!canProceed() || isSubmitting}
                      className="bg-gradient-hero"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          Creating...
                        </span>
                      ) : (
                        <>
                          Create Goal 🎯
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      disabled={!canProceed()}
                      className="bg-gradient-hero"
                    >
                      Next <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </main>
    </div>
  );
}
