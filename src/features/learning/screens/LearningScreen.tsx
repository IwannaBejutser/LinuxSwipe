import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { ActionDock, TrainingMode } from '../components/ActionDock';
import { CardDetailsModal } from '../components/CardDetailsModal';
import { FirstRunOnboarding } from '../components/FirstRunOnboarding';
import { FilterSheet } from '../components/FilterSheet';
import { LearningEmptyState } from '../components/LearningEmptyState';
import { LearningHeader } from '../components/LearningHeader';
import { LearningCard } from '../components/LearningCard';
import { LearningSessionStrip } from '../components/LearningSessionStrip';
import { LearningToast } from '../components/LearningToast';
import { ManualAnswerSheet } from '../components/ManualAnswerSheet';
import { AnimatedBackdrop } from '../../../shared/components/AnimatedBackdrop';
import { useLearning } from '../context/LearningContext';
import { useCardSwipe } from '../hooks/useCardSwipe';
import { useLearningDeck } from '../hooks/useLearningDeck';
import { useManualAnswer } from '../hooks/useManualAnswer';
import { FeedbackTone, useToast } from '../hooks/useToast';
import { palette } from '../../../shared/theme/palette';
import {
  loadOnboardingSeen,
  resetOnboardingSeen,
  saveOnboardingSeen,
} from '../storage/learningStorage';

