import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Download, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { generateDiagnosticPdf } from '@/lib/generatePdf';
interface DiagnosticData {
  id: string;
  company_name: string;
  industry: string;
  stage: string;
  team_size: string;
  market_score: number | null;
  product_score: number | null;
  business_model_score: number | null;
  marketing_score: number | null;
  operations_score: number | null;
  finance_score: number | null;
  team_score: number | null;
  legal_score: number | null;
  overall_score: number | null;
  ai_analysis: string | null;
  ai_recommendations: string | null;
  status: string;
  created_at: string;
}

const SCORE_LABELS = [
  { key: 'market_score', label: 'Market' },
  { key: 'product_score', label: 'Product' },
  { key: 'business_model_score', label: 'Business Model' },
  { key: 'marketing_score', label: 'Marketing' },
  { key: 'operations_score', label: 'Operations' },
  { key: 'finance_score', label: 'Finance' },
  { key: 'team_score', label: 'Team' },
  { key: 'legal_score', label: 'Legal' },
];

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

const DiagnosticResult = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [diagnostic, setDiagnostic] = useState<DiagnosticData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user && id) {
      fetchDiagnostic();
    }
  }, [user, authLoading, id, navigate]);

  const fetchDiagnostic = async () => {
    const { data, error } = await supabase
      .from('diagnostics')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      navigate('/');
      return;
    }

    setDiagnostic(data);
    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!diagnostic) {
    return null;
  }

  const scores = SCORE_LABELS.map(({ key, label }) => ({
    label,
    score: diagnostic[key as keyof DiagnosticData] as number | null,
  })).filter(s => s.score !== null);

  const sortedScores = [...scores].sort((a, b) => (b.score || 0) - (a.score || 0));
  const topStrengths = sortedScores.slice(0, 3);
  const topWeaknesses = sortedScores.slice(-3).reverse();

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
              <h1 className="font-display text-3xl font-bold">{diagnostic.company_name}</h1>
              <p className="text-muted-foreground">
                {diagnostic.industry} • {diagnostic.stage} • {diagnostic.team_size}
              </p>
            </div>
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => generateDiagnosticPdf(diagnostic)}
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
                    <div className={`font-display text-5xl font-bold ${getScoreColor(diagnostic.overall_score || 0)}`}>
                      {diagnostic.overall_score || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Overall Score</div>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                {scores.map(({ label, score }) => (
                  <div key={label} className="bg-secondary/50 rounded-xl p-4 text-center">
                    <div className={`font-display text-2xl font-bold ${getScoreColor(score || 0)}`}>
                      {score}
                    </div>
                    <div className="text-xs text-muted-foreground">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Strengths & Weaknesses */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <h2 className="font-display text-lg font-bold">Top Strengths</h2>
              </div>
              <div className="space-y-3">
                {topStrengths.map(({ label, score }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-foreground">{label}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getScoreBg(score || 0)}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      <span className={`font-medium ${getScoreColor(score || 0)}`}>{score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="h-5 w-5 text-red-500" />
                <h2 className="font-display text-lg font-bold">Areas to Improve</h2>
              </div>
              <div className="space-y-3">
                {topWeaknesses.map(({ label, score }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-foreground">{label}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getScoreBg(score || 0)}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      <span className={`font-medium ${getScoreColor(score || 0)}`}>{score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* AI Analysis */}
          {diagnostic.ai_analysis && (
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-card mb-8">
              <h2 className="font-display text-xl font-bold mb-4">AI Analysis</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground whitespace-pre-wrap">{diagnostic.ai_analysis}</p>
              </div>
            </div>
          )}
          
          {/* Recommendations */}
          {diagnostic.ai_recommendations && (
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-card mb-8">
              <h2 className="font-display text-xl font-bold mb-4">Recommendations</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground whitespace-pre-wrap">{diagnostic.ai_recommendations}</p>
              </div>
            </div>
          )}
          
          {/* CTA */}
          <div className="bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 rounded-2xl p-8 text-center">
            <h2 className="font-display text-2xl font-bold mb-2">Want Expert Guidance?</h2>
            <p className="text-muted-foreground mb-6">
              Book a deep-dive consulting session and get a professional Startup Upgrade Plan.
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

export default DiagnosticResult;
