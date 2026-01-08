import React, { useState, useEffect, ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import { Loader2, AlertCircle, Languages, X } from 'lucide-react';
import { TestContent as TestContentType, TestType } from '../types';
import { CEFR_HIGHLIGHT_COLORS } from '../constants';
import { translateText } from '../services/geminiService';

interface TestContentProps {
  content: TestContentType;
  onGenerate: () => void;
  isGenerating: boolean;
  hasTopic: boolean;
  tab: TestType;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  highlightedLevels?: string[];
  showKeywords?: boolean;
}

const TestContent: React.FC<TestContentProps> = ({ 
  content, 
  onGenerate, 
  isGenerating, 
  hasTopic,
  tab,
  onScroll,
  highlightedLevels = [],
  showKeywords = false
}) => {
  const [selectionPopup, setSelectionPopup] = useState<{x: number, y: number, text: string} | null>(null);
  const [translatedSelection, setTranslatedSelection] = useState<string | null>(null);
  const [isTranslatingSelection, setIsTranslatingSelection] = useState(false);
  const [hoverPopup, setHoverPopup] = useState<{x: number, y: number, text: string, level: string} | null>(null);

  const highlightKeywords = (text: string): ReactNode => {
    if (!text) return null;
    const stopWords = new Set(['A', 'An', 'The', 'In', 'On', 'At', 'To', 'For', 'Of', 'With', 'By', 'And', 'But', 'Or', 'So', 'Is', 'Are', 'Was', 'Were', 'It', 'This', 'That']);
    const parts = text.split(/(\b\d+(?:[.,]\d+)?(?:st|nd|rd|th)?%?\b|\b[A-Z][a-zA-Z-]*\b)/g);
    return parts.map((part, i) => {
        if (!part) return null;
        if (/^\d+(?:[.,]\d+)?(?:st|nd|rd|th)?%?$/.test(part)) return <span key={i} className="text-green-600 font-bold">{part}</span>;
        if (/^[A-Z][a-zA-Z-]*$/.test(part) && !stopWords.has(part) && part.length > 1) return <span key={i} className="text-green-600 font-bold">{part}</span>;
        return part;
    });
  };

  const boldSpecialText = (text: string): ReactNode => {
    const questionRegex = /^(\s*(?:Question\s+\d+[:.]?|\d+\.)\s*)/i;
    const cefrLabelRegex = /^(\s*(?:B1|B2|C1|C2)\s*[:.]\s*)/i;
    const dialogueLabelRegex = /^(\s*[a-e]\.\s*)/i;
    
    const parts = text.split(/([“"”][^“”"]*[“"”])|(\([^)]+\))|(\*\*[^*]+\*\*)|(\[[A-D]\])/g);
    
    let isLineDialogue = false;
    let nameAlreadyStyled = false;

    return parts.map((part, i) => {
      if (!part) return null;

      if (i === 0) {
        const qMatch = part.match(questionRegex);
        const cefrMatch = part.match(cefrLabelRegex);
        const dMatch = part.match(dialogueLabelRegex);
        
        if (qMatch) {
           const qLabel = qMatch[1];
           const remaining = part.slice(qLabel.length);
           return (
             <React.Fragment key={i}>
                <span className="text-blue-600 font-bold">{qLabel}</span>
                {remaining}
             </React.Fragment>
           );
        } else if (cefrMatch) {
           const cefrLabel = cefrMatch[1];
           const remaining = part.slice(cefrLabel.length);
           return (
             <React.Fragment key={i}>
                <span className="text-mono-900 font-black underline decoration-2 decoration-mono-300 mr-1">{cefrLabel}</span>
                {remaining}
             </React.Fragment>
           );
        } else if (dMatch) {
           isLineDialogue = true;
           const dLabel = dMatch[1];
           const remaining = part.slice(dLabel.length);
           return (
             <React.Fragment key={i}>
                <span className="text-blue-600 font-bold">{dLabel}</span>
                {remaining}
             </React.Fragment>
           );
        }
      }

      const isQuoted = /^[“"”].*[“"”]$/.test(part.trim());
      const isBrackets = /^\(.*\)$/.test(part.trim());
      const isMdBold = /^\*\*.*\*\*$/.test(part.trim());
      const isMarker = /^\[[A-D]\]$/.test(part.trim());

      if (isQuoted || isBrackets || isMdBold || isMarker) {
        let cleanText = part;
        if (isMdBold) {
           cleanText = part.replace(/\*\*/g, '');
        } else if (isQuoted) {
           cleanText = part.replace(/\*\*/g, '');
        }
        
        let colorClass = "text-mono-900";
        if (isBrackets || isMarker) {
           colorClass = "text-blue-600";
        } else if (isMdBold && isLineDialogue && !nameAlreadyStyled) {
           // Color dialogue character name blue
           colorClass = "text-blue-600";
           nameAlreadyStyled = true;
        }
        
        return <strong key={i} className={`${colorClass} font-bold`}>{cleanText}</strong>;
      }
      return part;
    });
  };

  useEffect(() => {
    const handleMouseUp = () => {
      if (tab !== TestType.READING) return;
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.toString().trim()) return;
      const text = selection.toString().trim();
      const container = document.querySelector('.prose-container');
      if (container && (container.contains(selection.anchorNode) || container.contains(selection.focusNode))) {
         const range = selection.getRangeAt(0);
         const rect = range.getBoundingClientRect();
         setSelectionPopup({ x: rect.left + (rect.width / 2), y: rect.top - 10, text: text });
         setTranslatedSelection(null); 
      }
    };
    const handleMouseDown = (e: MouseEvent) => {
       if ((e.target as HTMLElement).closest('.translation-popup')) return;
       setSelectionPopup(null);
    };
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [tab]);

  if (isGenerating) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full text-mono-500">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-mono-800" />
        <p className="text-lg font-medium">Designing test content with AI...</p>
        <p className="text-sm mt-2">Analyzing internet trends & creating questions</p>
      </div>
    );
  }

  if (!content.isGenerated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full p-8 text-center overflow-y-auto" onScroll={onScroll}>
        <div className="max-w-2xl w-full mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-sm border border-mono-200 max-w-md mx-auto">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-mono-100 mb-4">
               <AlertCircle className="h-6 w-6 text-mono-600" />
            </div>
            <h3 className="text-lg font-medium text-mono-900">No Content Generated</h3>
            <p className="mt-2 text-sm text-mono-500">
              {hasTopic ? `Ready to generate the ${content.type} section.` : `Please enter a topic or select options in the toolbar.`}
            </p>
            <div className="mt-6 text-xs text-mono-400">
              Configure settings above and click <strong>Generate</strong> to start.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStr = (c: any): string => {
    if (Array.isArray(c)) return c.map(getStr).join('');
    if (typeof c === 'string' || typeof c === 'number') return String(c);
    if (React.isValidElement(c) && c.props.children) return getStr(c.props.children);
    return '';
  };

  let displayContent = content.content;
  displayContent = displayContent.split('\n').map(line => line.trimStart()).join('\n');

  return (
    <div className="flex-1 overflow-y-auto bg-white p-8 sm:p-12 relative transition-all" onScroll={onScroll}>
      <div className="prose-container max-w-4xl mx-auto bg-white min-h-[1000px] shadow-sm border border-mono-200 p-12 relative">
        <article className="prose prose-slate max-w-none prose-headings:font-serif prose-headings:text-mono-900 prose-p:text-mono-700 prose-p:leading-relaxed text-justify">
          <ReactMarkdown
            components={{
              blockquote: ({ node, ...props }) => (
                <blockquote className="not-italic font-bold text-blue-700 bg-blue-50 border-l-4 border-blue-500 py-2 px-4 rounded-r my-6 shadow-sm" {...props} />
              ),
              p: ({ node, children, ...props }) => {
                 const textContent = getStr(children);
                 const isQuestion = textContent.includes('Question') || /^\d+\./.test(textContent);
                 const hasOptionsInline = /([*]*[A-D]\.\s+)/.test(textContent) && textContent.split(/([*]*[A-D]\.\s+)/).length > 2;

                 if (hasOptionsInline) {
                    const parts = textContent.split(/([*]*[A-D]\.\s+)/);
                    const qPart = parts[0];
                    const options = [];
                    for (let i = 1; i < parts.length; i += 2) {
                      options.push(parts[i] + (parts[i+1] || ''));
                    }

                    const maxLength = Math.max(...options.map(o => o.length));
                    let gridCols = "grid-cols-4";
                    if (maxLength > 35) gridCols = "grid-cols-1";
                    else if (maxLength > 18) gridCols = "grid-cols-2";

                    return (
                      <div className="mb-6">
                        <p className="mb-2 font-medium">
                          {showKeywords ? highlightKeywords(qPart) : boldSpecialText(qPart)}
                        </p>
                        <div className={`grid ${gridCols} gap-2 text-sm`}>
                           {options.map((opt, idx) => <div key={idx} className="whitespace-normal sm:whitespace-nowrap">{opt.trim()}</div>)}
                        </div>
                      </div>
                    );
                 }

                 if (isQuestion) {
                     const processed = React.Children.map(children, child => {
                        if (typeof child === 'string') {
                           return showKeywords ? highlightKeywords(child) : boldSpecialText(child);
                        }
                        return child;
                     });
                     return <p className="mb-2 text-justify" {...props}>{processed}</p>;
                 }
                 
                 const boldedChildren = React.Children.map(children, child => 
                    typeof child === 'string' ? boldSpecialText(child) : child
                 );
                 return <p className="mb-2 text-justify" {...props}>{boldedChildren}</p>;
              },
              ul: ({ node, ...props }) => (
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-1 list-none pl-0 mb-6 mt-1" {...props} />
              ),
              li: ({ node, children, ...props }) => {
                 const bolded = React.Children.map(children, child => 
                    typeof child === 'string' ? boldSpecialText(child) : child
                 );
                 return <li className="m-0 p-0 text-justify min-w-fit" {...props}>{bolded}</li>;
              },
              a: ({node, href, children, ...props}) => {
                 if (href?.startsWith('#cefr-')) {
                   const decoded = decodeURIComponent(href.replace('#cefr-', ''));
                   const [level, trans] = decoded.split('||');
                   return (
                     <span 
                        className={`${CEFR_HIGHLIGHT_COLORS[level] || 'bg-yellow-300'} rounded px-1 cursor-help border-b border-transparent hover:border-mono-900 transition-all shadow-sm box-decoration-clone`} 
                        onMouseEnter={(e) => {
                           const rect = e.currentTarget.getBoundingClientRect();
                           setHoverPopup({ x: rect.left + (rect.width / 2), y: rect.top - 8, text: trans || 'No translation', level });
                        }}
                        onMouseLeave={() => setHoverPopup(null)}
                     >
                       {children}
                     </span>
                   );
                 }
                 return <a href={href} className="text-blue-600 hover:underline" {...props}>{children}</a>
              },
              code: ({node, className, children, ...props}) => <span className="font-bold text-blue-700 font-serif" {...props}>{children}</span>
            }}
          >
            {displayContent}
          </ReactMarkdown>
        </article>

        {selectionPopup && (
           <div className="translation-popup fixed z-50 bg-mono-900 text-white p-3 rounded-lg shadow-2xl transform -translate-x-1/2 -translate-y-full text-xs max-w-[240px] min-w-[150px] animate-fade-in" style={{ top: selectionPopup.y, left: selectionPopup.x }}>
              {!translatedSelection ? (
                  <button onClick={async () => { setIsTranslatingSelection(true); const res = await translateText(selectionPopup.text); setTranslatedSelection(res); setIsTranslatingSelection(false); }} className="flex items-center justify-center w-full space-x-2 text-white hover:text-mono-200 font-semibold transition-colors py-1" disabled={isTranslatingSelection}>
                     {isTranslatingSelection ? <Loader2 className="w-3 h-3 animate-spin" /> : <Languages className="w-3 h-3" />}
                     <span>Translate Selection</span>
                  </button>
              ) : (
                  <div>
                     <div className="flex items-center justify-between border-b border-mono-700 pb-1.5 mb-2">
                        <span className="font-bold text-mono-400 uppercase text-[10px] tracking-wider">Vietnamese</span>
                        <button onClick={() => setSelectionPopup(null)} className="text-mono-400 hover:text-white"><X className="w-3 h-3" /></button>
                     </div>
                     <div className="leading-relaxed text-sm font-medium">{translatedSelection}</div>
                  </div>
              )}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-mono-900"></div>
           </div>
        )}

        {hoverPopup && !selectionPopup && (
            <div className="fixed z-40 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 animate-fade-in" style={{ top: hoverPopup.y, left: hoverPopup.x }}>
               <div className="bg-blue-800 border border-blue-700 shadow-xl rounded-md px-3 py-2 text-xs min-w-[120px]">
                  <div className="flex items-center space-x-2 mb-1.5 border-b border-blue-700 pb-1">
                     <span className={`font-bold px-1.5 rounded text-[10px] text-white ${CEFR_HIGHLIGHT_COLORS[hoverPopup.level]?.split(' ')[0] || 'bg-gray-500'}`}>{hoverPopup.level}</span>
                     <span className="font-semibold text-blue-200 uppercase text-[10px] tracking-wide">VN Meaning</span>
                  </div>
                  <div className="text-yellow-300 font-serif text-sm font-medium">{hoverPopup.text}</div>
               </div>
               <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-[4px] rotate-45 w-2 h-2 bg-blue-800 border-r border-b border-blue-700"></div>
            </div>
        )}
      </div>
    </div>
  );
};

export default TestContent;
