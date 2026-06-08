import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { palette } from '../../../shared/theme/palette';
import { getCategoryLabel } from '../lib/category';
import { getDifficultyLabel } from '../lib/difficulty';
import { Card } from '../types/card';

type CardDetailsModalProps = {
  card: Card;
  onClose: () => void;
  visible: boolean;
};

export function CardDetailsModal({ card, onClose, visible }: CardDetailsModalProps) {
  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
      visible={visible}
    >
      <SafeAreaView style={styles.screen}>
        <View style={styles.screen__header}>
          <View style={styles.screen__headerCopy}>
            <Text style={styles.screen__eyebrow}>Подробнее по карточке</Text>
            <Text style={styles.screen__title}>{card.question}</Text>
          </View>
          <Pressable onPress={onClose} style={styles.screen__closeButton}>
            <Text style={styles.screen__closeButtonText}>Закрыть</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.screen__content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.card__metaRail}>
              <DetailMetaPill label={getCategoryLabel(card.category)} />
              <DetailMetaPill label={getDifficultyLabel(card.difficulty)} />
            </View>

            <DetailPanel body={card.answer} title="Правильный ответ" tone="accent" />
            <DetailPanel body={card.explanation} title="Почему так" tone="default" />
            <DetailPanel body={card.example} title="Когда пригодится" tone="default" />
            <DetailPanel
              body={card.hint}
              title="Подсказка для запоминания"
              tone="subtle"
            />

            {card.acceptedAnswers?.length ? (
              <DetailPanel
                body={card.acceptedAnswers.join('\n')}
                title="Допустимые варианты"
                tone="default"
              />
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function DetailMetaPill({ label }: { label: string }) {
  return (
    <View style={styles.metaPill}>
      <Text numberOfLines={1} style={styles.metaPill__text}>
        {label}
      </Text>
    </View>
  );
}

function DetailPanel({
  body,
  title,
  tone,
}: {
  body: string;
  title: string;
  tone: 'accent' | 'default' | 'subtle';
}) {
  return (
    <View
      style={[
        styles.panel,
        tone === 'accent' && styles.panelAccent,
        tone === 'subtle' && styles.panelSubtle,
      ]}
    >
      <Text style={styles.panel__title}>{title}</Text>
      <Text style={tone === 'accent' ? styles.panel__answer : styles.panel__body}>
        {body}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  screen__header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: palette.hairline,
    backgroundColor: 'rgba(1, 2, 3, 0.96)',
  },
  screen__headerCopy: {
    flex: 1,
    gap: 6,
  },
  screen__eyebrow: {
    color: palette.accentStrong,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  screen__title: {
    color: palette.textPrimary,
    fontSize: 19,
    fontWeight: '900',
    lineHeight: 25,
  },
  screen__closeButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.hairline,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  screen__closeButtonText: {
    color: palette.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
  screen__content: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 36,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 760,
    padding: 18,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(158, 184, 214, 0.1)',
    backgroundColor: palette.panel,
    gap: 14,
  },
  card__metaRail: {
    flexDirection: 'row',
    gap: 10,
  },
  metaPill: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.hairline,
    backgroundColor: 'rgba(7, 10, 14, 0.68)',
    alignItems: 'center',
  },
  metaPill__text: {
    color: palette.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  panel: {
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(120, 130, 146, 0.09)',
    backgroundColor: palette.footerPanel,
    gap: 10,
  },
  panelAccent: {
    backgroundColor: palette.answerPanel,
  },
  panelSubtle: {
    backgroundColor: palette.subtlePanel,
  },
  panel__title: {
    color: palette.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  panel__answer: {
    color: palette.textPrimary,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 31,
  },
  panel__body: {
    color: palette.textSecondary,
    fontSize: 15,
    lineHeight: 23,
  },
});
