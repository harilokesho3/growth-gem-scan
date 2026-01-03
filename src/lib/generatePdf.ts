import jsPDF from 'jspdf';

interface DiagnosticPdfData {
  company_name: string;
  industry: string;
  stage: string;
  team_size: string;
  overall_score: number | null;
  market_score: number | null;
  product_score: number | null;
  business_model_score: number | null;
  marketing_score: number | null;
  operations_score: number | null;
  finance_score: number | null;
  team_score: number | null;
  legal_score: number | null;
  ai_analysis: string | null;
  ai_recommendations: string | null;
  created_at: string;
}

interface IdeaPdfData {
  idea_title: string;
  idea_description: string;
  target_market: string;
  problem_solved: string;
  overall_score: number | null;
  feasibility_score: number | null;
  innovation_score: number | null;
  market_potential_score: number | null;
  ai_analysis: string | null;
  ai_recommendations: string | null;
  created_at: string;
}

const COLORS = {
  primary: [255, 102, 0] as [number, number, number],
  dark: [20, 20, 24] as [number, number, number],
  gray: [100, 100, 100] as [number, number, number],
  lightGray: [200, 200, 200] as [number, number, number],
  green: [34, 197, 94] as [number, number, number],
  yellow: [234, 179, 8] as [number, number, number],
  orange: [249, 115, 22] as [number, number, number],
  red: [239, 68, 68] as [number, number, number],
};

const getScoreColor = (score: number): [number, number, number] => {
  if (score >= 80) return COLORS.green;
  if (score >= 60) return COLORS.yellow;
  if (score >= 40) return COLORS.orange;
  return COLORS.red;
};

const addHeader = (doc: jsPDF, title: string, subtitle: string) => {
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, 210, 45, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('STARTUP SAVER', 20, 20);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(title, 20, 32);
  
  doc.setFontSize(10);
  doc.text(subtitle, 20, 40);
};

const addScoreCircle = (doc: jsPDF, score: number, x: number, y: number, label: string) => {
  const color = getScoreColor(score);
  
  doc.setDrawColor(...color);
  doc.setLineWidth(2);
  doc.circle(x, y, 15);
  
  doc.setTextColor(...color);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(score.toString(), x, y + 2, { align: 'center' });
  
  doc.setTextColor(...COLORS.gray);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(label, x, y + 22, { align: 'center' });
};

const addSection = (doc: jsPDF, title: string, content: string, startY: number): number => {
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 20, startY);
  
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.5);
  doc.line(20, startY + 2, 60, startY + 2);
  
  doc.setTextColor(...COLORS.gray);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const lines = doc.splitTextToSize(content, 170);
  let currentY = startY + 10;
  
  for (const line of lines) {
    if (currentY > 270) {
      doc.addPage();
      currentY = 20;
    }
    doc.text(line, 20, currentY);
    currentY += 5;
  }
  
  return currentY + 10;
};

const addScoreBar = (doc: jsPDF, label: string, score: number, x: number, y: number, width: number) => {
  const color = getScoreColor(score);
  
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(label, x, y);
  
  doc.setFillColor(...COLORS.lightGray);
  doc.roundedRect(x, y + 2, width, 4, 2, 2, 'F');
  
  doc.setFillColor(...color);
  doc.roundedRect(x, y + 2, (width * score) / 100, 4, 2, 2, 'F');
  
  doc.setTextColor(...color);
  doc.setFont('helvetica', 'bold');
  doc.text(score.toString(), x + width + 5, y + 5);
};

// Helper to extract strengths and weaknesses from AI analysis
const extractStrengthsAndWeaknesses = (analysis: string | null): { strengths: string[]; weaknesses: string[] } => {
  if (!analysis) {
    return { strengths: ['Analysis not available'], weaknesses: ['Analysis not available'] };
  }
  
  // Try to find strengths section with various formats
  const strengthsMatch = analysis.match(/\*\*Strengths?:?\*\*\s*([\s\S]*?)(?=\*\*Weakness|\*\*Areas|$)/i) ||
    analysis.match(/Strengths?:?\s*([\s\S]*?)(?=Weakness|Areas for|$)/i) ||
    analysis.match(/(?:Key\s+)?Strengths?:?\s*([\s\S]*?)(?=Weakness|$)/i);
  
  // Try to find weaknesses section with various formats
  const weaknessesMatch = analysis.match(/\*\*(?:Weakness(?:es)?|Areas for Improvement):?\*\*\s*([\s\S]*?)(?=\*\*Recommendation|\*\*Next|\*\*Action|$)/i) ||
    analysis.match(/(?:Weakness(?:es)?|Areas for Improvement):?\s*([\s\S]*?)(?=Recommendation|Next Steps|Action|$)/i);
  
  const parseItems = (text: string | undefined): string[] => {
    if (!text) return ['See analysis for details'];
    
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
    
    return sentences.length > 0 ? sentences.slice(0, 5) : ['See analysis for details'];
  };
  
  return {
    strengths: parseItems(strengthsMatch?.[1]),
    weaknesses: parseItems(weaknessesMatch?.[1])
  };
};

