import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sparkles, Trophy, Flame, ArrowRight, Star, Zap } from 'lucide-react';
import teensKonnectLogo from '@/assets/teens-konnect-logo.png';

export default function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <div className="relative">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-secondary/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-accent/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img 
              src={teensKonnectLogo} 
              alt="Teens Konnect" 
              className="h-20 md:h-24 object-contain animate-bounce-subtle"
            />
          </div>

          {/* Main headline */}
          <div className="text-center max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">
              <span className="text-gradient-hero">Turn Dreams</span>
              <br />
              <span className="text-foreground">Into Achievements</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              The gamified goal-setting app that helps teens crush their S.M.A.R.T. goals and level up in life! 🚀
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                className="h-14 px-8 text-lg font-semibold bg-gradient-hero hover:opacity-90 transition-all shadow-glow"
                onClick={() => navigate('/auth')}
              >
                Start Your Journey <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="h-14 px-8 text-lg font-semibold"
                onClick={() => navigate('/auth')}
              >
                I Have an Account
              </Button>
            </div>

            {/* Feature badges */}
            <div className="flex flex-wrap justify-center gap-3 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-2 px-4 py-2 bg-xp/10 text-xp rounded-full font-medium">
                <Sparkles className="w-5 h-5" /> Earn XP Points
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full font-medium">
                <Trophy className="w-5 h-5" /> Unlock Badges
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-streak/10 text-streak rounded-full font-medium">
                <Flame className="w-5 h-5" /> Build Streaks
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-level/10 text-level rounded-full font-medium">
                <Zap className="w-5 h-5" /> Level Up
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: '🎯', title: 'S.M.A.R.T. Goals', desc: 'Follow a proven framework to set goals that actually work' },
            { icon: '🏆', title: 'Earn Achievements', desc: 'Unlock badges and rewards as you progress on your journey' },
            { icon: '📊', title: 'Track Progress', desc: 'Visual progress bars and milestones keep you motivated' },
          ].map((feature, i) => (
            <div 
              key={feature.title}
              className="p-8 rounded-2xl bg-card shadow-card hover:shadow-hover transition-all animate-fade-in-up"
              style={{ animationDelay: `${0.1 * i}s` }}
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-display font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 text-muted-foreground">
          <Star className="w-5 h-5 text-xp" />
          <span>Join thousands of teens achieving their dreams</span>
          <Star className="w-5 h-5 text-xp" />
        </div>
      </div>
    </div>
  );
}
