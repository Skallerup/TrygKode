import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Button, Card } from '../../components';

interface MitIDScreenProps {
  onVerified: () => void;
}

export const MitIDScreen: React.FC<MitIDScreenProps> = ({ onVerified }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleMitIDLogin = async () => {
    setIsVerifying(true);
    // Mock MitID-verifikation — i produktion forbindes til MitID Broker API
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsVerified(true);
    setIsVerifying(false);
  };

  if (isVerified) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={100} color={colors.secondary} />
          </View>
          <Text style={styles.title}>Verificeret!</Text>
          <Text style={styles.description}>
            Din identitet er bekræftet med MitID. Du er nu klar til at bruge TrygKode.
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <Button title="Fortsæt til TrygKode" onPress={onVerified} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="finger-print" size={64} color={colors.primary} />
        </View>
        <Text style={styles.title}>Bekræft din identitet</Text>
        <Text style={styles.description}>
          For at sikre at alle brugere er rigtige personer, skal du verificere dig med MitID.
        </Text>

        <Card style={styles.infoCard} variant="outlined">
          <View style={styles.infoRow}>
            <Ionicons name="lock-closed" size={20} color={colors.primary} />
            <Text style={styles.infoText}>
              Vi gemmer ingen MitID-oplysninger
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
            <Text style={styles.infoText}>
              Bruges kun til at bekræfte din identitet
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="eye-off" size={20} color={colors.primary} />
            <Text style={styles.infoText}>
              Dine data er krypteret og private
            </Text>
          </View>
        </Card>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Log ind med MitID"
          onPress={handleMitIDLogin}
          loading={isVerifying}
        />
        <Text style={styles.footerText}>
          Ved at fortsætte accepterer du vores vilkår og privatlivspolitik
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
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
  successIcon: {
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
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  infoCard: {
    width: '100%',
    gap: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  infoText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  footerText: {
    ...typography.small,
    color: colors.textLight,
    textAlign: 'center',
  },
});