// Helper to add a bullet list section to PDF
const addBulletListSection = (doc: jsPDF, title: string, items: string[], startY: number, color: [number, number, number]): number => {
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 20, startY);
  
  doc.setDrawColor(...color);
  doc.setLineWidth(0.5);
  doc.line(20, startY + 2, 60, startY + 2);
  
  let currentY = startY + 12;
  
  doc.setTextColor(...COLORS.gray);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  for (const item of items) {
    if (currentY > 270) {
      doc.addPage();
      currentY = 20;
    }
    
    // Draw bullet point
    doc.setFillColor(...color);
    doc.circle(24, currentY - 1.5, 1.5, 'F');
    
    // Wrap text for long items
    const lines = doc.splitTextToSize(item, 160);
    for (const line of lines) {
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }
      doc.text(line, 30, currentY);
      currentY += 5;
    }
    currentY += 3;
  }
  
  return currentY + 5;
};

export const generateDiagnosticPdf = (data: DiagnosticPdfData) => {
  const doc = new jsPDF();
  const date = new Date(data.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  addHeader(doc, 'Startup Diagnostic Report', `Generated on ${date}`);
  
  // Company Info
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(data.company_name, 20, 60);
  
  doc.setTextColor(...COLORS.gray);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.industry} • ${data.stage} • ${data.team_size}`, 20, 68);
  
  // Overall Score
  if (data.overall_score !== null) {
    addScoreCircle(doc, data.overall_score, 170, 62, 'Overall Score');
  }
  
  // Area Scores
  let scoreY = 90;
  const scores = [
    { label: 'Market', score: data.market_score },
    { label: 'Product', score: data.product_score },
    { label: 'Business Model', score: data.business_model_score },
    { label: 'Marketing', score: data.marketing_score },
    { label: 'Operations', score: data.operations_score },
    { label: 'Finance', score: data.finance_score },
    { label: 'Team', score: data.team_score },
    { label: 'Legal', score: data.legal_score },
  ];
  
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Performance by Area', 20, scoreY);
  scoreY += 10;
  
  scores.forEach((item) => {
    if (item.score !== null) {
      addScoreBar(doc, item.label, item.score, 20, scoreY, 120);
      scoreY += 12;
    }
  });
  
  scoreY += 5;
  
  // Strengths & Weaknesses (extracted from AI Analysis)
  const { strengths, weaknesses } = extractStrengthsAndWeaknesses(data.ai_analysis);
  
  scoreY = addBulletListSection(doc, 'Strengths', strengths, scoreY, COLORS.green);
  addBulletListSection(doc, 'Weaknesses', weaknesses, scoreY, COLORS.red);
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setTextColor(...COLORS.gray);
    doc.setFontSize(8);
    doc.text('Startup Saver - Your Startup Diagnostic Partner', 20, 287);
    doc.text(`Page ${i} of ${pageCount}`, 180, 287);
  }
  
  doc.save(`${data.company_name.replace(/\s+/g, '_')}_Diagnostic_Report.pdf`);
};

export const generateIdeaPdf = (data: IdeaPdfData) => {
  const doc = new jsPDF();
  const date = new Date(data.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  addHeader(doc, 'Idea Validation Report', `Generated on ${date}`);
  
  // Idea Title
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(data.idea_title, 130);
  doc.text(titleLines, 20, 60);
  
  // Overall Score
  if (data.overall_score !== null) {
    addScoreCircle(doc, data.overall_score, 170, 62, 'Overall Score');
  }
  
  let currentY = 60 + titleLines.length * 8 + 10;
  
  // Scores
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Validation Scores', 20, currentY);
  currentY += 12;
  
  const scores = [
    { label: 'Feasibility', score: data.feasibility_score },
    { label: 'Innovation', score: data.innovation_score },
    { label: 'Market Potential', score: data.market_potential_score },
  ];
  
  scores.forEach((item) => {
    if (item.score !== null) {
      addScoreBar(doc, item.label, item.score, 20, currentY, 120);
      currentY += 14;
    }
  });
  
  currentY += 5;
  
  // Idea Description
  currentY = addSection(doc, 'Idea Description', data.idea_description, currentY);
  
  // Target Market
  currentY = addSection(doc, 'Target Market', data.target_market, currentY);
  
  // Problem Solved
  currentY = addSection(doc, 'Problem Solved', data.problem_solved, currentY);
  
  // Strengths & Weaknesses (extracted from AI Analysis)
  const { strengths, weaknesses } = extractStrengthsAndWeaknesses(data.ai_analysis);
  
  currentY = addBulletListSection(doc, 'Strengths', strengths, currentY, COLORS.green);
  addBulletListSection(doc, 'Weaknesses', weaknesses, currentY, COLORS.red);
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setTextColor(...COLORS.gray);
    doc.setFontSize(8);
    doc.text('Startup Saver - Your Idea Validation Partner', 20, 287);
    doc.text(`Page ${i} of ${pageCount}`, 180, 287);
  }
  
  doc.save(`${data.idea_title.replace(/\s+/g, '_')}_Validation_Report.pdf`);
};
