import { useState } from 'react';

import { evaluateManualAnswer } from '../lib/commandMatcher';
import { Card } from '../types/card';
import { FeedbackTone } from './useToast';

type ManualFeedback = {
  body: string;
  title: string;
  tone: FeedbackTone;
} | null;

type UseManualAnswerParams = {
  currentCard: Card | null;
  markCardForReview: (cardId: string, source?: 'swipe' | 'manual') => Promise<void>;
  markCardKnown: (cardId: string, source?: 'swipe' | 'manual') => Promise<void>;
  onClose: () => void;
  pulseCardFeedback: (tone: FeedbackTone) => void;
  showToast: (tone: FeedbackTone, title: string, body: string) => void;
};

export function useManualAnswer({
  currentCard,
  markCardForReview,
  markCardKnown,
  onClose,
  pulseCardFeedback,
  showToast,
}: UseManualAnswerParams) {
  const [manualAnswer, setManualAnswer] = useState('');
  const [manualFeedback, setManualFeedback] = useState<ManualFeedback>(null);

  const resetManualAnswer = () => {
    setManualAnswer('');
    setManualFeedback(null);
  };

  const closeAnswerSheet = () => {
    onClose();
    resetManualAnswer();
  };

  const updateManualAnswer = (value: string) => {
    setManualAnswer(value);

    if (manualFeedback) {
      setManualFeedback(null);
    }
  };

  const submitManualAnswer = async () => {
    if (!currentCard) {
      return;
    }

    const result = evaluateManualAnswer(currentCard, manualAnswer);

    if (result.correct) {
      setManualFeedback({
        body: result.body,
        title: result.title,
        tone: 'success',
      });
      pulseCardFeedback('success');
      await markCardKnown(currentCard.id, 'manual');
      showToast(
        'success',
        '+18 опыта',
        'Отличный ручной ответ. Это лучший тип закрепления.',
      );
      closeAnswerSheet();
      return;
    }

    setManualFeedback({
      body: result.body,
      title: result.title,
      tone: 'warning',
    });
    pulseCardFeedback('warning');
  };

  const sendManualToReview = async () => {
    if (!currentCard) {
      return;
    }

    pulseCardFeedback('warning');
    await markCardForReview(currentCard.id, 'manual');
    showToast('warning', '+6 опыта', 'Карточка ушла в повтор и вернется раньше.');
    closeAnswerSheet();
  };

  return {
    closeAnswerSheet,
    manualAnswer,
    manualFeedback,
    resetManualAnswer,
    sendManualToReview,
    submitManualAnswer,
    updateManualAnswer,
  };
}
