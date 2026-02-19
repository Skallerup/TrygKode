import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Button, Card, ScreenHeader } from '../../components';
import { useAppStore } from '../../store/useAppStore';
import { generateCodeWord, generateRotatingCode, getExpiryDate } from '../../utils/codeGenerator';

interface AddContactScreenProps {
  onBack: () => void;
  onAdded: () => void;
}

export const AddContactScreen: React.FC<AddContactScreenProps> = ({
  onBack,
  onAdded,
}) => {
  const { addContact } = useAppStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [codeType, setCodeType] = useState<'static' | 'rotating'>('static');
  const [customCode, setCustomCode] = useState('');
  const [step, setStep] = useState<'info' | 'code' | 'share'>('info');
  const [generatedCode, setGeneratedCode] = useState(() => generateCodeWord());

  const regenerateCode = useCallback((type: 'static' | 'rotating') => {
    setGeneratedCode(type === 'static' ? generateCodeWord() : generateRotatingCode());
  }, []);

  const handleCodeTypeChange = (type: 'static' | 'rotating') => {
    setCodeType(type);
    setCustomCode('');
    regenerateCode(type);
  };

  const handleContinue = () => {
    if (step === 'info') {
      if (!name.trim()) {
        Alert.alert('Mangler navn', 'Skriv kontaktens navn for at fortsætte.');
        return;
      }
      setStep('code');
    } else if (step === 'code') {
      if (customCode.trim() && customCode.trim().length < 3) {
        Alert.alert('For kort kodeord', 'Kodeordet skal være mindst 3 tegn langt.');
        return;
      }
      setStep('share');
    }
  };

  const handleSave = () => {
    const finalCode = customCode.trim() || generatedCode;

    addContact({
      id: Date.now().toString(),
      name: name.trim(),
      phone: phone.trim() || undefined,
      codeWord: finalCode,
      codeType,
      createdAt: new Date().toISOString(),
      expiresAt: codeType === 'rotating' ? getExpiryDate(30) : undefined,
    });

    onAdded();
  };

  const renderInfoStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Hvem vil du forbinde med?</Text>
      <Text style={styles.stepDescription}>
        Skriv navn og telefonnummer på den person, du vil dele et kodeord med.
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Navn</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="F.eks. Mor (Karen)"
          placeholderTextColor={colors.textLight}
          autoFocus
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Telefonnummer (valgfrit)</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="+45 12 34 56 78"
          placeholderTextColor={colors.textLight}
          keyboardType="phone-pad"
        />
      </View>
    </View>
  );

  const renderCodeStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Vælg kodeordstype</Text>

      <Card
        style={[styles.optionCard, codeType === 'static' && styles.optionCardActive]}
        onPress={() => handleCodeTypeChange('static')}
        variant="outlined"
      >
        <View style={styles.optionHeader}>
          <Ionicons name="key-outline" size={24} color={codeType === 'static' ? colors.primary : colors.textSecondary} />
          <Text style={[styles.optionTitle, codeType === 'static' && styles.optionTitleActive]}>
            Fast kodeord
          </Text>
        </View>
        <Text style={styles.optionDescription}>
          I vælger et kodeord, der forbliver det samme. Nemt at huske for alle aldre.
        </Text>
      </Card>

      <Card
        style={[styles.optionCard, codeType === 'rotating' && styles.optionCardActive]}
        onPress={() => handleCodeTypeChange('rotating')}
        variant="outlined"
      >
        <View style={styles.optionHeader}>
          <Ionicons name="refresh-outline" size={24} color={codeType === 'rotating' ? colors.primary : colors.textSecondary} />
          <Text style={[styles.optionTitle, codeType === 'rotating' && styles.optionTitleActive]}>
            Skiftende kodeord
          </Text>
        </View>
        <Text style={styles.optionDescription}>
          Appen genererer automatisk nye kodeord med jævne mellemrum. Mere sikkert.
        </Text>
      </Card>

      {codeType === 'static' && (
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Skriv jeres kodeord (eller lad os vælge ét)</Text>
          <TextInput
            style={styles.input}
            value={customCode}
            onChangeText={setCustomCode}
            placeholder={generatedCode}
            placeholderTextColor={colors.textLight}
          />
          <Text style={styles.inputHint}>
            Lad feltet stå tomt for at bruge det foreslåede kodeord
          </Text>
        </View>
      )}
    </View>
  );

  const renderShareStep = () => {
    const finalCode = customCode.trim() || generatedCode;
    return (
      <View style={styles.stepContent}>
        <View style={styles.shareIcon}>
          <Ionicons name="people" size={64} color={colors.primary} />
        </View>
        <Text style={styles.stepTitle}>Del kodeordet ansigt til ansigt</Text>
        <Text style={styles.stepDescription}>
          Fortæl {name} jeres kodeord næste gang I ses. Send det ALDRIG via SMS, e-mail eller beskeder.
        </Text>

        <Card style={styles.codePreview} variant="elevated">
          <Text style={styles.codePreviewLabel}>Jeres kodeord:</Text>
          <Text style={styles.codePreviewWord}>{finalCode}</Text>
        </Card>

        <Card style={styles.tipCard} variant="outlined">
          <View style={styles.tipHeader}>
            <Ionicons name="bulb-outline" size={20} color={colors.warning} />
            <Text style={styles.tipTitle}>Tip</Text>
          </View>
          <Text style={styles.tipText}>
            Vælg et kodeord der er nemt at huske, men svært at gætte. Brug ikke fødselsdage, navne eller andre oplagte ord.
          </Text>
        </Card>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="Tilføj kontakt" onBack={onBack} />

      <View style={styles.progressBar}>
        {['info', 'code', 'share'].map((s, i) => (
          <View
            key={s}
            style={[
              styles.progressDot,
              (step === s || ['info', 'code', 'share'].indexOf(step) > i) &&
                styles.progressDotActive,
            ]}
          />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {step === 'info' && renderInfoStep()}
        {step === 'code' && renderCodeStep()}
        {step === 'share' && renderShareStep()}
      </ScrollView>

      <View style={styles.bottomBar}>
        {step === 'share' ? (
          <Button title="Gem kontakt" onPress={handleSave} variant="secondary" />
        ) : (
          <Button title="Fortsæt" onPress={handleContinue} />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  progressDot: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  stepContent: {
    gap: spacing.md,
  },
  stepTitle: {
    ...typography.h2,
    color: colors.text,
  },
  stepDescription: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  inputGroup: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  inputLabel: {
    ...typography.bodyBold,
    color: colors.text,
  },
  input: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputHint: {
    ...typography.small,
    color: colors.textLight,
  },
  optionCard: {
    gap: spacing.sm,
  },
  optionCardActive: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.primaryLight + '10',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  optionTitle: {
    ...typography.bodyBold,
    color: colors.text,
  },
  optionTitleActive: {
    color: colors.primary,
  },
  optionDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  shareIcon: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  codePreview: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  codePreviewLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  codePreviewWord: {
    ...typography.hero,
    color: colors.primary,
    letterSpacing: 2,
  },
  tipCard: {
    gap: spacing.sm,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tipTitle: {
    ...typography.bodyBold,
    color: colors.warning,
  },
  tipText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    paddingBottom: spacing.xl,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
});
