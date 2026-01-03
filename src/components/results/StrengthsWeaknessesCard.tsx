import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface StrengthsWeaknessesCardProps {
  analysis: string | null;
}

const extractStrengthsAndWeaknesses = (analysis: string | null): { strengths: string[]; weaknesses: string[] } => {
  if (!analysis) {
    return { strengths: [], weaknesses: [] };
  }
  
  // Try to find strengths section with various formats
  const strengthsMatch = analysis.match(/\*\*Strengths?:?\*\*\s*([\s\S]*?)(?=\*\*Weakness|\*\*Areas|$)/i) ||
    analysis.match(/Strengths?:?\s*([\s\S]*?)(?=Weakness|Areas for|$)/i) ||
    analysis.match(/(?:Key\s+)?Strengths?:?\s*([\s\S]*?)(?=Weakness|$)/i);
  
  // Try to find weaknesses section with various formats
  const weaknessesMatch = analysis.match(/\*\*(?:Weakness(?:es)?|Areas for Improvement):?\*\*\s*([\s\S]*?)(?=\*\*Recommendation|\*\*Next|\*\*Action|$)/i) ||
    analysis.match(/(?:Weakness(?:es)?|Areas for Improvement):?\s*([\s\S]*?)(?=Recommendation|Next Steps|Action|$)/i);
  
  const parseItems = (text: string | undefined): string[] => {
    if (!text) return [];
    
    // Split by common list patterns
    const items = text
      .split(/(?:\n[-•*]|\n\d+\.|\n-\s)/)
      .map(item => item.replace(/^[-•*\d.)\s]+/, '').trim())
      .filter(item => item.length > 5 && item.length < 500);
    
    if (items.length > 0) return items.slice(0, 5);
    
    // If no list items found, split by sentences
    const sentences = text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10 && s.length < 300);
    
    return sentences.slice(0, 5);
  };
  
  return {
    strengths: parseItems(strengthsMatch?.[1]),
    weaknesses: parseItems(weaknessesMatch?.[1])
  };
};

const StrengthsWeaknessesCard = ({ analysis }: StrengthsWeaknessesCardProps) => {
  const { strengths, weaknesses } = extractStrengthsAndWeaknesses(analysis);
  
  if (strengths.length === 0 && weaknesses.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-card">
      <h2 className="font-display text-xl font-bold mb-6">Strengths & Weaknesses</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-[hsl(var(--score-excellent))]/20 flex items-center justify-center">
              <ThumbsUp className="h-5 w-5 text-[hsl(var(--score-excellent))]" />
            </div>
            <h3 className="font-semibold text-lg text-[hsl(var(--score-excellent))]">Strengths</h3>
          </div>
          
          {strengths.length > 0 ? (
            <ul className="space-y-3">
              {strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-[hsl(var(--score-excellent))] mt-2 shrink-0" />
                  <span className="text-sm text-muted-foreground leading-relaxed">{strength}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground italic">No specific strengths identified</p>
          )}
        </div>
        
        {/* Weaknesses Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-[hsl(var(--score-poor))]/20 flex items-center justify-center">
              <ThumbsDown className="h-5 w-5 text-[hsl(var(--score-poor))]" />
            </div>
            <h3 className="font-semibold text-lg text-[hsl(var(--score-poor))]">Weaknesses</h3>
          </div>
          
          {weaknesses.length > 0 ? (
            <ul className="space-y-3">
              {weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-[hsl(var(--score-poor))] mt-2 shrink-0" />
                  <span className="text-sm text-muted-foreground leading-relaxed">{weakness}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground italic">No specific weaknesses identified</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StrengthsWeaknessesCard;
