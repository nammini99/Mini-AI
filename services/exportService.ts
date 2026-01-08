import { Document, Packer, Paragraph, TextRun, AlignmentType, PageNumber, Footer, TabStopType } from "docx";
import FileSaver from "file-saver";
import { GeneratedTest, LevelOption, TestType } from "../types";

export const formatTestContent = (
  content: string
): string => {
  if (!content) return "";

  const answerKeyHeaderRegex = /\*\*(Answer Key|Answers):?\*\*/i;
  const headerIndex = content.search(answerKeyHeaderRegex);
  
  let mainBody = headerIndex !== -1 ? content.substring(0, headerIndex) : content;
  let rawAnswerKey = headerIndex !== -1 ? content.substring(headerIndex) : "";

  const answers: Record<string, string> = {};
  const answerMatches = rawAnswerKey.matchAll(/(\d+)\s*[:.]\s*(.+?)(?=\s+\d+\s*[:.]|$|\r?\n)/gi);
  for (const m of answerMatches) {
    const num = m[1];
    let val = m[2].trim();
    val = val.replace(/,$/, '').trim();
    answers[num] = val;
  }

  const lines = mainBody.split('\n');
  let currentQuestionNum: string | null = null;

  const processedLines = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return line;

    const questionMatch = trimmed.match(/^(\*\*|)(?:Question\s+)?(\d+)(?:[:.]?)\s*(\*\*|)\s*(.*)/i);
    
    if (questionMatch && !trimmed.match(/[A-D][.)]\s+/)) {
      const num = questionMatch[2];
      const restOfLine = questionMatch[4].trim();
      currentQuestionNum = num;
      
      return `Question ${num}. ${restOfLine.replace(/\*\*/g, '')}`;
    }

    if (trimmed.match(/([*]*[A-D][.)]\s+)/)) {
      let updatedLine = trimmed;
      if (currentQuestionNum && answers[currentQuestionNum]) {
        const correctVal = answers[currentQuestionNum].toUpperCase();
        if (correctVal.length === 1 && /[A-D]/.test(correctVal)) {
          const checkExistsRegex = new RegExp(`\\*${correctVal}[.)]`, 'i');
          if (!checkExistsRegex.test(updatedLine)) {
            const letterRegex = new RegExp(`(^|\\s|\\t)(${correctVal}[.)])`, 'g');
            updatedLine = updatedLine.replace(letterRegex, `$1*$2`);
          }
        }
      }
      return updatedLine;
    }

    if (trimmed.startsWith('=>')) return null;
    
    return trimmed;
  }).filter(l => l !== null);

  let sectionAnswerKey = "";
  if (Object.keys(answers).length > 0) {
    const hasLongAnswers = Object.values(answers).some(v => v.length > 5);
    const formattedPairs = Object.entries(answers)
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .map(([num, val]) => `${num}. ${val}`)
      .join(hasLongAnswers ? '\n' : '   ');
      
    sectionAnswerKey = `\n\nAnswer Key:\n${formattedPairs}`;
  } else if (rawAnswerKey) {
    sectionAnswerKey = `\n\n${rawAnswerKey.trim().replace(/\*\*/g, '')}`;
  }

  return processedLines.join('\n').trim() + sectionAnswerKey;
};

