type Level = "A1"|"A2"|"B1"|"B2";
type QType = "MCQ"|"CLOZE"|"ORDER";

type BaseQ = {
  id: string;           // "u1-l1-q1"
  type: QType;
  prompt: string;       // câu lệnh
  concept: string;      // nhãn ngữ pháp
  level?: Level;        // optional
  lessonId?: string;    // optional
  explain?: string;     // optional: 1-2 dòng
};

export type McqQ = BaseQ & {
  type: "MCQ";
  choices: string[];     // 3–6 lựa chọn
  answerIndex: number;   // 0-based
};

export type ClozeQ = BaseQ & {
  type: "CLOZE";
  template: string;      // "She {{1}} to school {{2}}."
  answers: string[];     // ["goes","every day"] — khớp số {{n}}
};

export type OrderQ = BaseQ & {
  type: "ORDER";
  tokens: string[];      // thứ tự ĐÚNG: ["She","likes","coffee","."]
};

export type Question = McqQ | ClozeQ | OrderQ;
