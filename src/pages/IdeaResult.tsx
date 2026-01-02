import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Download, Calendar, Lightbulb, Target, Sparkles, Package, DollarSign, Megaphone, Settings, PiggyBank, Users, Scale, BarChart3, PieChart } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { generateIdeaPdf } from '@/lib/generatePdf';
import ScoreRadarChart from '@/components/results/ScoreRadarChart';
import ScoreBarChart from '@/components/results/ScoreBarChart';
import ScoreTable from '@/components/results/ScoreTable';
import OverallScoreCard from '@/components/results/OverallScoreCard';
import FeatureDetailCard from '@/components/results/FeatureDetailCard';
import AIAnalysisContent from '@/components/results/AIAnalysisContent';
import ActionFramework from '@/components/results/ActionFramework';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  market_response: string | null;
  product_response: string | null;
  business_model_response: string | null;
  marketing_response: string | null;
  operations_response: string | null;
  finance_response: string | null;
  team_response: string | null;
  legal_response: string | null;
  status: string;
  created_at: string;
}

const VALIDATION_SCORES = [
  { 
    key: 'feasibility_score', 
    label: 'Feasibility',
    icon: Target,
    description: 'How realistic is it to build and launch this idea?',
    details: {
      whatItMeans: 'Feasibility measures the practical ability to execute on your idea, including technical complexity, resource requirements, and implementation timeline.',
      keyFactors: ['Technical complexity', 'Resource availability', 'Time to market', 'Team capabilities'],
      recommendations: ['Break down into MVP features', 'Identify critical dependencies', 'Create realistic timeline']
    }
  },
  { 
    key: 'innovation_score', 
    label: 'Innovation',
    icon: Sparkles,
    description: 'How unique and differentiated is your solution?',
    details: {
      whatItMeans: 'Innovation reflects how novel your approach is compared to existing solutions, including unique features, new technology, or fresh business models.',
      keyFactors: ['Uniqueness of approach', 'Defensible advantages', 'Patent potential', 'First-mover opportunity'],
      recommendations: ['Document unique features', 'Research patent opportunities', 'Identify moat strategies']
    }
  },
  { 
    key: 'market_potential_score', 
    label: 'Market Potential',
    icon: Lightbulb,
    description: 'How large is the market opportunity?',
    details: {
      whatItMeans: 'Market potential evaluates the size, growth, and accessibility of your target market, including customer willingness to pay.',
      keyFactors: ['Total addressable market', 'Market growth rate', 'Customer willingness to pay', 'Market accessibility'],
      recommendations: ['Size your TAM/SAM/SOM', 'Validate pricing assumptions', 'Identify early adopter segments']
    }
  },
];

const AREA_RESPONSES = [
  { key: 'market_response', label: 'Market', icon: Target, description: 'Target customer analysis' },
  { key: 'product_response', label: 'Product', icon: Package, description: 'Solution being built' },
  { key: 'business_model_response', label: 'Business Model', icon: DollarSign, description: 'Revenue strategy' },
  { key: 'marketing_response', label: 'Marketing', icon: Megaphone, description: 'Customer discovery plan' },
  { key: 'operations_response', label: 'Operations', icon: Settings, description: 'Resources needed' },
  { key: 'finance_response', label: 'Finance', icon: PiggyBank, description: 'Budget planning' },
  { key: 'team_response', label: 'Team', icon: Users, description: 'Founder capabilities' },
  { key: 'legal_response', label: 'Legal', icon: Scale, description: 'Registration status' },
];

