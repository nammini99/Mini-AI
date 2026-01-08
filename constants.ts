
// Reading Subtypes Definitions

export const READING_CLOZE_SUBTYPES = {
  'Quantifiers': 'some, any, much, many, few, little, several, enough, all, most, no, range, amount, deal, number',
  'Determiners': 'a, an, the, other, another',
  'Distributives': 'each, every, either, neither, both, all, none',
  'Word Formation': 'Converting word classes (e.g., act -> active).',
  'Word Choice': 'Selecting the most appropriate vocabulary contextually.',
  'Relative Clauses': 'Who, which, that, whose usage.',
  'Reduced relative clause': 'Focus on reduced relative clauses in passive form (V3/ed).',
  'Passive voice': 'Focus on passive verb forms, specifically the (V3/ED + BY) structure.',
  'Phrasal Verbs': 'Verb + particle combinations.',
  'Conjunctions': 'Linking words (however, despite, because).',
  'Collocations': 'Natural word pairings.',
  'Prepositions': 'Dependent prepositions and time/place markers.',
  'Gerund/Infinitive': 'Verb patterns (enjoy doing vs want to do).',
  'Word Order': 'Correct sentence structure placement.'
};

export const READING_CLOZE_ADVANCED_SUBTYPES = {
  'Word Choice': 'Selecting the most appropriate vocabulary contextually (Advanced/C1-C2).',
  'Collocations': 'Focus on pairings of verb+adverb, adverb+adjective, or adjective+noun.',
  'Phrasal Verbs': 'Complex and formal phrasal verbs.',
  'Conjunctions': 'Strictly focus on Subordinating Conjunctions (because, although, if, since, while).',
  'Idioms': 'Common and advanced idiomatic expressions.',
  'Quantifiers': 'some, any, much, many, few, little, several, enough, all, most, no, range, amount, deal, number',
  'Distributives': 'each, every, either, neither, both, all, none',
  'Prepositional Phrases': 'Idiomatic fixed phrases starting with or containing prepositions.'
};

export const READING_COMP_SUBTYPES = {
  'Main Idea': 'Identify the primary theme or purpose.',
  'Detail': 'Retrieve specific stated information.',
  'Factual: TRUE/MENTIONED': 'Identify which statement is true or mentioned.',
  'Negative Factual': 'Identify what is NOT mentioned or true.',
  'Vocabulary': 'Synonyms/Antonyms in context.',
  'Inference': 'Draw conclusions not explicitly stated.',
  'Rhetorical Purpose': 'Why the author included specific information.',
  'Reference': 'Identify what a pronoun refers to.',
  'Restatement': 'Paraphrasing essential information.',
  'Sentence Insertion': 'Best placement for a new sentence.',
  'Best Summary (Passage)': 'Choose the option that best summarizes the entire text.',
  'Best Summary (Paragraph)': 'Choose the option that best summarizes a specific paragraph.',
  'Discussion': 'Identify the paragraph containing specific information.'
};

export const READING_ANSWER_SUBTYPES = {
  'Detail': 'Answer specific questions based on facts in the text.',
  'Main Idea': 'Answer questions about the overall purpose or theme.',
  'Inference': 'Answer questions requiring logical deduction.',
  'Vocabulary': 'Explain the meaning of specific words or phrases in context.',
  'Author Opinion': 'Describe the author\'s attitude or perspective.'
};

export const READING_TRUEFALSE_SUBTYPES = {
  'Factual Detail': 'Decide if a specific fact is true or false.',
  'Main Idea': 'Decide if a summary statement is true or false.',
  'Inference': 'Decide if a deduced statement is true or false based on text logic.'
};

export const READING_MIXED_SUBTYPES = {
  'Reading and answer': 'Short answer questions requiring open-ended text response.',
  'Reading True/False': 'Determining whether statements are correct or incorrect based on the passage.'
};

