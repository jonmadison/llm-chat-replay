import React, { useState, useEffect, useRef } from 'react'
import { PlayIcon, PauseIcon, Rewind, FastForward, Upload } from 'lucide-react'
import MarkdownContent from './components/MarkdownContent'
import StreamingText from './components/StreamingText'
import SpeakerIcon from './components/SpeakerIcon'
import './markdown.css'

interface Message {
  speaker: string;
  content: string;
  isVisible: boolean;
  isComplete?: boolean;
}

const App = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [progress, setProgress] = useState(0);
  const [hasTranscript, setHasTranscript] = useState(false);
  const [subtitle, setSubtitle] = useState('Drop a markdown file to play');
  const [isDragging, setIsDragging] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userScrolledRef = useRef(false);

  const scrollToBottom = () => {
    if (chatContainerRef.current && !userScrolledRef.current) {
      const container = chatContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;
      const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight <= 2;
      userScrolledRef.current = !isAtBottom;
    }
  };

  const clearPlayback = () => {
    setMessages(prev => prev.map(msg => ({ 
      ...msg, 
      isVisible: false,
      isComplete: false 
    })));
    setCurrentMessageIndex(0);
    setProgress(0);
    setIsPlaying(false);
    userScrolledRef.current = false;
  };

  const resetAll = () => {
    setMessages([]);
    setCurrentMessageIndex(0);
    setProgress(0);
    setIsPlaying(false);
    setHasTranscript(false);
    setSubtitle('Drop a markdown file to play');
    userScrolledRef.current = false;
  };

  const parseTranscript = (text: string) => {
    const parsedMessages: Message[] = [];
    const humanMsgs = text.split('**Human**:');
    
    const lines = text.split('\n');
    if (lines.length > 0) {
      const potentialTitle = lines[0].trim();
      if (potentialTitle) {
        setSubtitle(potentialTitle.replace(/^#+\s*/, ''));
      }
    }
    
    humanMsgs.slice(1).forEach(chunk => {
      const parts = chunk.split('**Assistant**:');
      if (parts.length === 2) {
        parsedMessages.push({
          speaker: 'Human',
          content: parts[0].trim(),
          isVisible: false,
          isComplete: false
        });
        
        parsedMessages.push({
          speaker: 'Assistant',
          content: parts[1].split('**Human**:')[0].trim(),
          isVisible: false,
          isComplete: false
        });
      }
    });

    setMessages(parsedMessages);
    setHasTranscript(true);
    clearPlayback();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.md')) {
      const text = await file.text();
      parseTranscript(text);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.md')) {
      const text = await file.text();
      parseTranscript(text);
    }
  };

  useEffect(() => {
    if (isPlaying && currentMessageIndex < messages.length) {
      const currentMessage = messages[currentMessageIndex];
      
      setMessages(prev => prev.map((msg, idx) => 
        idx === currentMessageIndex ? { ...msg, isVisible: true } : msg
      ));

      if (currentMessage.speaker === 'Human') {
        setTimeout(() => {
          setMessages(prev => prev.map((msg, idx) => 
            idx === currentMessageIndex ? { ...msg, isComplete: true } : msg
          ));
          setCurrentMessageIndex(prev => prev + 1);
          scrollToBottom();
        }, 500 / playbackSpeed);
      }
    }
  }, [isPlaying, currentMessageIndex, messages.length, playbackSpeed]);

  const handleMessageComplete = () => {
    setMessages(prev => prev.map((msg, idx) => 
      idx === currentMessageIndex ? { ...msg, isComplete: true } : msg
    ));
    setCurrentMessageIndex(prev => prev + 1);
    scrollToBottom();
  };

  const togglePlayback = () => {
    if (!isPlaying) {
      userScrolledRef.current = false;
    }
    setIsPlaying(!isPlaying);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseInt(e.target.value);
    const newIndex = Math.floor((newProgress / 100) * messages.length);
    setCurrentMessageIndex(newIndex);
    setIsPlaying(false);
    userScrolledRef.current = false;
    setMessages(prev => prev.map((msg, idx) => ({ 
      ...msg, 
      isVisible: idx < newIndex,
      isComplete: idx < newIndex
    })));
    setTimeout(scrollToBottom, 0);
  };

  useEffect(() => {
    if (messages.length > 0) {
      setProgress((currentMessageIndex / messages.length) * 100);
    }
  }, [currentMessageIndex, messages.length]);

  return (
    <div className="min-h-screen bg-[#668092] font-libre">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-neutral-50 text-xl font-medium">Chat Replay</h1>
            <p className="text-neutral-200 text-sm">{subtitle}</p>
          </div>
          {hasTranscript && (
            <button 
              className="px-3 py-1.5 text-sm bg-[#FF9CA6] hover:bg-[#FF9CA6]/80 text-[#222] rounded"
              onClick={resetAll}
            >
              Reset
            </button>
          )}
        </div>

        <div 
          ref={chatContainerRef}
          onScroll={handleScroll}
          className={`h-[600px] rounded-lg border border-[#2E3941] bg-[#2E3941] overflow-y-auto mb-4 relative
            ${!hasTranscript ? 'flex items-center justify-center' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleFileDrop}
        >
          {isDragging && !hasTranscript && (
            <div className="absolute inset-0 bg-emerald-500/20 border-2 border-dashed border-emerald-500 rounded-lg pointer-events-none" />
          )}
          {!hasTranscript ? (
            <div className="text-center">
              <input
                type="file"
                accept=".md"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileSelect}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-3 text-neutral-400 hover:text-neutral-300"
              >
                <Upload size={48} />
                <span>Drop markdown file here or click to browse</span>
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-4 pb-20">
              {messages.map((message, index) => (
                message.isVisible && (
                  <div
                    key={index}
                    className={`flex ${message.speaker === "Human" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-chat px-6 py-3 ${
                        message.speaker === "Human"
                          ? "bg-[#ddd] text-[#222]"
                          : "bg-[#9EECFF] text-[#222]"
                      }`}
                    >
                      <div className={`text-xs mb-1 font-medium ${
                        message.speaker === "Human" ? "text-[#222]/70" : "text-[#222]/70"
                      }`}>
                        <SpeakerIcon speaker={message.speaker} />
                      </div>
                      {message.speaker === "Human" || message.isComplete ? (
                        <MarkdownContent 
                          content={message.content}
                          className="text-[#222]"
                        />
                      ) : (
                        <StreamingText 
                          content={message.content}
                          onComplete={handleMessageComplete}
                          speed={playbackSpeed}
                          isPlaying={isPlaying}
                        />
                      )}
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>

        {hasTranscript && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={progress || 0}
                onChange={handleProgressChange}
                className="flex-grow h-1 bg-[#2E3941] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none"
              />
            </div>

            <div className="flex justify-center items-center gap-4">
              <button 
                onClick={() => handleSpeedChange(Math.max(0.5, playbackSpeed / 2))}
                className="p-2 text-neutral-200 hover:text-white disabled:opacity-50"
                disabled={playbackSpeed <= 0.5}
              >
                <Rewind size={20} />
              </button>

              <button
                onClick={togglePlayback}
                className="px-6 py-2 bg-[#2E3941] hover:bg-[#3a4950] text-white rounded-md flex items-center gap-2"
              >
                {isPlaying ? (
                  <>
                    <PauseIcon size={16} />
                    Pause
                  </>
                ) : (
                  <>
                    <PlayIcon size={16} />
                    Play
                  </>
                )}
              </button>

              <button 
                onClick={() => handleSpeedChange(Math.min(4, playbackSpeed * 2))}
                className="p-2 text-neutral-200 hover:text-white disabled:opacity-50"
                disabled={playbackSpeed >= 4}
              >
                <FastForward size={20} />
              </button>
            </div>

            <div className="flex justify-center">
              <span className="text-neutral-200 text-sm">
                Speed: {playbackSpeed}x
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App