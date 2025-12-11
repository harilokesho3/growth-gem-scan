import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Lightbulb, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';

const IdeaValidationPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaDescription, setIdeaDescription] = useState('');
  const [targetMarket, setTargetMarket] = useState('');
  const [problemSolved, setProblemSolved] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const isFormComplete = ideaTitle && ideaDescription && targetMarket && problemSolved;

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
