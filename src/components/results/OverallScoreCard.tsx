import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface OverallScoreCardProps {
  score: number;
  title: string;
  subtitle?: string;
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
  if (score >= 60) return 'Good Progress';
  if (score >= 40) return 'Needs Improvement';
  return 'Critical Attention Required';
};

const getScoreIcon = (score: number) => {
  if (score >= 60) return TrendingUp;
  if (score >= 40) return Minus;
  return TrendingDown;
};

const OverallScoreCard = ({ score, title, subtitle }: OverallScoreCardProps) => {
  const Icon = getScoreIcon(score);
  
  // Calculate circumference for the progress ring
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-card">
      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Circular Progress */}
        <div className="relative flex-shrink-0">
          <svg className="w-44 h-44 transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="88"
              cy="88"
              r={radius}
              fill="none"
              stroke="hsl(var(--secondary))"
              strokeWidth="12"
            />
            {/* Progress circle */}
            <circle
              cx="88"
              cy="88"
              r={radius}
              fill="none"
              stroke={`hsl(var(${score >= 80 ? '--score-excellent' : score >= 60 ? '--score-good' : score >= 40 ? '--score-fair' : '--score-poor'}))`}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("font-display text-5xl font-bold", getScoreColor(score))}>
              {score}
            </span>
            <span className="text-sm text-muted-foreground">out of 100</span>
          </div>
        </div>

        {/* Score Info */}
        <div className="flex-1 text-center md:text-left">
          <h2 className="font-display text-2xl font-bold mb-2">{title}</h2>
          {subtitle && (
            <p className="text-muted-foreground mb-4">{subtitle}</p>
          )}
          
          <div className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full",
            getScoreBgColor(score) + "/20"
          )}>
            <Icon className={cn("h-5 w-5", getScoreColor(score))} />
            <span className={cn("font-semibold", getScoreColor(score))}>
              {getScoreLabel(score)}
            </span>
          </div>
          
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-secondary/30 rounded-lg">
              <div className="text-2xl font-bold text-[hsl(var(--score-excellent))]">
                {score >= 80 ? '★★★' : score >= 60 ? '★★☆' : score >= 40 ? '★☆☆' : '☆☆☆'}
              </div>
              <div className="text-xs text-muted-foreground">Rating</div>
            </div>
            <div className="text-center p-3 bg-secondary/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">{Math.round(score / 10)}/10</div>
              <div className="text-xs text-muted-foreground">Grade</div>
            </div>
            <div className="text-center p-3 bg-secondary/30 rounded-lg">
              <div className={cn("text-2xl font-bold", getScoreColor(score))}>
                {score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D'}
              </div>
              <div className="text-xs text-muted-foreground">Tier</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverallScoreCard;
