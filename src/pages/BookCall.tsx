import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Phone, Video, CheckCircle2, Clock, Users } from 'lucide-react';
import { toast } from 'sonner';

const BookCall = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    stage: '',
    callType: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success('Your booking request has been submitted! We will contact you within 24 hours.');
    setIsSubmitting(false);
    setFormData({ name: '', email: '', company: '', stage: '', callType: '', message: '' });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-gradient-hero" />
      <div className="fixed inset-0 grid-pattern opacity-50" />
      
      <Navbar />
      
      <main className="relative pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Book a <span className="text-primary">Consultation</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Schedule a free consultation to discuss how we can help transform your startup
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left Side - Benefits */}
            <div className="space-y-8">
              <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-8">
                <h2 className="font-display text-2xl font-bold mb-6">What You'll Get</h2>
                
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Expert Assessment</h3>
                      <p className="text-sm text-muted-foreground">Get insights from experienced startup consultants</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">30-Minute Session</h3>
                      <p className="text-sm text-muted-foreground">Focused discussion on your specific challenges</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Personalized Roadmap</h3>
                      <p className="text-sm text-muted-foreground">Receive actionable next steps for your startup</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call Types */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card/60 border border-border rounded-xl p-5 text-center hover:border-primary/50 transition-colors">
                  <Video className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-sm">Video Call</h3>
                  <p className="text-xs text-muted-foreground mt-1">Google Meet / Zoom</p>
                </div>
                <div className="bg-card/60 border border-border rounded-xl p-5 text-center hover:border-primary/50 transition-colors">
                  <Phone className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-sm">Phone Call</h3>
                  <p className="text-xs text-muted-foreground mt-1">Direct call</p>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold">Schedule Your Call</h2>
                  <p className="text-sm text-muted-foreground">Fill in the details below</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      required
                      className="bg-secondary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@startup.com"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      required
                      className="bg-secondary/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company Name *</Label>
                  <Input
                    id="company"
                    placeholder="Your Startup Inc."
                    value={formData.company}
                    onChange={(e) => handleChange('company', e.target.value)}
                    required
                    className="bg-secondary/50"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Startup Stage *</Label>
                    <Select value={formData.stage} onValueChange={(v) => handleChange('stage', v)} required>
                      <SelectTrigger className="bg-secondary/50">
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="idea">Idea Stage</SelectItem>
                        <SelectItem value="mvp">MVP / Pre-launch</SelectItem>
                        <SelectItem value="early">Early Traction</SelectItem>
                        <SelectItem value="growth">Growth Stage</SelectItem>
                        <SelectItem value="scale">Scaling</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Call Type *</Label>
                    <Select value={formData.callType} onValueChange={(v) => handleChange('callType', v)} required>
                      <SelectTrigger className="bg-secondary/50">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consultation">Free Consultation</SelectItem>
                        <SelectItem value="demo">Product Demo</SelectItem>
                        <SelectItem value="diagnostic">Discuss Diagnostic</SelectItem>
                        <SelectItem value="idea">Idea Validation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">What would you like to discuss? (Optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us about your startup and what challenges you're facing..."
                    value={formData.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    rows={4}
                    className="bg-secondary/50 resize-none"
                  />
                </div>

                <Button 
                  type="submit" 
                  variant="hero" 
                  size="lg" 
                  className="w-full gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Calendar className="h-5 w-5" />
                      Request Booking
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  We'll respond within 24 hours to confirm your booking
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BookCall;
