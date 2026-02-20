import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Button, Card, ScreenHeader } from '../../components';
import { useAppStore } from '../../store/useAppStore';
import { showAlert } from '../../utils/alerts';

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
  const [step, setStep] = useState<'info' | 'confirm' | 'sent'>('info');

  const handleContinue = () => {
    if (step === 'info') {
      if (!name.trim()) {
        showAlert('Mangler navn', 'Skriv kontaktens navn for at fortsætte.');
        return;
      }
      setStep('confirm');
    }
  };

  const handleSendRequest = () => {
    addContact({
      id: Date.now().toString(),
      name: name.trim(),
      phone: phone.trim() || undefined,
      codeWord: '',
      codeType: 'static',
      createdAt: new Date().toISOString(),
      status: 'pending_sent',
      requestedAt: new Date().toISOString(),
      requestedBy: 'me',
    });
    setStep('sent');
  };

  const renderInfoStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Hvem vil du forbindes med?</Text>
      <Text style={styles.stepDescription}>
        Skriv navn og telefonnummer på den person, du vil dele et kodeord med.
        Personen skal godkende anmodningen, før I kan oprette et fælles kodeord.
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
        <Text style={styles.inputLabel}>Telefonnummer</Text>
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

  const renderConfirmStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.confirmIcon}>
        <Ionicons name="person-add" size={64} color={colors.primary} />
      </View>
      <Text style={styles.stepTitle}>Send forbindelsesanmodning</Text>
      <Text style={styles.stepDescription}>
        Du er ved at sende en anmodning til {name.trim()}.
        Personen skal acceptere, før I kan oprette et fælles kodeord.
      </Text>

      <Card style={styles.summaryCard} variant="outlined">
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Navn</Text>
          <Text style={styles.summaryValue}>{name.trim()}</Text>
        </View>
        {phone.trim() && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Telefon</Text>
            <Text style={styles.summaryValue}>{phone.trim()}</Text>
          </View>
        )}
      </Card>

      <Card style={styles.infoCard} variant="outlined">
        <View style={styles.infoRow}>
          <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
          <Text style={styles.infoText}>
            Kodeordet oprettes først, når personen har accepteret din anmodning.
            Det sikrer, at begge parter er enige om forbindelsen.
          </Text>
        </View>
      </Card>
    </View>
  );

  const renderSentStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.sentIcon}>
        <Ionicons name="checkmark-circle" size={80} color={colors.success} />
      </View>
      <Text style={styles.stepTitle}>Anmodning sendt!</Text>
      <Text style={styles.stepDescription}>
        {name.trim()} vil modtage din anmodning i deres TrygKode-app.
        Du får besked, så snart personen accepterer.
      </Text>
      <Text style={styles.stepDescription}>
        Derefter kan I sammen vælge et kodeord og begynde at beskytte jer mod svindel.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="Tilføj kontakt" onBack={step === 'sent' ? undefined : onBack} />

      <View style={styles.progressBar}>
        {['info', 'confirm', 'sent'].map((s, i) => (
          <View
            key={s}
            style={[
              styles.progressDot,
              (['info', 'confirm', 'sent'].indexOf(step) >= i) &&
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
        {step === 'confirm' && renderConfirmStep()}
        {step === 'sent' && renderSentStep()}
      </ScrollView>

      <View style={styles.bottomBar}>
        {step === 'info' && (
          <Button title="Fortsæt" onPress={handleContinue} />
        )}
        {step === 'confirm' && (
          <View style={styles.bottomButtons}>
            <Button title="Tilbage" onPress={() => setStep('info')} variant="ghost" />
            <Button title="Send anmodning" onPress={handleSendRequest} />
          </View>
        )}
        {step === 'sent' && (
          <Button title="Færdig" onPress={onAdded} variant="secondary" />
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
    textAlign: 'center',
  },
  stepDescription: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
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
  confirmIcon: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  summaryCard: {
    gap: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.bodyBold,
    color: colors.text,
  },
  infoCard: {
    gap: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  infoText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 20,
    flex: 1,
  },
  sentIcon: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
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
  bottomButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