const IdeaResult = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [idea, setIdea] = useState<IdeaData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchIdea();
    }
  }, [id]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!idea) {
    return null;
  }

  const validationScores = VALIDATION_SCORES.map(({ key, label }) => ({
    label,
    score: (idea[key as keyof IdeaData] as number | null) || 0,
    fullMark: 100,
  })).filter(s => s.score > 0);

  // Create a synthetic score breakdown for the area responses (estimated from overall)
  const areaScoresForChart = AREA_RESPONSES.map((area, index) => {
    const response = idea[area.key as keyof IdeaData] as string | null;
    // Estimate a score based on response length and overall score
    const baseScore = idea.overall_score || 50;
    const variance = (index % 3 - 1) * 10;
    const estimatedScore = Math.max(20, Math.min(100, baseScore + variance + (response?.length ? Math.min(15, response.length / 30) : 0)));
    return {
      label: area.label,
      score: Math.round(estimatedScore),
      fullMark: 100,
    };
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-gradient-hero" />
      <div className="fixed inset-0 grid-pattern opacity-50" />
      
      <Navbar />
      
      <main className="relative pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </Link>
              <h1 className="font-display text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                {idea.idea_title}
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                {idea.idea_description.slice(0, 150)}...
              </p>
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
          <div className="mb-8 animate-fade-in">
            <OverallScoreCard 
              score={idea.overall_score || 0}
              title="Validation Score"
              subtitle={`AI-powered analysis of your startup idea: ${idea.idea_title}`}
            />
          </div>

          {/* Validation Scores Grid */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {VALIDATION_SCORES.map(({ key, label, icon: Icon, description }) => {
              const score = (idea[key as keyof IdeaData] as number | null) || 0;
              const getColor = (s: number) => {
                if (s >= 80) return 'text-[hsl(var(--score-excellent))]';
                if (s >= 60) return 'text-[hsl(var(--score-good))]';
                if (s >= 40) return 'text-[hsl(var(--score-fair))]';
                return 'text-[hsl(var(--score-poor))]';
              };
              const getBg = (s: number) => {
                if (s >= 80) return 'bg-[hsl(var(--score-excellent))]';
                if (s >= 60) return 'bg-[hsl(var(--score-good))]';
                if (s >= 40) return 'bg-[hsl(var(--score-fair))]';
                return 'bg-[hsl(var(--score-poor))]';
              };
              
              return (
                <div key={key} className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 text-center shadow-card hover:border-primary/50 transition-colors">
                  <div className={`h-14 w-14 mx-auto rounded-xl ${getBg(score)}/20 flex items-center justify-center mb-4`}>
                    <Icon className={`h-7 w-7 ${getColor(score)}`} />
                  </div>
                  <div className={`font-display text-4xl font-bold ${getColor(score)} mb-1`}>
                    {score}
                  </div>
                  <div className="font-semibold text-foreground">{label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{description}</div>
                  <div className="mt-4 h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getBg(score)} transition-all duration-500`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts Section */}
          <div className="mb-8">
            <Tabs defaultValue="radar" className="w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-bold">Area Coverage Analysis</h2>
                <TabsList className="bg-secondary/50">
                  <TabsTrigger value="radar" className="gap-2">
                    <PieChart className="h-4 w-4" />
                    Radar
                  </TabsTrigger>
                  <TabsTrigger value="bar" className="gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Bar Chart
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-card">
                <TabsContent value="radar" className="mt-0">
                  <ScoreRadarChart data={areaScoresForChart} />
                </TabsContent>
                <TabsContent value="bar" className="mt-0">
                  <ScoreBarChart data={areaScoresForChart} />
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Idea Details */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-[hsl(var(--chart-4))]/20 flex items-center justify-center">
                  <Target className="h-5 w-5 text-[hsl(var(--chart-4))]" />
                </div>
                <h2 className="font-display text-lg font-bold">Target Market</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">{idea.target_market}</p>
            </div>
            
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-[hsl(var(--chart-5))]/20 flex items-center justify-center">
                  <Lightbulb className="h-5 w-5 text-[hsl(var(--chart-5))]" />
                </div>
                <h2 className="font-display text-lg font-bold">Problem Solved</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">{idea.problem_solved}</p>
            </div>
          </div>

          {/* Validation Score Details */}
          <div className="mb-8">
            <h2 className="font-display text-xl font-bold mb-4">Validation Breakdown</h2>
            <p className="text-muted-foreground mb-6">Click on each score to understand what it means and get specific recommendations.</p>
            
            <div className="space-y-4">
              {VALIDATION_SCORES.map((item) => {
                const score = (idea[item.key as keyof IdeaData] as number | null) || 0;
                return (
                  <FeatureDetailCard
                    key={item.key}
                    title={item.label}
                    score={score}
                    description={item.description}
                    icon={item.icon}
                    details={item.details}
                  />
                );
              })}
            </div>
          </div>

          {/* Your Responses Section */}
          <div className="mb-8">
            <h2 className="font-display text-xl font-bold mb-4">Your Idea Stage Responses</h2>
            <p className="text-muted-foreground mb-6">Here's what you shared about each operational area.</p>
            
            <div className="grid md:grid-cols-2 gap-4">
              {AREA_RESPONSES.map((area) => {
                const response = idea[area.key as keyof IdeaData] as string | null;
                const Icon = area.icon;
                
                if (!response) return null;
                
                return (
                  <div key={area.key} className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-5 shadow-card hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{area.label}</h3>
                        <p className="text-xs text-muted-foreground">{area.description}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{response}</p>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* AI Analysis Section - Enhanced */}
          {idea.ai_analysis && (
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-card mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                  <span className="text-2xl">🤖</span>
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold">AI-Powered Analysis</h2>
                  <p className="text-sm text-muted-foreground">Deep insights generated from your idea validation data</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-[hsl(var(--chart-1))]/10 to-transparent border border-[hsl(var(--chart-1))]/20 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-[hsl(var(--chart-1))]">8</div>
                  <div className="text-xs text-muted-foreground">Areas Analyzed</div>
                </div>
                <div className="bg-gradient-to-br from-[hsl(var(--chart-2))]/10 to-transparent border border-[hsl(var(--chart-2))]/20 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-[hsl(var(--chart-2))]">{idea.overall_score || 0}%</div>
                  <div className="text-xs text-muted-foreground">Validation Score</div>
                </div>
                <div className="bg-gradient-to-br from-[hsl(var(--chart-3))]/10 to-transparent border border-[hsl(var(--chart-3))]/20 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-[hsl(var(--chart-3))]">{validationScores.filter(s => s.score >= 60).length}/3</div>
                  <div className="text-xs text-muted-foreground">Strong Scores</div>
                </div>
              </div>
              
              <div className="bg-secondary/30 rounded-xl p-6 border border-border/50">
                <AIAnalysisContent content={idea.ai_analysis} />
              </div>
            </div>
          )}

          {/* Action Framework Section */}
          <div className="mb-8">
            <ActionFramework recommendations={idea.ai_recommendations} />
          </div>
          
          {/* Book a Call CTA - Unlocks Full Recommendations */}
          <div className="bg-gradient-to-r from-[hsl(var(--score-excellent))]/20 via-[hsl(var(--score-excellent))]/15 to-[hsl(var(--score-excellent))]/10 border border-[hsl(var(--score-excellent))]/30 rounded-2xl p-8 text-center mb-8">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-[hsl(var(--score-excellent))]/20 mb-4">
              <span className="text-3xl">🚀</span>
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">Ready to Launch Your Idea?</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Book a consulting session to get a <strong className="text-foreground">complete go-to-market strategy</strong> and actionable roadmap. Our experts will help you move from idea to execution.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/book-call">
                <Button variant="hero" size="lg" className="gap-2">
                  <Calendar className="h-5 w-5" />
                  Book Consulting Session
                </Button>
              </Link>
              <span className="text-sm text-muted-foreground">MVP planning • Launch strategy • Investor readiness</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IdeaResult;
