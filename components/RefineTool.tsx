import React, { useState } from 'react';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';

interface RefineToolProps {
  onRefine: (instruction: string) => Promise<void>;
  isProcessing: boolean;
  disabled: boolean;
}

const RefineTool: React.FC<RefineToolProps> = ({ onRefine, isProcessing, disabled }) => {
  const [instruction, setInstruction] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (instruction.trim() && !isProcessing) {
      onRefine(instruction);
      setInstruction('');
    }
  };

  return (
    <div className="bg-mono-50 border-t border-mono-200 p-4 sticky bottom-0 z-10">
      <form onSubmit={handleSubmit} className="flex items-center space-x-3 max-w-5xl mx-auto">
        <div className="flex-shrink-0">
          <div className="bg-mono-200 p-2 rounded-full">
            <Sparkles className="h-5 w-5 text-mono-600" />
          </div>
        </div>
        <div className="flex-1 relative">
          <input
            type="text"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            disabled={disabled || isProcessing}
            placeholder={disabled ? "Generate content first to use AI Refine..." : "AI Refine: e.g., 'Make the questions harder', 'Add 5 more items', 'Focus on synonyms'..."}
            className="block w-full pl-4 pr-12 py-3 border border-mono-300 rounded-full leading-5 bg-white text-mono-900 placeholder-mono-400 focus:outline-none focus:ring-2 focus:ring-mono-900 focus:border-transparent transition-shadow shadow-sm disabled:bg-mono-100 disabled:text-mono-400"
          />
          <button
            type="submit"
            disabled={!instruction.trim() || isProcessing || disabled}
            className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-mono-900 hover:bg-mono-800 text-white rounded-full flex items-center justify-center transition-colors disabled:bg-mono-300 disabled:cursor-not-allowed"
          >
             {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RefineTool;