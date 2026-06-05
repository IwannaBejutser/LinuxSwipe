import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { BoltIcon, ReviewIcon, SparkIcon } from "../AppIcon";
import { palette } from "../../theme/palette";

type SessionStripProps = {
  progressRatio: number;
  remainingCount: number;
  reviewCount: number;
  streak: number;
  xp: number;
};

export function SessionStrip({
  progressRatio,
  remainingCount,
  reviewCount,
  streak,
  xp
}: SessionStripProps) {
  return (
    <View style={styles.session}>
      <View style={styles.session__head}>
        <Text style={styles.session__lead}>{remainingCount} в очереди сейчас</Text>
        <Text style={styles.session__value}>{Math.round(progressRatio * 100)}%</Text>
      </View>

      <View style={styles.session__track}>
        <View
          style={[
            styles.session__fill,
            { width: `${Math.max(progressRatio * 100, 4)}%` }
          ]}
        />
      </View>

      <View style={styles.session__metrics}>
        <SessionMetric
          icon={<BoltIcon color={palette.accentStrong} size={15} />}
          label="XP"
          value={xp}
        />
        <SessionMetric
          icon={<SparkIcon color={palette.accentStrong} size={15} />}
          label="Streak"
          value={streak}
        />
        <SessionMetric
          icon={<ReviewIcon color="#f4a261" size={15} />}
          label="Повтор"
          value={reviewCount}
        />
      </View>
    </View>
  );
}

function SessionMetric({
  icon,
  label,
  value
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <View style={styles.metric}>
      <View style={styles.metric__head}>
        {icon}
        <Text style={styles.metric__label}>{label}</Text>
      </View>
      <Text style={styles.metric__value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  session: {
    width: "100%",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.overlayPill,
    gap: 10
  },
  session__head: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  session__lead: {
    color: palette.textPrimary,
    fontSize: 13,
    fontWeight: "800"
  },
  session__value: {
    color: palette.textSecondary,
    fontSize: 12,
    fontWeight: "800"
  },
  session__track: {
    height: 7,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: palette.track
  },
  session__fill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: palette.accentStrong
  },
  session__metrics: {
    flexDirection: "row",
    gap: 8
  },
  metric: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(79, 111, 155, 0.18)",
    backgroundColor: "rgba(9, 18, 34, 0.52)",
    gap: 4
  },
  metric__head: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  metric__label: {
    color: palette.textMuted,
    fontSize: 10,
    fontWeight: "700"
  },
  metric__value: {
    color: palette.textPrimary,
    fontSize: 15,
    fontWeight: "800"
  }
});
