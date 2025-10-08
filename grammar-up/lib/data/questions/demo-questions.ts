type Level = "A1"|"A2"|"B1"|"B2";
type QType = "MCQ"|"CLOZE"|"ORDER"|"TRANSLATE";

type BaseQ = {
  id: string;
  level: Level;
  type: QType;
  question: string;
  explanation?: string;
};

export type McqQ = BaseQ & {
  type: "MCQ";
  options: string[];
  correctAnswer: string;
};

export type ClozeQ = BaseQ & {
  type: "CLOZE";
  text: string;
  correctAnswer: string;
};

export type OrderQ = BaseQ & {
  type: "ORDER";
  sentences: string[];
  correctOrder: number[];
};

export type TranslateQ = BaseQ & {
  type: "TRANSLATE";
  vietnameseText: string;     // "Tôi thích học tiếng Anh."
  correctAnswer: string;       // "I like learning English."
};

export type Question = McqQ | ClozeQ | OrderQ | TranslateQ;