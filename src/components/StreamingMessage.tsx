import React, { useEffect, useRef } from 'react';
import Typed from 'typed.js';
import MarkdownContent from './MarkdownContent';

interface StreamingMessageProps {
  content: string;
  onComplete: () => void;
  typeSpeed?: number;
  className?: string;
}

const StreamingMessage: React.FC<StreamingMessageProps> = ({ 
  content, 
  onComplete, 
  typeSpeed = 20,
  className = '' 
}) => {
  const messageRef = useRef<HTMLDivElement>(null);
  const typedRef = useRef<Typed | null>(null);

  useEffect(() => {
    if (messageRef.current) {
      // Create placeholder for typing
      const placeholderSpan = document.createElement('span');
      messageRef.current.innerHTML = '';
      messageRef.current.appendChild(placeholderSpan);

      // Initialize Typed instance
      typedRef.current = new Typed(placeholderSpan, {
        strings: [content],
        typeSpeed: typeSpeed,
        cursorChar: '▋',
        onComplete: (self) => {
          // Replace typed content with markdown rendered content
          if (messageRef.current) {
            messageRef.current.innerHTML = '';
            const markdownDiv = document.createElement('div');
            markdownDiv.className = className;
            messageRef.current.appendChild(markdownDiv);
            
            // Use our MarkdownContent component's logic
            const { marked } = require('marked');
            marked.setOptions({ breaks: true, gfm: true });
            markdownDiv.innerHTML = marked(content);
          }
          onComplete();
        }
      });
    }

    return () => {
      if (typedRef.current) {
        typedRef.current.destroy();
      }
    };
  }, [content, typeSpeed, onComplete, className]);

  return <div ref={messageRef} />;
};

export default StreamingMessage;