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
    // Old format regex
    const oldFunctionCallRegex = /\[Function call: ([\s\S]*?)\]/g;
    const oldFunctionResultRegex = /\[Function result: ([\s\S]*?)\]/g;
    
    // New format regex with tags
    const newFunctionCallRegex = /<function_call>([\s\S]*?)<\/function_call>/g;
    const newFunctionResultRegex = /<function_result>([\s\S]*?)<\/function_result>/g;
    
    const functionCalls: {type: 'call' | 'result', content: string, position: number}[] = [];
    
    // Find all function calls (old format)
    let match;
    while ((match = oldFunctionCallRegex.exec(text)) !== null) {
      functionCalls.push({
        type: 'call',
        content: match[1],
        position: match.index,
        format: 'old',
        fullMatch: match[0]
      });
    }
    
    // Find all function results (old format)
    while ((match = oldFunctionResultRegex.exec(text)) !== null) {
      functionCalls.push({
        type: 'result',
        content: match[1],
        position: match.index,
        format: 'old',
        fullMatch: match[0]
      });
    }
    
    // Find all function calls (new format)
    while ((match = newFunctionCallRegex.exec(text)) !== null) {
      functionCalls.push({
        type: 'call',
        content: match[1],
        position: match.index,
        format: 'new',
        fullMatch: match[0]
      });
    }
    
    // Find all function results (new format)
    while ((match = newFunctionResultRegex.exec(text)) !== null) {
      functionCalls.push({
        type: 'result',
        content: match[1],
        position: match.index,
        format: 'new',
        fullMatch: match[0]
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
    // Calculate position based on format
    const matchLength = block.fullMatch ? block.fullMatch.length : 
      block.format === 'old' ? 
        `[Function ${block.type}: ${block.content}]`.length : 
        `<function_${block.type}>${block.content}</function_${block.type}>`.length;
    
    lastPosition = block.position + matchLength;
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