import { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
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
import { getCategoryLabel } from '../lib/category';
import { progressScreenStyles as styles } from './progressScreenStyles';

export function ProgressScreen() {
  const { cards, isHydrated, progress, restart, stats } = useLearning();
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
  const nextLevelXp = stats.level * 120;
  const levelProgress = Math.min((stats.xp % 120) / 120, 1);
  const packageCards = cards.filter((card) => card.category === 'Package Management');
  const masteredPackageCards = packageCards.filter(
    (card) => progress[card.id] === 'known',
  ).length;
  const milestones = [
    {
      body: `${Math.min(stats.known, 10)}/10 уверенных ответов`,
      done: stats.known >= 10,
      title: '10 карточек освоены',
    },
    {
      body: `${Math.min(stats.streak, 3)}/3 дня подряд`,
      done: stats.streak >= 3,
      title: 'Серия из 3 дней',
    },
    {
      body: `${masteredPackageCards}/${Math.max(packageCards.length, 1)} карточек`,
      done: packageCards.length > 0 && masteredPackageCards === packageCards.length,
      title: 'Пакеты освоены',
    },
  ];
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
        contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + 96 }]}
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

          <View style={styles.levelRow}>
            <Text style={styles.levelText}>До уровня {stats.level + 1}</Text>
            <Text style={styles.levelText}>
              {Math.max(nextLevelXp - stats.xp, 0)} опыта
            </Text>
          </View>
          <View style={styles.levelTrack}>
            <View
              style={[
                styles.levelFill,
                { width: `${Math.max(levelProgress * 100, 4)}%` },
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
              ? 'Дневная цель уже выполнена. Хороший момент закрепить ответы руками.'
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
          <Text style={styles.panelTitle}>Прогресс по темам</Text>
          <Text style={styles.panelBody}>
            Так видно, какие навыки уже собираются в систему, а где лучше пройти короткий
            повтор.
          </Text>

          <View style={styles.topicList}>
            {stats.topics.slice(0, 6).map((topic) => (
              <TopicRow
                key={topic.category}
                completed={topic.known}
                label={getCategoryLabel(topic.category)}
                percent={topic.percent}
                total={topic.total}
              />
            ))}
          </View>
        </View>

        <View style={[styles.panel, frameMaxWidth ? { maxWidth: frameMaxWidth } : null]}>
          <Text style={styles.panelTitle}>Вехи прогресса</Text>
          <Text style={styles.panelBody}>
            Маленькие вехи делают прогресс видимым: не просто учим команды, а закрываем
            понятные этапы.
          </Text>

          <View style={styles.milestoneList}>
            {milestones.map((milestone) => (
              <View
                key={milestone.title}
                style={[styles.milestone, milestone.done && styles.milestoneDone]}
              >
                <View style={styles.milestoneIcon}>
                  {milestone.done ? (
                    <CheckIcon color={palette.accentStrong} size={15} />
                  ) : (
                    <SparkIcon color={palette.textMuted} size={15} />
                  )}
                </View>
                <View style={styles.milestoneCopy}>
                  <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                  <Text style={styles.milestoneBody}>{milestone.body}</Text>
                </View>
              </View>
            ))}
          </View>
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

function TopicRow({
  completed,
  label,
  percent,
  total,
}: {
  completed: number;
  label: string;
  percent: number;
  total: number;
}) {
  const percentValue = Math.round(percent * 100);

  return (
    <View style={styles.topicRow}>
      <View style={styles.topicRowHeader}>
        <Text style={styles.topicRowLabel}>{label}</Text>
        <Text style={styles.topicRowValue}>
          {completed}/{total}
        </Text>
      </View>
      <View style={styles.topicRowTrack}>
        <View style={[styles.topicRowFill, { width: `${Math.max(percentValue, 4)}%` }]} />
      </View>
      <Text style={styles.topicRowMeta}>Освоено на {percentValue}%</Text>
    </View>
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
