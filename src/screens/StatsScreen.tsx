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

export function StatsScreen() {
  const { isHydrated, restart, stats } = useLearning();

  if (!isHydrated) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.loader}>
          <ActivityIndicator color={palette.accentStrong} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  const mastery =
    stats.completed === 0
      ? "Начните с первой карточки, чтобы статистика ожила."
      : stats.review > stats.known
        ? "Сейчас лучше сфокусироваться на повторении сложных команд."
        : "Темп хороший: уже формируется устойчивая база команд.";

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>Прогресс</Text>
          <Text style={styles.title}>Как идет изучение команд</Text>
          <Text style={styles.subtitle}>{mastery}</Text>
        </View>

        <View style={styles.grid}>
          <StatCard label="Всего карточек" value={stats.total} />
          <StatCard label="Изучено" value={stats.completed} />
          <StatCard label="Знаю" value={stats.known} accent />
          <StatCard label="На повтор" value={stats.review} />
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Разбор сессии</Text>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Осталось пройти</Text>
            <Text style={styles.rowValue}>{stats.remaining}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Процент завершения</Text>
            <Text style={styles.rowValue}>{Math.round(stats.completion * 100)}%</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Баланс знаний</Text>
            <Text style={styles.rowValue}>
              {stats.known >= stats.review ? "Стабильный" : "Нужно повторение"}
            </Text>
          </View>
        </View>

        <Pressable onPress={() => void restart()} style={styles.resetButton}>
          <Text style={styles.resetButtonText}>Сбросить прогресс</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({
  accent = false,
  label,
  value
}: {
  accent?: boolean;
  label: string;
  value: number;
}) {
  return (
    <View style={[styles.statCard, accent && styles.statCardAccent]}>
      <Text style={[styles.statValue, accent && styles.statValueAccent]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  content: {
    padding: 20,
    gap: 18
  },
  hero: {
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
    fontSize: 15,
    lineHeight: 22
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  statCard: {
    width: "48%",
    backgroundColor: palette.panel,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 8
  },
  statCardAccent: {
    backgroundColor: palette.answerPanel
  },
  statValue: {
    color: palette.textPrimary,
    fontSize: 32,
    fontWeight: "800"
  },
  statValueAccent: {
    color: palette.accentStrong
  },
  statLabel: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: "700"
  },
  panel: {
    backgroundColor: palette.panel,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 16
  },
  panelTitle: {
    color: palette.textPrimary,
    fontSize: 20,
    fontWeight: "800"
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12
  },
  rowLabel: {
    color: palette.textSecondary,
    fontSize: 15
  },
  rowValue: {
    color: palette.textPrimary,
    fontSize: 15,
    fontWeight: "800"
  },
  resetButton: {
    backgroundColor: palette.subtlePanel,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center"
  },
  resetButtonText: {
    color: palette.textPrimary,
    fontSize: 15,
    fontWeight: "800"
  }
});
