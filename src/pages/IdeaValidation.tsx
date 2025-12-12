import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Lightbulb, Loader2, ArrowRight, Target, Package, DollarSign, Megaphone, Settings, PiggyBank, Users, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';

const operationalAreas = [
  { key: 'market', label: 'Market', icon: Target, placeholder: 'Who is your target customer? Describe their demographics, behaviors, and pain points.' },
  { key: 'product', label: 'Product', icon: Package, placeholder: 'What solution are you planning to build? Describe the core features and value proposition.' },
  { key: 'businessModel', label: 'Business Model', icon: DollarSign, placeholder: 'How will you make money? Describe your revenue streams and pricing strategy.' },
  { key: 'marketing', label: 'Marketing', icon: Megaphone, placeholder: 'How will customers discover your solution? What channels will you use?' },
  { key: 'operations', label: 'Operations', icon: Settings, placeholder: 'What resources/tools do you need to start? Describe your operational requirements.' },
  { key: 'finance', label: 'Finance', icon: PiggyBank, placeholder: 'What is your estimated budget for the first 3 months? Include key expenses.' },
  { key: 'team', label: 'Team', icon: Users, placeholder: 'Who are the founders & what skills do they bring? Describe your team composition.' },
  { key: 'legal', label: 'Legal', icon: Scale, placeholder: 'Is your startup registered or in process? Describe your legal status and requirements.' },
];

const IdeaValidationPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaDescription, setIdeaDescription] = useState('');
  const [targetMarket, setTargetMarket] = useState('');
  const [problemSolved, setProblemSolved] = useState('');
  
  // Operational area responses
  const [areaResponses, setAreaResponses] = useState<Record<string, string>>({
    market: '',
    product: '',
    businessModel: '',
    marketing: '',
    operations: '',
    finance: '',
    team: '',
    legal: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleAreaChange = (key: string, value: string) => {
    setAreaResponses(prev => ({ ...prev, [key]: value }));
  };

  const isFormComplete = ideaTitle && ideaDescription && targetMarket && problemSolved && 
    Object.values(areaResponses).every(v => v.trim().length > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isFormComplete) return;
    
    setIsSubmitting(true);
    
    try {
      // Create the idea validation record
      const { data: idea, error: insertError } = await supabase
        .from('idea_validations')
        .insert({
          user_id: user.id,
          idea_title: ideaTitle,
          idea_description: ideaDescription,
          target_market: targetMarket,
          problem_solved: problemSolved,
          market_response: areaResponses.market,
          product_response: areaResponses.product,
          business_model_response: areaResponses.businessModel,
          marketing_response: areaResponses.marketing,
          operations_response: areaResponses.operations,
          finance_response: areaResponses.finance,
          team_response: areaResponses.team,
          legal_response: areaResponses.legal,
          status: 'analyzing',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast({
        title: 'Idea Submitted',
        description: 'Our AI is validating your idea. This may take a moment...',
      });

      // Call the AI analysis function
      const { error: fnError } = await supabase.functions.invoke('analyze-idea', {
        body: {
          ideaId: idea.id,
          ideaTitle,
          ideaDescription,
          targetMarket,
          problemSolved,
          areaResponses,
        },
      });

      if (fnError) {
        if (fnError.message.includes('429')) {
          toast({
            title: 'Rate Limited',
            description: 'Too many requests. Please try again in a moment.',
            variant: 'destructive',
          });
        } else if (fnError.message.includes('402')) {
          toast({
            title: 'Credits Required',
            description: 'Please add credits to continue using AI features.',
            variant: 'destructive',
          });
        } else {
          throw fnError;
        }
        return;
      }

      toast({
        title: 'Validation Complete!',
        description: 'Your idea validation report is ready.',
      });
      
      navigate(`/idea-result/${idea.id}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to validate idea',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-gradient-hero" />
      <div className="fixed inset-0 grid-pattern opacity-50" />
      
      <Navbar />
      
      <main className="relative pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-2xl">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          
          <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Lightbulb className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold">Validate Your Idea</h1>
                <p className="text-muted-foreground">Get AI-powered insights on your startup idea</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Core Idea Info */}
              <div className="space-y-4">
                <h2 className="font-semibold text-lg border-b border-border pb-2">Your Idea</h2>
                
                <div className="space-y-2">
                  <Label htmlFor="ideaTitle">Idea Title</Label>
                  <Input
                    id="ideaTitle"
                    placeholder="e.g., AI-Powered Personal Finance Coach"
                    value={ideaTitle}
                    onChange={(e) => setIdeaTitle(e.target.value)}
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground">{ideaTitle.length}/100 characters</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ideaDescription">Describe Your Idea</Label>
                  <Textarea
                    id="ideaDescription"
                    placeholder="Explain your idea in detail. What is it? How does it work? What makes it unique?"
                    value={ideaDescription}
                    onChange={(e) => setIdeaDescription(e.target.value)}
                    rows={4}
                    maxLength={1000}
                  />
                  <p className="text-xs text-muted-foreground">{ideaDescription.length}/1000 characters</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="targetMarket">Target Market</Label>
                  <Textarea
                    id="targetMarket"
                    placeholder="Who is your target customer? What are their demographics, behaviors, and pain points?"
                    value={targetMarket}
                    onChange={(e) => setTargetMarket(e.target.value)}
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">{targetMarket.length}/500 characters</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="problemSolved">Problem Solved</Label>
                  <Textarea
                    id="problemSolved"
                    placeholder="What problem does your idea solve? How are people currently solving this problem?"
                    value={problemSolved}
                    onChange={(e) => setProblemSolved(e.target.value)}
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">{problemSolved.length}/500 characters</p>
                </div>
              </div>
              
              {/* Operational Areas */}
              <div className="space-y-4">
                <h2 className="font-semibold text-lg border-b border-border pb-2">Idea Stage Details</h2>
                <p className="text-sm text-muted-foreground">Answer these questions to help our AI provide more accurate validation.</p>
                
                {operationalAreas.map((area) => {
                  const Icon = area.icon;
                  return (
                    <div key={area.key} className="space-y-2">
                      <Label htmlFor={area.key} className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary" />
                        {area.label}
                      </Label>
                      <Textarea
                        id={area.key}
                        placeholder={area.placeholder}
                        value={areaResponses[area.key]}
                        onChange={(e) => handleAreaChange(area.key, e.target.value)}
                        rows={2}
                        maxLength={500}
                      />
                      <p className="text-xs text-muted-foreground">{areaResponses[area.key].length}/500 characters</p>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex justify-between pt-6 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Cancel
                </Button>
                
                <Button
                  type="submit"
                  variant="hero"
                  disabled={!isFormComplete || isSubmitting}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      Validate Idea
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IdeaValidationPage;
