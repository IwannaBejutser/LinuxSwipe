export type Card = {
  id: string;
  command: string;
  question: string;
  hint: string;
  answer: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
};
