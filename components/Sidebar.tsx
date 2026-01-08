
import React from 'react';
import { TestType } from '../types';
import { BookOpen, PenTool, Type, FileText, ListOrdered, MessageCircle, Book, Languages, ScanText, Highlighter, Search, ScrollText } from 'lucide-react';
import { VOCAB_HIGHLIGHT_OPTIONS, CEFR_COLORS } from '../constants';

interface SidebarProps {
  currentTab: TestType;
  onTabChange: (tab: TestType) => void;
  generatedStatus: Record<TestType, boolean>;
  highlightedLevels?: string[];
  onToggleHighlightLevel?: (level: string) => void;
  showKeywords?: boolean;
  onToggleKeywords?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  onTabChange, 
  generatedStatus, 
  highlightedLevels = [],
  onToggleHighlightLevel,
  showKeywords = false,
  onToggleKeywords
}) => {
  const tabs = [
    { id: TestType.VOCABULARY, label: 'Vocabulary', icon: <Type size={18} /> },
    { id: TestType.WORDLIST, label: 'WordList', icon: <ScrollText size={18} /> },
    { id: TestType.GRAMMAR, label: 'Grammar', icon: <PenTool size={18} /> },
    { id: TestType.COMMUNICATION, label: 'Communication', icon: <MessageCircle size={18} /> },
    { id: TestType.READING, label: 'Reading', icon: <BookOpen size={18} /> },
    { id: TestType.REWRITING, label: 'Rewriting', icon: <FileText size={18} /> },
    { id: TestType.ARRANGEMENT, label: 'Arrangement', icon: <ListOrdered size={18} /> },
    { id: TestType.DICTIONARY, label: 'Dictionary', icon: <Book size={18} /> },
    { id: TestType.TRANSLATE, label: 'Translate', icon: <Languages size={18} /> },
    { id: TestType.CEFR_CHECK, label: 'CEFR Check', icon: <ScanText size={18} /> },
  ];

  const showHighlightControls = currentTab === TestType.READING || currentTab === TestType.CEFR_CHECK;

  return (
    <div className="w-64 bg-mono-50 border-r border-mono-200 h-full flex flex-col pt-6 flex-shrink-0">
      <div className="px-6 mb-8">
        <h1 className="text-xl font-bold text-mono-900 tracking-tight font-serif">Trợ lý Nam Mini</h1>
        <p className="text-xs text-mono-500 mt-1 uppercase tracking-wider">SDT: 0968584858</p>
      </div>
      
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar pb-4">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const isGenerated = generatedStatus[tab.id];
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                w-full flex items-center justify-between px-3 py-3 text-sm font-medium rounded-md transition-all duration-200
                ${isActive 
                  ? 'bg-mono-800 text-white shadow-md' 
                  : 'text-mono-600 hover:bg-mono-200 hover:text-mono-900'}
              `}
            >
              <div className="flex items-center">
                <span className={`mr-3 ${isActive ? 'text-mono-300' : 'text-mono-400'}`}>
                  {tab.icon}
                </span>
                {tab.label}
              </div>
              {isGenerated && !isActive && (
                <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
              )}
            </button>
          );
        })}

        {/* Highlight Levels Section (Reading & CEFR Check) */}
        {showHighlightControls && onToggleHighlightLevel && (
          <div className="mt-6 px-1 animate-fade-in border-t border-mono-200 pt-4">
             {/* Keywords Toggle */}
             {onToggleKeywords && currentTab === TestType.READING && (
               <button
                 onClick={onToggleKeywords}
                 className={`
                   w-full flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wide rounded mb-4 transition-colors
                   ${showKeywords
                     ? 'bg-green-100 text-green-800 border border-green-200' 
                     : 'bg-white text-mono-500 border border-mono-200 hover:bg-mono-50'}
                 `}
               >
                 <div className="flex items-center">
                   <Search className="w-3 h-3 mr-2" />
                   Highlight Keywords
                 </div>
                 {showKeywords && <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>}
               </button>
             )}

             <div className="flex items-center px-3 mb-3 text-xs font-semibold text-mono-500 uppercase tracking-wider">
                <Highlighter className="w-3 h-3 mr-2" />
                Level Highlights
             </div>
             <div className="grid grid-cols-2 gap-2 px-1">
                {VOCAB_HIGHLIGHT_OPTIONS.map(lvl => {
                   const isActive = highlightedLevels.includes(lvl);
                   const textSize = lvl.length > 3 ? 'text-[10px]' : 'text-xs';
                   
                   return (
                      <button
                        key={lvl}
                        onClick={() => onToggleHighlightLevel(lvl)}
                        className={`
                          flex items-center justify-center py-1.5 font-bold rounded border transition-all duration-200 ${textSize}
                          ${isActive ? CEFR_COLORS[lvl] + ' shadow-sm ring-1 ring-offset-1 ring-mono-200' : 'bg-white text-mono-400 border-mono-200 hover:bg-mono-50'}
                        `}
                      >
                        {lvl}
                      </button>
                   );
                })}
             </div>
          </div>
        )}
      </nav>
      
      <div className="p-4 border-t border-mono-200 bg-white flex-shrink-0">
        <div className="text-xs text-mono-400 text-center pt-1">
          &copy; 2024 Trợ lý Nam Mini
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