export function LearningScreen() {
  const {
    cards,
    isHydrated,
    markCardForReview,
    markCardKnown,
    progress,
    restart,
    reviewMeta,
    setDailyGoal,
    stats,
  } = useLearning();
  const tabBarHeight = useBottomTabBarHeight();
  const { height, width } = useWindowDimensions();
  const frameMaxWidth = width >= 768 ? 720 : undefined;
  const isCompactViewport = width < 390;
  const isDenseViewport = isCompactViewport || height < 760;
  const frameWidth =
    width >= 768
      ? Math.min(width - 32, 720)
      : Math.max(width - (isCompactViewport ? 28 : 32), 0);
  const deck = useLearningDeck({ cards, progress, reviewMeta });
  const {
    activeFiltersCount,
    categories,
    clearFilters,
    currentCard,
    deckLabel,
    deckMode,
    filteredCards,
    nextCard,
    progressRatio,
    remainingCards,
    selectedCategory,
    selectedCollection,
    selectedDifficulty,
    sessionIndex,
    setDeckMode,
    setSelectedCategory,
    setSelectedCollection,
    setSelectedDifficulty,
  } = deck;
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isAnswerSheetOpen, setIsAnswerSheetOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [showFirstRunOnboarding, setShowFirstRunOnboarding] = useState(false);
  const [trainingMode, setTrainingMode] = useState<TrainingMode>('swipe');
  const flipProgress = useRef(new Animated.Value(0)).current;
  const swipeOffset = useRef(new Animated.Value(0)).current;
  const successGlow = useRef(new Animated.Value(0)).current;
  const warningGlow = useRef(new Animated.Value(0)).current;
  const isCardFlippedRef = useRef(false);
  const { showToast, toastOpacity, toastState, toastTranslateY } = useToast();

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    let isMounted = true;

    const loadOnboarding = async () => {
      const hasSeenOnboarding = await loadOnboardingSeen();

      if (isMounted) {
        setShowFirstRunOnboarding(!hasSeenOnboarding);
      }
    };

    void loadOnboarding();

    return () => {
      isMounted = false;
    };
  }, [isHydrated]);

  useEffect(() => {
    isCardFlippedRef.current = isCardFlipped;
  }, [isCardFlipped]);

  useEffect(() => {
    setIsCardFlipped(false);
    isCardFlippedRef.current = false;
    flipProgress.setValue(0);
    swipeOffset.setValue(0);
    setIsAnswerSheetOpen(false);
    setIsDetailsOpen(false);
  }, [currentCard?.id, flipProgress, swipeOffset]);

  const pulseCardFeedback = (tone: FeedbackTone) => {
    const animatedValue = tone === 'success' ? successGlow : warningGlow;
    animatedValue.stopAnimation();
    animatedValue.setValue(0);

    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 140,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 420,
        useNativeDriver: true,
      }),
    ]).start();
  };
  const { isCompletingSwipeRef, panResponder } = useCardSwipe({
    currentCard,
    markCardForReview,
    markCardKnown,
    pulseCardFeedback,
    showToast,
    swipeOffset,
  });

  const setCardFace = (nextFlipped: boolean) => {
    if (isCompletingSwipeRef.current) {
      return;
    }

    isCardFlippedRef.current = nextFlipped;
    setIsCardFlipped(nextFlipped);

    Animated.spring(flipProgress, {
      toValue: nextFlipped ? 1 : 0,
      useNativeDriver: true,
      bounciness: 7,
      speed: 14,
    }).start();
  };

  const handleCardPrimaryAction = () => {
    if (trainingMode === 'manual') {
      setIsAnswerSheetOpen(true);
      return;
    }

    setCardFace(!isCardFlippedRef.current);
  };

  const {
    closeAnswerSheet,
    manualAnswer,
    manualFeedback,
    sendManualToReview,
    submitManualAnswer,
    updateManualAnswer,
  } = useManualAnswer({
    currentCard,
    markCardForReview,
    markCardKnown,
    onClose: () => setIsAnswerSheetOpen(false),
    pulseCardFeedback,
    showToast,
  });

  const completeFirstRunOnboarding = async () => {
    setShowFirstRunOnboarding(false);
    await saveOnboardingSeen();
  };

  const replayOnboarding = async () => {
    await resetOnboardingSeen();
    setIsFiltersOpen(false);
    setShowFirstRunOnboarding(true);
  };

  if (!isHydrated) {
    return (
      <SafeAreaView style={screenStyles.screen}>
        <AnimatedBackdrop />
        <View style={loaderStyles.loader}>
          <ActivityIndicator color={palette.accentStrong} size="large" />
          <Text style={loaderStyles.loader__text}>Собираем вашу учебную сессию...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (filteredCards.length === 0) {
    return (
      <SafeAreaView style={screenStyles.screen}>
        <AnimatedBackdrop />
        <LearningEmptyState
          body={
            deckMode === 'review'
              ? "Отмечайте команды как 'повторить', и здесь появится ваша персональная очередь."
              : 'Смените тему, уровень сложности или вернитесь к полной колоде.'
          }
          eyebrow={deckMode === 'review' ? 'Режим повторения' : 'Фильтры'}
          onPrimaryAction={() => {
            clearFilters();
            setIsFiltersOpen(false);
          }}
          primaryLabel="Показать все карточки"
          title={
            deckMode === 'review'
              ? 'Сейчас в очереди повторения пусто'
              : 'Под эти фильтры карточек пока нет'
          }
        />
      </SafeAreaView>
    );
  }

  if (!currentCard) {
    return (
      <SafeAreaView style={screenStyles.screen}>
        <AnimatedBackdrop />
        <LearningEmptyState
          body={
            deckMode === 'review'
              ? 'Хороший момент вернуться в общую колоду или пройти статистику и закрепить темп.'
              : 'Можно сменить фильтры, открыть блок повторения или полностью начать заново.'
          }
          eyebrow={deckMode === 'review' ? 'Повторение завершено' : 'Сессия завершена'}
          known={stats.known}
          onOpenReview={() => setDeckMode('review')}
          onPrimaryAction={() => void restart()}
          onSecondaryAction={clearFilters}
          primaryLabel="Начать всю колоду заново"
          review={stats.review}
          secondaryLabel="Сбросить режим и фильтры"
          showStats
          title={
            deckMode === 'review'
              ? 'Очередь на повтор сейчас закрыта'
              : 'В этой подборке больше нет активных карточек'
          }
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={screenStyles.screen}>
      <AnimatedBackdrop />

      <View
        style={[
          screenStyles.screen__content,
          { paddingBottom: tabBarHeight + (isDenseViewport ? 14 : 24) },
        ]}
      >
        <View
          style={[
            screenStyles.screen__frame,
            isDenseViewport ? screenStyles.screen__frameCompact : null,
            { width: frameWidth },
            frameMaxWidth ? { maxWidth: frameMaxWidth } : null,
          ]}
        >
          <LearningHeader
            activeFiltersCount={activeFiltersCount}
            isCompact={isDenseViewport}
            onOpenFilters={() => setIsFiltersOpen(true)}
          />

          <LearningSessionStrip
            isCompact={isDenseViewport}
            progressRatio={progressRatio}
            remainingCount={remainingCards.length}
          />

          <LearningCard
            currentCard={currentCard}
            deckLabel={deckLabel}
            flipProgress={flipProgress}
            isCompact={isDenseViewport}
            isCardFlipped={isCardFlipped}
            nextCard={nextCard}
            onOpenDetails={() => setIsDetailsOpen(true)}
            onPressFront={handleCardPrimaryAction}
            onToggleFace={() => setCardFace(!isCardFlippedRef.current)}
            panHandlers={panResponder.panHandlers}
            sessionIndex={sessionIndex}
            sessionTotal={filteredCards.length}
            successGlow={successGlow}
            swipeOffset={swipeOffset}
            warningGlow={warningGlow}
          />

          <ActionDock
            isCompact={isDenseViewport}
            mode={trainingMode}
            onSelectMode={(mode) => {
              setTrainingMode(mode);

              if (mode === 'manual') {
                setIsAnswerSheetOpen(true);
              }
            }}
          />

          <LearningToast
            opacity={toastOpacity}
            state={toastState}
            translateY={toastTranslateY}
          />
        </View>
      </View>

      <FilterSheet
        categories={categories}
        dailyGoal={stats.dailyGoal}
        deckMode={deckMode}
        onClearFilters={() => {
          clearFilters();
          setIsFiltersOpen(false);
        }}
        onClose={() => setIsFiltersOpen(false)}
        onResetOnboarding={() => void replayOnboarding()}
        onSelectCollection={setSelectedCollection}
        onSelectDailyGoal={(goal) => void setDailyGoal(goal)}
        onSelectCategory={setSelectedCategory}
        onSelectDeckMode={setDeckMode}
        onSelectDifficulty={setSelectedDifficulty}
        selectedCategory={selectedCategory}
        selectedCollection={selectedCollection}
        selectedDifficulty={selectedDifficulty}
        visible={isFiltersOpen}
      />

      <ManualAnswerSheet
        currentCard={currentCard}
        manualAnswer={manualAnswer}
        manualFeedback={manualFeedback}
        onChangeAnswer={updateManualAnswer}
        onClose={closeAnswerSheet}
        onSendToReview={() => void sendManualToReview()}
        onSubmit={() => void submitManualAnswer()}
        visible={isAnswerSheetOpen}
      />

      <CardDetailsModal
        card={currentCard}
        onClose={() => setIsDetailsOpen(false)}
        visible={isDetailsOpen}
      />

      <FirstRunOnboarding
        onComplete={() => void completeFirstRunOnboarding()}
        visible={showFirstRunOnboarding}
      />
    </SafeAreaView>
  );
}

const screenStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
    overflow: 'hidden',
  },
  screen__content: {
    flex: 1,
    alignItems: 'center',
  },
  screen__frame: {
    flex: 1,
    alignSelf: 'center',
    position: 'relative',
    paddingTop: 8,
    gap: 10,
  },
  screen__frameCompact: {
    paddingTop: 6,
    gap: 8,
  },
});

const loaderStyles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loader__text: {
    color: palette.textSecondary,
    fontSize: 16,
  },
});
