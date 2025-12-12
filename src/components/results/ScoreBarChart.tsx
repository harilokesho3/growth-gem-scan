import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface ScoreData {
  label: string;
  score: number;
}

interface ScoreBarChartProps {
  data: ScoreData[];
}

const getBarColor = (score: number) => {
  if (score >= 80) return 'hsl(var(--score-excellent))';
  if (score >= 60) return 'hsl(var(--score-good))';
  if (score >= 40) return 'hsl(var(--score-fair))';
  return 'hsl(var(--score-poor))';
};

const ScoreBarChart = ({ data }: ScoreBarChartProps) => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
          <XAxis 
            type="number" 
            domain={[0, 100]} 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
          />
          <YAxis 
            dataKey="label" 
            type="category" 
            tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            width={75}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--foreground))'
            }}
            formatter={(value: number) => [`${value}/100`, 'Score']}
            cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
          />
          <Bar dataKey="score" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScoreBarChart;
