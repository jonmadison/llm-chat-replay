import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FunctionBlockProps {
  type: 'call' | 'result';
  content: string;
}

const FunctionBlock: React.FC<FunctionBlockProps> = ({ type, content }) => {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="my-2 rounded-md overflow-hidden border border-gray-300">
      <button
        onClick={toggleExpand}
        className={`w-full px-3 py-2 text-left flex justify-between items-center text-xs font-mono ${
          type === 'call' 
            ? 'bg-gray-50 text-gray-500' 
            : 'bg-green-50 text-green-600'
        }`}
      >
        <span>
          {type === 'call' ? 'View function call' : 'View function result'}
        </span>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      
      {expanded && (
        <pre className="p-3 bg-gray-800 text-gray-300 text-xs overflow-x-auto max-h-[400px] overflow-y-auto">
          <code>{content}</code>
        </pre>
      )}
    </div>
  );
};

export default FunctionBlock;
