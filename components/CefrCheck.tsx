
import React, { useState } from 'react';
import { Loader2, ArrowRight, RefreshCw, Eraser, Info, Edit, Table } from 'lucide-react';
import { analyzeCefrLevels } from '../services/geminiService';
import { CEFR_HIGHLIGHT_COLORS, CEFR_COLORS } from '../constants';

interface CefrCheckProps {
  highlightedLevels: string[];
}

interface AnalyzedWord {
  field: string;
  word: string;
  form: string;
  level: string;
  meaning: string;
  synonyms: string; // "word (level), word (level)"
  antonyms: string; // "word (level), word (level)"
}

const CefrCheck: React.FC<CefrCheckProps> = ({ highlightedLevels }) => {
  const [input, setInput] = useState('');
  // analyzedData is now an array of complex objects
  const [analyzedData, setAnalyzedData] = useState<AnalyzedWord[] | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showInput, setShowInput] = useState(true);
  const [hoverPopup, setHoverPopup] = useState<{x: number, y: number, text: string, level: string} | null>(null);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setIsAnalyzing(true);
    setAnalyzedData(null); 
    
    try {
      const result = await analyzeCefrLevels(input);
      if (result && result.length > 0) {
        setAnalyzedData(result);
        setShowInput(false);
      } else {
         // Graceful fallback if AI fails or finds no words
         alert("Analysis complete but no suitable vocabulary was identified. Try a longer or more complex text.");
      }
    } catch (error) {
      console.error("UI Analysis Error:", error);
      alert("An error occurred. If your text is very long, try analyzing it in smaller chunks.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderAnalyzedText = () => {
    if (!analyzedData) return null;
    
    /**
     * Highlighting Strategy:
     * 1. Sort identified terms by length (descending) to match longer phrases first.
     * 2. Build a regex that matches any of the active terms.
     * 3. Split the text and render matching parts with highlights.
     */
    const activeTerms = analyzedData.filter(item => {
      const isLevelMatch = highlightedLevels.includes(item.level);
      const isFormMatch = highlightedLevels.some(l => l.toLowerCase() === item.form.toLowerCase());
      return isLevelMatch || isFormMatch;
    }).sort((a, b) => b.word.length - a.word.length);

    if (activeTerms.length === 0) {
      return <div className="leading-relaxed text-lg text-justify font-serif text-mono-800 whitespace-pre-wrap mb-8">{input}</div>;
    }

    // Escape special chars and join with OR
    const regexPattern = activeTerms.map(t => t.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const regex = new RegExp(`(\\b(?:${regexPattern})\\b)`, 'gi');
    
    const parts = input.split(regex);
    
    // Create lookup for normalized words
    const termMap = new Map<string, AnalyzedWord>();
    activeTerms.forEach(t => termMap.set(t.word.toLowerCase(), t));

    return (
      <div className="leading-relaxed text-lg text-justify font-serif text-mono-800 whitespace-pre-wrap mb-8">
        {parts.map((part, i) => {
          const lower = part.toLowerCase();
          const item = termMap.get(lower);
          
          if (item) {
              const translation = item.meaning || 'No translation';
              const colorClass = CEFR_HIGHLIGHT_COLORS[item.form] || CEFR_HIGHLIGHT_COLORS[item.level] || 'bg-yellow-300';

              return (
                <span 
                    key={i}
                    className={`${colorClass} rounded px-1 cursor-help border-b border-transparent hover:border-mono-900 transition-all shadow-sm box-decoration-clone inline-block`}
                    onMouseEnter={(e) => {
                       const rect = e.currentTarget.getBoundingClientRect();
                       setHoverPopup({
                          x: rect.left + (rect.width / 2),
                          y: rect.top - 8,
                          text: translation,
                          level: item.level
                       });
                    }}
                    onMouseLeave={() => setHoverPopup(null)}
                >
                    {part}
                </span>
              );
          }
          
          return <span key={i}>{part}</span>;
        })}
      </div>
    );
  };

  const renderAnalysisTable = () => {
    if (!analyzedData || analyzedData.length === 0) return null;

    const levelOrder: Record<string, number> = { 'C2': 6, 'C1': 5, 'B2': 4, 'B1': 3, 'A2': 2, 'A1': 1 };
    const getLevelVal = (l: string) => levelOrder[l] || 0;

    const sortedData = [...analyzedData].sort((a, b) => {
        // Sort by Level Descending (C2 -> B1)
        const diff = getLevelVal(b.level) - getLevelVal(a.level);
        if (diff !== 0) return diff;
        // Then by Field
        return a.field.localeCompare(b.field);
    });

    return (
      <div className="mt-8 border-t border-mono-200 pt-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-mono-500 mb-6 flex items-center">
          <Table className="w-4 h-4 mr-2" />
          Detailed Vocabulary Analysis
        </h3>
        
        <div className="overflow-x-auto rounded-lg border border-mono-200 shadow-sm">
          <table className="min-w-full divide-y divide-mono-200">
            <thead className="bg-mono-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-mono-500 uppercase tracking-wider w-24">Field</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-mono-500 uppercase tracking-wider w-32">Word/Expression</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-mono-500 uppercase tracking-wider w-24">Form</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-mono-500 uppercase tracking-wider w-16">Level</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-mono-500 uppercase tracking-wider w-40">Meaning (VN)</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-mono-500 uppercase tracking-wider w-48">Closest (Synonyms)</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-mono-500 uppercase tracking-wider w-48">Opposite (Antonyms)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-mono-200">
              {sortedData.map((row, idx) => {
                const badgeColor = CEFR_COLORS[row.level] || CEFR_COLORS[row.form] || 'bg-gray-100 text-gray-800';
                
                return (
                  <tr key={idx} className="hover:bg-mono-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-mono-600 font-medium">{row.field}</td>
                    <td className="px-4 py-3 text-sm font-bold text-mono-900">{row.word}</td>
                    <td className="px-4 py-3 text-xs text-mono-500 italic">{row.form}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                       <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${badgeColor}`}>
                         {row.level}
                       </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-mono-800">{row.meaning}</td>
                    <td className="px-4 py-3 text-xs text-mono-600 leading-snug">{row.synonyms}</td>
                    <td className="px-4 py-3 text-xs text-mono-600 leading-snug">{row.antonyms}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
     <div className="flex-1 flex flex-col h-full bg-white p-6 overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
           <div>
              <h2 className="text-2xl font-bold text-mono-900 font-serif">CEFR Level Checker</h2>
              <p className="text-sm text-mono-500 mt-1">Identify academic words, collocations, idioms, and phrasal verbs across CEFR levels.</p>
           </div>
        </div>

        <div className="flex-1 flex flex-col relative overflow-hidden">
            {/* Input Area - Conditionally Shown/Hidden */}
            {(!analyzedData || showInput) && (
              <div className={`flex flex-col transition-all duration-300 ${analyzedData ? 'h-1/3 mb-4 shrink-0' : 'h-full'}`}>
                 <div className="flex-1 relative">
                   <textarea
                     className="w-full h-full p-4 border border-mono-300 rounded-lg resize-none focus:ring-2 focus:ring-mono-900 focus:border-transparent font-mono text-sm shadow-sm"
                     placeholder="Paste your text here to analyze..."
                     value={input}
                     onChange={(e) => setInput(e.target.value)}
                   />
                   {input.length > 0 && !analyzedData && (
                      <div className="absolute bottom-4 right-4 text-xs text-mono-400 bg-white/80 px-2 py-1 rounded">
                         {input.split(/\s+/).filter(w => w.length > 0).length} words
                      </div>
                   )}
                 </div>
                 
                 <div className="mt-4 flex space-x-3">
                    <button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing || !input.trim()}
                      className="flex-1 flex items-center justify-center px-4 py-2.5 bg-mono-900 text-white rounded-md font-medium hover:bg-mono-800 disabled:bg-mono-300 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
                    >
                       {isAnalyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                       Analyze Text
                    </button>
                    <button
                       onClick={() => {
                          setInput('');
                          setAnalyzedData(null);
                          setShowInput(true);
                       }}
                       className="px-4 py-2.5 border border-mono-300 text-mono-600 rounded-md hover:bg-mono-50 transition-colors"
                       title="Clear All"
                    >
                       <Eraser className="w-4 h-4" />
                    </button>
                    {analyzedData && (
                      <button
                        onClick={() => setShowInput(false)}
                        className="px-4 py-2.5 bg-mono-100 text-mono-600 rounded-md hover:bg-mono-200 transition-colors"
                      >
                        Hide Input
                      </button>
                    )}
                 </div>
              </div>
            )}

            {/* Output Area */}
            {analyzedData && !showInput && (
              <div className="flex items-center justify-between mb-2 animate-fade-in">
                  <div className="text-xs text-mono-500 font-medium">
                     Analysis Result ({analyzedData.length} terms identified)
                  </div>
                  <button 
                    onClick={() => setShowInput(true)}
                    className="flex items-center text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-3 py-1.5 rounded-full"
                  >
                    <Edit className="w-3 h-3 mr-1.5" />
                    Edit Input
                  </button>
              </div>
            )}

            {analyzedData && (
               <div className={`flex-1 flex flex-col min-h-0 bg-mono-50 border border-mono-200 rounded-lg relative animate-fade-in shadow-inner ${showInput ? 'border-t-4 border-t-mono-200' : ''}`}>
                  {!showInput && (
                    <div className="absolute top-4 right-4 z-10">
                       <button 
                          onClick={handleAnalyze} 
                          className="p-2 bg-white rounded-full shadow-sm border border-mono-200 text-mono-500 hover:text-mono-900 transition-colors"
                          title="Re-analyze"
                       >
                          <RefreshCw className="w-4 h-4" />
                       </button>
                    </div>
                  )}

                  <div className="flex-1 p-8 overflow-y-auto custom-scrollbar relative">
                     {renderAnalyzedText()}
                     {renderAnalysisTable()}
                  </div>
                  
                  <div className="p-3 bg-white border-t border-mono-200 text-xs text-mono-500 flex items-center justify-center flex-shrink-0">
                     <Info className="w-3 h-3 mr-1.5" />
                     Hover over highlighted text for meanings. Table provides comprehensive breakdown of academic words, idioms, and phrases.
                  </div>
               </div>
            )}
        </div>

        {/* --- Hover Translation Tooltip --- */}
        {hoverPopup && (
            <div 
               className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 animate-fade-in"
               style={{ top: hoverPopup.y, left: hoverPopup.x }}
            >
               <div className="bg-blue-800 border border-blue-700 shadow-xl rounded-md px-3 py-2 text-xs min-w-[120px]">
                  <div className="flex items-center space-x-2 mb-1.5 border-b border-blue-700 pb-1">
                     <span className={`font-bold px-1.5 rounded text-[10px] text-white ${CEFR_HIGHLIGHT_COLORS[hoverPopup.level]?.split(' ')[0] || 'bg-gray-500'}`}>
                        {hoverPopup.level}
                     </span>
                     <span className="font-semibold text-blue-200 uppercase text-[10px] tracking-wide">VN Meaning</span>
                  </div>
                  <div className="text-yellow-300 font-serif text-sm font-medium">
                     {hoverPopup.text}
                  </div>
               </div>
               <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-[4px] rotate-45 w-2 h-2 bg-blue-800 border-r border-b border-blue-700"></div>
            </div>
        )}
     </div>
  );
};

export default CefrCheck;
