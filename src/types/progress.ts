export type CardOutcome = "known" | "review";

export type LearningState = {
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
