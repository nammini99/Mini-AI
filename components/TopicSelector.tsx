import React from 'react';
import { Search } from 'lucide-react';

interface TopicSelectorProps {
  value: string;
  onChange: (value: string) => void;
  context?: string;
  hideTrends?: boolean; // Kept for prop compatibility but unused
}

const TopicSelector: React.FC<TopicSelectorProps> = ({ value, onChange, context }) => {
  return (
    <div className="relative w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-mono-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-mono-300 rounded-md leading-5 bg-white text-mono-900 placeholder-mono-400 focus:outline-none focus:ring-1 focus:ring-mono-900 focus:border-mono-900 sm:text-sm transition-shadow shadow-sm"
          placeholder={context && context !== 'All' ? `Enter ${context} topic...` : "Enter topic..."}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default TopicSelector;