import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Button } from '../../components';
import { LoginMethod } from '../../store/useAppStore';
import { showAlert } from '../../utils/alerts';

interface LockScreenProps {
  preferredMethod: LoginMethod;
  pinCode?: string;
  onUnlocked: () => void;
}

const methodLabels: Record<LoginMethod, string> = {
  faceid: 'Face ID',
  pin: 'Personlig kode',
  mitid: 'MitID',
};

const methodIcons: Record<LoginMethod, keyof typeof Ionicons.glyphMap> = {
  faceid: 'scan',
  pin: 'keypad',
  mitid: 'card',
};

const allMethods: LoginMethod[] = ['faceid', 'pin', 'mitid'];

export const LockScreen: React.FC<LockScreenProps> = ({
  preferredMethod,
  pinCode,
  onUnlocked,
}) => {
  const [activeMethod, setActiveMethod] = useState<LoginMethod>(preferredMethod);
  const [enteredPin, setEnteredPin] = useState('');
  const [error, setError] = useState('');

  const alternativeMethods = allMethods.filter((m) => m !== activeMethod);

  const handleFaceId = () => {
    setTimeout(() => {
      onUnlocked();
    }, 800);
  };

  const handlePinDigit = (digit: string) => {
    setError('');
    const next = enteredPin + digit;
    if (next.length <= 4) {
      setEnteredPin(next);
    }
    if (next.length === 4) {
      if (!pinCode) {
        showAlert('Ingen kode sat', 'Du har endnu ikke oprettet en personlig kode. Gå til Indstillinger efter login for at oprette én.');
        setEnteredPin('');
        return;
      }
      if (next === pinCode) {
        onUnlocked();
      } else {
        setError('Forkert kode. Prøv igen.');
        setEnteredPin('');
      }
    }
  };

  const handlePinDelete = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const handleMitId = () => {
    setTimeout(() => {
      onUnlocked();
    }, 800);
  };

  const renderFaceId = () => (
    <View style={styles.methodContent}>
      <TouchableOpacity style={styles.faceIdButton} onPress={handleFaceId} activeOpacity={0.7}>
        <Ionicons name="scan" size={80} color={colors.primary} />
      </TouchableOpacity>
      <Text style={styles.methodInstruction}>Tryk for at bruge Face ID</Text>
    </View>
  );

  const renderPin = () => (
    <View style={styles.methodContent}>
      <Text style={styles.methodInstruction}>Indtast din 4-cifrede kode</Text>
      <View style={styles.pinDots}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.pinDot,
              i < enteredPin.length && styles.pinDotFilled,
              error ? styles.pinDotError : null,
            ]}
          />
        ))}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <View style={styles.numpad}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((key) => (
          <TouchableOpacity
            key={key || 'empty'}
            style={[styles.numpadKey, !key && styles.numpadKeyEmpty]}
            onPress={() => {
              if (key === 'del') handlePinDelete();
              else if (key) handlePinDigit(key);
            }}
            activeOpacity={key ? 0.6 : 1}
            disabled={!key}
          >
            {key === 'del' ? (
              <Ionicons name="backspace-outline" size={24} color={colors.text} />
            ) : (
              <Text style={styles.numpadKeyText}>{key}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderMitId = () => (
    <View style={styles.methodContent}>
      <TouchableOpacity style={styles.mitidButton} onPress={handleMitId} activeOpacity={0.7}>
        <Ionicons name="card" size={48} color={colors.surface} />
        <Text style={styles.mitidButtonText}>Log ind med MitID</Text>
      </TouchableOpacity>
      <Text style={styles.methodInstruction}>Tryk for at verificere med MitID</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={40} color={colors.primary} />
        <Text style={styles.title}>TrygKode</Text>
        <Text style={styles.subtitle}>
          Log ind med {methodLabels[activeMethod]}
        </Text>
      </View>

      {activeMethod === 'faceid' && renderFaceId()}
      {activeMethod === 'pin' && renderPin()}
      {activeMethod === 'mitid' && renderMitId()}

      <View style={styles.alternativesSection}>
        <Text style={styles.alternativesLabel}>Eller log ind med</Text>
        <View style={styles.alternativeButtons}>
          {alternativeMethods.map((method) => (
            <TouchableOpacity
              key={method}
              style={styles.alternativeButton}
              onPress={() => { setActiveMethod(method); setEnteredPin(''); setError(''); }}
              activeOpacity={0.7}
            >
              <Ionicons name={methodIcons[method]} size={22} color={colors.primary} />
              <Text style={styles.alternativeButtonText}>{methodLabels[method]}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    gap: spacing.xs,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  methodContent: {
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  methodInstruction: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  faceIdButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinDots: {
    flexDirection: 'row',
    gap: spacing.md,
    marginVertical: spacing.md,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
  pinDotFilled: {
    backgroundColor: colors.primary,
  },
  pinDotError: {
    borderColor: colors.danger,
    backgroundColor: colors.danger,
  },
  errorText: {
    ...typography.small,
    color: colors.danger,
    textAlign: 'center',
  },
  numpad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 280,
    gap: spacing.sm,
  },
  numpadKey: {
    width: 72,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  numpadKeyEmpty: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  numpadKeyText: {
    ...typography.h3,
    color: colors.text,
  },
  mitidButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  mitidButtonText: {
    ...typography.bodyBold,
    color: colors.surface,
  },
  alternativesSection: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  alternativesLabel: {
    ...typography.small,
    color: colors.textLight,
  },
  alternativeButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  alternativeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  alternativeButtonText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '600',
  },
});
