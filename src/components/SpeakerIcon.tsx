import React from 'react';
import { Bot, Palette } from 'lucide-react';

interface SpeakerIconProps {
  speaker: string;
  className?: string;
}

const SpeakerIcon: React.FC<SpeakerIconProps> = ({ speaker, className = '' }) => {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {speaker === 'Human' ? <Palette size={14} /> : <Bot size={14} />}
      {speaker}
    </span>
  );
};

export default SpeakerIcon;