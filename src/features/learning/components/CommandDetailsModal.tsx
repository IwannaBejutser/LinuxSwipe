import { ReactNode } from 'react';
import { Modal, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

import { getCategoryLabel } from '../lib/category';
import { CommandReference, getDifficultyLabel } from '../lib/commandReference';
import { commandReferenceStyles as styles } from './commandReferenceStyles';

type CommandDetailsModalProps = {
  onClose: () => void;
  reference: CommandReference | null;
  visible: boolean;
};

export function CommandDetailsModal({
  onClose,
  reference,
  visible,
}: CommandDetailsModalProps) {
  if (!reference) {
    return null;
  }

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
      visible={visible}
    >
      <SafeAreaView style={styles.detailsScreen}>
        <View style={styles.detailsHeader}>
          <View style={styles.detailsHeader__copy}>
            <Text style={styles.detailsHeader__eyebrow}>Справочник команд</Text>
            <Text style={styles.detailsHeader__title}>{reference.command}</Text>
          </View>
          <Pressable onPress={onClose} style={styles.detailsHeader__closeButton}>
            <Text style={styles.detailsHeader__closeButtonText}>Закрыть</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.detailsContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.detailsHero}>
            <View style={styles.detailsHero__meta}>
              <Text style={styles.detailsHero__metaText}>
                {reference.cards.length} сценариев
              </Text>
              <Text style={styles.detailsHero__metaText}>
                {reference.categories.map(getCategoryLabel).join(', ')}
              </Text>
            </View>
            <Text style={styles.detailsHero__summary}>{reference.summary}</Text>
          </View>

          <DetailsPanel title="Типовые варианты">
            {reference.answers.slice(0, 8).map((answer) => (
              <View key={answer} style={styles.answerRow}>
                <Text style={styles.answerRow__text}>{answer}</Text>
              </View>
            ))}
          </DetailsPanel>

          <DetailsPanel title="Где пригодится">
            {reference.cards.map((card) => (
              <View key={card.id} style={styles.scenarioRow}>
                <View style={styles.scenarioRow__header}>
                  <Text style={styles.scenarioRow__category}>
                    {getCategoryLabel(card.category)}
                  </Text>
                  <Text style={styles.scenarioRow__difficulty}>
                    {getDifficultyLabel(card.difficulty)}
                  </Text>
                </View>
                <Text style={styles.scenarioRow__question}>{card.question}</Text>
                <Text style={styles.scenarioRow__answer}>{card.answer}</Text>
                <Text style={styles.scenarioRow__body}>{card.example}</Text>
              </View>
            ))}
          </DetailsPanel>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function DetailsPanel({ children, title }: { children: ReactNode; title: string }) {
  return (
    <View style={styles.detailsPanel}>
      <Text style={styles.detailsPanel__title}>{title}</Text>
      {children}
    </View>
  );
}
