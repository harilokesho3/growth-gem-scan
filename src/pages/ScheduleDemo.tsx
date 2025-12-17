import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { Monitor, CheckCircle2, Sparkles, Clock, Users } from 'lucide-react';

const ScheduleDemo = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success('Demo request received! We\'ll contact you within 24 hours.');
    setFormData({ name: '', email: '', company: '', message: '' });
    setIsSubmitting(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const benefits = [
    {
      icon: Sparkles,
      title: 'See AI in Action',
      description: 'Watch how our AI analyzes startups in real-time',
    },
    {
      icon: Clock,
      title: '15-Minute Overview',
      description: 'Quick walkthrough of all platform features',
    },
    {
      icon: Users,
      title: 'Q&A Session',
      description: 'Get answers to all your questions',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-gradient-hero" />
      <div className="fixed inset-0 grid-pattern opacity-50" />
      
      <Navbar />
      
      <main className="relative pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/20 mb-6">
              <Monitor className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Schedule a Demo
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              See Startup Saver in action. Get a personalized walkthrough of our diagnostic and idea validation tools.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Benefits */}
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold">What to Expect</h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-5 flex items-start gap-4 shadow-card"
                  >
                    <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-secondary/50 rounded-xl p-6 border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-foreground">No commitment required</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Our demos are free with no strings attached. Learn about the platform and decide if it's right for your startup.
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-card">
              <h2 className="font-display text-xl font-bold mb-6">Request Your Demo</h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="bg-secondary/50 border-border focus:border-primary"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@company.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="bg-secondary/50 border-border focus:border-primary"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company" className="text-foreground">Company Name</Label>
                  <Input
                    id="company"
                    placeholder="Your Startup Inc."
                    value={formData.company}
                    onChange={(e) => handleChange('company', e.target.value)}
                    className="bg-secondary/50 border-border focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-foreground">
                    What would you like to see? <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="I'm interested in learning about..."
                    value={formData.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    className="bg-secondary/50 border-border focus:border-primary min-h-[100px]"
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
                      <Monitor className="h-5 w-5" />
                      Request Demo
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ScheduleDemo;
