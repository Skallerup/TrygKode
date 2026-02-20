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
      'Svindlere bruger nu AI til at kopiere stemmer og narre dine nærmeste. TrygKode beskytter dig med personlige kodeord, som kun du og dine kontakter kender.\n\nIngen AI kan gætte jeres hemmelige ord.',
  },
  {
    id: '2',
    icon: 'people',
    title: 'Forbind med dine nærmeste',
    description:
      'Tilføj familie og venner i appen, og opret et hemmeligt kodeord med hver person. Det kan være et sjovt ord som "jordbær-pandekage" eller noget kun I kender.\n\nDel altid kodeordet ansigt til ansigt — aldrig over SMS eller e-mail.',
  },
  {
    id: '3',
    icon: 'call',
    title: 'Verificer ved opkald',
    description:
      'Når nogen ringer og beder om penge eller personlige oplysninger — spørg efter jeres kodeord.\n\nKan de svare korrekt? Så er det den rigtige person.\nIngen kodeord? Læg på og ring selv op til personen.',
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
      <View style={styles.iconContainer}>
        <Ionicons name={item.icon} size={80} color={colors.primary} />
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.hero,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
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
