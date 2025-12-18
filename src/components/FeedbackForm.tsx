import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Star, Send, MessageSquare } from 'lucide-react';

const FeedbackForm = () => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    if (!message.trim()) {
      toast.error('Please enter your feedback');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          rating,
          message: message.trim(),
          email: email.trim() || null,
        });

      if (error) throw error;

      toast.success('Thank you for your feedback!');
      setRating(0);
      setMessage('');
      setEmail('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 px-4 md:px-8 lg:px-16 relative">
      <div className="w-full">
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-8 md:p-12 shadow-card">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/20 shrink-0">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-xl md:text-2xl font-bold">Share Your Feedback</h2>
              <p className="text-muted-foreground text-sm">Help us improve Startup Saver</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
            {/* Star Rating */}
            <div className="space-y-2">
              <Label className="text-foreground">How would you rate your experience?</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-7 w-7 transition-colors ${
                        star <= (hoveredRating || rating)
                          ? 'fill-primary text-primary'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="feedback-message" className="text-foreground">Your Feedback *</Label>
              <Textarea
                id="feedback-message"
                placeholder="Tell us what you think..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[80px] bg-secondary/50 border-border focus:border-primary"
                required
              />
            </div>

            {/* Email (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="feedback-email" className="text-foreground">
                Email <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              <Input
                id="feedback-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary/50 border-border focus:border-primary"
              />
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full gap-2 h-[42px]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>Submitting...</>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default FeedbackForm;
