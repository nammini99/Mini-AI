
import React, { useState } from 'react';
import { Languages, ArrowRightLeft, Loader2, Copy, Check, Volume2, RotateCcw, List, AlignLeft, Info, ArrowDown } from 'lucide-react';
import { translateText, translateVocabList } from '../services/geminiService';

const TranslateTab: React.FC = () => {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [targetLang, setTargetLang] = useState('Vietnamese');
  const [mode, setMode] = useState<'standard' | 'vocab'>('vocab');

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    setIsTranslating(true);
    try {
      let result = "";
      if (mode === 'vocab') {
        result = await translateVocabList(sourceText, targetLang);
      } else {
        result = await translateText(sourceText, targetLang);
      }
      setTranslatedText(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setSourceText('');
    setTranslatedText('');
  };

  return (
    <div className="flex-1 flex flex-col bg-mono-50 p-8 overflow-y-auto custom-scrollbar">
      <div className="max-w-6xl mx-auto w-full flex flex-col space-y-8 pb-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold text-mono-900 font-serif tracking-tight">Vocabulary Translator</h2>
            <p className="text-sm text-mono-500 mt-2 font-medium">Chuyên dụng dịch danh sách từ vựng theo định dạng đề thi.</p>
          </div>
          
          <div className="flex items-center space-x-4 bg-white p-1.5 rounded-2xl border border-mono-200 shadow-sm">
             <div className="flex bg-mono-100 p-1 rounded-xl">
               <button 
                onClick={() => setMode('standard')}
                className={`flex items-center px-4 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'standard' ? 'bg-white text-mono-900 shadow-sm' : 'text-mono-400 hover:text-mono-600'}`}
               >
                 <AlignLeft className="w-3.5 h-3.5 mr-2" />
                 Dịch đoạn văn
               </button>
               <button 
                onClick={() => setMode('vocab')}
                className={`flex items-center px-4 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'vocab' ? 'bg-white text-mono-900 shadow-sm' : 'text-mono-400 hover:text-mono-600'}`}
               >
                 <List className="w-3.5 h-3.5 mr-2" />
                 Danh sách từ
               </button>
             </div>
             
             <div className="h-6 w-px bg-mono-200"></div>
             
             <div className="flex items-center space-x-3 px-3">
                <span className="text-[10px] font-black text-mono-400 uppercase tracking-widest">Target:</span>
                <select 
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="bg-transparent text-xs font-bold text-mono-900 focus:outline-none cursor-pointer hover:text-blue-600 transition-colors"
                >
                  <option value="Vietnamese">Vietnamese</option>
                  <option value="English">English</option>
                  <option value="French">French</option>
                  <option value="Japanese">Japanese</option>
                </select>
             </div>
          </div>
        </div>

        {/* Input Window */}
        <div className="flex flex-col bg-white border border-mono-200 rounded-3xl shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] overflow-hidden transition-all focus-within:ring-4 focus-within:ring-mono-900/5">
          <div className="px-6 py-4 border-b border-mono-100 flex justify-between items-center bg-mono-50/30">
            <div className="flex items-center">
               <div className="w-2 h-2 rounded-full bg-mono-300 mr-3"></div>
               <span className="text-[10px] uppercase font-black text-mono-400 tracking-[0.2em]">Cửa sổ Input (Nhập từ vựng)</span>
            </div>
            <button onClick={handleClear} className="p-2 text-mono-400 hover:text-mono-900 hover:bg-mono-100 rounded-xl transition-all"><RotateCcw className="w-4 h-4" /></button>
          </div>
          
          <div className="p-6">
            <textarea
              className="w-full h-48 resize-none bg-transparent focus:outline-none text-xl text-mono-900 placeholder-mono-200 font-serif leading-relaxed"
              placeholder={mode === 'vocab' ? "Nhập danh sách từ vựng cần dịch...\nVí dụ:\nzero chance\nzero charge\nzero emission" : "Nhập đoạn văn bản cần dịch..."}
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
            />
          </div>

          <div className="px-6 py-5 bg-mono-50/50 border-t border-mono-100 flex items-center justify-between">
            <div className="flex items-center text-xs text-mono-400 italic">
               <Info className="w-3.5 h-3.5 mr-2" />
               {mode === 'vocab' ? "Nhập mỗi dòng một từ hoặc cụm từ." : "Hỗ trợ dịch thuật ngữ cảnh cao."}
            </div>
            <button
              onClick={handleTranslate}
              disabled={isTranslating || !sourceText.trim()}
              className="flex items-center px-10 py-3.5 bg-mono-900 text-white rounded-2xl font-bold text-sm hover:bg-mono-800 disabled:bg-mono-200 transition-all active:scale-[0.98] shadow-lg shadow-mono-900/10"
            >
              {isTranslating ? <Loader2 className="w-4 h-4 animate-spin mr-3" /> : <Languages className="w-4 h-4 mr-3" />}
              Bắt đầu dịch ngay
            </button>
          </div>
        </div>

        {/* Arrow Spacer */}
        <div className="flex justify-center -my-4 relative z-10">
           <div className="bg-white p-3 rounded-full border border-mono-200 shadow-md">
              <ArrowDown className="w-5 h-5 text-mono-300" />
           </div>
        </div>

        {/* Output Window (Plain Text Focused) */}
        <div className="flex flex-col bg-white border border-mono-200 rounded-3xl shadow-[0_15px_40px_-20px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="px-6 py-4 border-b border-mono-100 flex justify-between items-center bg-mono-900">
            <div className="flex items-center">
               <div className="w-2 h-2 rounded-full bg-white/40 mr-3"></div>
               <span className="text-[10px] uppercase font-black text-white/60 tracking-[0.2em]">Cửa sổ Output (Kết quả dạng Plain Text)</span>
            </div>
            <div className="flex items-center space-x-3">
               <button className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all"><Volume2 className="w-4 h-4" /></button>
               <button 
                  onClick={handleCopy}
                  disabled={!translatedText}
                  className={`flex items-center px-4 py-2 rounded-xl font-bold text-xs transition-all ${copied ? 'bg-green-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  {copied ? <Check className="w-3.5 h-3.5 mr-2" /> : <Copy className="w-3.5 h-3.5 mr-2" />}
                  {copied ? 'Đã sao chép' : 'Sao chép tất cả'}
               </button>
            </div>
          </div>
          
          <div className="p-8 min-h-[160px] relative bg-white">
            {isTranslating ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-white/80 backdrop-blur-sm z-10">
                <div className="w-12 h-1 bg-mono-100 rounded-full overflow-hidden relative">
                   <div className="absolute inset-0 bg-mono-900 animate-[loading_1.5s_ease-in-out_infinite]"></div>
                </div>
                <p className="text-[10px] uppercase font-black text-mono-400 tracking-[0.2em] animate-pulse">Đang định dạng văn bản...</p>
              </div>
            ) : null}

            {translatedText ? (
              <div className="text-xl text-mono-800 leading-[1.8] font-serif text-justify break-words">
                 {translatedText}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center opacity-20 grayscale">
                 <Languages className="w-16 h-16 mb-4 text-mono-300" />
                 <p className="text-mono-500 italic text-sm font-serif">Kết quả dịch sẽ hiển thị ở đây theo định dạng chuỗi ký tự plain text...</p>
              </div>
            )}
          </div>

          {translatedText && (
            <div className="px-6 py-4 bg-mono-50 border-t border-mono-100 flex items-center justify-center">
               <span className="text-[10px] font-black text-mono-400 uppercase tracking-widest flex items-center">
                  <CheckSquare className="w-3.5 h-3.5 mr-2 text-green-500" />
                  Đã tối ưu hóa cho việc dán vào Word/PDF
               </span>
            </div>
          )}
        </div>

        {/* Pro Tips Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 flex items-start">
              <div className="p-3 bg-blue-100 rounded-2xl mr-4">
                 <List className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                 <h4 className="font-bold text-blue-900 mb-1">Dành cho soạn đề</h4>
                 <p className="text-xs text-blue-700/70 leading-relaxed">Định dạng [từ (nghĩa)] giúp bạn tạo phần giải nghĩa từ vựng ở cuối đề thi một cách nhanh chóng chỉ bằng 1 cú nhấp chuột.</p>
              </div>
           </div>
           <div className="bg-mono-900 p-6 rounded-3xl flex items-start text-white shadow-xl">
              <div className="p-3 bg-white/10 rounded-2xl mr-4">
                 <AlignLeft className="w-5 h-5 text-mono-100" />
              </div>
              <div>
                 <h4 className="font-bold text-white mb-1">Lưu ý nhập liệu</h4>
                 <p className="text-xs text-white/50 leading-relaxed">Hệ thống xử lý tốt nhất khi bạn nhập mỗi từ vựng trên một dòng riêng biệt. AI sẽ tự động gộp chúng thành chuỗi ký tự.</p>
              </div>
           </div>
        </div>
      </div>
      
      <style>{`
        @keyframes loading {
          0% { left: -100%; width: 100%; }
          50% { left: 0%; width: 100%; }
          100% { left: 100%; width: 100%; }
        }
      `}</style>
    </div>
  );
};

const CheckSquare = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default TranslateTab;
