
import React from 'react';
import { Download, Check, Hash, Play, Loader2, ChevronUp, ChevronDown, Lock, Unlock, Settings, Info, Plus, Minus } from 'lucide-react';
import TopicSelector from './TopicSelector';
import LevelSelector from './LevelSelector';
import { LevelOption, TestType } from '../types';
import { READING_CLOZE_SUBTYPES, READING_CLOZE_ADVANCED_SUBTYPES, READING_COMP_SUBTYPES, READING_ANSWER_SUBTYPES, READING_TRUEFALSE_SUBTYPES, READING_MATCHING_SUBTYPES, READING_OPEN_GUIDED_SUBTYPES, COMMUNICATION_SUBTYPES, ARRANGEMENT_SUBTYPES, VOCAB_COLLOCATION_SUBTYPES, GRAMMAR_REORDER_SUBTYPES, READING_MIXED_SUBTYPES } from '../constants';

interface TopbarProps {
  currentTab: TestType;
  topic: string;
  onTopicChange: (val: string) => void;
  level: LevelOption;
  onLevelChange: (val: LevelOption) => void;
  onExport: () => void;
  canExport: boolean;
  
  // Generation
  onGenerate: () => void;
  isGenerating: boolean;
  canGenerate: boolean;
  
  // Grammar specific
  grammarCategory: string;
  onGrammarCategoryChange: (val: string) => void;
  grammarTestType?: string;
  onGrammarTestTypeChange?: (val: string) => void;
  grammarReorderConfig?: Record<string, number>;
  onGrammarReorderConfigChange?: (subtype: string, qty: number) => void;
  
  // Vocabulary specific
  vocabForm?: string;
  onVocabFormChange?: (val: string) => void;
  vocabCollocationConfig?: Record<string, number>;
  onVocabCollocationConfigChange?: (subtype: string, qty: number) => void;

  // Communication specific
  communicationConfig?: Record<string, number>;
  onCommunicationConfigChange?: (subtype: string, qty: number) => void;

  // Reading specific
  readingForm?: string;
  onReadingFormChange?: (val: string) => void;
  readingConfig?: Record<string, number>;
  onReadingConfigChange?: (subtype: string, qty: number) => void;
  readingVocabType?: string;
  onReadingVocabTypeChange?: (val: string) => void;

  // Arrangement specific
  arrangementConfig?: Record<string, number>;
  onArrangementConfigChange?: (subtype: string, qty: number) => void;

  // General/Grammar
  questionQuantity: number;
  onQuestionQuantityChange: (val: number) => void;

  // Multi-Test Generation
  numberOfTests: number;
  onNumberOfTestsChange: (val: number) => void;
  
  // Suggestions (Generic)
  suggestions?: string[];
  suggestionsLabel?: string;
  selectedSuggestions?: string[];
  onSuggestionClick?: (s: string) => void;

  // Collapsible / AutoHide Props
  isExpanded: boolean;
  onToggleExpand: () => void;
  isAutoHide: boolean;
  onToggleAutoHide: () => void;
}

const grammarCategories = [
  "All", 
  "Tenses", 
  "Verbs", 
  "Nouns & Articles", 
  "Adjectives & Adverbs", 
  "Prepositions", 
  "Conditionals", 
  "Passive Voice", 
  "Reported Speech", 
  "Modals", 
  "Sentence Structure"
];

const grammarTypes = [
  "Multiple Choice",
  "Sentence Transformation",
  "Rewrite 1",
  "Rewrite 2",
  "Reorder sentence"
];

const vocabForms = [
  "Word Choice",
  "Synonyms",
  "Antonyms",
  "Word Formation 1",
  "Word Formation 2",
  "Preposition",
  "Phrasal Verb",
  "Collocation",
  "Idiom"
];

const readingForms = [
  "Reading Comprehension",
  "Reading (Answer/True/False)",
  "Reading Cloze (Advertisement)",
  "Reading Cloze (Leaflet)",
  "Reading Cloze Advanced",
  "Reading Matching",
  "Reading Open-Guided"
];

