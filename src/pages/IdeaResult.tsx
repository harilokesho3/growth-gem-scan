import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Download, Calendar, Lightbulb, Target, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { generateIdeaPdf } from '@/lib/generatePdf';

interface IdeaData {
  id: string;
  idea_title: string;
  idea_description: string;
  target_market: string;
  problem_solved: string;
  feasibility_score: number | null;
  innovation_score: number | null;
  market_potential_score: number | null;
  overall_score: number | null;
  ai_analysis: string | null;
  ai_recommendations: string | null;
  status: string;
  created_at: string;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-500';
};

const getScoreBg = (score: number) => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
};

const getScoreLabel = (score: number) => {
  if (score >= 80) return 'High Potential';
  if (score >= 60) return 'Promising';
  if (score >= 40) return 'Needs Work';
  return 'High Risk';
};

const IdeaResult = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [idea, setIdea] = useState<IdeaData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user && id) {
      fetchIdea();
    }
  }, [user, authLoading, id, navigate]);

  const fetchIdea = async () => {
    const { data, error } = await supabase
      .from('idea_validations')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      navigate('/');
      return;
    }

    setIdea(data);
    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!idea) {
    return null;
  }

  const scores = [
    { label: 'Feasibility', score: idea.feasibility_score, icon: Target, description: 'How realistic is it to build?' },
    { label: 'Innovation', score: idea.innovation_score, icon: Sparkles, description: 'How unique and differentiated?' },
    { label: 'Market Potential', score: idea.market_potential_score, icon: Lightbulb, description: 'How large is the opportunity?' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-gradient-hero" />
      <div className="fixed inset-0 grid-pattern opacity-50" />
      
      <Navbar />
      
      <main className="relative pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </Link>
              <h1 className="font-display text-3xl font-bold">{idea.idea_title}</h1>
              <p className="text-muted-foreground mt-1">{idea.idea_description.slice(0, 100)}...</p>
            </div>
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => generateIdeaPdf(idea)}
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
          
          {/* Overall Score Card */}
          <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-card mb-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative">
                <div className="h-40 w-40 rounded-full border-8 border-secondary flex items-center justify-center">
                  <div className="text-center">
                    <div className={`font-display text-5xl font-bold ${getScoreColor(idea.overall_score || 0)}`}>
                      {idea.overall_score || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Overall Score</div>
                  </div>
                </div>
                <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium ${getScoreBg(idea.overall_score || 0)} text-white`}>
                  {getScoreLabel(idea.overall_score || 0)}
                </div>
              </div>
              
              <div className="flex-1 grid md:grid-cols-3 gap-4">
                {scores.map(({ label, score, icon: Icon, description }) => (
                  <div key={label} className="bg-secondary/50 rounded-xl p-5 text-center">
                    <Icon className={`h-6 w-6 mx-auto mb-2 ${getScoreColor(score || 0)}`} />
                    <div className={`font-display text-3xl font-bold ${getScoreColor(score || 0)}`}>
                      {score}
                    </div>
                    <div className="text-sm font-medium text-foreground">{label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Idea Details */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-card">
              <h2 className="font-display text-lg font-bold mb-3">Target Market</h2>
              <p className="text-muted-foreground">{idea.target_market}</p>
            </div>
            
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-card">
              <h2 className="font-display text-lg font-bold mb-3">Problem Solved</h2>
              <p className="text-muted-foreground">{idea.problem_solved}</p>
            </div>
          </div>
          
          {/* AI Analysis */}
          {idea.ai_analysis && (
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-card mb-8">
              <h2 className="font-display text-xl font-bold mb-4">AI Analysis</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground whitespace-pre-wrap">{idea.ai_analysis}</p>
              </div>
            </div>
          )}
          
          {/* Recommendations */}
          {idea.ai_recommendations && (
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-card mb-8">
              <h2 className="font-display text-xl font-bold mb-4">Next Steps</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground whitespace-pre-wrap">{idea.ai_recommendations}</p>
              </div>
            </div>
          )}
          
          {/* CTA */}
          <div className="bg-gradient-to-r from-green-500/20 to-green-500/10 border border-green-500/30 rounded-2xl p-8 text-center">
            <h2 className="font-display text-2xl font-bold mb-2">Ready to Build?</h2>
            <p className="text-muted-foreground mb-6">
              Book a consulting session to develop a comprehensive go-to-market strategy.
            </p>
            <Button variant="hero" size="lg" className="gap-2">
              <Calendar className="h-5 w-5" />
              Book Consulting Session
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IdeaResult;
