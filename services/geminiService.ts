import { GoogleGenAI, Type } from "@google/genai";
import { TestType, LevelOption, LevelSystem } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_FAST = 'gemini-3-flash-preview';
const MODEL_QUALITY = 'gemini-3-pro-preview';

export interface DictionaryOptions {
  phrases: boolean;
  collocations: boolean;
  idioms: boolean;
}

export const translateText = async (text: string, targetLang: string = 'Vietnamese'): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: `Translate the following text into ${targetLang}. Return only the translated text.\n\nText: ${text}`,
    });
    return response.text || "";
  } catch (error) {
    console.error("Translation error:", error);
    return "";
  }
};

export const translateVocabList = async (text: string, targetLang: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: `Translate the following list of vocabulary items into ${targetLang}. For each item, return it in the format: "word (translation)". Join all items into a single string separated by ", ". Only return the result string.\n\nList:\n${text}`,
    });
    return response.text || "";
  } catch (error) {
    console.error("Vocab list translation error:", error);
    return "";
  }
};

export const refineContent = async (content: string, instruction: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_QUALITY,
      contents: `You are an expert English exam creator. Refine the following test content based on the instruction provided. Maintain the existing formatting rules (Question N., *A., etc.).\n\nExisting Content:\n${content}\n\nInstruction: ${instruction}`,
    });
    return response.text || content;
  } catch (error) {
    console.error("Refine error:", error);
    return content;
  }
};

export const analyzeCefrLevels = async (text: string): Promise<any[]> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_QUALITY,
      contents: `Analyze the following English text and identify academic words, collocations, idioms, and phrasal verbs. For each item, determine its CEFR level (A1-C2) and provide Vietnamese translation, synonyms, and antonyms. Return the result as a JSON array of objects.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              field: { type: Type.STRING, description: "The thematic field or category of the word." },
              word: { type: Type.STRING, description: "The word or expression identified." },
              form: { type: Type.STRING, description: "The form (e.g., Academic Word, Collocation, Idiom, Phrasal Verb)." },
              level: { type: Type.STRING, description: "CEFR Level (A1, A2, B1, B2, C1, or C2)." },
              meaning: { type: Type.STRING, description: "Vietnamese meaning." },
              synonyms: { type: Type.STRING, description: "Closest synonyms with their levels in parentheses." },
              antonyms: { type: Type.STRING, description: "Opposite meanings with their levels in parentheses." }
            },
            required: ["field", "word", "form", "level", "meaning", "synonyms", "antonyms"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("CEFR analysis error:", error);
    return [];
  }
};

export const lookupDictionary = async (word: string, options: DictionaryOptions): Promise<any> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_QUALITY,
      contents: `Provide a detailed dictionary entry for the English word or phrase: "${word}". Include phonetic, CEFR level, part of speech, Vietnamese translation, English definition, examples, and usage notes. Based on the following preferences: prepositional phrases (${options.phrases}), collocations (${options.collocations}), idioms (${options.idioms}).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            phonetic: { type: Type.STRING },
            level: { type: Type.STRING },
            partOfSpeech: { type: Type.STRING },
            translation: { type: Type.STRING },
            definition: { type: Type.STRING },
            examples: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  en: { type: Type.STRING },
                  vn: { type: Type.STRING }
                }
              }
            },
            usage_note: { type: Type.STRING },
            prepositional_phrases: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phrase: { type: Type.STRING },
                  vn: { type: Type.STRING }
                }
              }
            },
            collocations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  collocation: { type: Type.STRING },
                  vn: { type: Type.STRING }
                }
              }
            },
            idioms: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  idiom: { type: Type.STRING },
                  vn: { type: Type.STRING }
                }
              }
            }
          },
          required: ["word", "phonetic", "level", "partOfSpeech", "translation", "definition", "examples"]
        }
      }
    });
    return JSON.parse(response.text || "null");
  } catch (error) {
    console.error("Dictionary lookup error:", error);
    return null;
  }
};

export const getTrendingTopics = async (): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: "List 12 current trending global topics suitable for English language examinations. Return only a JSON array of strings. Do not use markdown code blocks.",
      config: { tools: [{ googleSearch: {} }] },
    });
    const text = response.text;
    if (!text) return [];
    const cleanText = text.replace(/```json|```/g, '').trim();
    try {
      const parsed = JSON.parse(cleanText);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  } catch (error) { return []; }
};

