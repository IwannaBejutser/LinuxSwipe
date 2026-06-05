import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CheckIcon, ReviewIcon } from '../../../shared/components/icons/AppIcons';
import { palette } from '../../../shared/theme/palette';

type LearningEmptyStateProps = {
  body: string;
  eyebrow: string;
  known?: number;
  onOpenReview?: () => void;
  onPrimaryAction: () => void;
  onSecondaryAction?: () => void;
  primaryLabel: string;
  review?: number;
  secondaryLabel?: string;
  showStats?: boolean;
  title: string;
};

export function LearningEmptyState({
  body,
  eyebrow,
  known = 0,
  onOpenReview,
  onPrimaryAction,
  onSecondaryAction,
  primaryLabel,
  review = 0,
  secondaryLabel,
  showStats = false,
  title,
}: LearningEmptyStateProps) {
  return (
    <View style={styles.empty}>
      <Text style={styles.empty__eyebrow}>{eyebrow}</Text>
      <Text style={styles.empty__title}>{title}</Text>
      <Text style={styles.empty__body}>{body}</Text>

      {showStats ? (
        <View style={styles.empty__statsRow}>
          <CompletionChip
            icon={<CheckIcon color={palette.accentStrong} size={18} />}
            label="Знаю"
            tone="success"
            value={known}
          />
          <CompletionChip
            icon={<ReviewIcon color="#f4a261" size={18} />}
            label="На повторе"
            tone="warning"
            value={review}
          />
        </View>
      ) : null}

      {onOpenReview ? (
        <Pressable onPress={onOpenReview} style={styles.empty__secondaryAction}>
          <Text style={styles.empty__secondaryActionText}>
            Открыть карточки на повторе
          </Text>
        </Pressable>
      ) : null}

      {onSecondaryAction && secondaryLabel ? (
        <Pressable onPress={onSecondaryAction} style={styles.empty__secondaryAction}>
          <Text style={styles.empty__secondaryActionText}>{secondaryLabel}</Text>
        </Pressable>
      ) : null}

      <Pressable onPress={onPrimaryAction} style={styles.empty__primaryAction}>
        <Text style={styles.empty__primaryActionText}>{primaryLabel}</Text>
      </Pressable>
    </View>
  );
}

function CompletionChip({
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
      style={[styles.chip, tone === 'success' ? styles.chipSuccess : styles.chipWarning]}
    >
      <View style={styles.chip__icon}>{icon}</View>
      <Text style={styles.chip__value}>{value}</Text>
      <Text style={styles.chip__label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  empty__eyebrow: {
    color: palette.accentStrong,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  empty__title: {
    color: palette.textPrimary,
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 36,
  },
  empty__body: {
    color: palette.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },
  empty__statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  chip: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 4,
    alignItems: 'center',
  },
  chipSuccess: {
    backgroundColor: palette.successPanel,
  },
  chipWarning: {
    backgroundColor: palette.warningPanel,
  },
  chip__icon: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  chip__value: {
    color: palette.textPrimary,
    fontSize: 18,
    fontWeight: '900',
  },
  chip__label: {
    color: palette.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  empty__primaryAction: {
    backgroundColor: palette.accentStrong,
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  empty__primaryActionText: {
    color: palette.background,
    fontSize: 16,
    fontWeight: '900',
  },
  empty__secondaryAction: {
    backgroundColor: palette.overlayPill,
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.border,
  },
  empty__secondaryActionText: {
    color: palette.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
});
