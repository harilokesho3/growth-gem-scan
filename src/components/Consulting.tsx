import { Button } from "@/components/ui/button";
import { ArrowRight, Video, Users, FileCheck, Calendar, CheckCircle2 } from "lucide-react";

const features = [
  "Deep-dive analysis by expert consultants",
  "Online or in-person sessions available",
  "Custom Startup Upgrade Plan",
  "5-7 day turnaround time",
  "Actionable roadmap and priorities",
  "Follow-up support included",
];

const Consulting = () => {
  return (
    <section id="consulting" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-glow opacity-20 blur-3xl" />
      
      <div className="container relative mx-auto px-4">
        <div className="rounded-3xl border border-border bg-gradient-to-br from-card via-card to-secondary/30 p-8 md:p-12 lg:p-16 overflow-hidden relative">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          
          <div className="grid gap-12 lg:grid-cols-2 items-center relative">
            {/* Content */}
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-primary">Expert Consulting</span>
              </div>

              <h2 className="mb-6 font-display text-3xl font-bold md:text-4xl">
                Turn Insights Into a{' '}
                <span className="text-gradient">Professional Plan</span>
              </h2>

              <p className="mb-8 text-lg text-muted-foreground">
                Our AI-powered reports are just the beginning. Book a session with our 
                experienced startup consultants who will analyze your data, collect 
                additional insights, and deliver a comprehensive Startup Upgrade Plan.
              </p>

              <div className="grid gap-3 sm:grid-cols-2 mb-8">
                {features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="hero" size="lg" className="group">
                  <Video className="mr-2 h-5 w-5" />
                  Book Online Session
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button variant="heroOutline" size="lg" className="group">
                  <Calendar className="mr-2 h-5 w-5" />
                  Schedule In-Person
                </Button>
              </div>
            </div>

            {/* Visual */}
            <div className="relative">
              <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 shadow-card">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <FileCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-display font-semibold">Startup Upgrade Plan</div>
                    <div className="text-sm text-muted-foreground">Professional Consulting Deliverable</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-lg bg-secondary/50 p-4">
                    <div className="text-xs text-muted-foreground mb-1">Executive Summary</div>
                    <div className="h-2 bg-muted rounded w-full mb-1" />
                    <div className="h-2 bg-muted rounded w-3/4" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-secondary/50 p-4">
                      <div className="text-xs text-muted-foreground mb-2">Priority Actions</div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-red-500" />
                          <div className="h-2 bg-muted rounded flex-1" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-yellow-500" />
                          <div className="h-2 bg-muted rounded flex-1" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          <div className="h-2 bg-muted rounded flex-1" />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg bg-secondary/50 p-4">
                      <div className="text-xs text-muted-foreground mb-2">90-Day Roadmap</div>
                      <div className="space-y-2">
                        <div className="h-2 bg-primary/30 rounded w-1/3" />
                        <div className="h-2 bg-primary/50 rounded w-2/3" />
                        <div className="h-2 bg-primary/70 rounded w-full" />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 text-center">
                    <div className="text-sm text-primary font-medium">Delivered in 5-7 Business Days</div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -bottom-4 -right-4 h-20 w-20 rounded-full bg-primary/30 blur-xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Consulting;
