
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import TestContent from './components/TestContent';
import RefineTool from './components/RefineTool';
import CefrCheck from './components/CefrCheck';
import Dictionary from './components/Dictionary';
import TranslateTab from './components/TranslateTab';
import { TestType, LevelSystem, LevelOption, GeneratedTest, TestContent as TestContentType } from './types';
import { generateTestSection, refineContent, getGrammarSuggestions, getTrendingTopics, getTopicSuggestions } from './services/geminiService';
import { exportToWord, formatTestContent } from './services/exportService';
import { READING_CLOZE_SUBTYPES, READING_CLOZE_ADVANCED_SUBTYPES, READING_COMP_SUBTYPES, READING_MATCHING_SUBTYPES, READING_OPEN_GUIDED_SUBTYPES, READING_MIXED_SUBTYPES, COMMUNICATION_SUBTYPES, ARRANGEMENT_SUBTYPES, VOCAB_COLLOCATION_SUBTYPES, GRAMMAR_REORDER_SUBTYPES } from './constants';

const initialTestData: GeneratedTest = {
  [TestType.VOCABULARY]: { id: 'vocab', type: TestType.VOCABULARY, content: '', isGenerated: false },
  [TestType.WORDLIST]: { id: 'wordlist', type: TestType.WORDLIST, content: '', isGenerated: false },
  [TestType.GRAMMAR]: { id: 'grammar', type: TestType.GRAMMAR, content: '', isGenerated: false },
  [TestType.READING]: { id: 'reading', type: TestType.READING, content: '', isGenerated: false },
  [TestType.REWRITING]: { id: 'rewriting', type: TestType.REWRITING, content: '', isGenerated: false },
  [TestType.ARRANGEMENT]: { id: 'arrangement', type: TestType.ARRANGEMENT, content: '', isGenerated: false },
  [TestType.COMMUNICATION]: { id: 'communication', type: TestType.COMMUNICATION, content: '', isGenerated: false },
  [TestType.DICTIONARY]: { id: 'dict', type: TestType.DICTIONARY, content: '', isGenerated: false },
  [TestType.TRANSLATE]: { id: 'trans', type: TestType.TRANSLATE, content: '', isGenerated: false },
  [TestType.CEFR_CHECK]: { id: 'cefr', type: TestType.CEFR_CHECK, content: '', isGenerated: false },
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<TestType>(TestType.VOCABULARY);
  const [topic, setTopic] = useState<string>('');
  const [grammarCategory, setGrammarCategory] = useState<string>('All');
  const [grammarTestType, setGrammarTestType] = useState<string>('Multiple Choice');
  const [grammarReorderConfig, setGrammarReorderConfig] = useState<Record<string, number>>({});
  const [vocabForm, setVocabForm] = useState<string>('Word Choice');
  const [vocabCollocationConfig, setVocabCollocationConfig] = useState<Record<string, number>>({});
  const [communicationConfig, setCommunicationConfig] = useState<Record<string, number>>({});
  const [readingForm, setReadingForm] = useState<string>('Reading Comprehension');
  const [readingConfig, setReadingConfig] = useState<Record<string, number>>({});
  const [readingVocabType, setReadingVocabType] = useState<string>('CLOSEST');
  const [highlightedLevels, setHighlightedLevels] = useState<string[]>([]);
  const [showKeywords, setShowKeywords] = useState<boolean>(false);
  const [arrangementConfig, setArrangementConfig] = useState<Record<string, number>>({});
  const [questionQuantity, setQuestionQuantity] = useState<number>(10);
  const [numberOfTests, setNumberOfTests] = useState<number>(1);
  const [level, setLevel] = useState<LevelOption>({ system: LevelSystem.CEFR, subLevel: 'B1' });
  const [testData, setTestData] = useState<GeneratedTest>(initialTestData);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [cachedTrends, setCachedTrends] = useState<string[]>([]);
  const [selectedGrammarChips, setSelectedGrammarChips] = useState<string[]>([]);
  const [isTopbarExpanded, setIsTopbarExpanded] = useState<boolean>(true);
  const [isAutoHide, setIsAutoHide] = useState<boolean>(true); 
  const lastScrollY = useRef(0);

  const [dictOptions, setDictOptions] = useState({ phrases: false, collocations: false, idioms: false });

  const handleContentScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!isAutoHide) return;
    const currentScrollY = e.currentTarget.scrollTop;
    if (Math.abs(currentScrollY - lastScrollY.current) < 10) return;
    if (currentScrollY > lastScrollY.current && currentScrollY > 50) setIsTopbarExpanded(false);
    else setIsTopbarExpanded(true);
    lastScrollY.current = currentScrollY;
  };

  useEffect(() => {
    const fetchSuggestionsData = async () => {
      const isUtilityTab = [TestType.DICTIONARY, TestType.TRANSLATE, TestType.CEFR_CHECK].includes(currentTab);
      if (currentTab === TestType.GRAMMAR) {
        const grammarResults = await getGrammarSuggestions(grammarCategory);
        setSuggestions(grammarResults);
        setSelectedGrammarChips([]); 
      } else if (currentTab === TestType.REWRITING) {
        const structureResults = await getGrammarSuggestions('Sentence Transformation & Structure');
        setSuggestions(structureResults);
      } else if (isUtilityTab) {
        setSuggestions([]);
      } else {
        if (topic.trim() === '') {
          if (cachedTrends.length > 0) setSuggestions(cachedTrends);
          else {
            const trends = await getTrendingTopics();
            setCachedTrends(trends);
            setSuggestions(trends);
          }
        }
      }
    };
    fetchSuggestionsData();
  }, [currentTab, grammarCategory]); 

  useEffect(() => {
    const isUtilityTab = [TestType.DICTIONARY, TestType.TRANSLATE, TestType.CEFR_CHECK].includes(currentTab);
    if (currentTab === TestType.GRAMMAR || isUtilityTab) return;
    const timer = setTimeout(async () => {
      if (topic.trim().length > 2) {
        const context = currentTab === TestType.REWRITING ? 'English Grammar & Sentence Transformation' : undefined;
        const results = await getTopicSuggestions(topic, context);
        if (results.length > 0) setSuggestions(results);
      } else if (topic.trim().length === 0) {
        if (cachedTrends.length > 0) setSuggestions(cachedTrends);
      }
    }, 800); 
    return () => clearTimeout(timer);
  }, [topic, currentTab, cachedTrends]);

  const handleToggleHighlightLevel = (levelToToggle: string) => {
    setHighlightedLevels(prev => prev.includes(levelToToggle) ? prev.filter(l => l !== levelToToggle) : [...prev, levelToToggle]);
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (currentTab === TestType.GRAMMAR) {
      setSelectedGrammarChips(prev => prev.includes(suggestion) ? prev.filter(s => s !== suggestion) : [...prev, suggestion]);
    } else setTopic(suggestion);
  };

  // Helper function to calculate quantity based on visible subtypes
  const calculateEffectiveQuantity = () => {
    if (currentTab === TestType.WORDLIST) return questionQuantity; // Dynamic count per level
    if (currentTab === TestType.READING) {
      let activeSubtypes: Record<string, string> = {};
      if (readingForm === 'Reading Cloze Advanced') activeSubtypes = READING_CLOZE_ADVANCED_SUBTYPES;
      else if (readingForm?.startsWith('Reading Cloze')) activeSubtypes = READING_CLOZE_SUBTYPES;
      else if (readingForm === 'Reading Matching') activeSubtypes = READING_MATCHING_SUBTYPES;
      else if (readingForm === 'Reading Open-Guided') activeSubtypes = READING_OPEN_GUIDED_SUBTYPES;
      else if (readingForm === 'Reading (Answer/True/False)') activeSubtypes = READING_MIXED_SUBTYPES;
      else activeSubtypes = READING_COMP_SUBTYPES;
      return Object.keys(activeSubtypes).reduce((sum, key) => sum + (readingConfig[key] || 0), 0);
    }
    if (currentTab === TestType.COMMUNICATION) {
      return Object.keys(COMMUNICATION_SUBTYPES).reduce((sum, key) => sum + (communicationConfig[key] || 0), 0);
    }
    if (currentTab === TestType.ARRANGEMENT) {
      return Object.keys(ARRANGEMENT_SUBTYPES).reduce((sum, key) => sum + (arrangementConfig[key] || 0), 0);
    }
    if (currentTab === TestType.VOCABULARY && vocabForm === 'Collocation') {
      return Object.keys(VOCAB_COLLOCATION_SUBTYPES).reduce((sum, key) => sum + (vocabCollocationConfig[key] || 0), 0);
    }
    if (currentTab === TestType.GRAMMAR && grammarTestType === 'Reorder sentence') {
      return Object.keys(GRAMMAR_REORDER_SUBTYPES).reduce((sum, key) => sum + (grammarReorderConfig[key] || 0), 0);
    }
    return questionQuantity;
  };

  const handleGenerate = async () => {
    if (!topic && (currentTab !== TestType.GRAMMAR || selectedGrammarChips.length === 0)) return;
    if ([TestType.DICTIONARY, TestType.TRANSLATE, TestType.CEFR_CHECK].includes(currentTab)) return;
    setIsProcessing(true);
    
    const effectiveQuantity = calculateEffectiveQuantity();
    const effectiveTopic = topic || (selectedGrammarChips.length > 0 ? selectedGrammarChips.join(', ') : "General Content");
    
    let subTypeInfo = "";
    if (currentTab === TestType.VOCABULARY) {
        if (vocabForm === 'Collocation') {
            const types = (Object.entries(vocabCollocationConfig) as [string, number][])
                .filter(([type, q]) => q > 0 && VOCAB_COLLOCATION_SUBTYPES.hasOwnProperty(type))
                .map(([type, q]) => `${type}: ${q} items`)
                .join(', ');
            subTypeInfo = `Dạng bài: Collocation (Chi tiết: ${types})`;
        } else {
            subTypeInfo = `Dạng bài: ${vocabForm}`;
        }
    } else if (currentTab === TestType.GRAMMAR) {
        if (grammarTestType === 'Reorder sentence') {
           const types = (Object.entries(grammarReorderConfig) as [string, number][])
                .filter(([type, q]) => q > 0 && GRAMMAR_REORDER_SUBTYPES.hasOwnProperty(type))
                .map(([type, q]) => `${type}: ${q} items`)
                .join(', ');
            subTypeInfo = `Dạng bài: Reorder sentence (Chi tiết: ${types})`;
        } else {
            subTypeInfo = `Dạng bài: ${grammarTestType}`;
        }
    } else if (currentTab === TestType.READING) {
        let activeKeys: string[] = [];
        if (readingForm === 'Reading Cloze Advanced') activeKeys = Object.keys(READING_CLOZE_ADVANCED_SUBTYPES);
        else if (readingForm?.startsWith('Reading Cloze')) activeKeys = Object.keys(READING_CLOZE_SUBTYPES);
        else if (readingForm === 'Reading Matching') activeKeys = Object.keys(READING_MATCHING_SUBTYPES);
        else if (readingForm === 'Reading Open-Guided') activeKeys = Object.keys(READING_OPEN_GUIDED_SUBTYPES);
        else if (readingForm === 'Reading (Answer/True/False)') activeKeys = Object.keys(READING_MIXED_SUBTYPES);
        else activeKeys = Object.keys(READING_COMP_SUBTYPES);

        const types = (Object.entries(readingConfig) as [string, number][])
            .filter(([type, q]) => q > 0 && activeKeys.includes(type))
            .map(([type, q]) => `${type}: ${q} items`)
            .join(', ');
        subTypeInfo = `Dạng bài: ${readingForm} (Chi tiết: ${types})`;
    } else if (currentTab === TestType.COMMUNICATION) {
        const types = (Object.entries(communicationConfig) as [string, number][])
            .filter(([type, q]) => q > 0 && COMMUNICATION_SUBTYPES.hasOwnProperty(type))
            .map(([type, q]) => `${type}: ${q} items`)
            .join(', ');
        subTypeInfo = `Dạng bài: Communication (Chi tiết: ${types})`;
    } else if (currentTab === TestType.ARRANGEMENT) {
        const types = (Object.entries(arrangementConfig) as [string, number][])
            .filter(([type, q]) => q > 0 && ARRANGEMENT_SUBTYPES.hasOwnProperty(type))
            .map(([type, q]) => `${type}: ${q} items`)
            .join(', ');
        subTypeInfo = `Dạng bài: Arrangement (Chi tiết: ${types})`;
    }

    let content = await generateTestSection(currentTab, effectiveTopic, level, effectiveQuantity, subTypeInfo);
    setTestData(prev => ({ ...prev, [currentTab]: { ...prev[currentTab], content, isGenerated: true } }));
    setIsProcessing(false);
  };

  const handleRefine = async (instruction: string) => {
    const currentSection = testData[currentTab];
    if (!currentSection.isGenerated) return;
    setIsProcessing(true);
    let refined = await refineContent(currentSection.content, instruction);
    setTestData(prev => ({ ...prev, [currentTab]: { ...prev[currentTab], content: refined } }));
    setIsProcessing(false);
  };

  const handleExport = () => { exportToWord(testData, topic, level); };

  const handleToggleDictOption = (key: 'phrases' | 'collocations' | 'idioms') => {
    setDictOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isUtilityTab = [TestType.DICTIONARY, TestType.TRANSLATE, TestType.CEFR_CHECK].includes(currentTab);
  const canGenerate = (!!topic || (currentTab === TestType.GRAMMAR && selectedGrammarChips.length > 0)) && !isUtilityTab;
  
  const suggestionsLabel = (currentTab === TestType.GRAMMAR || currentTab === TestType.REWRITING) ? "Suggested Concepts:" : "Trending Topics:";

  return (
    <div className="flex h-screen bg-mono-50 overflow-hidden font-sans">
      <Sidebar 
        currentTab={currentTab} 
        onTabChange={setCurrentTab}
        generatedStatus={Object.keys(testData).reduce((acc, key) => {
          acc[key as TestType] = testData[key as TestType].isGenerated;
          return acc;
        }, {} as Record<TestType, boolean>)}
        highlightedLevels={highlightedLevels}
        onToggleHighlightLevel={handleToggleHighlightLevel}
        showKeywords={showKeywords}
        onToggleKeywords={() => setShowKeywords(!showKeywords)}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        {!isUtilityTab && (
          <Topbar 
            currentTab={currentTab}
            topic={topic}
            onTopicChange={setTopic}
            grammarCategory={grammarCategory}
            onGrammarCategoryChange={setGrammarCategory}
            grammarTestType={grammarTestType}
            onGrammarTestTypeChange={setGrammarTestType}
            grammarReorderConfig={grammarReorderConfig}
            onGrammarReorderConfigChange={(s, q) => setGrammarReorderConfig(p => ({...p, [s]: q}))}
            vocabForm={vocabForm}
            onVocabFormChange={setVocabForm}
            vocabCollocationConfig={vocabCollocationConfig}
            onVocabCollocationConfigChange={(s, q) => setVocabCollocationConfig(p => ({...p, [s]: q}))}
            communicationConfig={communicationConfig}
            onCommunicationConfigChange={(s, q) => setCommunicationConfig(p => ({...p, [s]: q}))}
            readingForm={readingForm}
            onReadingFormChange={setReadingForm}
            readingConfig={readingConfig}
            onReadingConfigChange={(s, q) => setReadingConfig(p => ({...p, [s]: q}))}
            readingVocabType={readingVocabType}
            onReadingVocabTypeChange={setReadingVocabType}
            arrangementConfig={arrangementConfig}
            onArrangementConfigChange={(s, q) => setArrangementConfig(p => ({...p, [s]: q}))}
            questionQuantity={questionQuantity}
            onQuestionQuantityChange={setQuestionQuantity}
            numberOfTests={numberOfTests}
            onNumberOfTestsChange={setNumberOfTests}
            level={level}
            onLevelChange={setLevel}
            onGenerate={handleGenerate}
            isGenerating={isProcessing}
            canGenerate={canGenerate}
            onExport={handleExport}
            canExport={(Object.values(testData) as TestContentType[]).some(d => d.isGenerated)}
            suggestions={suggestions}
            suggestionsLabel={suggestionsLabel}
            selectedSuggestions={currentTab === TestType.GRAMMAR ? selectedGrammarChips : [topic]}
            onSuggestionClick={handleSuggestionClick}
            isExpanded={isTopbarExpanded}
            onToggleExpand={() => setIsTopbarExpanded(!isTopbarExpanded)}
            isAutoHide={isAutoHide}
            onToggleAutoHide={() => setIsAutoHide(!isAutoHide)}
          />
        )}
        
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {currentTab === TestType.CEFR_CHECK ? (
            <CefrCheck highlightedLevels={highlightedLevels} />
          ) : currentTab === TestType.DICTIONARY ? (
            <Dictionary options={dictOptions} onToggleOption={handleToggleDictOption} />
          ) : currentTab === TestType.TRANSLATE ? (
            <TranslateTab />
          ) : (
            <>
              <TestContent 
                content={{...testData[currentTab], content: formatTestContent(testData[currentTab].content)}}
                onGenerate={handleGenerate}
                isGenerating={isProcessing}
                hasTopic={!!topic || selectedGrammarChips.length > 0}
                tab={currentTab}
                onScroll={handleContentScroll}
                highlightedLevels={highlightedLevels}
                showKeywords={showKeywords}
              />
              <RefineTool onRefine={handleRefine} isProcessing={isProcessing} disabled={!testData[currentTab].isGenerated} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
