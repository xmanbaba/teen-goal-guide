import { GoalTemplate, GOAL_TEMPLATES } from '@/data/goalTemplates';
import { GoalCategory, CATEGORY_CONFIG } from '@/hooks/useGoals';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, ArrowRight, FileText } from 'lucide-react';

interface GoalTemplatesPickerProps {
  onSelectTemplate: (template: GoalTemplate) => void;
  onStartFromScratch: () => void;
}

export default function GoalTemplatesPicker({ 
  onSelectTemplate, 
  onStartFromScratch 
}: GoalTemplatesPickerProps) {
  // Group templates by category
  const templatesByCategory = (Object.keys(CATEGORY_CONFIG) as GoalCategory[])
    .filter(cat => cat !== 'custom')
    .map(category => ({
      category,
      config: CATEGORY_CONFIG[category],
      templates: GOAL_TEMPLATES.filter(t => t.category === category),
    }))
    .filter(group => group.templates.length > 0);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-hero mb-2">
          <Sparkles className="w-8 h-8 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-display font-bold">Choose a Template</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Start with a pre-made S.M.A.R.T. goal or create your own from scratch
        </p>
      </div>

      <Button 
        variant="outline" 
        className="w-full py-6 border-dashed border-2 hover:border-primary hover:bg-primary/5"
        onClick={onStartFromScratch}
      >
        <FileText className="w-5 h-5 mr-2" />
        Start from Scratch
        <ArrowRight className="w-4 h-4 ml-auto" />
      </Button>

      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <p className="text-center text-sm text-muted-foreground py-4">or pick a template</p>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-6">
          {templatesByCategory.map(({ category, config, templates }) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{config.icon}</span>
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  {config.label}
                </h3>
              </div>
              <div className="grid gap-3">
                {templates.map((template) => (
                  <Card 
                    key={template.id}
                    className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50 hover:bg-muted/30 group"
                    onClick={() => onSelectTemplate(template)}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="text-3xl">{template.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold group-hover:text-primary transition-colors">
                          {template.title}
                        </h4>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {template.smartGoal}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