const renderRunsWithBolding = (text: string) => {
  const questionRegex = /^(Question\s+\d+[:.]?\s*)/i;
  const cefrLabelRegex = /^((?:B1|B2|C1|C2)\s*[:.]\s*)/i;
  const dialogueLabelRegex = /^([a-e]\.\s*)/i;
  
  const qMatch = text.match(questionRegex);
  const cefrMatch = text.match(cefrLabelRegex);
  const dMatch = text.match(dialogueLabelRegex);

  let labelPart = "";
  let remainingText = text;

  if (qMatch) {
    labelPart = qMatch[1];
    remainingText = text.slice(labelPart.length);
  } else if (cefrMatch) {
    labelPart = cefrMatch[1];
    remainingText = text.slice(labelPart.length);
  } else if (dMatch) {
    labelPart = dMatch[1];
    remainingText = text.slice(labelPart.length);
  }

  const runs: TextRun[] = [];

  if (labelPart) {
    runs.push(new TextRun({
      text: labelPart,
      bold: true,
      font: "Times New Roman",
      size: 24,
      color: (qMatch || dMatch) ? "0000FF" : "111827",
      underline: cefrMatch ? {} : undefined
    }));
  }

  const parts = remainingText.split(/([“"”][^“”"]*[“"”])|(\([^)]+\))|(\*\*[^*]+\*\*)|(\[[A-D]\])/g);
  let nameAlreadyStyled = false;

  parts.forEach(part => {
    if (!part) return;
    const isQuoted = /^[“"”].*[“"”]$/.test(part.trim());
    const isBrackets = /^\(.*\)$/.test(part.trim());
    const isMdBold = /^\*\*.*\*\*$/.test(part.trim());
    const isMarker = /^\[[A-D]\]$/.test(part.trim());
    
    let cleanText = part;
    let shouldBeBold = false;
    let color: string | undefined = undefined;
    
    if (isMdBold) {
       cleanText = part.replace(/\*\*/g, '');
       shouldBeBold = true;
       // Color dialogue character name blue
       if (dMatch && !nameAlreadyStyled) {
          color = "0000FF";
          nameAlreadyStyled = true;
       }
    } else if (isQuoted) {
       cleanText = part.replace(/\*\*/g, '');
       shouldBeBold = true;
    } else if (isBrackets || isMarker) {
       shouldBeBold = true;
       color = "0000FF";
    }

    runs.push(new TextRun({
      text: cleanText,
      bold: shouldBeBold,
      font: "Times New Roman",
      size: 24,
      color: color
    }));
  });

  return runs;
};

export const exportToWord = async (
  testData: GeneratedTest,
  topic: string,
  level: LevelOption
) => {
  const processContent = (text: string): Paragraph[] => {
    const lines = text.split('\n');
    const paragraphs: Paragraph[] = [];

    lines.forEach(lineRaw => {
      const line = lineRaw.trim();
      if (!line) return;
      
      const isQuestion = line.match(/^Question\s+\d+/i);
      const isCefrLine = line.match(/^(?:B1|B2|C1|C2)\s*[:.]/i);
      const isDialogueLine = line.match(/^[a-e]\.\s*/i);
      const isAnswerKeyHeader = line.match(/^Answer Key/i) || line.match(/^Answers/i);
      const hasOptions = line.match(/[*]*[A-D][.)]\s+/);

      if (isQuestion || isCefrLine || isDialogueLine) {
        paragraphs.push(new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { 
            before: isDialogueLine ? 40 : 120, 
            after: isDialogueLine ? 40 : 60, 
            line: 240, 
            lineRule: "auto" 
          },
          children: renderRunsWithBolding(line)
        }));
      } else if (hasOptions) {
        const optionParts = line.split(/\s*([*]*[A-D][.)]\s+)/g).filter(p => p !== "");
        const options: { label: string, text: string }[] = [];
        
        for (let i = 0; i < optionParts.length; i += 2) {
          if (optionParts[i] && optionParts[i+1]) {
            options.push({ label: optionParts[i].trim(), text: optionParts[i+1].trim() });
          } else if (optionParts[i] && optionParts[i].match(/[A-D][.)]/)) {
            options.push({ label: optionParts[i].trim(), text: (optionParts[i+1] || "").trim() });
          }
        }

        const maxLength = Math.max(...options.map(o => (o.label + o.text).length));
        let numCols = 4;
        if (maxLength > 35) numCols = 1;
        else if (maxLength > 18) numCols = 2;

        if (numCols === 1) {
          options.forEach(opt => {
            paragraphs.push(new Paragraph({
              alignment: AlignmentType.JUSTIFIED,
              spacing: { before: 0, after: 0, line: 240, lineRule: "auto" },
              children: [new TextRun({ text: `${opt.label} ${opt.text}`, font: "Times New Roman", size: 24 })]
            }));
          });
        } else if (numCols === 2) {
          for (let i = 0; i < options.length; i += 2) {
            const pair = options.slice(i, i + 2);
            paragraphs.push(new Paragraph({
              alignment: AlignmentType.JUSTIFIED,
              spacing: { before: 0, after: 0, line: 240, lineRule: "auto" },
              tabStops: [{ type: TabStopType.LEFT, position: 4500 }],
              children: [
                new TextRun({ text: `${pair[0].label} ${pair[0].text}`, font: "Times New Roman", size: 24 }),
                ...(pair[1] ? [new TextRun({ text: "\t", font: "Times New Roman" }), new TextRun({ text: `${pair[1].label} ${pair[1].text}`, font: "Times New Roman", size: 24 })] : [])
              ]
            }));
          }
        } else {
          const runs: TextRun[] = [];
          options.forEach((opt, idx) => {
            if (idx > 0) runs.push(new TextRun({ text: "\t", font: "Times New Roman" }));
            runs.push(new TextRun({ text: `${opt.label} ${opt.text}`, font: "Times New Roman", size: 24 }));
          });
          paragraphs.push(new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 0, after: 0, line: 240, lineRule: "auto" },
            tabStops: [
              { type: TabStopType.LEFT, position: 2200 },
              { type: TabStopType.LEFT, position: 4400 },
              { type: TabStopType.LEFT, position: 6600 },
            ],
            children: runs
          }));
        }
      } else if (isAnswerKeyHeader) {
        paragraphs.push(new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { before: 240, after: 60, line: 240, lineRule: "auto" },
          children: [new TextRun({ text: line, bold: true, font: "Times New Roman", size: 24 })]
        }));
      } else {
        paragraphs.push(new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { before: 0, after: 0, line: 240, lineRule: "auto" },
          children: [new TextRun({ text: line, font: "Times New Roman", size: 24 })]
        }));
      }
    });
    return paragraphs;
  };

  const allParagraphs: Paragraph[] = [];
  
  allParagraphs.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 400, line: 240, lineRule: "auto" },
    children: [new TextRun({ text: `ENGLISH TEST: ${topic.toUpperCase()}`, bold: true, size: 28, font: "Times New Roman", color: "0000FF" })]
  }));

  const order = [TestType.VOCABULARY, TestType.WORDLIST, TestType.GRAMMAR, TestType.COMMUNICATION, TestType.READING, TestType.REWRITING, TestType.ARRANGEMENT];
  order.forEach(type => {
    const section = testData[type];
    if (section && section.isGenerated) {
      allParagraphs.push(new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 240, after: 120, line: 240, lineRule: "auto" },
        children: [new TextRun({ text: `--- ${type.toUpperCase()} SECTION ---`, bold: true, size: 24, font: "Times New Roman", color: "0000FF" })]
      }));

      const formatted = formatTestContent(section.content);
      allParagraphs.push(...processContent(formatted));
    }
  });

  const doc = new Document({
    sections: [{
      properties: { 
        page: { 
          margin: { top: 720, right: 720, bottom: 720, left: 720 },
          size: { width: 11906, height: 16838 } // A4
        } 
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  children: [PageNumber.CURRENT],
                  font: "Times New Roman",
                  size: 24,
                }),
              ],
            }),
          ],
        }),
      },
      children: allParagraphs
    }]
  });

  const blob = await Packer.toBlob(doc);
  const saveAs = (FileSaver as any).saveAs || FileSaver;
  saveAs(blob, `Test_${topic.replace(/\s+/g, '_')}.docx`);
};
