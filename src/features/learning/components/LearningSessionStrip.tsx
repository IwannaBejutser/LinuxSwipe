import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  BoltIcon,
  ReviewIcon,
  SparkIcon,
} from '../../../shared/components/icons/AppIcons';
import { palette } from '../../../shared/theme/palette';

type LearningSessionStripProps = {
  isCompact?: boolean;
  progressRatio: number;
  remainingCount: number;
  reviewCount: number;
  streak: number;
  xp: number;
};

export function LearningSessionStrip({
  isCompact = false,
  progressRatio,
  remainingCount,
  reviewCount,
  streak,
  xp,
}: LearningSessionStripProps) {
  return (
    <View style={[styles.session, isCompact && styles.sessionCompact]}>
      <View style={styles.session__head}>
        <View style={styles.session__copy}>
          <Text style={[styles.session__lead, isCompact && styles.session__leadCompact]}>
            {remainingCount} в очереди
          </Text>
          <View style={styles.session__metrics}>
            <InlineMetric
              icon={<BoltIcon color={palette.accentStrong} size={13} />}
              label="Опыт"
              value={xp}
            />
            <InlineMetric
              icon={<SparkIcon color={palette.accentStrong} size={13} />}
              label="Серия"
              value={streak}
            />
            <InlineMetric
              icon={<ReviewIcon color="#f4a261" size={13} />}
              label="Повтор"
              value={reviewCount}
            />
          </View>
        </View>
        <Text style={[styles.session__value, isCompact && styles.session__valueCompact]}>
          {Math.round(progressRatio * 100)}%
        </Text>
      </View>

      <View style={styles.session__track}>
        <View
          style={[
            styles.session__fill,
            { width: `${Math.max(progressRatio * 100, 4)}%` },
          ]}
        />
      </View>
    </View>
  );
}

function InlineMetric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <View style={styles.metric}>
      {icon}
      <Text style={styles.metric__label}>{label}</Text>
      <Text style={styles.metric__value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  session: {
    alignSelf: 'stretch',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.hairline,
    backgroundColor: 'rgba(7, 10, 14, 0.66)',
    gap: 9,
  },
  sessionCompact: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 7,
  },
  session__head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  session__copy: {
    flex: 1,
    gap: 7,
  },
  session__lead: {
    color: palette.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  session__leadCompact: {
    fontSize: 12,
  },
  session__value: {
    color: palette.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
  session__valueCompact: {
    fontSize: 11,
  },
  session__track: {
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: palette.track,
  },
  session__fill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: palette.accentStrong,
  },
  session__metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    opacity: 0.84,
  },
  metric__label: {
    color: palette.textMuted,
    fontSize: 9,
    fontWeight: '700',
  },
  metric__value: {
    color: palette.textPrimary,
    fontSize: 10,
    fontWeight: '800',
  },
});
