import React, { useState, useEffect, useRef } from 'react'
import { PlayIcon, PauseIcon, Rewind, FastForward, Upload, SkipBack, SkipForward } from 'lucide-react'
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
    const lines = text.split('\n');
    
    // Check for a specific "#Title:" format first
    const titleMatch = text.match(/^#\s*Title:\s*(.+?)$/m);
    if (titleMatch && titleMatch[1]) {
      setSubtitle(titleMatch[1].trim());
    } else {
      // Fall back to using the first message if no specific title is found
      const humanMsgMatch = text.match(/\*\*Human\*\*:\s*(.+?)(?=\n|$)/s);
      if (humanMsgMatch && humanMsgMatch[1]) {
        setSubtitle(humanMsgMatch[1].trim());
      } else if (lines.length > 0) {
        // If all else fails, use the first line as before
        const potentialTitle = lines[0].trim();
        if (potentialTitle) {
          setSubtitle(potentialTitle.replace(/^#+\s*/, ''));
        }
      }
    }
    
    // Track code block state to ignore Human/Assistant tags inside code blocks
    let inCodeBlock = false;
    let currentMessage: Message | null = null;
    let buffer = '';
    
    // Process the file line by line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for code block markers (backticks)
      if (line.trim().startsWith('```') || line.trim().match(/^`{3,}[^`]*$/)) {
        inCodeBlock = !inCodeBlock;
        buffer += line + '\n';
        continue;
      }
      
      // Process message markers only if not in a code block
      if (!inCodeBlock) {
        if (line.trim().startsWith('**Human**:')) {
          // If we have a previous message, save it before starting a new one
          if (currentMessage) {
            currentMessage.content = buffer.trim();
            parsedMessages.push(currentMessage);
          }
          
          // Start a new Human message
          currentMessage = {
            speaker: 'Human',
            content: '',
            isVisible: false,
            isComplete: false
          };
          
          // Extract content after the speaker marker
          buffer = line.replace(/^\s*\*\*Human\*\*:\s*/, '') + '\n';
          continue;
        }
        
        if (line.trim().startsWith('**Assistant**:')) {
          // If we have a previous message, save it before starting a new one
          if (currentMessage) {
            currentMessage.content = buffer.trim();
            parsedMessages.push(currentMessage);
          }
          
          // Start a new Assistant message
          currentMessage = {
            speaker: 'Assistant',
            content: '',
            isVisible: false,
            isComplete: false
          };
          
          // Extract content after the speaker marker
          buffer = line.replace(/^\s*\*\*Assistant\*\*:\s*/, '') + '\n';
          continue;
        }
      }
      
      // Add the line to the current buffer
      buffer += line + '\n';
    }
    
    // Add the last message if there is one
    if (currentMessage) {
      currentMessage.content = buffer.trim();
      parsedMessages.push(currentMessage);
    }

    setMessages(parsedMessages);
    setHasTranscript(true);
    clearPlayback();
    
    // Auto-start by showing the first message if it exists
    if (parsedMessages.length > 0) {
      setMessages(prev => prev.map((msg, idx) => 
        idx === 0 ? { ...msg, isVisible: true } : msg
      ));
    }
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

  const jumpToStart = () => {
    setCurrentMessageIndex(0);
    setIsPlaying(false);
    userScrolledRef.current = false;
    setMessages(prev => prev.map(msg => ({ 
      ...msg, 
      isVisible: false,
      isComplete: false 
    })));
    setProgress(0);
    setTimeout(scrollToBottom, 0);
  };

  const jumpToEnd = () => {
    const lastIndex = messages.length;
    setCurrentMessageIndex(lastIndex);
    setIsPlaying(false);
    userScrolledRef.current = false;
    setMessages(prev => prev.map(msg => ({ 
      ...msg, 
      isVisible: true,
      isComplete: true 
    })));
    setProgress(100);
    setTimeout(scrollToBottom, 0);
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
    <div className="h-screen bg-[#eee] font-libre flex flex-col overflow-hidden">
      {/* Main layout container */}
      <div className="relative h-[95%] w-full max-w-4xl mx-auto pb-6">
        {/* Header  */}
        <div className="absolute top-0 left-0 right-0 h-24 z-10 pointer-events-none bg-gradient-to-b from-[#eee] via-[#eee]/80 to-[#eee]/20"></div>
        
        {/* Footer  */}
        <div className="absolute bottom-0 left-0 right-0 h-24 z-10 pointer-events-none bg-transparent"></div>
        
        {/* Navigation header */}
        <nav className="absolute top-0 left-0 right-0 z-20 pt-4 px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-neutral-600 text-xl font-medium">LLM Chat Replay</h1>
              <p className="text-neutral-600 text-sm">{subtitle}</p>
            </div>
            {hasTranscript && (
              <button 
                className="px-3 py-1.5 text-sm bg-gradient-to-b from-[#8FD7B4] to-[#8FD7B4]/60 rounded-xl shadow-sm hover:bg-[#8FD7B4]/10 text-[#222] h-10"
                onClick={resetAll}
              >
                New Transcript
              </button>
            )}
          </div>
        </nav>
        
        {/* Chat container */}
        <div 
          ref={chatContainerRef}
          onScroll={handleScroll}
          className={`absolute inset-0 overflow-y-auto px-8 ${!hasTranscript ? 'flex items-center justify-center' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleFileDrop}
          style={{ paddingTop: '110px', paddingBottom: '150px', maxHeight: '85vh' }}
        >
          {isDragging && !hasTranscript && (
            <div className="absolute inset-0 mt-16 mb-16 mx-4 bg-emerald-500/20 border-2 border-dashed border-emerald-500 rounded-lg pointer-events-none" />
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
            <div className="space-y-4">
              {messages.map((message, index) => (
                message.isVisible && (
                  <div
                    key={index}
                    className={`flex ${message.speaker === "Human" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-chat px-6 py-3 ${
                        message.speaker === "Human"
                          ? "shadow-md bg-gradient-to-b from-[#938ac1]/70 to-[#938ac1]/25 text-[#222]"
                          : "shadow-sm bg-gradient-to-b from-[#f59e0b]/20 to-yellow-400/50 text-[#222]"
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
        
        {/* Controls section */}
        {hasTranscript && (
          <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-8">
            <div className="bg-white/30 backdrop-blur-sm rounded-lg p-4 pt-6 max-w-xl mx-auto">
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress || 0}
                  onChange={handleProgressChange}
                  className="flex-grow h-1 bg-neutral-400 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-yellow-400 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none"
                />
              </div>
              <div className="flex justify-center items-center gap-4">
                <button 
                  onClick={jumpToStart}
                  className="p-2 text-neutral-600 hover:text-neutral-800"
                  aria-label="Skip to beginning"
                >
                  <SkipBack size={20} />
                </button>
                
                <button 
                  onClick={() => handleSpeedChange(Math.max(0.5, playbackSpeed / 2))}
                  className="p-2 text-neutral-600 hover:text-neutral-800 disabled:opacity-50"
                  disabled={playbackSpeed <= 0.5}
                >
                  <Rewind size={20} />
                </button>

                <button
                  onClick={togglePlayback}
                  className="px-6 py-2 bg-neutral-600 hover:bg-neutral-700 text-white rounded-md flex items-center gap-2"
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
                  className="p-2 text-neutral-600 hover:text-neutral-800 disabled:opacity-50"
                  disabled={playbackSpeed >= 4}
                >
                  <FastForward size={20} />
                </button>
                
                <button 
                  onClick={jumpToEnd}
                  className="p-2 text-neutral-600 hover:text-neutral-800"
                  aria-label="Skip to end"
                >
                  <SkipForward size={20} />
                </button>
              </div>

              <div className="flex justify-center mt-2">
                <span className="text-neutral-600 text-sm">
                  Speed: {playbackSpeed}x
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App