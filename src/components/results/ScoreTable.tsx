import { cn } from '@/lib/utils';

interface ScoreTableProps {
  scores: {
    label: string;
    score: number;
    change?: number;
  }[];
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
  return 'Poor';
};

const ScoreTable = ({ scores }: ScoreTableProps) => {
  const sortedScores = [...scores].sort((a, b) => b.score - a.score);

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full">
        <thead>
          <tr className="bg-secondary/50">
            <th className="px-4 py-3 text-left text-sm font-semibold">Area</th>
            <th className="px-4 py-3 text-center text-sm font-semibold">Score</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
            <th className="px-4 py-3 text-left text-sm font-semibold hidden md:table-cell">Progress</th>
          </tr>
        </thead>
        <tbody>
          {sortedScores.map((item, index) => (
            <tr 
              key={item.label} 
              className={cn(
                "border-t border-border transition-colors hover:bg-secondary/30",
                index % 2 === 0 ? "bg-card/50" : "bg-card/30"
              )}
            >
              <td className="px-4 py-3">
                <span className="font-medium">{item.label}</span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className={cn("font-display font-bold text-lg", getScoreColor(item.score))}>
                  {item.score}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={cn(
                  "inline-flex px-2.5 py-1 rounded-full text-xs font-medium",
                  getScoreBgColor(item.score) + "/20",
                  getScoreColor(item.score)
                )}>
                  {getScoreLabel(item.score)}
                </span>
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all", getScoreBgColor(item.score))}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8">{item.score}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScoreTable;
