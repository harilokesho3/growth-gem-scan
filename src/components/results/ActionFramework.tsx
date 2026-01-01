import { Ban, Rocket, AlertTriangle, Clock, Flag, ThumbsUp } from 'lucide-react';

interface ActionFrameworkProps {
  recommendations?: string | null;
}

const ActionFramework = ({ recommendations }: ActionFrameworkProps) => {
  // Parse recommendations if available, otherwise show placeholder
  const parseRecommendations = (text: string | null | undefined) => {
    if (!text) return null;
    
    const sections = {
      redFlags: [] as string[],
      greenFlags: [] as string[],
      stopDoing: [] as string[],
      startDoing: [] as string[],
      fixFirst: [] as string[],
      fixLater: [] as string[],
    };

    // Try to extract sections from AI recommendations
    const lines = text.split('\n').filter(line => line.trim());
    let currentSection = '';
    
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes('red flag') || lowerLine.includes('warning') || lowerLine.includes('concern')) {
        currentSection = 'redFlags';
      } else if (lowerLine.includes('green flag') || lowerLine.includes('strength') || lowerLine.includes('positive')) {
        currentSection = 'greenFlags';
      } else if (lowerLine.includes('stop doing') || lowerLine.includes('stop:')) {
        currentSection = 'stopDoing';
      } else if (lowerLine.includes('start doing') || lowerLine.includes('start:')) {
        currentSection = 'startDoing';
      } else if (lowerLine.includes('fix first') || lowerLine.includes('priority') || lowerLine.includes('urgent')) {
        currentSection = 'fixFirst';
      } else if (lowerLine.includes('fix later') || lowerLine.includes('long-term') || lowerLine.includes('later')) {
        currentSection = 'fixLater';
      } else if (currentSection && line.trim().startsWith('-')) {
        sections[currentSection as keyof typeof sections].push(line.trim().substring(1).trim());
      } else if (currentSection && line.trim()) {
        sections[currentSection as keyof typeof sections].push(line.trim());
      }
    });

    return sections;
  };

  const parsed = parseRecommendations(recommendations);

  const flagCards = [
    {
      title: 'Red Flags',
      icon: Flag,
      color: 'hsl(0 84% 60%)',
      bgColor: 'hsl(0 84% 60%)',
      items: parsed?.redFlags || [],
      placeholder: 'Critical risks or warning signs that need immediate attention',
    },
    {
      title: 'Green Flags',
      icon: ThumbsUp,
      color: 'hsl(142 76% 36%)',
      bgColor: 'hsl(142 76% 36%)',
      items: parsed?.greenFlags || [],
      placeholder: 'Strengths and positive indicators that show promise',
    },
  ];

  const actionCards = [
    {
      title: 'Stop Doing',
      icon: Ban,
      color: 'hsl(var(--score-poor))',
      bgColor: 'hsl(var(--score-poor))',
      items: parsed?.stopDoing || [],
      placeholder: 'Activities or practices that are wasting resources or causing harm',
    },
    {
      title: 'Start Doing',
      icon: Rocket,
      color: 'hsl(var(--score-excellent))',
      bgColor: 'hsl(var(--score-excellent))',
      items: parsed?.startDoing || [],
      placeholder: 'New initiatives or practices to implement immediately',
    },
    {
      title: 'Fix First',
      icon: AlertTriangle,
      color: 'hsl(var(--score-fair))',
      bgColor: 'hsl(var(--score-fair))',
      items: parsed?.fixFirst || [],
      placeholder: 'Critical issues requiring immediate attention',
    },
    {
      title: 'Fix Later',
      icon: Clock,
      color: 'hsl(var(--chart-4))',
      bgColor: 'hsl(var(--chart-4))',
      items: parsed?.fixLater || [],
      placeholder: 'Important improvements to schedule for future sprints',
    },
  ];

  const renderCard = (card: typeof flagCards[0] | typeof actionCards[0]) => {
    const Icon = card.icon;
    const hasItems = card.items.length > 0;
    
    return (
      <div 
        key={card.title}
        className="border border-border rounded-xl p-5 hover:border-primary/30 transition-colors"
        style={{ 
          background: `linear-gradient(135deg, ${card.bgColor}10 0%, transparent 100%)`,
          borderColor: `${card.bgColor}30`
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div 
            className="h-10 w-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${card.bgColor}20` }}
          >
            <Icon className="h-5 w-5" style={{ color: card.color }} />
          </div>
          <h3 className="font-semibold text-foreground">{card.title}</h3>
        </div>
        
        {hasItems ? (
          <ul className="space-y-2">
            {card.items.slice(0, 3).map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary mt-1">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            {card.placeholder}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-card">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
          <span className="text-2xl">🎯</span>
        </div>
        <div>
          <h2 className="font-display text-xl font-bold">Action Framework</h2>
          <p className="text-sm text-muted-foreground">Your prioritized action plan based on the analysis</p>
        </div>
      </div>

      {/* Red Flags & Green Flags */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {flagCards.map(renderCard)}
      </div>

      {/* Action Items */}
      <div className="grid md:grid-cols-2 gap-4">
        {actionCards.map(renderCard)}
      </div>

      <div className="mt-6 p-4 bg-secondary/30 rounded-xl border border-border/50 text-center">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Want personalized recommendations?</strong> Book a consulting session to get detailed action items tailored to your specific situation.
        </p>
      </div>
    </div>
  );
};

export default ActionFramework;
