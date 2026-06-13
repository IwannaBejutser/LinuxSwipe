import { Pressable, Text, View } from 'react-native';

import { SparkIcon } from '../../../shared/components/icons';
import { palette } from '../../../shared/theme';
import { getCategoryLabel } from '../lib/category';
import { CommandReference, getDifficultyLabel } from '../lib/commandReference';
import { commandReferenceStyles as styles } from './commandReferenceStyles';

type CommandReferenceCardProps = {
  onOpen: () => void;
  reference: CommandReference;
};

export function CommandReferenceCard({ onOpen, reference }: CommandReferenceCardProps) {
  const [primaryCard, ...relatedCards] = reference.cards;

  return (
    <Pressable
      accessibilityLabel={`Открыть справку по команде ${reference.command}`}
      accessibilityRole="button"
      onPress={onOpen}
      style={({ pressed }) => [styles.commandCard, pressed && styles.commandCardPressed]}
    >
      <View style={styles.commandCard__header}>
        <View style={styles.commandCard__mark}>
          <SparkIcon color={palette.accentStrong} size={16} />
        </View>
        <View style={styles.commandCard__heading}>
          <Text style={styles.commandCard__command}>{reference.command}</Text>
          <Text style={styles.commandCard__meta}>
            {reference.cards.length} сценариев ·{' '}
            {reference.categories.map(getCategoryLabel).join(', ')}
          </Text>
        </View>
      </View>

      <Text style={styles.commandCard__summary}>{reference.summary}</Text>

      {primaryCard ? (
        <View style={styles.commandCard__example}>
          <Text style={styles.commandCard__exampleLabel}>Пример</Text>
          <Text style={styles.commandCard__answer}>{primaryCard.answer}</Text>
          <Text style={styles.commandCard__exampleBody}>{primaryCard.example}</Text>
        </View>
      ) : null}

      <View style={styles.commandCard__footer}>
        <View style={styles.commandCard__chips}>
          {reference.difficulties.map((difficulty) => (
            <View key={difficulty} style={styles.commandCard__chip}>
              <Text style={styles.commandCard__chipText}>
                {getDifficultyLabel(difficulty)}
              </Text>
            </View>
          ))}
        </View>
        {relatedCards.length > 0 ? (
          <Text style={styles.commandCard__more}>+{relatedCards.length} еще</Text>
        ) : (
          <Text style={styles.commandCard__more}>Открыть</Text>
        )}
      </View>
    </Pressable>
  );
}
