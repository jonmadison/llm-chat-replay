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
  const sentences = useRef(content.match(/[^.!?]+[.!?]+/g) || [content]);
  const pausedTextRef = useRef('');

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

    if (el.current) {
      typed.current = new Typed(el.current, {
        strings: [sentences.current[currentIndex]],
        typeSpeed: 20 / speed,
        showCursor: true,
        cursorChar: '▋',
        onComplete: () => {
          if (typed.current) {
            typed.current.destroy();
          }
          setRenderedText(prev => prev + sentences.current[currentIndex]);
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

  return (
    <div>
      <MarkdownContent content={renderedText} className="text-[#222]" />
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