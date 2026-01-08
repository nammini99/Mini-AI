
import React, { useState } from 'react';
import { Search, Loader2, Volume2, Bookmark, Info, List, CheckCircle, Book, Hash, MessageCircle, Copy, Check, Sparkles, CheckSquare, Square } from 'lucide-react';
import { lookupDictionary, DictionaryOptions } from '../services/geminiService';
import { CEFR_COLORS } from '../constants';

interface DictionaryProps {
  options: DictionaryOptions;
  onToggleOption: (key: 'phrases' | 'collocations' | 'idioms') => void;
}

const Dictionary: React.FC<DictionaryProps> = ({ options, onToggleOption }) => {
  const [word, setWord] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLookup = async () => {
    if (!word.trim()) return;
    setIsLoading(true);
    setResult(null);
    const data = await lookupDictionary(word, options);
    setResult(data);
    setIsLoading(false);
  };

  const handleCopyAll = () => {
    if (!result) return;
    let text = `${result.word.toUpperCase()} [${result.phonetic}]\n`;
    text += `Part of Speech: ${result.partOfSpeech}\n`;
    text += `Meaning: ${result.translation}\n`;
    text += `Definition: ${result.definition}\n\n`;
    
    if (result.prepositional_phrases?.length > 0) {
      text += "PREPOSITIONAL PHRASES:\n";
      result.prepositional_phrases.forEach((p: any) => text += `- ${p.phrase}: ${p.vn}\n`);
      text += "\n";
    }
    if (result.collocations?.length > 0) {
      text += "COLLOCATIONS:\n";
      result.collocations.forEach((c: any) => text += `- ${c.collocation}: ${c.vn}\n`);
      text += "\n";
    }
    if (result.idioms?.length > 0) {
      text += "IDIOMS:\n";
      result.idioms.forEach((i: any) => text += `- ${i.idiom}: ${i.vn}\n`);
      text += "\n";
    }
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderSection = (title: string, icon: React.ReactNode, list: any[], accentColor: string) => {
    if (!list || list.length === 0) return null;
    return (
      <div className="mb-10">
        <div className="flex items-center space-x-2 mb-4">
          <div className={`p-1.5 rounded-md ${accentColor} bg-opacity-20`}>{icon}</div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-mono-500">{title}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((item: any, i: number) => (
            <div key={i} className="group flex flex-col p-4 bg-white border border-mono-200 rounded-xl hover:border-mono-400 transition-all hover:shadow-md cursor-default">
              <span className="text-sm font-bold text-mono-900 mb-1">{item.phrase || item.collocation || item.idiom}</span>
              <span className="text-xs text-blue-600 font-medium italic">{item.vn}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      {/* Search & Control Header */}
      <div className="px-8 pt-8 pb-6 border-b border-mono-100 bg-mono-50/50 sticky top-0 z-10 backdrop-blur-md">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-mono-400 group-focus-within:text-mono-900 transition-colors" />
              <input
                type="text"
                className="w-full pl-12 pr-4 py-4 border border-mono-200 rounded-2xl bg-white text-lg focus:ring-4 focus:ring-mono-900/5 focus:border-mono-900 shadow-sm transition-all placeholder:text-mono-300 font-serif"
                placeholder="Tra cứu từ vựng hoặc cụm từ..."
                value={word}
                onChange={(e) => setWord(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
              />
            </div>
            <button
              onClick={handleLookup}
              disabled={isLoading || !word.trim()}
              className="px-10 py-4 bg-mono-900 text-white rounded-2xl font-bold hover:bg-mono-800 disabled:bg-mono-200 transition-all active:scale-[0.98] flex items-center justify-center min-w-[160px] shadow-lg shadow-mono-900/10"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search Now'}
            </button>
          </div>

          {/* Moved Deep Lookup Options Below Search */}
          <div className="mt-6 flex flex-wrap items-center gap-4 animate-fade-in">
             <div className="flex items-center text-[10px] font-bold text-mono-400 uppercase tracking-widest mr-2">
                <Sparkles className="w-3 h-3 mr-1.5" />
                Deep Lookup:
             </div>
             
             <button
               onClick={() => onToggleOption('phrases')}
               className={`flex items-center px-4 py-2 rounded-full text-xs font-bold transition-all border ${options.phrases ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-mono-500 border-mono-200 hover:border-mono-400'}`}
             >
               {options.phrases ? <CheckSquare className="w-3.5 h-3.5 mr-2" /> : <Square className="w-3.5 h-3.5 mr-2" />}
               Prepositional Phrases
             </button>
             
             <button
               onClick={() => onToggleOption('collocations')}
               className={`flex items-center px-4 py-2 rounded-full text-xs font-bold transition-all border ${options.collocations ? 'bg-green-600 text-white border-green-600' : 'bg-white text-mono-500 border-mono-200 hover:border-mono-400'}`}
             >
               {options.collocations ? <CheckSquare className="w-3.5 h-3.5 mr-2" /> : <Square className="w-3.5 h-3.5 mr-2" />}
               Collocations
             </button>
             
             <button
               onClick={() => onToggleOption('idioms')}
               className={`flex items-center px-4 py-2 rounded-full text-xs font-bold transition-all border ${options.idioms ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-mono-500 border-mono-200 hover:border-mono-400'}`}
             >
               {options.idioms ? <CheckSquare className="w-3.5 h-3.5 mr-2" /> : <Square className="w-3.5 h-3.5 mr-2" />}
               Idioms
             </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-8">
        <div className="max-w-5xl mx-auto pt-10 pb-20">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 text-mono-300">
              <div className="relative mb-6">
                <Loader2 className="w-16 h-16 animate-spin text-mono-100" />
                <Book className="absolute inset-0 m-auto w-6 h-6 text-mono-200" />
              </div>
              <p className="font-serif italic text-lg text-mono-400">Đang phân tích ngữ pháp và ngữ cảnh...</p>
            </div>
          ) : result ? (
            <div className="animate-fade-in">
              {/* Refined Result Card */}
              <div className="bg-white rounded-3xl p-10 mb-12 relative border border-mono-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)]">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-4">
                      <h1 className="text-6xl font-bold text-mono-900 tracking-tighter capitalize font-serif">{result.word}</h1>
                      <div className={`px-3 py-1 rounded-lg text-xs font-black border-2 ${CEFR_COLORS[result.level]?.replace('bg-', 'bg-opacity-10 text-') || 'bg-mono-100'}`}>
                        {result.level}
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-mono-400">
                      <span className="font-mono text-xl tracking-tight">{result.phonetic}</span>
                      <div className="h-1 w-1 rounded-full bg-mono-200"></div>
                      <span className="text-sm font-black uppercase tracking-[0.3em] text-mono-500">{result.partOfSpeech}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={handleCopyAll}
                      className="flex items-center gap-2 px-4 py-2.5 border border-mono-200 rounded-xl hover:bg-mono-900 hover:text-white hover:border-mono-900 transition-all text-mono-600 font-bold text-xs"
                      title="Copy full entry"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      Copy Entry
                    </button>
                    <button className="p-2.5 border border-mono-200 rounded-xl hover:bg-mono-50 transition-colors text-mono-600"><Volume2 className="w-5 h-5" /></button>
                  </div>
                </div>

                <div className="mt-12 grid grid-cols-1 gap-10">
                  <div className="flex flex-col md:flex-row gap-6 md:items-center">
                    <div className="text-3xl font-bold text-blue-700 bg-blue-50 px-6 py-4 rounded-2xl border border-blue-100 min-w-fit shadow-sm">
                      {result.translation}
                    </div>
                    <div className="text-lg text-mono-600 italic font-serif leading-relaxed border-l-4 border-mono-100 pl-6">
                      {result.definition}
                    </div>
                  </div>
                </div>

                {/* Examples Section */}
                <div className="mt-12 pt-10 border-t border-mono-50">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-[10px] font-black text-mono-300 uppercase tracking-[0.3em]">Usage Examples</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {result.examples?.map((ex: any, i: number) => (
                      <div key={i} className="group p-5 bg-mono-50/50 rounded-2xl hover:bg-white border border-transparent hover:border-mono-100 transition-all">
                        <p className="text-mono-800 font-medium mb-2 leading-relaxed">"{ex.en}"</p>
                        <p className="text-mono-400 text-xs italic">{ex.vn}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {result.usage_note && (
                  <div className="mt-10 bg-amber-50/50 rounded-2xl p-6 flex items-start border border-amber-100/50 shadow-inner">
                    <Info className="w-5 h-5 text-amber-500 mr-4 mt-0.5 shrink-0" />
                    <p className="text-sm text-amber-900 leading-relaxed">
                      <span className="font-black uppercase tracking-widest text-[10px] block mb-1 opacity-50">Usage Note</span>
                      {result.usage_note}
                    </p>
                  </div>
                )}
              </div>

              {/* Sub-sections Grid */}
              <div className="space-y-4">
                {renderSection("Prepositional Phrases", <Hash className="w-4 h-4 text-blue-600" />, result.prepositional_phrases, "bg-blue-600")}
                {renderSection("Collocations", <List className="w-4 h-4 text-green-600" />, result.collocations, "bg-green-600")}
                {renderSection("Idioms", <MessageCircle className="w-4 h-4 text-purple-600" />, result.idioms, "bg-purple-600")}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-40 text-center">
              <div className="relative mb-8">
                 <div className="absolute -inset-4 bg-mono-50 rounded-full blur-2xl opacity-50"></div>
                 <Book className="w-20 h-20 text-mono-100 relative" />
              </div>
              <h2 className="text-2xl font-bold text-mono-900 mb-3 font-serif">Sẵn sàng tra cứu</h2>
              <p className="text-mono-400 max-w-sm mx-auto text-sm leading-relaxed">
                Nhập từ vựng, cụm từ hoặc cấu trúc bất kỳ để phân tích định nghĩa, CEFR level và các cách kết hợp từ chuyên sâu.
              </p>
              
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full">
                 <div className="bg-white p-5 rounded-2xl border border-mono-100 shadow-sm text-left group hover:border-mono-300 transition-all">
                    <Hash className="w-5 h-5 text-blue-500 mb-3" />
                    <p className="text-xs font-black text-mono-300 uppercase tracking-widest mb-1">Phrases</p>
                    <p className="text-xs text-mono-500">Tra cứu các cụm từ đi với giới từ thông dụng nhất.</p>
                 </div>
                 <div className="bg-white p-5 rounded-2xl border border-mono-100 shadow-sm text-left group hover:border-mono-300 transition-all">
                    <MessageCircle className="w-5 h-5 text-purple-500 mb-3" />
                    <p className="text-xs font-black text-mono-300 uppercase tracking-widest mb-1">Idioms</p>
                    <p className="text-xs text-mono-500">Tìm hiểu các thành ngữ liên quan đến từ vựng đang tra cứu.</p>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dictionary;
