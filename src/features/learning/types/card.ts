export type Card = {
  id: string;
  command: string;
  question: string;
  hint: string;
  answer: string;
  acceptedAnswers?: string[];
  example: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
};
