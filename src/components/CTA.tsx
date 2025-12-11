import { Button } from "@/components/ui/button";
import { ArrowRight, Rocket } from "lucide-react";

const CTA = () => {
  return (
    <section className="relative py-24 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-t from-secondary/50 to-transparent" />
      
      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 animate-pulse-glow">
            <Rocket className="h-8 w-8 text-primary" />
          </div>

          <h2 className="mb-6 font-display text-3xl font-bold md:text-4xl lg:text-5xl">
            Ready to{' '}
            <span className="text-gradient">Save Your Startup?</span>
          </h2>

          <p className="mb-10 text-lg text-muted-foreground">
            Join 500+ founders who've transformed their startups with data-driven 
            insights and expert guidance. Start your diagnostic today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="xl" className="w-full sm:w-auto group">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="heroOutline" size="xl" className="w-full sm:w-auto">
              Schedule a Demo
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            No credit card required • Free diagnostic report included
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;
