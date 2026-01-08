
export enum TestType {
  VOCABULARY = 'Vocabulary',
  WORDLIST = 'WordList',
  GRAMMAR = 'Grammar',
  READING = 'Reading',
  REWRITING = 'Rewriting',
  ARRANGEMENT = 'Arrangement',
  COMMUNICATION = 'Communication',
  DICTIONARY = 'Dictionary',
  TRANSLATE = 'Translate',
  CEFR_CHECK = 'CEFR Check'
}

export enum LevelSystem {
  GLOBAL_SUCCESS = 'Global Success',
  CEFR = 'CEFR',
  IELTS = 'IELTS',
  TOEFL = 'TOEFL',
  TOEIC = 'TOEIC'
}

export interface LevelOption {
  system: LevelSystem;
  subLevel: string;
}

export interface TestContent {
  id: string;
  type: TestType;
  content: string; // Markdown or structured text
  isGenerated: boolean;
  vocabularyAnalysis?: Record<string, string>; // Map of word -> CEFR Level (e.g. "ubiquitous": "C2")
}

export interface GeneratedTest {
  [TestType.VOCABULARY]: TestContent;
  [TestType.WORDLIST]: TestContent;
  [TestType.GRAMMAR]: TestContent;
  [TestType.READING]: TestContent;
  [TestType.REWRITING]: TestContent;
  [TestType.ARRANGEMENT]: TestContent;
  [TestType.COMMUNICATION]: TestContent;
  [TestType.DICTIONARY]: TestContent;
  [TestType.TRANSLATE]: TestContent;
  [TestType.CEFR_CHECK]: TestContent;
}

export interface AppState {
  currentTab: TestType;
  topic: string;
  level: LevelOption;
  testData: GeneratedTest;
  isGenerating: boolean;
}
