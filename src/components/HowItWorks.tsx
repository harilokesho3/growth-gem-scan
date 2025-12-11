import { FileText, MessageSquare, Rocket, Download } from "lucide-react";

const steps = [
  {
    icon: FileText,
    step: "01",
    title: "Run Your Assessment",
    description: "Complete our diagnostic questionnaire or describe your startup idea. Takes just 10-15 minutes.",
  },
  {
    icon: Download,
    step: "02",
    title: "Get Your Report",
    description: "Receive AI-powered insights with scores, analysis, and actionable recommendations as a downloadable PDF.",
  },
  {
    icon: MessageSquare,
    step: "03",
    title: "Book Consulting",
    description: "Schedule an online or in-person deep-dive session with our expert consultants.",
  },
  {
    icon: Rocket,
    step: "04",
    title: "Receive Your Plan",
    description: "Get a professional Startup Upgrade Plan within 5-7 days, tailored to your specific needs.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="relative py-24 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/20 to-transparent" />
      
      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="mb-4 font-display text-3xl font-bold md:text-4xl lg:text-5xl">
            From Insights to{' '}
            <span className="text-gradient">Action Plan</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            A streamlined process that takes you from automated diagnostics 
            to a professional, consultant-delivered upgrade plan.
          </p>
        </div>

        <div className="relative">
          {/* Connection line */}
          <div className="absolute top-1/2 left-0 right-0 hidden lg:block">
            <div className="h-0.5 bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div
                key={step.step}
                className="group relative"
              >
                <div className="relative rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-glow h-full">
                  {/* Step number */}
                  <div className="absolute -top-3 left-6 rounded-full border border-border bg-background px-3 py-1 font-display text-xs font-bold text-primary">
                    STEP {step.step}
                  </div>

                  <div className="mb-4 mt-2 flex h-14 w-14 items-center justify-center rounded-xl bg-secondary transition-colors group-hover:bg-primary/20">
                    <step.icon className="h-7 w-7 text-primary" />
                  </div>

                  <h3 className="mb-2 font-display text-lg font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>

                {/* Arrow connector for desktop */}
                {index < steps.length - 1 && (
                  <div className="absolute -right-4 top-1/2 hidden -translate-y-1/2 lg:block">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background">
                      <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
