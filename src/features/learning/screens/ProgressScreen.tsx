import { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import {
  BoltIcon,
  CheckIcon,
  FlameIcon,
  ReviewIcon,
  SparkIcon,
  TargetIcon,
} from '../../../shared/components/icons/AppIcons';
import { AnimatedBackdrop } from '../../../shared/components/AnimatedBackdrop';
import { useLearning } from '../context/LearningContext';
import { palette } from '../../../shared/theme/palette';

export function ProgressScreen() {
  const { isHydrated, restart, stats } = useLearning();
  const tabBarHeight = useBottomTabBarHeight();
  const { width } = useWindowDimensions();
  const frameMaxWidth = width >= 768 ? 720 : undefined;

  if (!isHydrated) {
    return (
      <SafeAreaView style={styles.screen}>
        <AnimatedBackdrop />
        <View style={styles.loader}>
          <ActivityIndicator color={palette.accentStrong} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  const completionPercent = Math.round(stats.completion * 100);
  const dailyGoalPercent = Math.round(stats.dailyGoalProgress * 100);
  const manualAccuracyPercent = Math.round(stats.manualAccuracy * 100);
  const recommendation =
    stats.review > stats.known
      ? 'Сейчас полезнее пройти короткий круг по карточкам на повторе.'
      : stats.dailyGoalDone
        ? 'Дневная цель закрыта. Можно добрать качество ручным вводом команд.'
        : 'Темп хороший. Лучший следующий шаг — добить дневную цель и закрепить ответы руками.';

  return (
    <SafeAreaView style={styles.screen}>
      <AnimatedBackdrop />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.kicker}>Аналитика прогресса</Text>
          <Text style={styles.title}>Теперь это уже не просто карточки, а тренажер</Text>
          <Text style={styles.subtitle}>{recommendation}</Text>
        </View>

        <View
          style={[styles.summaryCard, frameMaxWidth ? { maxWidth: frameMaxWidth } : null]}
        >
          <View style={styles.summaryTopRow}>
            <View>
              <Text style={styles.summaryLabel}>Освоение колоды</Text>
              <Text style={styles.summaryValue}>{completionPercent}%</Text>
            </View>
            <View style={styles.summaryBadge}>
              <BoltIcon color={palette.accentStrong} size={16} />
              <Text style={styles.summaryBadgeText}>Уровень {stats.level}</Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.max(completionPercent, 4)}%` },
              ]}
            />
          </View>

          <View style={styles.summaryMetaRow}>
            <MiniMetric
              icon={<BoltIcon color={palette.accentStrong} size={16} />}
              label="Опыт"
              value={stats.xp}
            />
            <MiniMetric
              icon={<FlameIcon color="#f4a261" size={16} />}
              label="Серия"
              value={stats.streak}
            />
            <MiniMetric
              icon={<ReviewIcon color="#f4a261" size={16} />}
              label="На повторе"
              value={stats.reviewQueueCount}
            />
          </View>
        </View>

        <View style={[styles.grid, frameMaxWidth ? { maxWidth: frameMaxWidth } : null]}>
          <StatCard
            icon={<CheckIcon color={palette.accentStrong} size={18} />}
            label="Знаю уверенно"
            tone="success"
            value={stats.known}
          />
          <StatCard
            icon={<ReviewIcon color="#f4a261" size={18} />}
            label="Хочу повторить"
            tone="warning"
            value={stats.review}
          />
        </View>

        <View style={[styles.panel, frameMaxWidth ? { maxWidth: frameMaxWidth } : null]}>
          <Text style={styles.panelTitle}>Дневная цель</Text>
          <View style={styles.progressPanelRow}>
            <Text style={styles.progressPanelLabel}>
              {stats.todayCompleted}/{stats.dailyGoal} карточек сегодня
            </Text>
            <Text style={styles.progressPanelValue}>{dailyGoalPercent}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.max(dailyGoalPercent, 4)}%` },
              ]}
            />
          </View>
          <Text style={styles.panelBody}>
            {stats.dailyGoalDone
              ? 'Дневная цель уже выполнена. Хороший момент перейти в режим ручного ответа.'
              : 'Короткие ежедневные подходы по 5-10 карточек будут эффективнее длинных редких сессий.'}
          </Text>
        </View>

        <View style={[styles.panel, frameMaxWidth ? { maxWidth: frameMaxWidth } : null]}>
          <Text style={styles.panelTitle}>Качество ручных ответов</Text>

          <View style={styles.summaryMetaRow}>
            <MiniMetric
              icon={<SparkIcon color={palette.textSecondary} size={16} />}
              label="Попытки"
              value={stats.manualAttempts}
            />
            <MiniMetric
              icon={<CheckIcon color={palette.accentStrong} size={16} />}
              label="Верно"
              value={stats.manualCorrect}
            />
            <MiniMetric
              icon={<TargetIcon color={palette.accentStrong} size={16} />}
              label="Точность"
              suffix="%"
              value={manualAccuracyPercent}
            />
          </View>

          <Text style={styles.panelBody}>
            {stats.manualAttempts === 0
              ? 'Пока нет попыток ручного ввода. Этот режим лучше всего закрепляет синтаксис.'
              : stats.manualAccuracy >= 0.7
                ? 'Хорошая точность. Режим ручного ответа уже начинает закреплять моторную память.'
                : 'Точность пока низкая. Самый полезный шаг — чаще использовать ввод команды руками.'}
          </Text>
        </View>

        <View style={[styles.panel, frameMaxWidth ? { maxWidth: frameMaxWidth } : null]}>
          <Text style={styles.panelTitle}>Разбор структуры знаний</Text>

          <BreakdownRow
            color={palette.accentStrong}
            label="Знаю"
            value={stats.known}
            width={`${(stats.known / Math.max(stats.total, 1)) * 100}%` as `${number}%`}
          />
          <BreakdownRow
            color="#f4a261"
            label="На повторе"
            value={stats.review}
            width={`${(stats.review / Math.max(stats.total, 1)) * 100}%` as `${number}%`}
          />
          <BreakdownRow
            color="#5f7698"
            label="Еще не тронуты"
            value={stats.remaining}
            width={
              `${(stats.remaining / Math.max(stats.total, 1)) * 100}%` as `${number}%`
            }
          />
        </View>

        <View style={[styles.panel, frameMaxWidth ? { maxWidth: frameMaxWidth } : null]}>
          <Text style={styles.panelTitle}>Следующий лучший шаг</Text>
          <Text style={styles.panelBody}>{recommendation}</Text>

          <View style={styles.tipCard}>
            <Text style={styles.tipLabel}>Рекомендация</Text>
            <Text style={styles.tipText}>
              Сначала закрывайте дневную цель, потом проходите 3-4 карточки в режиме
              ручного ответа. Такой ритм дает и объем, и качество.
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => void restart()}
          style={[styles.resetButton, frameMaxWidth ? { maxWidth: frameMaxWidth } : null]}
        >
          <Text style={styles.resetButtonText}>Сбросить прогресс и пройти заново</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({
  icon,
  label,
  tone,
  value,
}: {
  icon: ReactNode;
  label: string;
  tone: 'success' | 'warning';
  value: number;
}) {
  return (
    <View
      style={[
        styles.statCard,
        tone === 'success' ? styles.statCardSuccess : styles.statCardWarning,
      ]}
    >
      <View style={styles.statCardIcon}>{icon}</View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MiniMetric({
  icon,
  label,
  suffix,
  value,
}: {
  icon: ReactNode;
  label: string;
  suffix?: string;
  value: number;
}) {
  return (
    <View style={styles.miniMetric}>
      <View style={styles.miniMetricHead}>
        {icon}
        <Text style={styles.miniMetricLabel}>{label}</Text>
      </View>
      <Text style={styles.miniMetricValue}>
        {value}
        {suffix ?? ''}
      </Text>
    </View>
  );
}

function BreakdownRow({
  color,
  label,
  value,
  width,
}: {
  color: string;
  label: string;
  value: number;
  width: `${number}%`;
}) {
  return (
    <View style={styles.breakdownRow}>
      <View style={styles.breakdownHeader}>
        <Text style={styles.breakdownLabel}>{label}</Text>
        <Text style={styles.breakdownValue}>{value}</Text>
      </View>
      <View style={styles.breakdownTrack}>
        <View style={[styles.breakdownFill, { backgroundColor: color, width }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 20,
    gap: 18,
    paddingBottom: 28,
  },
  hero: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    gap: 8,
  },
  kicker: {
    color: palette.accentStrong,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  title: {
    color: palette.textPrimary,
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 36,
    textAlign: 'center',
    maxWidth: '100%',
  },
  subtitle: {
    color: palette.textSecondary,
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    maxWidth: '100%',
  },
  summaryCard: {
    width: '100%',
    alignSelf: 'center',
    backgroundColor: palette.panelElevated,
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 16,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  summaryLabel: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  summaryValue: {
    marginTop: 6,
    color: palette.textPrimary,
    fontSize: 38,
    fontWeight: '900',
  },
  summaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: palette.overlayPill,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: palette.border,
  },
  summaryBadgeText: {
    color: palette.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: palette.track,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: palette.accentStrong,
  },
  summaryMetaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  miniMetric: {
    flex: 1,
    backgroundColor: palette.overlayPill,
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 10,
    gap: 5,
  },
  miniMetricHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  miniMetricValue: {
    color: palette.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  miniMetricLabel: {
    color: palette.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  grid: {
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 8,
  },
  statCardSuccess: {
    backgroundColor: palette.successPanel,
  },
  statCardWarning: {
    backgroundColor: palette.warningPanel,
  },
  statCardIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    color: palette.textPrimary,
    fontSize: 32,
    fontWeight: '900',
  },
  statLabel: {
    color: palette.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  panel: {
    width: '100%',
    alignSelf: 'center',
    backgroundColor: palette.panel,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 16,
  },
  panelTitle: {
    color: palette.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  panelBody: {
    color: palette.textSecondary,
    fontSize: 15,
    lineHeight: 23,
  },
  progressPanelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  progressPanelLabel: {
    color: palette.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  progressPanelValue: {
    color: palette.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  breakdownRow: {
    gap: 8,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  breakdownLabel: {
    color: palette.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  breakdownValue: {
    color: palette.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  breakdownTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: palette.track,
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    borderRadius: 999,
  },
  tipCard: {
    backgroundColor: palette.overlayPill,
    borderRadius: 20,
    padding: 16,
    gap: 8,
  },
  tipLabel: {
    color: palette.accentStrong,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  tipText: {
    color: palette.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  resetButton: {
    width: '100%',
    alignSelf: 'center',
    backgroundColor: palette.subtlePanel,
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.border,
  },
  resetButtonText: {
    color: palette.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
});
