import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Animated, PanResponder } from 'react-native';

import { Card } from '../types/card';
import { FeedbackTone } from './useToast';

type UseCardSwipeParams = {
  currentCard: Card | null;
  markCardForReview: (cardId: string, source?: 'swipe' | 'manual') => Promise<void>;
  markCardKnown: (cardId: string, source?: 'swipe' | 'manual') => Promise<void>;
  onSwipeComplete?: () => void;
  pulseCardFeedback: (tone: FeedbackTone) => void;
  showToast: (tone: FeedbackTone, title: string, body: string) => void;
  swipeOffset: Animated.Value;
};

const swipeThreshold = 82;
const exitDistance = 540;

export function useCardSwipe({
  currentCard,
  markCardForReview,
  markCardKnown,
  onSwipeComplete,
  pulseCardFeedback,
  showToast,
  swipeOffset,
}: UseCardSwipeParams) {
  const currentCardRef = useRef<Card | null>(null);
  const isCompletingSwipeRef = useRef(false);

  useEffect(() => {
    currentCardRef.current = currentCard;
  }, [currentCard]);

  const resetCardPosition = useCallback(() => {
    Animated.spring(swipeOffset, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 8,
      speed: 13,
    }).start();
  }, [swipeOffset]);

  const completeSwipe = useCallback(
    (card: Card, direction: 'up' | 'down') => {
      if (isCompletingSwipeRef.current) {
        return;
      }

      isCompletingSwipeRef.current = true;
      pulseCardFeedback(direction === 'up' ? 'success' : 'warning');

      Animated.timing(swipeOffset, {
        toValue: direction === 'up' ? -exitDistance : exitDistance,
        duration: 220,
        useNativeDriver: true,
      }).start(() => {
        const action =
          direction === 'up' ? markCardKnown(card.id) : markCardForReview(card.id);

        void action.finally(() => {
          showToast(
            direction === 'up' ? 'success' : 'warning',
            direction === 'up' ? '+10 опыта' : 'Добавлено на повтор',
            direction === 'up'
              ? 'Карточка ушла в уверенно знакомые.'
              : 'Команда вернется в поток раньше остальных.',
          );
          swipeOffset.setValue(0);
          isCompletingSwipeRef.current = false;
          onSwipeComplete?.();
        });
      });
    },
    [
      markCardForReview,
      markCardKnown,
      onSwipeComplete,
      pulseCardFeedback,
      showToast,
      swipeOffset,
    ],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          !isCompletingSwipeRef.current &&
          Math.abs(gestureState.dy) > 8 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onMoveShouldSetPanResponderCapture: (_, gestureState) =>
          !isCompletingSwipeRef.current &&
          Math.abs(gestureState.dy) > 8 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onPanResponderGrant: () => {
          swipeOffset.stopAnimation();
        },
        onPanResponderMove: (_, gestureState) => {
          const nextValue = Math.max(Math.min(gestureState.dy, 188), -188);
          swipeOffset.setValue(nextValue);
        },
        onPanResponderRelease: (_, gestureState) => {
          const liveCard = currentCardRef.current;

          if (!liveCard) {
            resetCardPosition();
            return;
          }

          if (gestureState.dy <= -swipeThreshold) {
            completeSwipe(liveCard, 'up');
            return;
          }

          if (gestureState.dy >= swipeThreshold) {
            completeSwipe(liveCard, 'down');
            return;
          }

          resetCardPosition();
        },
        onPanResponderTerminate: resetCardPosition,
        onPanResponderTerminationRequest: () => false,
      }),
    [completeSwipe, resetCardPosition, swipeOffset],
  );

  return {
    completeSwipe,
    isCompletingSwipeRef,
    panResponder,
    resetCardPosition,
  };
}
