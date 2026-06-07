export type CardOutcome = 'known' | 'review';

export type ReviewMeta = {
  count: number;
  lastReviewedOn: string;
};

export type DailyProgress = {
  date: string;
  completed: number;
};

export type ManualStats = {
  attempts: number;
  correct: number;
};

export type LearningState = {
  progress: Record<string, CardOutcome>;
  reviewMeta: Record<string, ReviewMeta>;
  xp: number;
  streak: number;
  lastActiveOn: null | string;
  dailyGoal: number;
  dailyProgress: DailyProgress;
  manualStats: ManualStats;
};

export type LearningStats = {
  total: number;
  completed: number;
  known: number;
  review: number;
  remaining: number;
  completion: number;
  reviewQueueCount: number;
  xp: number;
  level: number;
  streak: number;
  dailyGoal: number;
  todayCompleted: number;
  dailyGoalProgress: number;
  dailyGoalDone: boolean;
  manualAttempts: number;
  manualCorrect: number;
  manualAccuracy: number;
  topics: TopicProgress[];
};

export type TopicProgress = {
  category: string;
  completed: number;
  known: number;
  percent: number;
  review: number;
  total: number;
};
