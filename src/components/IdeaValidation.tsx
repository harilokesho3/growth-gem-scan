import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, TrendingUp, Target, Sparkles } from "lucide-react";

const metrics = [
  {
    icon: Target,
    label: "Feasibility",
    description: "Technical and resource viability",
    score: 85,
  },
  {
    icon: Sparkles,
    label: "Innovation",
    description: "Uniqueness and differentiation",
    score: 72,
  },
  {
    icon: TrendingUp,
    label: "Market Potential",
    description: "Growth opportunity and demand",
    score: 91,
  },
];

const IdeaValidation = () => {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-glow opacity-20 blur-3xl" />
      
      <div className="container relative mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Content */}
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-primary">Idea Validation Engine</span>
            </div>
            
            <h2 className="mb-6 font-display text-3xl font-bold md:text-4xl lg:text-5xl">
              Validate Before You{' '}
              <span className="text-gradient">Invest</span>
            </h2>
            
            <p className="mb-8 text-lg text-muted-foreground">
              Got a groundbreaking idea? Our AI-powered Idea Validation Engine 
              evaluates your concept across three critical dimensions, giving you 
              the confidence to move forward—or pivot early.
            </p>

            <ul className="mb-8 space-y-3">
              <li className="flex items-center gap-3 text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-primary" />
                AI-powered scoring in minutes
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-primary" />
                Detailed breakdown and recommendations
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-primary" />
                Downloadable PDF report
              </li>
            </ul>

            <Button variant="hero" size="lg" className="group">
              Validate Your Idea
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          {/* Visualization */}
          <div className="relative">
            <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-8 shadow-card">
              <div className="mb-6 text-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  Sample Analysis Complete
                </div>
              </div>

              <div className="space-y-6">
                {metrics.map((metric, index) => (
                  <div key={metric.label} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                          <metric.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{metric.label}</div>
                          <div className="text-xs text-muted-foreground">{metric.description}</div>
                        </div>
                      </div>
                      <div className="font-display text-2xl font-bold text-primary">{metric.score}</div>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-primary to-orange-400 transition-all duration-1000"
                        style={{ width: `${metric.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex items-center justify-between rounded-lg bg-secondary/50 p-4">
                <span className="text-sm text-muted-foreground">Overall Score</span>
                <span className="font-display text-3xl font-bold text-gradient">82.7</span>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />
            <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-orange-500/20 blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default IdeaValidation;
