import { cards } from "../data/learningCards";
import { LearningState, LearningStats } from "../types/progress";
import { getLocalDateStamp } from "./date";
import { levelFromXp } from "./xp";

export const buildStats = (state: LearningState): LearningStats => {
  const progressValues = Object.values(state.progress);
  const known = progressValues.filter((value) => value === "known").length;
  const review = progressValues.filter((value) => value === "review").length;
  const completed = progressValues.length;
  const total = cards.length;
  const todayCompleted =
    state.dailyProgress.date === getLocalDateStamp() ? state.dailyProgress.completed : 0;
  const manualAttempts = state.manualStats.attempts;
  const manualCorrect = state.manualStats.correct;

  return {
    total,
    completed,
    known,
    review,
    remaining: Math.max(total - completed, 0),
    completion: total === 0 ? 0 : completed / total,
    reviewQueueCount: review,
    xp: state.xp,
    level: levelFromXp(state.xp),
    streak: state.streak,
    dailyGoal: state.dailyGoal,
    todayCompleted,
    dailyGoalProgress: state.dailyGoal === 0 ? 0 : Math.min(todayCompleted / state.dailyGoal, 1),
    dailyGoalDone: todayCompleted >= state.dailyGoal,
    manualAttempts,
    manualCorrect,
    manualAccuracy: manualAttempts === 0 ? 0 : manualCorrect / manualAttempts
  };
};
