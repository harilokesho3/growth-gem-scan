import React from 'react';

interface AIAnalysisContentProps {
  content: string;
}

const AIAnalysisContent = ({ content }: AIAnalysisContentProps) => {
  // Parse and format the AI analysis content
  const formatContent = (text: string) => {
    // Split by section headers like **Market:**, **Product:**, etc.
    const sections = text.split(/(\*\*[A-Za-z\s]+:\*\*)/g);
    
    return sections.map((part, index) => {
      // Check if this is a section header
      if (part.match(/^\*\*[A-Za-z\s]+:\*\*$/)) {
        const headerText = part.replace(/\*\*/g, '');
        return (
          <h3 
            key={index} 
            className="text-primary font-semibold text-base mt-6 mb-2 first:mt-0 flex items-center gap-2"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {headerText}
          </h3>
        );
      }
      
      // Regular text content
      if (part.trim()) {
        return (
          <p key={index} className="text-muted-foreground leading-relaxed text-sm mb-3 last:mb-0">
            {part.trim()}
          </p>
        );
      }
      
      return null;
    });
  };

  return (
    <div className="space-y-1">
      {formatContent(content)}
    </div>
  );
};

export default AIAnalysisContent;