export const getTopicSuggestions = async (query: string, context?: string): Promise<string[]> => {
  if (!query && (!context || context === 'All')) return [];
  try {
    let prompt = !query && context 
      ? `List 8 key sub-topics or important keywords specifically for the English grammar category: "${context}". Return JSON array of strings.`
      : `Suggest 8 concise topic names or specific keywords related to "${query}"${context && context !== 'All' ? ` strictly related to the grammar category: "${context}"` : ''} for an English exam. Return JSON array of strings.`;
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) { return []; }
};

export const getGrammarSuggestions = async (category: string): Promise<string[]> => {
  const target = category === 'All' ? 'English Grammar' : category;
  const prompt = `List 15 popular and distinct grammar concepts, rules, or sub-topics specifically related to "${target}" for English learners. Return only a JSON array of strings.`;
  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) { return ["Present Simple", "Past Continuous", "Articles", "Prepositions", "Conditionals", "Passive Voice"]; }
}

export const generateTestSection = async (
  type: TestType,
  topic: string,
  level: LevelOption,
  quantity: number,
  subTypeInfo: string = "",
  additionalInstructions: string = ""
): Promise<string> => {
  let formatSpecific = "";
  let skipAnswerKey = false;
  
  if (type === TestType.WORDLIST) {
    skipAnswerKey = true;
    const isGlobalSuccess = level.system === LevelSystem.GLOBAL_SUCCESS;
    const levelInfo = isGlobalSuccess 
      ? `Dựa trên chương trình sách giáo khoa Global Success tại Việt Nam (Cấp độ: ${level.subLevel}).` 
      : `Dựa trên hệ thống trình độ ${level.system} (${level.subLevel}).`;

    formatSpecific = `ĐỊNH DẠNG RIÊNG CHO WORD LIST:
- Nhiệm vụ: Tạo danh sách từ vựng liên quan đến chủ đề "${topic}" được phân loại theo trình độ CEFR.
- QUY TẮC CỐT LÕI: ${levelInfo} 
${isGlobalSuccess ? "- YÊU CẦU ĐẶC BIỆT: Dữ liệu từ vựng PHẢI bám sát từ vựng xuất hiện trong bộ sách Global Success (MOET Vietnam) của khối lớp tương ứng." : ""}
- YÊU CẦU QUAN TRỌNG: Cung cấp ĐÚNG CHÍNH XÁC ${quantity} từ vựng cho MỖI trình độ: B1, B2, C1, và C2.
- ĐỊNH DẠNG HIỂN THỊ (BẮT BUỘC):
  B1: từ_1, từ_2, từ_3, ..., từ_${quantity}.
  B2: từ_1, từ_2, từ_3, ..., từ_${quantity}.
  C1: từ_1, từ_2, từ_3, ..., từ_${quantity}.
  C2: từ_1, từ_2, từ_3, ..., từ_${quantity}.
- QUY TẮC: 
  + Chỉ liệt kê từ vựng, không thêm IPA, nghĩa hay ví dụ. 
  + Các từ ngăn cách bởi dấu phẩy. 
  + Mỗi trình độ nằm trên 1 dòng duy nhất.
  + TUYỆT ĐỐI KHÔNG CUNG CẤP Answer Key cho dạng bài này.`;
  } else if (type === TestType.VOCABULARY) {
    if (subTypeInfo.includes("Word Choice")) {
      formatSpecific = `ĐỊNH DẠNG RIÊNG CHO WORD CHOICE:
- Nhiệm vụ: Chọn từ vựng phù hợp nhất với ngữ cảnh.
- Yêu cầu các phương án A, B, C, D phải là các từ hoàn toàn khác nhau về mặt ngữ nghĩa.`;
    } else if (subTypeInfo.includes("Synonyms")) {
      formatSpecific = `ĐỊNH DẠNG RIÊNG CHO SYNONYMS:
- Nhiệm vụ: Chọn từ/cụm từ có nghĩa GẦN NHẤT (CLOSEST) với từ trong ngoặc kép "WORD".`;
    } else if (subTypeInfo.includes("Antonyms")) {
      formatSpecific = `ĐỊNH DẠNG RIÊNG CHO ANTONYMS:
- Nhiệm vụ: Chọn từ/cụm từ có nghĩa TRÁI NGƯỢC (OPPOSITE) với từ trong ngoặc kép "WORD".`;
    } else if (subTypeInfo.includes("Word Formation 1")) {
      formatSpecific = `ĐỊNH DẠNG RIÊNG CHO WORD FORMATION 1:
- Dạng trắc nghiệm (Multiple Choice).
- Các phương án A, B, C, D là các dạng khác nhau của cùng một từ gốc (ví dụ: develop, developing, development, developer).
- Mẫu: Question 1. The ___________ of extensive green parks is a key part of the new city plan.
  A. developing   *B. development   C. develop   D. developer`;
    } else if (subTypeInfo.includes("Word Formation 2")) {
      formatSpecific = `ĐỊNH DẠNG RIÊNG CHO WORD FORMATION 2:
- Dạng tự luận điền từ vào chỗ trống.
- Cho từ gốc trong ngoặc đơn ở cuối câu.
- Mẫu: Question 2. Smart streetlights and cameras are installed to improve public ___________. (SAFE)`;
    } else if (subTypeInfo.includes("Collocation")) {
      formatSpecific = `ĐỊNH DẠNG RIÊNG CHO COLLOCATION:
- Nhiệm vụ: Chọn từ phù hợp để tạo thành một kết hợp từ tự nhiên (Collocation).
- ${subTypeInfo.includes("Chi tiết:") ? `YÊU CẦU PHÂN BỔ LOẠI COLLOCATION NHƯ SAU: ${subTypeInfo.split('Chi tiết: ')[1]}` : "Tập trung vào các collocation phổ biến."}
- TUYỆT ĐỐI CẤM: Không được dùng dạng bài Word Form (biến đổi hậu tố của cùng một từ gốc).
- CHẤT LƯỢNG ĐÁP ÁN: Đáp án đúng phải là một collocation PHỔ BIẾN, HỢP LÝ và được công nhận rộng rãi.
- YÊU CẦU PHƯƠNG ÁN (DISTRACTORS): Các lựa chọn A, B, C, D phải là các TỪ HOÀN TOÀN KHÁC NHAU, không chung gốc từ.`;
    }
  } else if (type === TestType.GRAMMAR) {
    if (subTypeInfo.includes("Rewrite 2")) {
      formatSpecific = `ĐỊNH DẠNG RIÊNG CHO REWRITE 2:
- Nhiệm vụ: Viết lại câu dựa trên từ/cụm từ gợi ý cho sẵn.
- YÊU CẦU CẤU TRÚC HIỂN THỊ (BẮT BUỘC):
  Question N. [Câu gốc hoàn chỉnh]
  ➔ [Phần gợi ý đầu câu] ............................................................
- Mẫu:
  Question 1. The scientist discovered a new element.
  ➔ A new element ............................................................`;
    } else if (subTypeInfo.includes("Sentence Transformation")) {
      formatSpecific = `ĐỊNH DẠNG RIÊNG CHO SENTENCE TRANSFORMATION:
- Nhiệm vụ: Viết lại câu sử dụng từ gợi ý cho sẵn trong ngoặc.
- YÊU CẦU CẤU TRÚC HIỂN THỊ (BẮT BUỘC):
  Question N. [Câu gốc hoàn chỉnh] ([TỪ GỢI Ý])
  ➝ [Phần gợi ý đầu câu cho câu viết lại]
- Quy tắc: Từ gợi ý (keyword) PHẢI nằm trong ngoặc đơn ở cuối câu gốc. Dùng mũi tên ➝ (U+279E) cho dòng viết lại.
- Mẫu:
  Question 1. We should not react without thinking twice. (HIP)
  ➝ Due`;
    } else if (subTypeInfo.includes("Reorder sentence")) {
      formatSpecific = `ĐỊNH DẠNG RIÊNG CHO REORDER SENTENCE:
- Nhiệm vụ: Sắp xếp các từ/cụm từ xáo trộn thành câu hoàn chỉnh.
- ${subTypeInfo.includes("Chi tiết:") ? `YÊU CẦU PHÂN BỔ LOẠI NHƯ SAU: ${subTypeInfo.split('Chi tiết: ')[1]}` : "Kết hợp trắc nghiệm và tự luận."}
- Với Reorder MTC: Cung cấp câu xáo trộn và 4 lựa chọn A, B, C, D cho trật tự đúng.
- Với Reorder Tự luận: Cung cấp câu xáo trộn (ví dụ: the / scientist / a / new / discovered / element).
- YÊU CẦU ĐÁP ÁN CHO REORDER TỰ LUẬN: BẮT BUỘC ghi rõ CÂU TRẢ LỜI HOÀN CHỈNH trong phần Answer Key ở cuối bài.
- Mẫu Answer Key cho Reorder Tự luận: 1. The scientist discovered a new element.`;
    }
  } else if (type === TestType.READING) {
    if (subTypeInfo.includes("Reading and answer")) {
      formatSpecific = `ĐỊNH DẠNG RIÊNG CHO READING AND ANSWER:
- Nhiệm vụ: Đọc đoạn văn và trả lời câu hỏi tự luận ngắn.
- YÊU CẦU VỀ ĐOẠN VĂN: Thêm biểu tượng ► (U+25BA) vào TRƯỚC mỗi đoạn văn trong bài đọc.
- YÊU CẦU CẤU TRÚC HIỂN THỊ:
  Question N. [Câu hỏi]
  Answer: ............................................................
- YÊU CẦU ĐÁP ÁN: Cung cấp đáp án đầy đủ và chính xác (logic) trong Answer Key.`;
    } else if (subTypeInfo.includes("Reading True/False")) {
      formatSpecific = `ĐỊNH DẠNG RIÊNG CHO READING TRUE/FALSE:
- Nhiệm vụ: Đọc đoạn văn và xác định các nhận định là Đúng (T) hay Sai (F).
- YÊU CẦU VỀ ĐOẠN VĂN: Thêm biểu tượng ► (U+25BA) vào TRƯỚC mỗi đoạn văn trong bài đọc.
- YÊU CẦU LOGIC: Các nhận định phải có tính logic cao, đúng tuyệt đối hoặc sai rõ ràng dựa trên văn bản.
- YÊU CẦU CẤU TRÚC HIỂN THỊ (BẮT BUỘC):
  Question N. [Nhận định] (T / F)
- Mẫu: Question 6. Experts believe that robots will definitely take every single job from humans. (T / F)
- YÊU CẦU ĐÁP ÁN: Ghi T hoặc F trong Answer Key.`;
    } else if (subTypeInfo.includes("Reading (Answer/True/False)")) {
      formatSpecific = `ĐỊNH DẠNG RIÊNG CHO READING (ANSWER/TRUE/FALSE):
- Nhiệm vụ: Đọc đoạn văn và trả lời kết hợp cả câu hỏi tự luận ngắn và nhận định Đúng/Sai.
- YÊU CẦU VỀ ĐOẠN VĂN: Thêm biểu tượng ► (U+25BA) vào TRƯỚC mỗi đoạn văn trong bài đọc.
- YÊU CẦU LOGIC: Mọi câu hỏi và nhận định phải đảm bảo tính chính xác và logic dựa trên thông tin từ bài đọc.
- ${subTypeInfo.includes("Chi tiết:") ? `YÊU CẦU PHÂN BỔ LOẠI NHƯ SAU: ${subTypeInfo.split('Chi tiết: ')[1]}` : ""}
- Cấu trúc cho câu trả lời (Answer):
  Question N. [Câu hỏi]
  Answer: ............................................................
- Cấu trúc cho câu Đúng/Sai (True/False):
  Question N. [Nhận định] (T / F)
- Mẫu T/F: Question 6. Robots in factories are described as being slower but safer than human workers. (T / F)
- YÊU CẦU ĐÁP ÁN TRONG ANSWER KEY:
  + Đối với Reading and answer: Ghi câu trả lời đầy đủ, súc tích và đúng logic.
  + Đối với Reading True/False: Ghi T hoặc F dựa trên dữ kiện bài học.`;
    } else if (subTypeInfo.includes("Reading Comprehension")) {
      formatSpecific = `ĐỊNH DẠNG RIÊNG CHO READING COMPREHENSION (MCQ):
- Nhiệm vụ: Tạo một bài đọc hiểu hoàn chỉnh với các câu hỏi trắc nghiệm A, B, C, D.
- YÊU CẦU CẤU TRÚC (BẮT BUỘC): Phải trình bày TOÀN BỘ bài đọc trước (với các đoạn bắt đầu bằng ►), sau đó mới đến các câu hỏi trắc nghiệm bên dưới.
- YÊU CẦU VỀ ĐOẠN VĂN: 
  + BẮT BUỘC thêm biểu tượng ► (U+25BA) vào ngay TRƯỚC mỗi đoạn văn.
  + TUYỆT ĐỐI KHÔNG viết chữ "Paragraph" hay bất kỳ nhãn nào sau ►. Nội dung đoạn văn phải bắt đầu ngay lập tức sau ký hiệu ►.
- ĐỊNH DẠNG TỪ VỰNG & CÂU HỎI (BẮT BUỘC): 
  + Mọi từ/cụm từ mục tiêu (với câu hỏi Closest, Opposite, Pronoun Reference) xuất hiện trong BÀI ĐỌC hoặc trong NỘI DUNG CÂU HỎI phải được bao quanh bởi dấu ngoặc kép và in đậm: **"word"**. 
  + Ví dụ đúng: **"ubiquitous"**, **"break a leg"**. 
  + Hệ thống sẽ giữ nguyên dấu ngoặc kép và in đậm từ này khi hiển thị.
- MARKERS: Các ký hiệu [A], [B], [C], [D] xuất hiện trong bài đọc phải được IN ĐẬM: **[A]**, **[B]**, **[C]**, **[D]**.
- YÊU CẦU CÂU HỎI:
  + Dấu * của đáp án đúng phải đứng LIỀN KỀ ngay trước chữ cái của phương án: *A., *B., *C., *D. (Không có khoảng trắng giữa dấu * và chữ cái).
  + Hãy điều chỉnh độ dài của các phương án A, B, C, D trong cùng một câu hỏi sao cho tương đương/bằng nhau nhất có thể.
- YÊU CẦU THỨ TỰ CÂU HỎI (BẮT BUỘC): 
  + Câu hỏi đầu tiên (Question 1) luôn phải là câu hỏi về ý chính (Main Idea).
  + Các câu hỏi dạng "Discussion" (Which paragraph mentions...?) hoặc Paragraph Identification phải được nhóm lại với nhau và luôn nằm ở CUỐI CÙNG của bộ câu hỏi.
- Phân bổ các loại câu hỏi một cách tự nhiên (Main Idea, Detail, Inference, Vocabulary, etc.) để đạt tổng số ${quantity} câu hỏi.`;
    } else if (subTypeInfo.includes("Reading Cloze (Advertisement)")) {
      formatSpecific = `ĐỊNH DẠNG RIÊNG CHO READING CLOZE (ADVERTISEMENT):
- Nhiệm vụ: Tạo một bài quảng cáo (Advertisement) với các chỗ trống (cloze test).
- YÊU CẦU VỀ HƯỚNG DẪN (INSTRUCTIONS): Phắt đầu bằng: "Read the following advertisement and mark the letter A, B, C or D on your answer sheet to indicate the option that best fits each of the numbered blanks."
- YÊU CẦU VỀ TIÊU ĐỀ: Phải có tiêu đề dạng "JOB ADVERTISEMENT: [Tên công việc]!"
- YÊU CẦU VỀ ĐOẠN VĂN:
  + Văn bản quảng cáo ngắn gọn, súc tích.
  + Chỗ trống được ký hiệu là (1) ___________, (2) ___________, v.v.
  + Cuối đoạn văn phải có phần "Contact Us: Email your application to [email] or call us at [số điện thoại] for more information."
- YÊU CẦU VỀ CÂU HỎI (BẮT BUỘC):
  + Phải tuân thủ nghiêm ngặt số lượng các loại câu hỏi theo chi tiết sau: ${subTypeInfo.split('Chi tiết: ')[1] || 'Sử dụng đa dạng các chủ điểm ngữ pháp và từ vựng.'}
  + Với 'Passive voice', tập trung vào câu hỏi dạng bị động, đặc trưng là cấu trúc (V3/ED + BY).
  + Định dạng: Question N. (N) A. ...  B. ...  C. ...  D. ...
  + Ví dụ: Question 1. (1) A. energy   *B. energetic   C. energetically   D. energize
- PHÂN BỔ LOẠI CÂU HỎI: Sử dụng kết hợp Word Form, Collocation, Grammar, Word Choice phù hợp.`;
    } else if (subTypeInfo.includes("Reading Cloze (Leaflet)")) {
      formatSpecific = `ĐỊNH DẠNG RIÊNG CHO READING CLOZE (LEAFLET):
- Nhiệm vụ: Tạo một tờ rơi (Leaflet) với các chỗ trống (cloze test).
- YÊU CẦU VỀ HƯỚNG DẪN (INSTRUCTIONS): "Read the following leaflet and mark the letter A, B, C or D on your answer sheet to indicate the option that best fits each of the numbered blanks." (Có thể kèm theo số câu, ví dụ: from 7 to 12).
- YÊU CẦU VỀ CẤU TRÚC TỜ RƠI:
  + Tiêu đề chính (Title): Ví dụ: "STEM Education: Inspiring the Next Generation"
  + Khẩu hiệu (Slogan): Ví dụ: "Unlock your potential with STEM!"
  + Các tiểu mục (Sections): Có các tiêu đề như "Why is STEM Important?", "How to Get Involved:".
  + Các điểm liệt kê (Bullet points): BẮT BUỘC sử dụng ký hiệu ✙ (U+271A) ở đầu mỗi điểm liệt kê trong mục "How to Get Involved".
- YÊU CẦU VỀ CHỖ TRỐNG: Ký hiệu là (1) ___________, (2) ___________, v.v.
- YÊU CẦU VỀ CÂU HỎI (BẮT BUỘC):
  + Phải tuân thủ nghiêm ngặt số lượng các loại câu hỏi theo chi tiết sau: ${subTypeInfo.split('Chi tiết: ')[1] || 'Sử dụng đa dạng các chủ điểm ngữ pháp và từ vựng.'}
  + Với 'Passive voice', tập trung vào câu hỏi dạng bị động, đặc trưng là cấu trúc (V3/ED + BY).
  + Định dạng: Question N. (N) A. ...  B. ...  C. ...  D. ...
  + Ví dụ: Question 7. (1) A. stands up   B. asks for   *C. stands for   D. writes down
- PHÂN BỔ LOẠI CÂU HỎI: Sử dụng đa dạng các chủ điểm ngữ pháp và từ vựng (Phrasal verbs, Collocations, Vocabulary in context).`;
    } else if (subTypeInfo.includes("Reading Cloze Advanced")) {
      formatSpecific = `ĐỊNH DẠNG RIÊNG CHO READING CLOZE ADVANCED:
- Nhiệm vụ: Tạo một bài đọc điền từ nâng cao (C1-C2).
- YÊU CẦU VỀ HƯỚNG DẪN (INSTRUCTIONS): "Read the following passage and mark the letter A, B, C, or D on your answer sheet to indicate the correct word or phrase that fits best each of the numbered blanks."
- YÊU CẦU VỀ TIÊU ĐỀ: Bài đọc phải có một tiêu đề (Title) được in đậm and căn giữa.
- YÊU CẦU VỀ ĐOẠN VĂN:
  + Văn bản học thuật hoặc báo chí chất lượng cao.
  + Chỗ trống ký hiệu là (N) ___________ (ví dụ: (51) ___________).
  + Cuối đoạn văn PHẢI có dòng "Adapted from [Source Name]" in nghiêng, căn phải.
- YÊU CẦU VỀ CÂU HỎI:
  + Định dạng: Question N. (N) A. ... B. ... C. ... D. ...
  + Ví dụ: Question 51. (51) A. condensing *B. throwing C. saturating D. diluting
- PHÂN BỔ LOẠI CÂU HỎI: Tập trung vào từ vựng học thuật, collocation hiếm, và các cấu trúc ngữ pháp phức tạp.`;
    } else if (subTypeInfo.includes("Reading Matching")) {
      formatSpecific = `ĐỊNH DẠNG RIÊNG CHO READING MATCHING (SENTENCE CLOZE):
- Nhiệm vụ: Đọc đoạn văn và chọn PHẦN CÂU hoặc CÂU phù hợp nhất để điền vào chỗ trống.
- YÊU CẦU VỀ HƯỚNG DẪN (INSTRUCTIONS): "Read the following passage and mark the letter A, B, C or D on your answer sheet to indicate the option that best fits each of the numbered blanks from [N] to [M]."
- YÊU CẦU VỀ TIÊU ĐỀ: Bài đọc phải có một tiêu đề (Title) được in đậm and căn giữa.
- YÊU CẦU VỀ ĐOẠN VĂN:
  + Văn bản chia làm nhiều đoạn văn (paragraphs).
  + Chỗ trống ký hiệu là (1), (2), v.v. đặt ở giữa hoặc cuối câu (ví dụ: ..., (1) ___________).
- YÊU CẦU VỀ CÂU HỎI:
  + Định dạng: Question N: (X) (Với N là số thứ tự câu hỏi trong đề, X là số thứ tự chỗ trống trong bài).
  + Các phương án A, B, C, D phải là các cụm từ dài, vế câu hoặc cả câu hoàn chỉnh có tính logic cao.
  + Mẫu: Question 18: (1)
    A. which was officially launched...
    *B. was officially launched to the public in July 2016
    C. of which the app was...
    D. having been officially...
- PHÂN BỔ LOẠI CÂU HỎI: Tập trung vào logic đoạn văn, liên kết câu, mệnh đề quan hệ và rút gọn mệnh đề.`;
    } else if (subTypeInfo.includes("Reading Open-Guided")) {
      formatSpecific = `ĐỊNH DẠNG RIÊNG CHO READING OPEN-GUIDED:
- Nhiệm vụ: Đọc đoạn văn và chọn từ phù hợp từ danh sách (Box) cho sẵn để điền vào chỗ trống.
- YÊU CẦU VỀ HƯỚNG DẪN (INSTRUCTIONS): "Read the following passage and choose the most suitable word from the ones given in the box to fill in each gap."
- YÊU CẦU VỀ KHUNG TỪ VỰNG (WORD BOX):
  + Liệt kê các từ cần điền (đúng số lượng chỗ trống) ngay bên dưới câu hướng dẫn.
  + Các từ cách nhau bởi khoảng trắng hoặc dấu Tab (để hiển thị thành một dòng hoặc khối).
- YÊU CẦU VỀ ĐOẠN VĂN:
  + Chỗ trống ký hiệu là (1) ___________, (2) ___________, v.v.
- YÊU CẦU VỀ ĐĐÁP ÁN: Ghi rõ số thứ tự và từ đúng trong Answer Key.`;
    }
  } else if (type === TestType.ARRANGEMENT) {
    if (subTypeInfo.includes("Word Order (Adjectives)")) {
      formatSpecific = `ĐỊNH DẠNG RIÊNG CHO WORD ORDER (ADJECTIVES):
- Nhiệm vụ: Chọn phương án có trật tự tính từ đúng nhất dựa trên quy tắc OSASCOMP (Opinion - Size - Age - Shape - Color - Origin - Material - Purpose).
- YÊU CẦU ĐỊNH DẠNG (BẮT BUỘC): Trình bày dưới dạng trắc nghiệm trật tự từ.
- QUY TẮC HIỂN THỊ: Mỗi câu hỏi chiếm 2-3 dòng. Phương án A, B trên một dòng; C, D trên dòng tiếp theo (hoặc tất cả trên 2 dòng).
- Mẫu (BẮT BUỘC THEO SÁT):
  Question 1. 
  A. a wooden small old house			B. a small wooden old house
  C. an old small wooden house			*D. a small old wooden house
  
  Question 2. 
  A. many cultural famous heritage sites			*B. many famous cultural heritage sites
  C. many heritage famous cultural sites			D. famous many cultural heritage sites
- YÊU CẦU ĐÁP ÁN: Ghi rõ số thứ tự và phương án đúng trong Answer Key.`;
    } else {
      formatSpecific = `ĐỊNH DẠNG RIÊNG CHO ARRANGEMENT:
- Nhiệm vụ: Sắp xếp các câu/vế thành một đoạn văn, hội thoại hoặc lá thư hoàn chỉnh.
- YÊU CẦU VỀ NHÃN (LABELING): Sử dụng chữ cái thường kèm dấu chấm (a., b., c., d., e.) cho các thành phần cần sắp xếp.
- YÊU CẦU VỀ PHƯƠNG ÁN (OPTIONS): Các lựa chọn A, B, C, D phải biểu diễn thứ tự bằng dấu gạch ngang dài — (U+2014) giữa các chữ cái.
- YÊU CẦU CHI TIẾT THEO TỪNG LOẠI:
  1. Dialogue (Hội thoại):
     - Định dạng: a. **[Tên nhân vật]**: [Nội dung nói]
     - YÊU CẦU: Tên nhân vật PHẢI được in đậm bằng dấu sao **.
     - Mẫu (BẮT BUỘC THEO SÁT): 
       a. **John**: Have you ever celebrated Thanksgiving?
       b. **Tina**: No, but I've seen it in movies; it looks fun.
       c. **John**: It is! It's all about family and gratitude.
       A. a—b—c    *B. a—c—b
  2. Letter/Email (Thư/Email):
     - Phải có lời chào (Greeting) ở trên cùng.
     - Phải có lời kết (Closing) và tên người gửi ở dưới cùng các phương án a, b, c...
     - Mẫu:
       Dear Mr. Smith,
       a. [Sentence 1]
       b. [Sentence 2]
       Sincerely, David
       A. a—b    *B. b—a
  3. Paragraph (Đoạn văn):
     - Các câu văn rời rạc được gắn nhãn a, b, c, d, e.
     - Mẫu:
       a. [Sentence A]
       b. [Sentence B]
       A. a—b    *B. b—a
- YÊU CẦU VỀ ĐOẠN VĂN:
  + Chỗ trống ký hiệu là (1) ___________, (2) ___________, v.v.
- YÊU CẦU VỀ ĐOẠN VĂN MẪU TỪ NGƯỜI DÙNG: Twenty years ago, people tried to leave the suburbs...
- YÊU CẦU VỀ ĐÁP ÁN: Ghi rõ số thứ tự và từ đúng trong Answer Key (ví dụ: 1. A, 2. B...).`;
    }
  }

  const prompt = `Bạn là chuyên gia soạn đề thi tiếng Anh cấp quốc gia.
Nhiệm vụ: Tạo phần thi **${type}** (${subTypeInfo}).
Chủ đề: ${topic}. Trình độ: ${level.system} ${level.subLevel}.
Số lượng: ĐÚNG CHÍNH XÁC **${quantity}** CÂU/MỤC.

QUY TẮC CÂN BẰNG ĐÁP ÁN (BẮT BUỘC):
- Tỷ lệ đáp án đúng giữa các phương án A, B, C, D phải CÂN BẰNG TUYỆT ĐỐI. 
- Ví dụ: Nếu đề có 20 câu hỏi MCQ, số lượng đáp án đúng rơi vào A, B, C, D phải xấp xỉ 5 câu cho mỗi chữ cái. 
- TUYỆT ĐỐI KHÔNG để một chữ cái (ví dụ A) chiếm đa số đáp án đúng.
- Vị trí đáp án đúng phải được XÁO TRỘN NGẪU NHIÊN hoàn toàn, không theo quy luật dễ đoán.

YÊU CẦU ĐỊNH DẠNG ĐỀ THI:
1. Question format: Luôn bắt đầu bằng "Question N." (Ví dụ: Question 1., Question 2.). Không dùng các ký hiệu Markdown như dấu sao ** cho số thứ tự câu.
2. TRONG NỘI DUNG CÂU HỎI: Với các câu trắc nghiệm, hãy thêm dấu * vào ngay trước chữ cái của đáp án đúng (ví dụ: *A. , *B. , *C. , *D. ).
3. Các lựa chọn A, B, C, D phải trên CÙNG MỘT DÒNG.
4. Dùng ___________ cho chỗ trống.
${formatSpecific}

YÊU CẦU ĐÁP ÁN:
- ${skipAnswerKey ? "KHÔNG CUNG CẤP ANSWER KEY." : "BẮT BUỘC cung cấp phần \"**Answer Key:**\" ở cuối bài."}
- Định dạng Answer Key: "1. A, 2. B, 3. C, 4. D..." hoặc đối với tự luận (Reorder, Rewrite) "1. [Full Correct Sentence]", "2. safety"... hoặc đối với True/False "1. T, 2. F...".

Chỉ trả về nội dung đề thi${skipAnswerKey ? "" : " và Answer Key"}.

${additionalInstructions}`;

  try {
    const response = await ai.models.generateContent({ model: MODEL_QUALITY, contents: prompt });
    return response.text || "Failed to generate content.";
  } catch (error) { return `Error generating content.`; }
};
