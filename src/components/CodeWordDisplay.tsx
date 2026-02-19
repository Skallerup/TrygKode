import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme';

interface CodeWordDisplayProps {
  codeWord: string;
  type: 'static' | 'rotating';
  expiresAt?: string;
  contactName: string;
}

export const CodeWordDisplay: React.FC<CodeWordDisplayProps> = ({
  codeWord,
  type,
  expiresAt,
  contactName,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.typeTag}>
          <Ionicons
            name={type === 'static' ? 'key-outline' : 'refresh-outline'}
            size={14}
            color={colors.primary}
          />
          <Text style={styles.typeText}>
            {type === 'static' ? 'Fast kodeord' : 'Skiftende kodeord'}
          </Text>
        </View>
        {expiresAt && (
          <Text style={styles.expires}>Udløber: {expiresAt}</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.codeContainer}
        onPress={() => setIsVisible(!isVisible)}
        activeOpacity={0.7}
      >
        <Text style={styles.codeWord}>
          {isVisible ? codeWord : '••••••••'}
        </Text>
        <Ionicons
          name={isVisible ? 'eye-off-outline' : 'eye-outline'}
          size={24}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      <Text style={styles.hint}>
        Tryk for at {isVisible ? 'skjule' : 'vise'} kodeordet
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  typeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  typeText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '600',
  },
  expires: {
    ...typography.small,
    color: colors.textSecondary,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  codeWord: {
    ...typography.h1,
    color: colors.text,
    letterSpacing: 2,
  },
  hint: {
    ...typography.small,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
