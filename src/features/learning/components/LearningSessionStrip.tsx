import { StyleSheet, Text, View } from 'react-native';

import { palette } from '../../../shared/theme/palette';

type LearningSessionStripProps = {
  isCompact?: boolean;
  progressRatio: number;
  remainingCount: number;
};

export function LearningSessionStrip({
  isCompact = false,
  progressRatio,
  remainingCount,
}: LearningSessionStripProps) {
  return (
    <View style={[styles.session, isCompact && styles.sessionCompact]}>
      <View style={styles.session__head}>
        <Text style={[styles.session__lead, isCompact && styles.session__leadCompact]}>
          {remainingCount} в очереди
        </Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
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
});
