import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';
import { Button } from '../../components';

const { width } = Dimensions.get('window');

interface OnboardingStep {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

const steps: OnboardingStep[] = [
  {
    id: '1',
    icon: 'shield-checkmark',
    title: 'Velkommen til TrygKode',
    description:
      'Vidste du, at svindlere nu kan kopiere din stemme med kun 3 sekunders optagelse? De bruger AI til at ringe til dine nærmeste og udgive sig for at være dig.\n\n' +
      'TrygKode beskytter dig med et simpelt princip: et personligt kodeord mellem dig og dine nærmeste, som ingen kunstig intelligens kan gætte.\n\n' +
      'Appen er 100% gratis og udviklet til danske familier.',
  },
  {
    id: '2',
    icon: 'people',
    title: 'Forbind med familie og venner',
    description:
      'Sådan virker det:\n\n' +
      '1. Tilføj dine nærmeste som kontakter i appen\n' +
      '2. Opret et hemmeligt kodeord med hver person — f.eks. "jordbær-pandekage"\n' +
      '3. Del kodeordet ansigt til ansigt — aldrig digitalt\n\n' +
      'Du kan vælge et fast kodeord, som I selv finder på, eller lade appen generere skiftende kodeord for ekstra sikkerhed.\n\n' +
      'Hver kontakt har sit eget unikke kodeord.',
  },
  {
    id: '3',
    icon: 'call',
    title: 'Stop svindel med ét spørgsmål',
    description:
      'Forestil dig: Du får et opkald fra "din mor", der beder dig overføre penge akut.\n\n' +
      'Med TrygKode spørger du blot:\n"Hvad er vores kodeord?"\n\n' +
      'Kan personen svare korrekt? Så er det den rigtige.\n' +
      'Kan de ikke svare? Læg på med det samme og ring selv til personen.\n\n' +
      'Så enkelt er det at beskytte dig selv og dem du holder af.',
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < steps.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  const renderStep = ({ item }: { item: OnboardingStep }) => (
    <View style={styles.stepContainer}>
      <View style={styles.stepInner}>
        <View style={styles.iconContainer}>
          <Ionicons name={item.icon} size={64} color={colors.primary} />
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {steps.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === currentIndex ? styles.dotActive : styles.dotInactive,
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={steps}
        renderItem={renderStep}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      {renderDots()}

      <View style={styles.buttonContainer}>
        <Button
          title={currentIndex === steps.length - 1 ? 'Kom i gang' : 'Næste'}
          onPress={handleNext}
        />
        {currentIndex < steps.length - 1 && (
          <Button
            title="Spring over"
            onPress={onComplete}
            variant="ghost"
            size="medium"
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  stepContainer: {
    width,
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  stepInner: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'left',
    lineHeight: 26,
    paddingHorizontal: spacing.sm,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 28,
  },
  dotInactive: {
    backgroundColor: colors.border,
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
});
