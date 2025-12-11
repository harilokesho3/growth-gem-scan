import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Scan, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';

const DIAGNOSTIC_AREAS = [
  { id: 'market', name: 'Market', description: 'Market size, competition, and positioning' },
  { id: 'product', name: 'Product', description: 'Product-market fit and development' },
  { id: 'businessModel', name: 'Business Model', description: 'Revenue streams and unit economics' },
  { id: 'marketing', name: 'Marketing', description: 'Customer acquisition and branding' },
  { id: 'operations', name: 'Operations', description: 'Processes and scalability' },
  { id: 'finance', name: 'Finance', description: 'Funding, runway, and financial health' },
  { id: 'team', name: 'Team', description: 'Leadership, culture, and talent' },
  { id: 'legal', name: 'Legal', description: 'Compliance, IP, and contracts' },
];

const QUESTIONS = {
  market: [
    'How well do you understand your target customer?',
    'How large is your total addressable market?',
    'How strong is your competitive advantage?',
  ],
  product: [
    'How validated is your product-market fit?',
    'How mature is your product development process?',
    'How strong is your product roadmap?',
  ],
  businessModel: [
    'How clear are your revenue streams?',
    'How healthy are your unit economics?',
    'How scalable is your business model?',
  ],
  marketing: [
    'How effective is your customer acquisition?',
    'How strong is your brand awareness?',
    'How optimized are your marketing channels?',
  ],
  operations: [
    'How efficient are your core processes?',
    'How scalable is your infrastructure?',
    'How strong are your vendor relationships?',
  ],
  finance: [
    'How healthy is your cash flow?',
    'How long is your runway?',
    'How well do you track key metrics?',
  ],
  team: [
    'How strong is your founding team?',
    'How effective is your hiring process?',
    'How healthy is your company culture?',
  ],
  legal: [
    'How protected is your intellectual property?',
    'How compliant are you with regulations?',
    'How well-structured are your contracts?',
  ],
};

const RATING_OPTIONS = ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent'];

const Diagnostic = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState(0); // 0 = company info, 1-8 = diagnostic areas
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Company info
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [stage, setStage] = useState('');
  const [teamSize, setTeamSize] = useState('');
  
  // Diagnostic responses
  const [responses, setResponses] = useState<Record<string, Record<string, string>>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleResponseChange = (areaId: string, questionIndex: number, value: string) => {
    setResponses(prev => ({
      ...prev,
      [areaId]: {
        ...(prev[areaId] || {}),
        [`q${questionIndex}`]: value,
      },
    }));
  };

  const isStepComplete = () => {
    if (step === 0) {
      return companyName && industry && stage && teamSize;
    }
    const areaId = DIAGNOSTIC_AREAS[step - 1].id;
    const areaResponses = responses[areaId] || {};
    return Object.keys(areaResponses).length === 3;
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Create the diagnostic record
      const { data: diagnostic, error: insertError } = await supabase
        .from('diagnostics')
        .insert({
          user_id: user.id,
          company_name: companyName,
          industry,
          stage,
          team_size: teamSize,
          status: 'analyzing',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast({
        title: 'Diagnostic Submitted',
        description: 'Our AI is analyzing your startup. This may take a moment...',
      });

      // Call the AI analysis function
      const { error: fnError } = await supabase.functions.invoke('analyze-diagnostic', {
        body: {
          diagnosticId: diagnostic.id,
          companyName,
          industry,
          stage,
          teamSize,
          responses,
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
        title: 'Analysis Complete!',
        description: 'Your diagnostic report is ready.',
      });
      
      navigate(`/diagnostic-result/${diagnostic.id}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit diagnostic',
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
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Step {step + 1} of 9</span>
              <span>{Math.round(((step + 1) / 9) * 100)}% Complete</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${((step + 1) / 9) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-card">
            {step === 0 ? (
              // Company Info Step
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Scan className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="font-display text-2xl font-bold">Startup Information</h1>
                    <p className="text-muted-foreground">Tell us about your startup</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      placeholder="Acme Inc."
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select value={industry} onValueChange={setIndustry}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="saas">SaaS</SelectItem>
                        <SelectItem value="fintech">Fintech</SelectItem>
                        <SelectItem value="healthtech">Healthtech</SelectItem>
                        <SelectItem value="ecommerce">E-commerce</SelectItem>
                        <SelectItem value="edtech">Edtech</SelectItem>
                        <SelectItem value="marketplace">Marketplace</SelectItem>
                        <SelectItem value="ai-ml">AI/ML</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stage">Stage</Label>
                    <Select value={stage} onValueChange={setStage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="idea">Idea Stage</SelectItem>
                        <SelectItem value="mvp">MVP</SelectItem>
                        <SelectItem value="pre-seed">Pre-Seed</SelectItem>
                        <SelectItem value="seed">Seed</SelectItem>
                        <SelectItem value="series-a">Series A</SelectItem>
                        <SelectItem value="series-b+">Series B+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="teamSize">Team Size</Label>
                    <Select value={teamSize} onValueChange={setTeamSize}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Solo Founder</SelectItem>
                        <SelectItem value="2-5">2-5 People</SelectItem>
                        <SelectItem value="6-10">6-10 People</SelectItem>
                        <SelectItem value="11-25">11-25 People</SelectItem>
                        <SelectItem value="26-50">26-50 People</SelectItem>
                        <SelectItem value="50+">50+ People</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            ) : (
              // Diagnostic Area Steps
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <span className="font-display font-bold text-primary">{step}</span>
                  </div>
                  <div>
                    <h1 className="font-display text-2xl font-bold">
                      {DIAGNOSTIC_AREAS[step - 1].name}
                    </h1>
                    <p className="text-muted-foreground">
                      {DIAGNOSTIC_AREAS[step - 1].description}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {QUESTIONS[DIAGNOSTIC_AREAS[step - 1].id as keyof typeof QUESTIONS].map((question, idx) => (
                    <div key={idx} className="space-y-3">
                      <Label className="text-base">{question}</Label>
                      <div className="flex flex-wrap gap-2">
                        {RATING_OPTIONS.map((option) => {
                          const areaId = DIAGNOSTIC_AREAS[step - 1].id;
                          const isSelected = responses[areaId]?.[`q${idx}`] === option;
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => handleResponseChange(areaId, idx, option)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                isSelected
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-secondary text-foreground hover:bg-secondary/80'
                              }`}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            
            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={() => step > 0 ? setStep(step - 1) : navigate('/')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {step === 0 ? 'Cancel' : 'Back'}
              </Button>
              
              {step < 8 ? (
                <Button
                  variant="hero"
                  onClick={() => setStep(step + 1)}
                  disabled={!isStepComplete()}
                  className="gap-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="hero"
                  onClick={handleSubmit}
                  disabled={!isStepComplete() || isSubmitting}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Submit Diagnostic
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Diagnostic;
