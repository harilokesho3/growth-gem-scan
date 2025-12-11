import { Button } from "@/components/ui/button";
import { ArrowRight, Scan, Lightbulb, Sparkles } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen overflow-hidden pt-16">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute inset-0 grid-pattern opacity-50" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-glow opacity-30 blur-3xl" />
      
      <div className="container relative mx-auto px-4 py-24 md:py-32 lg:py-40">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm backdrop-blur-sm animate-fade-in">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">AI-Powered Startup Intelligence</span>
          </div>

          {/* Main headline */}
          <h1 className="mb-6 font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Transform Your Startup with{' '}
            <span className="text-gradient">Data-Driven Insights</span>
          </h1>

          {/* Subheadline */}
          <p className="mb-10 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Diagnose your startup across 8 critical areas or validate your next big idea. 
            Get AI-powered reports and expert consulting to accelerate your growth.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Button variant="hero" size="xl" className="w-full sm:w-auto group">
              <Scan className="mr-2 h-5 w-5" />
              Run Diagnostic
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="heroOutline" size="xl" className="w-full sm:w-auto group">
              <Lightbulb className="mr-2 h-5 w-5" />
              Validate Idea
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="text-center">
              <div className="font-display text-3xl font-bold text-foreground">8</div>
              <div className="text-sm text-muted-foreground">Areas Analyzed</div>
            </div>
            <div className="text-center">
              <div className="font-display text-3xl font-bold text-foreground">500+</div>
              <div className="text-sm text-muted-foreground">Startups Saved</div>
            </div>
            <div className="text-center">
              <div className="font-display text-3xl font-bold text-foreground">5-7</div>
              <div className="text-sm text-muted-foreground">Days to Plan</div>
            </div>
          </div>
        </div>

        {/* Floating cards decoration */}
        <div className="absolute bottom-20 left-10 hidden lg:block animate-float">
          <div className="rounded-xl bg-card/80 backdrop-blur-sm border border-border p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Scan className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium">Diagnostic Complete</div>
                <div className="text-xs text-muted-foreground">Score: 78/100</div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-40 right-10 hidden lg:block animate-float" style={{ animationDelay: '1s' }}>
          <div className="rounded-xl bg-card/80 backdrop-blur-sm border border-border p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Lightbulb className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <div className="text-sm font-medium">Idea Validated</div>
                <div className="text-xs text-muted-foreground">High Potential</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
