import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  CheckIcon,
  KeyboardIcon,
  ReviewIcon,
} from '../../../shared/components/icons/AppIcons';
import { palette } from '../../../shared/theme/palette';
import { FeedbackTone } from '../hooks/useToast';
import { Card } from '../types/card';
import { BottomSheetPanel } from './BottomSheetPanel';

type ManualFeedback = {
  body: string;
  title: string;
  tone: FeedbackTone;
} | null;

type ManualAnswerSheetProps = {
  currentCard: Card;
  manualAnswer: string;
  manualFeedback: ManualFeedback;
  onChangeAnswer: (value: string) => void;
  onClose: () => void;
  onSendToReview: () => void;
  onSubmit: () => void;
  visible: boolean;
};

export function ManualAnswerSheet({
  currentCard,
  manualAnswer,
  manualFeedback,
  onChangeAnswer,
  onClose,
  onSendToReview,
  onSubmit,
  visible,
}: ManualAnswerSheetProps) {
  return (
    <BottomSheetPanel keyboardAware onClose={onClose} visible={visible}>
      <View style={styles.sheet__head}>
        <View style={styles.sheet__titleIcon}>
          <KeyboardIcon color={palette.accentStrong} size={18} />
        </View>
        <View style={styles.sheet__titleCopy}>
          <Text style={styles.sheet__title}>Проверьте себя руками</Text>
          <Text style={styles.sheet__subtitle}>
            Умная проверка понимает пробелы, разные кавычки, `sudo` и несколько допустимых
            вариантов.
          </Text>
        </View>
      </View>

      <View style={styles.prompt__card}>
        <Text style={styles.prompt__label}>Вопрос</Text>
        <Text style={styles.prompt__text}>{currentCard.question}</Text>
      </View>

      <View style={styles.input__block}>
        <Text style={styles.input__label}>Команда</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={onChangeAnswer}
          placeholder="Введите команду"
          placeholderTextColor={palette.textMuted}
          style={styles.input__field}
          value={manualAnswer}
        />
      </View>

      {manualFeedback ? (
        <View
          style={[
            styles.feedback,
            manualFeedback.tone === 'success'
              ? styles.feedbackSuccess
              : styles.feedbackWarning,
          ]}
        >
          <View style={styles.feedback__head}>
            {manualFeedback.tone === 'success' ? (
              <CheckIcon color={palette.accentStrong} size={18} />
            ) : (
              <ReviewIcon color="#f4a261" size={18} />
            )}
            <Text style={styles.feedback__title}>{manualFeedback.title}</Text>
          </View>
          <Text style={styles.feedback__body}>{manualFeedback.body}</Text>
        </View>
      ) : null}

      <View style={styles.sheet__actions}>
        {manualFeedback?.tone === 'warning' ? (
          <Pressable onPress={onSendToReview} style={styles.sheet__ghostButton}>
            <Text style={styles.sheet__ghostButtonText}>В повтор</Text>
          </Pressable>
        ) : (
          <Pressable onPress={onClose} style={styles.sheet__ghostButton}>
            <Text style={styles.sheet__ghostButtonText}>Закрыть</Text>
          </Pressable>
        )}

        <Pressable onPress={onSubmit} style={styles.sheet__primaryButton}>
          <Text style={styles.sheet__primaryButtonText}>
            {manualFeedback?.tone === 'warning' ? 'Проверить снова' : 'Проверить'}
          </Text>
        </Pressable>
      </View>
    </BottomSheetPanel>
  );
}

const styles = StyleSheet.create({
  sheet__head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  sheet__titleIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(130, 245, 208, 0.08)',
  },
  sheet__titleCopy: {
    flex: 1,
    gap: 6,
  },
  sheet__title: {
    color: palette.textPrimary,
    fontSize: 24,
    fontWeight: '900',
  },
  sheet__subtitle: {
    color: palette.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  prompt__card: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.footerPanel,
    gap: 8,
  },
  prompt__label: {
    color: palette.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  prompt__text: {
    color: palette.textPrimary,
    fontSize: 19,
    fontWeight: '800',
    lineHeight: 25,
  },
  input__block: {
    gap: 8,
  },
  input__label: {
    color: palette.textPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  input__field: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.footerPanel,
    color: palette.textPrimary,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  feedback: {
    padding: 14,
    borderRadius: 18,
    gap: 8,
  },
  feedbackSuccess: {
    backgroundColor: palette.successPanel,
  },
  feedbackWarning: {
    backgroundColor: palette.warningPanel,
  },
  feedback__head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  feedback__title: {
    color: palette.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  feedback__body: {
    color: palette.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  sheet__actions: {
    flexDirection: 'row',
    gap: 12,
  },
  sheet__ghostButton: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.overlayPill,
  },
  sheet__ghostButtonText: {
    color: palette.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  sheet__primaryButton: {
    flex: 1.2,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.accentStrong,
  },
  sheet__primaryButtonText: {
    color: palette.background,
    fontSize: 15,
    fontWeight: '900',
  },
});
