import React from 'react';
import FunctionBlock from './FunctionBlock';
import { marked } from 'marked';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

const MarkdownContent: React.FC<MarkdownContentProps> = ({ content, className = '' }) => {
  // First process function calls and results
  const processFunctionBlocks = (text: string) => {
    const functionCallRegex = /\[Function call: ([\s\S]*?)\]/g;
    const functionResultRegex = /\[Function result: ([\s\S]*?)\]/g;
    
    const functionCalls: {type: 'call' | 'result', content: string, position: number}[] = [];
    
    // Find all function calls
    let match;
    while ((match = functionCallRegex.exec(text)) !== null) {
      functionCalls.push({
        type: 'call',
        content: match[1],
        position: match.index
      });
    }
    
    // Find all function results
    while ((match = functionResultRegex.exec(text)) !== null) {
      functionCalls.push({
        type: 'result',
        content: match[1],
        position: match.index
      });
    }
    
    // Sort by position
    functionCalls.sort((a, b) => a.position - b.position);
    
    return functionCalls;
  };
  
  const functionBlocks = processFunctionBlocks(content);
  
  // Process regular markdown for non-function content
  const processedContent = content.replace(/:\s*(\d+\.)/g, ':\n\n$1');

  marked.setOptions({
    breaks: true,
    gfm: true,
  });

  // If there are no function blocks, just render the markdown
  if (functionBlocks.length === 0) {
    return (
      <div 
        className={`markdown-content ${className}`}
        dangerouslySetInnerHTML={{ __html: marked(processedContent) }} 
      />
    );
  }
  
  // Split content at function block positions and render with function blocks interspersed
  let lastPosition = 0;
  const contentParts: JSX.Element[] = [];
  
  functionBlocks.forEach((block, index) => {
    // Add text before this function block
    const textBefore = content.substring(lastPosition, block.position);
    if (textBefore) {
      contentParts.push(
        <div 
          key={`text-${index}`}
          className={`markdown-content ${className}`}
          dangerouslySetInnerHTML={{ __html: marked(textBefore) }} 
        />
      );
    }
    
    // Add the function block
    contentParts.push(
      <FunctionBlock 
        key={`function-${index}`}
        type={block.type} 
        content={block.content} 
      />
    );
    
    // Update position for next iteration
    lastPosition = block.position + `[Function ${block.type}: ${block.content}]`.length;
  });
  
  // Add any remaining text after the last function block
  const textAfter = content.substring(lastPosition);
  if (textAfter) {
    contentParts.push(
      <div 
        key="text-end"
        className={`markdown-content ${className}`}
        dangerouslySetInnerHTML={{ __html: marked(textAfter) }} 
      />
    );
  }
  
  return <div className={className}>{contentParts}</div>;
};

export default MarkdownContent;