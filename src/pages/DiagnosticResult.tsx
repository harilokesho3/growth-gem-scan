import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Download, Calendar, Target, Package, DollarSign, Megaphone, Settings, PiggyBank, Users, Scale, BarChart3, PieChart } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { generateDiagnosticPdf } from '@/lib/generatePdf';
import ScoreRadarChart from '@/components/results/ScoreRadarChart';
import ScoreBarChart from '@/components/results/ScoreBarChart';
import ScoreTable from '@/components/results/ScoreTable';
import OverallScoreCard from '@/components/results/OverallScoreCard';
import FeatureDetailCard from '@/components/results/FeatureDetailCard';
import AIAnalysisContent from '@/components/results/AIAnalysisContent';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

const AREA_CONFIG = [
  { 
    key: 'market_score', 
    label: 'Market',
    icon: Target,
    description: 'Market size, competition, and positioning analysis',
    details: {
      whatItMeans: 'This score reflects how well you understand your market, including customer needs, competitive landscape, and market timing.',
      keyFactors: ['Target customer clarity', 'Market size understanding', 'Competitive advantage', 'Market timing'],
      recommendations: ['Conduct customer interviews', 'Analyze competitor positioning', 'Validate market size assumptions']
    }
  },
  { 
    key: 'product_score', 
    label: 'Product',
    icon: Package,
    description: 'Product-market fit and development maturity',
    details: {
      whatItMeans: 'Measures how well your product solves customer problems and the maturity of your development process.',
      keyFactors: ['Product-market fit validation', 'Development process maturity', 'Product roadmap clarity', 'User feedback integration'],
      recommendations: ['Gather more user feedback', 'Prioritize core features', 'Establish clear product metrics']
    }
  },
  { 
    key: 'business_model_score', 
    label: 'Business Model',
    icon: DollarSign,
    description: 'Revenue streams and unit economics health',
    details: {
      whatItMeans: 'Evaluates the clarity and viability of your revenue model, including pricing strategy and unit economics.',
      keyFactors: ['Revenue stream clarity', 'Unit economics health', 'Scalability potential', 'Pricing strategy'],
      recommendations: ['Calculate customer acquisition cost', 'Define lifetime value', 'Test pricing models']
    }
  },
  { 
    key: 'marketing_score', 
    label: 'Marketing',
    icon: Megaphone,
    description: 'Customer acquisition and brand effectiveness',
    details: {
      whatItMeans: 'Reflects your ability to reach and convert customers through various marketing channels.',
      keyFactors: ['Acquisition channel effectiveness', 'Brand awareness', 'Content strategy', 'Growth metrics'],
      recommendations: ['Identify top-performing channels', 'Build consistent brand messaging', 'Track conversion funnels']
    }
  },
  { 
    key: 'operations_score', 
    label: 'Operations',
    icon: Settings,
    description: 'Process efficiency and infrastructure scalability',
    details: {
      whatItMeans: 'Measures the efficiency of your internal processes and readiness to scale operations.',
      keyFactors: ['Process efficiency', 'Infrastructure scalability', 'Vendor relationships', 'Operational metrics'],
      recommendations: ['Document core processes', 'Identify automation opportunities', 'Build scalable infrastructure']
    }
  },
  { 
    key: 'finance_score', 
    label: 'Finance',
    icon: PiggyBank,
    description: 'Financial health and runway management',
    details: {
      whatItMeans: 'Evaluates your financial position, including cash flow management and runway visibility.',
      keyFactors: ['Cash flow health', 'Runway length', 'Financial tracking', 'Funding strategy'],
      recommendations: ['Extend runway with efficiency', 'Implement financial dashboards', 'Prepare fundraising materials']
    }
  },
  { 
    key: 'team_score', 
    label: 'Team',
    icon: Users,
    description: 'Leadership strength and team culture',
    details: {
      whatItMeans: 'Reflects the strength of your founding team, hiring practices, and company culture.',
      keyFactors: ['Founding team strength', 'Hiring process effectiveness', 'Company culture', 'Skill coverage'],
      recommendations: ['Identify skill gaps', 'Develop hiring pipeline', 'Foster team communication']
    }
  },
  { 
    key: 'legal_score', 
    label: 'Legal',
    icon: Scale,
    description: 'Compliance and intellectual property protection',
    details: {
      whatItMeans: 'Measures your legal readiness, including IP protection, compliance, and contract management.',
      keyFactors: ['IP protection', 'Regulatory compliance', 'Contract structure', 'Legal risk management'],
      recommendations: ['Audit IP protection', 'Review compliance requirements', 'Standardize contract templates']
    }
  },
];

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

  const scores = AREA_CONFIG.map(({ key, label }) => ({
    label,
    score: (diagnostic[key as keyof DiagnosticData] as number | null) || 0,
    fullMark: 100,
  })).filter(s => s.score > 0);

  const chartData = scores.map(s => ({
    label: s.label,
    score: s.score,
    fullMark: 100,
  }));

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
                {diagnostic.company_name}
              </h1>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
                  {diagnostic.industry}
                </span>
                <span className="px-3 py-1 bg-secondary text-foreground rounded-full text-sm font-medium">
                  {diagnostic.stage}
                </span>
                <span className="px-3 py-1 bg-secondary text-foreground rounded-full text-sm font-medium">
                  {diagnostic.team_size} team
                </span>
              </div>
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
          <div className="mb-8 animate-fade-in">
            <OverallScoreCard 
              score={diagnostic.overall_score || 0}
              title="Diagnostic Score"
              subtitle={`Based on analysis of 8 operational areas for ${diagnostic.company_name}`}
            />
          </div>

          {/* Charts Section */}
          <div className="mb-8">
            <Tabs defaultValue="radar" className="w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-bold">Score Visualization</h2>
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
                  <ScoreRadarChart data={chartData} />
                </TabsContent>
                <TabsContent value="bar" className="mt-0">
                  <ScoreBarChart data={chartData} />
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Score Table */}
          <div className="mb-8">
            <h2 className="font-display text-xl font-bold mb-4">Detailed Scores</h2>
            <ScoreTable scores={scores} />
          </div>
          
          {/* Feature Detail Cards */}
          <div className="mb-8">
            <h2 className="font-display text-xl font-bold mb-4">Area Breakdown</h2>
            <p className="text-muted-foreground mb-6">Click on each area to learn more about what it means and get specific recommendations.</p>
            
            <div className="space-y-4">
              {AREA_CONFIG.map((area) => {
                const score = (diagnostic[area.key as keyof DiagnosticData] as number | null) || 0;
                return (
                  <FeatureDetailCard
                    key={area.key}
                    title={area.label}
                    score={score}
                    description={area.description}
                    icon={area.icon}
                    details={area.details}
                  />
                );
              })}
            </div>
          </div>
          
          {/* AI Analysis Section - Enhanced */}
          {diagnostic.ai_analysis && (
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-card mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                  <span className="text-2xl">🤖</span>
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold">AI-Powered Analysis</h2>
                  <p className="text-sm text-muted-foreground">Deep insights generated from your diagnostic data</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-[hsl(var(--chart-1))]/10 to-transparent border border-[hsl(var(--chart-1))]/20 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-[hsl(var(--chart-1))]">8</div>
                  <div className="text-xs text-muted-foreground">Areas Analyzed</div>
                </div>
                <div className="bg-gradient-to-br from-[hsl(var(--chart-2))]/10 to-transparent border border-[hsl(var(--chart-2))]/20 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-[hsl(var(--chart-2))]">{diagnostic.overall_score || 0}%</div>
                  <div className="text-xs text-muted-foreground">Overall Score</div>
                </div>
                <div className="bg-gradient-to-br from-[hsl(var(--chart-3))]/10 to-transparent border border-[hsl(var(--chart-3))]/20 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-[hsl(var(--chart-3))]">{scores.filter(s => s.score >= 60).length}</div>
                  <div className="text-xs text-muted-foreground">Strong Areas</div>
                </div>
              </div>
              
              <div className="bg-secondary/30 rounded-xl p-6 border border-border/50">
                <AIAnalysisContent content={diagnostic.ai_analysis} />
              </div>
            </div>
          )}
          
          {/* Book a Call CTA - Unlocks Full Recommendations */}
          <div className="bg-gradient-to-r from-primary/20 via-primary/15 to-primary/10 border border-primary/30 rounded-2xl p-8 text-center mb-8">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/20 mb-4">
              <span className="text-3xl">🔓</span>
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">Unlock Your Full Action Plan</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Get personalized recommendations and a professional <strong className="text-foreground">Startup Upgrade Plan</strong> tailored to your specific challenges. Our experts will deliver it within 5–7 days after your consultation.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="hero" size="lg" className="gap-2">
                <Calendar className="h-5 w-5" />
                Book Consulting Session
              </Button>
              <span className="text-sm text-muted-foreground">Detailed roadmap • Priority fixes • Growth strategy</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DiagnosticResult;