export const READING_MATCHING_SUBTYPES = {
  'Sentence Insertion': 'Choose the correct sentence to complete the paragraph (Logic/Coherence).',
  'Grammar & Structure': 'Choose the correct clause or phrase (Relative clauses, conjunctions, etc.).'
};

export const READING_OPEN_GUIDED_SUBTYPES = {
  'Preposition': 'Supply the correct preposition.',
  'Word Formation': 'Supply the correct word form.',
  'Conjunction': 'Supply the correct linking word.',
  'Idiom': 'Supply the missing word to complete a common idiom.',
  'Gerund/Infinitive': 'Supply the correct verb form.',
  'Comparison': 'Focusing on form of adjective and adverb.'
};

export const COMMUNICATION_SUBTYPES = {
  'Type 1': 'Request, Suggest, Permission, Agree/Disagree',
  'Type 2': 'Invitation, Recommendation, Advice',
  'Type 3': 'Warning, Apologizing, Compliment, Congratulation, Encouragement',
  'Type 4': 'Asking (direction, time, plan, transportation)'
};

export const ARRANGEMENT_SUBTYPES = {
  'Word Order (Adjectives)': 'OSASCOMP rules (Opinion, Size, Age, Shape, Color, Origin, Material, Purpose).',
  'Dialogue (3 lines)': 'Reorder a short conversation (a, b, c).',
  'Dialogue (5 lines)': 'Reorder a longer conversation (a, b, c, d, e).',
  'Letter/Email': 'Reorder body sentences of a formal letter/email.',
  'Paragraph': 'Reorder sentences to form a coherent paragraph.'
};

export const VOCAB_COLLOCATION_SUBTYPES = {
  'Verb & Adverb': 'Example: "whisper softly", "walk quickly", "badly need", "completely understand".',
  'Adverb + Adjective': 'Example: "extremely happy", "highly successful", "bitterly cold".',
  'Verb + Noun': 'Example: "match the requirements", "show interest", "gain experience".'
};

export const GRAMMAR_REORDER_SUBTYPES = {
  'Reorder MTC': 'Sắp xếp các từ/cụm từ xáo trộn thành câu hoàn chỉnh dưới dạng TRẮC NGHIỆM (chọn đáp án A, B, C, D).',
  'Reorder Tự luận': 'Sắp xếp các từ/cụm từ xáo trộn thành câu hoàn chỉnh dưới dạng TỰ LUẬN (viết lại cả câu).'
};

export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const VOCAB_HIGHLIGHT_OPTIONS = [
  ...CEFR_LEVELS,
  'Collocation',
  'Idiom',
  'Phrasal Verb'
];

// Used for the toggle buttons in Sidebar (Light Backgrounds)
export const CEFR_COLORS: Record<string, string> = {
  'A1': 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200',
  'A2': 'bg-sky-100 text-sky-700 border-sky-200 hover:bg-sky-200',
  'B1': 'bg-lime-100 text-lime-700 border-lime-200 hover:bg-lime-200',
  'B2': 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200',
  'C1': 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200',
  'C2': 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200',
  'Collocation': 'bg-pink-100 text-pink-700 border-pink-200 hover:bg-pink-200',
  'Idiom': 'bg-violet-100 text-violet-700 border-violet-200 hover:bg-violet-200',
  'Phrasal Verb': 'bg-teal-100 text-teal-700 border-teal-200 hover:bg-teal-200'
};

// Used for the actual text highlights in Reading Passage (Stronger/Distinct Colors)
export const CEFR_HIGHLIGHT_COLORS: Record<string, string> = {
  'A1': 'bg-slate-300 text-slate-900',
  'A2': 'bg-sky-300 text-sky-900',
  'B1': 'bg-lime-300 text-lime-900',
  'B2': 'bg-yellow-300 text-yellow-900',
  'C1': 'bg-orange-300 text-orange-900',
  'C2': 'bg-red-300 text-red-900',
  'Collocation': 'bg-pink-300 text-pink-900',
  'Idiom': 'bg-violet-300 text-violet-900',
  'Phrasal Verb': 'bg-teal-300 text-teal-900'
};