// Pastel-ish colors for chips
const CHIP_COLORS = [
  "bg-red-50 text-red-700 border-red-100 hover:bg-red-100",
  "bg-orange-50 text-orange-700 border-orange-100 hover:bg-orange-100",
  "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100",
  "bg-green-50 text-green-700 border-green-100 hover:bg-green-100",
  "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100",
  "bg-teal-50 text-teal-700 border-teal-100 hover:bg-teal-100",
  "bg-cyan-50 text-cyan-700 border-cyan-100 hover:bg-cyan-100",
  "bg-sky-50 text-sky-700 border-sky-100 hover:bg-sky-100",
  "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100",
  "bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100",
  "bg-violet-50 text-violet-700 border-violet-100 hover:bg-violet-100",
  "bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100",
  "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100 hover:bg-fuchsia-100",
  "bg-pink-50 text-pink-700 border-pink-100 hover:bg-pink-100",
  "bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100",
];

const Topbar: React.FC<TopbarProps> = ({ 
  currentTab,
  topic, 
  onTopicChange, 
  level, 
  onLevelChange, 
  onExport, 
  canExport,
  onGenerate,
  isGenerating,
  canGenerate,
  grammarCategory,
  onGrammarCategoryChange,
  grammarTestType,
  onGrammarTestTypeChange,
  grammarReorderConfig,
  onGrammarReorderConfigChange,
  vocabForm,
  onVocabFormChange,
  vocabCollocationConfig,
  onVocabCollocationConfigChange,
  communicationConfig,
  onCommunicationConfigChange,
  readingForm,
  onReadingFormChange,
  readingConfig,
  onReadingConfigChange,
  readingVocabType,
  onReadingVocabTypeChange,
  arrangementConfig,
  onArrangementConfigChange,
  questionQuantity,
  onQuestionQuantityChange,
  numberOfTests,
  onNumberOfTestsChange,
  suggestions = [],
  suggestionsLabel = "Popular:",
  selectedSuggestions = [],
  onSuggestionClick,
  isExpanded,
  onToggleExpand,
  isAutoHide,
  onToggleAutoHide
}) => {
  // Determine modes
  const isReading = currentTab === TestType.READING;
  const isCommunication = currentTab === TestType.COMMUNICATION;
  const isArrangement = currentTab === TestType.ARRANGEMENT;
  const isVocabCollocation = currentTab === TestType.VOCABULARY && vocabForm === 'Collocation';
  const isGrammarReorder = currentTab === TestType.GRAMMAR && grammarTestType === 'Reorder sentence';
  const isWordList = currentTab === TestType.WORDLIST;
  
  // All Reading types are now configurable
  const isConfigurable = (isReading || isCommunication || isArrangement || isVocabCollocation || isGrammarReorder) && !isWordList;
  
  // Get subtypes based on Mode
  let activeSubtypes: Record<string, string> = {};
  let configValues: Record<string, number> = {};
  let onConfigChange: ((subtype: string, qty: number) => void) | undefined;

  if (isReading) {
      configValues = readingConfig || {};
      onConfigChange = onReadingConfigChange;
      if (readingForm === 'Reading Cloze Advanced') {
          activeSubtypes = READING_CLOZE_ADVANCED_SUBTYPES;
      } else if (readingForm?.startsWith('Reading Cloze')) {
          activeSubtypes = READING_CLOZE_SUBTYPES;
      } else if (readingForm === 'Reading Matching') {
          activeSubtypes = READING_MATCHING_SUBTYPES;
      } else if (readingForm === 'Reading Open-Guided') {
          activeSubtypes = READING_OPEN_GUIDED_SUBTYPES;
      } else if (readingForm === 'Reading (Answer/True/False)') {
          activeSubtypes = READING_MIXED_SUBTYPES;
      } else {
          activeSubtypes = READING_COMP_SUBTYPES;
      }
  } else if (isCommunication) {
      activeSubtypes = COMMUNICATION_SUBTYPES;
      configValues = communicationConfig || {};
      onConfigChange = onCommunicationConfigChange;
  } else if (isArrangement) {
      activeSubtypes = ARRANGEMENT_SUBTYPES;
      configValues = arrangementConfig || {};
      onConfigChange = onArrangementConfigChange;
  } else if (isVocabCollocation) {
      activeSubtypes = VOCAB_COLLOCATION_SUBTYPES;
      configValues = vocabCollocationConfig || {};
      onConfigChange = onVocabCollocationConfigChange;
  } else if (isGrammarReorder) {
      activeSubtypes = GRAMMAR_REORDER_SUBTYPES;
      configValues = grammarReorderConfig || {};
      onConfigChange = onGrammarReorderConfigChange;
  }

  // FIXED: Sum ONLY values of subtypes that are actually in activeSubtypes
  const totalQuantity = Object.keys(activeSubtypes).reduce((sum, key) => sum + (configValues[key] || 0), 0);

  return (
    <div className="bg-white border-b border-mono-200 flex flex-col flex-shrink-0 shadow-sm z-20 relative transition-all duration-300">
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
        {/* Top Row: Main Controls */}
        <div className="h-16 flex items-center justify-between px-6 space-x-4">
          <div className="flex items-center space-x-3 flex-1 overflow-x-auto no-scrollbar">
              {/* Topic Label */}
              <span className="text-sm font-medium text-mono-500 whitespace-nowrap">Topic</span>
              
              {/* Grammar Category Dropdown (Grammar Only) */}
              {currentTab === TestType.GRAMMAR && (
                <div className="w-36 flex-shrink-0">
                  <select
                    value={grammarCategory}
                    onChange={(e) => onGrammarCategoryChange(e.target.value)}
                    className="block w-full pl-3 pr-8 py-2 border border-mono-300 rounded-md leading-5 bg-white text-mono-900 focus:outline-none focus:ring-1 focus:ring-mono-900 focus:border-mono-900 sm:text-sm shadow-sm"
                  >
                    {grammarCategories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Topic Input */}
              <div className="flex-1 min-w-[200px] max-w-xl">
                <TopicSelector 
                  value={topic} 
                  onChange={onTopicChange} 
                  context={currentTab === TestType.GRAMMAR && grammarCategory !== 'All' ? grammarCategory : undefined}
                />
              </div>

              {/* Number/Quantity Input (Total) */}
              {(!isConfigurable || isWordList) && (
                <div className="flex items-center space-x-2">
                   <span className="text-xs font-medium text-mono-500 uppercase whitespace-nowrap">Number</span>
                    <div className="w-20 flex-shrink-0 relative group">
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-mono-400">
                          <Hash className="h-3 w-3" />
                        </div>
                        <input
                          type="number"
                          min="1"
                          max="200"
                          value={questionQuantity}
                          onChange={(e) => onQuestionQuantityChange(parseInt(e.target.value) || 0)}
                          className="block w-full pl-7 pr-2 py-2 border border-mono-300 rounded-md leading-5 bg-white text-mono-900 focus:outline-none focus:ring-1 focus:ring-mono-900 focus:border-mono-900 sm:text-sm shadow-sm"
                          title={isWordList ? "Number of words per level" : "Number of Questions"}
                        />
                    </div>
                </div>
              )}

              {/* Level Selector - Now visible for WordList too */}
              <div className="w-48 flex-shrink-0">
                  <LevelSelector value={level} onChange={onLevelChange} />
              </div>

              {!isWordList && (
                <>
                  {/* Reading Form Selector */}
                  {currentTab === TestType.READING && onReadingFormChange && (
                    <div className="w-56 flex-shrink-0">
                        <select
                          value={readingForm}
                          onChange={(e) => onReadingFormChange(e.target.value)}
                          className="block w-full pl-3 pr-8 py-2 border border-mono-300 rounded-md leading-5 bg-white text-mono-900 focus:outline-none focus:ring-1 focus:ring-mono-900 focus:border-mono-900 sm:text-sm shadow-sm font-medium"
                          title="Reading Test Format"
                        >
                          {readingForms.map((f) => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                    </div>
                  )}

                  {/* Test Type (Grammar Only) */}
                  {currentTab === TestType.GRAMMAR && onGrammarTestTypeChange && (
                    <div className="w-44 flex-shrink-0">
                      <select
                        value={grammarTestType}
                        onChange={(e) => onGrammarTestTypeChange(e.target.value)}
                        className="block w-full pl-3 pr-8 py-2 border border-mono-300 rounded-md leading-5 bg-white text-mono-900 focus:outline-none focus:ring-1 focus:ring-mono-900 focus:border-mono-900 sm:text-sm shadow-sm"
                        title="Grammar Test Format"
                      >
                        {grammarTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {/* Vocabulary Selectors */}
                  {currentTab === TestType.VOCABULARY && onVocabFormChange && (
                      <div className="w-44 flex-shrink-0">
                        <select
                          value={vocabForm}
                          onChange={(e) => onVocabFormChange(e.target.value)}
                          className="block w-full pl-3 pr-8 py-2 border border-mono-300 rounded-md leading-5 bg-white text-mono-900 focus:outline-none focus:ring-1 focus:ring-mono-900 focus:border-mono-900 sm:text-sm shadow-sm"
                          title="Question Form"
                        >
                          {vocabForms.map((f) => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                      </div>
                  )}
                </>
              )}
          </div>
          
          {/* Actions Buttons */}
          <div className="flex items-center space-x-2 pl-2 flex-shrink-0 border-l border-mono-200 ml-2">
            
            {/* Number of Tests Input - Hidden for WordList */}
            {!isWordList && (
              <div className="flex items-center space-x-1 mr-2" title="Number of distinct test versions to generate">
                  <span className="text-xs font-medium text-mono-500 uppercase">Tests</span>
                  <input 
                    type="number" 
                    min={1} 
                    max={5} 
                    value={numberOfTests}
                    onChange={(e) => onNumberOfTestsChange(Math.max(1, Math.min(5, parseInt(e.target.value) || 1)))}
                    className="w-12 py-1.5 px-2 text-center text-sm border border-mono-300 rounded-md focus:ring-1 focus:ring-mono-900 focus:border-mono-900"
                  />
              </div>
            )}

            <button
              onClick={onGenerate}
              disabled={!canGenerate || isGenerating}
              className={`
                flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm 
                transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mono-900
                ${!canGenerate || isGenerating
                  ? 'bg-mono-100 text-mono-400 cursor-not-allowed' 
                  : 'bg-mono-900 text-white hover:bg-mono-800'}
              `}
            >
              {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
              Generate
            </button>

            <button
              onClick={onExport}
              disabled={!canExport}
              className={`
                flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm border
                transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mono-900
                ${canExport 
                  ? 'bg-white border-mono-300 text-mono-700 hover:bg-mono-50' 
                  : 'bg-mono-50 border-mono-200 text-mono-300 cursor-not-allowed'}
              `}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Standard Suggestions Row (Generic) */}
        {suggestions.length > 0 && (
          <div className="px-6 pb-3 pt-1 animate-fade-in border-t border-mono-100 bg-mono-50/50">
            <div className="flex items-start space-x-3 overflow-x-auto pb-1 no-scrollbar">
              <span className="text-xs font-semibold text-mono-400 uppercase tracking-wide mt-2 flex-shrink-0">
                  {suggestionsLabel}
              </span>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((sug, idx) => {
                  const isSelected = selectedSuggestions.includes(sug);
                  const colorClass = CHIP_COLORS[idx % CHIP_COLORS.length];
                  
                  return (
                    <button
                      key={sug}
                      onClick={() => onSuggestionClick && onSuggestionClick(sug)}
                      className={`
                        group relative px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200
                        ${isSelected 
                          ? 'bg-mono-900 text-white border-mono-900 shadow-sm' 
                          : `${colorClass} opacity-80 hover:opacity-100`}
                      `}
                    >
                      <span className="flex items-center">
                        {isSelected && <Check className="w-3 h-3 mr-1" />}
                        {sug}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* CONFIGURATION PANEL */}
        {isConfigurable && (
          <div className="px-6 pb-6 pt-2 border-t border-mono-100 bg-mono-50/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Settings className="w-4 h-4 text-mono-500 mr-2" />
                <h3 className="text-sm font-semibold text-mono-700 uppercase tracking-wide">Configuration</h3>
                <span className="ml-2 text-xs text-mono-400 font-normal">
                  Configure question quantities for {isReading ? readingForm : isCommunication ? 'Conversation Types' : isArrangement ? 'Arrangement Types' : isVocabCollocation ? 'Collocation Types' : 'Reorder Types'}
                </span>
              </div>
              <div className="text-xs font-semibold text-mono-600 bg-white px-3 py-1 rounded-full border border-mono-200">
                Total Questions: <span className="text-mono-900">{totalQuantity}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
              {Object.entries(activeSubtypes).map(([subtype, description]) => {
                const qty = configValues[subtype] || 0;
                const isSelected = qty > 0;
                // Cast description to string to avoid ts error
                const descText = description as string;
                
                return (
                  <div 
                    key={subtype} 
                    className={`
                      group flex flex-col p-3 rounded-lg border transition-all duration-200
                      ${isSelected 
                        ? 'bg-white border-mono-400 shadow-sm' 
                        : 'bg-mono-50 border-mono-200 hover:border-mono-300'}
                    `}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${isSelected ? 'text-mono-900' : 'text-mono-500'}`}>
                        {subtype}
                      </span>
                      
                      {/* Quantity Control */}
                      <div className="flex items-center space-x-1 bg-white border border-mono-200 rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-mono-900">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onConfigChange && onConfigChange(subtype, Math.max(0, qty - 1));
                          }}
                          className="p-1 hover:bg-mono-100 text-mono-500 rounded-l-md active:bg-mono-200 transition-colors"
                          type="button"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          min="0"
                          max="99"
                          value={qty === 0 ? '' : qty}
                          placeholder="0"
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            onConfigChange && onConfigChange(subtype, isNaN(val) ? 0 : Math.max(0, val));
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className={`w-8 text-center text-xs font-bold bg-transparent border-none focus:outline-none focus:ring-0 p-0 appearance-none m-0 ${isSelected ? 'text-mono-900' : 'text-mono-400'}`}
                          style={{ MozAppearance: 'textfield' }}
                        />
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onConfigChange && onConfigChange(subtype, qty + 1);
                          }}
                          className="p-1 hover:bg-mono-100 text-mono-500 rounded-r-md active:bg-mono-200 transition-colors"
                          type="button"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                       <Info className={`w-3 h-3 mt-0.5 mr-1.5 flex-shrink-0 ${isSelected ? 'text-mono-400' : 'text-mono-300'}`} />
                       <p className={`text-xs leading-tight ${isSelected ? 'text-mono-600' : 'text-mono-400'}`}>
                         {descText}
                       </p>
                    </div>

                    {/* Subtype Specific Options: Vocabulary */}
                    {isSelected && isReading && subtype === 'Vocabulary' && readingForm === 'Reading Comprehension' && onReadingVocabTypeChange && (
                      <div className="mt-3 pt-2 border-t border-mono-100">
                        <label className="text-[10px] uppercase font-bold tracking-wide text-mono-400 mb-1 block">Mode:</label>
                        <select
                          value={readingVocabType}
                          onChange={(e) => onReadingVocabTypeChange(e.target.value)}
                          className="block w-full py-1 px-2 text-xs rounded border border-mono-200 bg-mono-50 text-mono-700 focus:ring-1 focus:ring-mono-500 focus:outline-none"
                        >
                          <option value="CLOSEST">Closest (Synonym)</option>
                          <option value="OPPOSITE">Opposite (Antonym)</option>
                          <option value="BOTH">Both</option>
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Resize/Toggle Handle */}
      <div 
        className="h-4 bg-white border-t border-mono-200 flex items-center justify-center cursor-pointer hover:bg-mono-50 group relative"
        onClick={onToggleExpand}
        title={isExpanded ? "Collapse Topbar" : "Expand Topbar"}
      >
        <div className="flex items-center justify-center w-full h-full">
           {isExpanded ? <ChevronUp className="w-3 h-3 text-mono-400 group-hover:text-mono-600" /> : <ChevronDown className="w-3 h-3 text-mono-400 group-hover:text-mono-600" />}
        </div>
        
        {/* Auto Hide Toggle (Right Side) */}
        <div 
          className="absolute right-4 flex items-center space-x-1 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onToggleAutoHide();
          }}
          title={isAutoHide ? "Disable Auto-Hide" : "Enable Auto-Hide"}
        >
          <span className={`text-[10px] uppercase font-bold tracking-wider ${isAutoHide ? 'text-green-600' : 'text-mono-400'}`}>
            {isAutoHide ? 'Auto' : 'Fixed'}
          </span>
          {isAutoHide 
             ? <Unlock className="w-3 h-3 text-mono-400" /> 
             : <Lock className="w-3 h-3 text-mono-400" />
          }
        </div>
      </div>
    </div>
  );
};

export default Topbar;
