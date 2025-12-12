import { useState } from 'react';
import { ChevronDown, ChevronUp, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureDetailCardProps {
  title: string;
  score: number;
  description: string;
  userResponse?: string;
  icon: LucideIcon;
  details: {
    whatItMeans: string;
    keyFactors: string[];
    recommendations: string[];
  };
}

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-[hsl(var(--score-excellent))]';
  if (score >= 60) return 'text-[hsl(var(--score-good))]';
  if (score >= 40) return 'text-[hsl(var(--score-fair))]';
  return 'text-[hsl(var(--score-poor))]';
};

const getScoreBgColor = (score: number) => {
  if (score >= 80) return 'bg-[hsl(var(--score-excellent))]';
  if (score >= 60) return 'bg-[hsl(var(--score-good))]';
  if (score >= 40) return 'bg-[hsl(var(--score-fair))]';
  return 'bg-[hsl(var(--score-poor))]';
};

const getScoreLabel = (score: number) => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Improvement';
};

const FeatureDetailCard = ({ title, score, description, userResponse, icon: Icon, details }: FeatureDetailCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl overflow-hidden transition-all duration-300 hover:border-primary/50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 flex items-center gap-4 text-left"
      >
        <div className={cn(
          "h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0",
          getScoreBgColor(score) + "/20"
        )}>
          <Icon className={cn("h-6 w-6", getScoreColor(score))} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-display font-bold text-lg">{title}</h3>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs font-medium",
              getScoreBgColor(score) + "/20",
              getScoreColor(score)
            )}>
              {getScoreLabel(score)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1">{description}</p>
        </div>
        
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-right">
            <div className={cn("font-display text-2xl font-bold", getScoreColor(score))}>
              {score}
            </div>
            <div className="text-xs text-muted-foreground">/ 100</div>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </button>
      
      {isExpanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-border pt-4 animate-fade-in">
          {userResponse && (
            <div className="bg-secondary/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-primary mb-2">Your Response</h4>
              <p className="text-sm text-muted-foreground">{userResponse}</p>
            </div>
          )}
          
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              What This Means
            </h4>
            <p className="text-sm text-muted-foreground">{details.whatItMeans}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--score-good))]" />
              Key Factors
            </h4>
            <ul className="space-y-1">
              {details.keyFactors.map((factor, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  {factor}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--chart-4))]" />
              Recommendations
            </h4>
            <ul className="space-y-1">
              {details.recommendations.map((rec, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-[hsl(var(--chart-4))] mt-1">{idx + 1}.</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeatureDetailCard;
