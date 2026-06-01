import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

import { useLearning } from "../context/LearningContext";
import { palette } from "../theme/palette";

export function HomeScreen() {
  const {
    currentCard,
    currentIndex,
    isHydrated,
    markForReview,
    markKnown,
    restart,
    stats
  } = useLearning();
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    setShowHint(false);
    setShowAnswer(false);
  }, [currentCard?.id]);

  if (!isHydrated) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.loader}>
          <ActivityIndicator color={palette.accentStrong} size="large" />
          <Text style={styles.loaderText}>Загружаем прогресс обучения...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentCard) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.backgroundGlowTop} />
        <View style={styles.backgroundGlowBottom} />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.summaryCard}>
            <Text style={styles.kicker}>Сессия завершена</Text>
            <Text style={styles.summaryTitle}>Колода пройдена целиком</Text>
            <Text style={styles.summaryText}>
              Вы отметили {stats.completed} из {stats.total} карточек. Можно начать
              заново и пройти команды еще раз.
            </Text>

            <View style={styles.summaryStatsRow}>
              <View style={styles.summaryStat}>
                <Text style={styles.summaryStatValue}>{stats.known}</Text>
                <Text style={styles.summaryStatLabel}>Знаю</Text>
              </View>
              <View style={styles.summaryStat}>
                <Text style={styles.summaryStatValue}>{stats.review}</Text>
                <Text style={styles.summaryStatLabel}>Повторить</Text>
              </View>
            </View>

            <Pressable onPress={() => void restart()} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Пройти заново</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.backgroundGlowTop} />
      <View style={styles.backgroundGlowBottom} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerBlock}>
          <Text style={styles.kicker}>LinuxSwipe</Text>
          <Text style={styles.title}>Команда дня для быстрых повторений</Text>
          <Text style={styles.subtitle}>
            Карточка {currentIndex + 1} из {stats.total}
          </Text>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.max(stats.completion * 100, 8)}%` }
            ]}
          />
        </View>

        <View style={styles.card}>
          <View style={styles.metaRow}>
            <Text style={styles.commandTag}>{currentCard.command}</Text>
            <Text style={styles.metaText}>
              {currentCard.category} · {currentCard.difficulty}
            </Text>
          </View>

          <Text style={styles.questionLabel}>Вопрос</Text>
          <Text style={styles.question}>{currentCard.question}</Text>

          <Pressable
            onPress={() => setShowHint((value) => !value)}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>
              {showHint ? "Скрыть подсказку" : "Подсказка"}
            </Text>
          </Pressable>

          {showHint ? (
            <View style={styles.revealBlock}>
              <Text style={styles.revealLabel}>Подсказка</Text>
              <Text style={styles.revealText}>{currentCard.hint}</Text>
            </View>
          ) : null}

          <Pressable
            onPress={() => setShowAnswer((value) => !value)}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>
              {showAnswer ? "Скрыть ответ" : "Показать ответ"}
            </Text>
          </Pressable>

          {showAnswer ? (
            <View style={styles.answerBlock}>
              <Text style={styles.revealLabel}>Правильная команда</Text>
              <Text style={styles.answer}>{currentCard.answer}</Text>
            </View>
          ) : (
            <Text style={styles.helperText}>
              Откройте ответ, чтобы отметить, знаете ли вы эту команду.
            </Text>
          )}
        </View>

        <View style={styles.actionRow}>
          <Pressable
            disabled={!showAnswer}
            onPress={() => void markForReview()}
            style={[
              styles.outcomeButton,
              styles.outcomeSecondary,
              !showAnswer && styles.outcomeDisabled
            ]}
          >
            <Text style={styles.outcomeSecondaryText}>Повторить позже</Text>
          </Pressable>

          <Pressable
            disabled={!showAnswer}
            onPress={() => void markKnown()}
            style={[
              styles.outcomeButton,
              styles.outcomePrimary,
              !showAnswer && styles.outcomeDisabled
            ]}
          >
            <Text style={styles.outcomePrimaryText}>Знаю</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    gap: 18
  },
  backgroundGlowTop: {
    position: "absolute",
    top: -80,
    right: -20,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: palette.glowBlue
  },
  backgroundGlowBottom: {
    position: "absolute",
    bottom: 60,
    left: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: palette.glowGreen
  },
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24
  },
  loaderText: {
    color: palette.textSecondary,
    fontSize: 16
  },
  headerBlock: {
    gap: 6
  },
  kicker: {
    color: palette.accentStrong,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1
  },
  title: {
    color: palette.textPrimary,
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 36
  },
  subtitle: {
    color: palette.textSecondary,
    fontSize: 15
  },
  progressTrack: {
    height: 10,
    backgroundColor: palette.track,
    borderRadius: 999,
    overflow: "hidden"
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: palette.accentStrong
  },
  card: {
    backgroundColor: palette.panel,
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 16
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  commandTag: {
    backgroundColor: palette.chip,
    color: palette.accentStrong,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: "hidden",
    fontWeight: "800",
    fontSize: 13
  },
  metaText: {
    color: palette.textMuted,
    fontSize: 13,
    textTransform: "lowercase"
  },
  questionLabel: {
    color: palette.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 12,
    fontWeight: "700"
  },
  question: {
    color: palette.textPrimary,
    fontSize: 26,
    fontWeight: "700",
    lineHeight: 34
  },
  revealBlock: {
    backgroundColor: palette.subtlePanel,
    borderRadius: 20,
    padding: 16,
    gap: 8
  },
  answerBlock: {
    backgroundColor: palette.answerPanel,
    borderRadius: 20,
    padding: 16,
    gap: 10
  },
  revealLabel: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1
  },
  revealText: {
    color: palette.textSecondary,
    fontSize: 15,
    lineHeight: 22
  },
  answer: {
    color: palette.textPrimary,
    fontSize: 22,
    fontWeight: "800"
  },
  helperText: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 20
  },
  actionRow: {
    flexDirection: "row",
    gap: 12
  },
  primaryButton: {
    backgroundColor: palette.accentStrong,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 18,
    alignItems: "center"
  },
  primaryButtonText: {
    color: palette.background,
    fontWeight: "800",
    fontSize: 15
  },
  secondaryButton: {
    backgroundColor: palette.subtlePanel,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 18,
    alignItems: "center"
  },
  secondaryButtonText: {
    color: palette.textPrimary,
    fontWeight: "700",
    fontSize: 15
  },
  outcomeButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center"
  },
  outcomePrimary: {
    backgroundColor: palette.success
  },
  outcomeSecondary: {
    backgroundColor: palette.panel,
    borderWidth: 1,
    borderColor: palette.borderStrong
  },
  outcomePrimaryText: {
    color: palette.background,
    fontWeight: "800",
    fontSize: 15
  },
  outcomeSecondaryText: {
    color: palette.textPrimary,
    fontWeight: "800",
    fontSize: 15
  },
  outcomeDisabled: {
    opacity: 0.45
  },
  summaryCard: {
    marginTop: 48,
    backgroundColor: palette.panel,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 16
  },
  summaryTitle: {
    color: palette.textPrimary,
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34
  },
  summaryText: {
    color: palette.textSecondary,
    fontSize: 15,
    lineHeight: 22
  },
  summaryStatsRow: {
    flexDirection: "row",
    gap: 12
  },
  summaryStat: {
    flex: 1,
    backgroundColor: palette.subtlePanel,
    borderRadius: 20,
    padding: 16,
    gap: 6
  },
  summaryStatValue: {
    color: palette.textPrimary,
    fontSize: 30,
    fontWeight: "800"
  },
  summaryStatLabel: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: "700"
  }
});
