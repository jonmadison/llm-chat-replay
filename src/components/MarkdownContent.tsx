import React from 'react';
import { marked } from 'marked';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

const MarkdownContent: React.FC<MarkdownContentProps> = ({ content, className = '' }) => {
  const processedContent = content.replace(/:\s*(\d+\.)/g, ':\n\n$1');

  marked.setOptions({
    breaks: true,
    gfm: true,
  });

  return (
    <div 
      className={`markdown-content ${className}`}
      dangerouslySetInnerHTML={{ __html: marked(processedContent) }} 
    />
  );
};

export default MarkdownContent;