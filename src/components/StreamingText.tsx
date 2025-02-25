import React, { useEffect, useRef, useState } from 'react';
import Typed from 'typed.js';
import MarkdownContent from './MarkdownContent';

interface StreamingTextProps {
  content: string;
  onComplete: () => void;
  speed?: number;
  isPlaying: boolean;
}

const StreamingText = ({ content, onComplete, speed = 1, isPlaying }: StreamingTextProps) => {
  const el = useRef(null);
  const typed = useRef<Typed | null>(null);
  const [renderedText, setRenderedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTyping, setCurrentTyping] = useState('');
  const pausedTextRef = useRef('');

  // Special processing for function calls and results
  const processFunctionBlocks = (text: string) => {
    const functionCallRegex = /\[Function call: ([\s\S]*?)\]/g;
    const functionResultRegex = /\[Function result: ([\s\S]*?)\]/g;
    
    // Replace functions with placeholders to avoid them getting split by sentence splitter
    let processedText = text;
    const functionBlocks: {type: 'call' | 'result', content: string, placeholder: string}[] = [];
    let blockCount = 0;
    
    // Process function calls
    processedText = processedText.replace(functionCallRegex, (match, content) => {
      const placeholder = `__FUNCTION_CALL_${blockCount}__`;
      functionBlocks.push({
        type: 'call',
        content,
        placeholder
      });
      blockCount++;
      return placeholder;
    });
    
    // Process function results
    processedText = processedText.replace(functionResultRegex, (match, content) => {
      const placeholder = `__FUNCTION_RESULT_${blockCount}__`;
      functionBlocks.push({
        type: 'result',
        content,
        placeholder
      });
      blockCount++;
      return placeholder;
    });
    
    return { processedText, functionBlocks };
  };
  
  // Process content to handle function blocks
  const { processedText, functionBlocks } = processFunctionBlocks(content);
  
  // Simplified approach - use a manual splitter that handles sentences properly
  const splitIntoSentences = (text: string) => {
    // Find all placeholders first
    const placeholders = functionBlocks.map(block => block.placeholder);
    let segments = [];
    let currentText = text;
    
    // Extract placeholders first (they should be treated as complete units)
    for (const placeholder of placeholders) {
      const placeholderIndex = currentText.indexOf(placeholder);
      if (placeholderIndex > -1) {
        // Add text before placeholder if any
        if (placeholderIndex > 0) {
          const textBefore = currentText.substring(0, placeholderIndex);
          // Further split this text into sentences
          const sentences = textBefore.match(/[^.!?]+[.!?]+/g) || 
                           (textBefore.trim() ? [textBefore] : []);
          segments.push(...sentences);
        }
        
        // Add placeholder as its own segment
        segments.push(placeholder);
        
        // Continue with text after placeholder
        currentText = currentText.substring(placeholderIndex + placeholder.length);
      }
    }
    
    // Add any remaining text
    if (currentText.trim()) {
      const remainingSentences = currentText.match(/[^.!?]+[.!?]+/g) || [currentText];
      segments.push(...remainingSentences);
    }
    
    // If we ended up with nothing, return the original text
    return segments.length > 0 ? segments : [text];
  };
  
  const sentences = useRef(splitIntoSentences(processedText));

  const scrollToBottom = () => {
    const findScrollContainer = (element: HTMLElement | null): HTMLElement | null => {
      while (element) {
        if (element.scrollHeight > element.clientHeight) {
          return element;
        }
        element = element.parentElement;
      }
      return null;
    };

    if (el.current) {
      const container = findScrollContainer(el.current);
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  };

  useEffect(() => {
    if (!isPlaying) {
      if (typed.current) {
        typed.current.destroy();
        setCurrentTyping('');
      }
      return;
    }

    if (currentIndex >= sentences.current.length) {
      onComplete();
      return;
    }

    const currentSentence = sentences.current[currentIndex];
    
    // Check if this is a function placeholder
    const isFunctionPlaceholder = functionBlocks.some(
      block => block.placeholder === currentSentence
    );
    
    if (isFunctionPlaceholder) {
      // For function blocks, don't animate, just add them immediately
      setRenderedText(prev => prev + currentSentence);
      setCurrentTyping('');
      setCurrentIndex(prev => prev + 1);
      scrollToBottom();
      return;
    }

    if (el.current) {
      typed.current = new Typed(el.current, {
        strings: [currentSentence],
        typeSpeed: 20 / speed,
        showCursor: true,
        cursorChar: '▋',
        onComplete: () => {
          if (typed.current) {
            typed.current.destroy();
          }
          setRenderedText(prev => prev + currentSentence);
          setCurrentTyping('');
          setCurrentIndex(prev => prev + 1);
          scrollToBottom();
        },
        onTyped: () => {
          if (el.current) {
            const newText = (el.current as HTMLElement).textContent || '';
            setCurrentTyping(newText);
            pausedTextRef.current = newText;
            scrollToBottom();
          }
        }
      });
    }

    return () => {
      if (typed.current) {
        typed.current.destroy();
      }
    };
  }, [currentIndex, isPlaying]);

  // Function to restore function blocks in rendered text
  const restoreFunctionBlocks = (text: string) => {
    let restoredText = text;
    functionBlocks.forEach(block => {
      restoredText = restoredText.replace(
        block.placeholder,
        `[Function ${block.type}: ${block.content}]`
      );
    });
    return restoredText;
  };
  
  // Render content with properly restored function blocks
  const renderContent = (text: string) => {
    const restoredText = restoreFunctionBlocks(text);
    return <MarkdownContent content={restoredText} className="text-[#222]" />;
  };

  return (
    <div>
      {renderedText && renderContent(renderedText)}
      {(currentTyping || (!isPlaying && pausedTextRef.current)) && (
        <span className="text-[#222]">
          {!isPlaying ? pausedTextRef.current : currentTyping}
        </span>
      )}
      {isPlaying && <span ref={el} className="text-[#222]" />}
    </div>
  );
};

export default StreamingText;