import { 
  Target, 
  Package, 
  TrendingUp, 
  Megaphone, 
  Settings, 
  DollarSign, 
  Users, 
  Shield 
} from "lucide-react";

const areas = [
  {
    icon: Target,
    title: "Market",
    description: "Analyze market size, trends, competition, and your positioning",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Package,
    title: "Product",
    description: "Evaluate product-market fit, features, and development roadmap",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: TrendingUp,
    title: "Business Model",
    description: "Review revenue streams, pricing strategy, and unit economics",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Megaphone,
    title: "Marketing",
    description: "Assess brand strategy, channels, and customer acquisition",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Settings,
    title: "Operations",
    description: "Examine processes, tools, and operational efficiency",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: DollarSign,
    title: "Finance",
    description: "Analyze cash flow, runway, funding readiness, and projections",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Users,
    title: "Team",
    description: "Evaluate team composition, skills gaps, and culture",
    color: "from-indigo-500 to-purple-500",
  },
  {
    icon: Shield,
    title: "Legal",
    description: "Review compliance, IP protection, and legal structure",
    color: "from-rose-500 to-pink-500",
  },
];

const DiagnosticAreas = () => {
  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/30 to-transparent" />
      
      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="mb-4 font-display text-3xl font-bold md:text-4xl lg:text-5xl">
            8 Critical Areas,{' '}
            <span className="text-gradient">One Complete Picture</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Our Diagnostic Engine performs a comprehensive scan of your startup, 
            identifying strengths, weaknesses, and opportunities across every operational dimension.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {areas.map((area, index) => (
            <div
              key={area.title}
              className="group relative overflow-hidden rounded-xl border border-border bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-glow hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${area.color} opacity-80 transition-opacity group-hover:opacity-100`}>
                <area.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 font-display text-lg font-semibold">{area.title}</h3>
              <p className="text-sm text-muted-foreground">{area.description}</p>
              
              {/* Hover glow effect */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DiagnosticAreas;
