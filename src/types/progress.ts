export type CardOutcome = "known" | "review";

export type LearningState = {
  currentIndex: number;
  progress: Record<string, CardOutcome>;
};

export type LearningStats = {
  total: number;
  completed: number;
  known: number;
  review: number;
  remaining: number;
  completion: number;
};
