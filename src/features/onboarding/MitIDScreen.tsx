import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';
import { Button, Card } from '../../components';
import { mitidService, MitIDUserInfo, MitIDError } from '../../services/mitidService';

interface MitIDScreenProps {
  onVerified: (userInfo?: MitIDUserInfo) => void;
}

type ScreenState = 'intro' | 'verifying' | 'verified' | 'error';

export const MitIDScreen: React.FC<MitIDScreenProps> = ({ onVerified }) => {
  const [state, setState] = useState<ScreenState>('intro');
  const [userInfo, setUserInfo] = useState<MitIDUserInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [useDemo, setUseDemo] = useState(false);

  const handleMitIDLogin = async () => {
    setState('verifying');
    setErrorMessage('');

    try {
      const info = await mitidService.authenticate();
      setUserInfo(info);
      setState('verified');
    } catch (error) {
      if (error instanceof MitIDError) {
        if (error.code === 'LOGIN_CANCELLED') {
          setState('intro');
          return;
        }
        setErrorMessage(error.message);
      } else {
        const msg = error instanceof Error ? error.message : 'Ukendt fejl';
        setErrorMessage(`Der opstod en fejl: ${msg}`);
      }
      setState('error');
    }
  };

  const handleDemoLogin = async () => {
    setUseDemo(true);
    setState('verifying');
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const demoUser: MitIDUserInfo = {
      sub: 'demo-user-001',
      name: 'Demo Bruger',
      mitidVerified: false,
    };
    setUserInfo(demoUser);
    setState('verified');
  };

  if (state === 'verified' && userInfo) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={100} color={colors.secondary} />
          </View>
          <Text style={styles.title}>Verificeret!</Text>
          {userInfo.name && (
            <Text style={styles.welcomeName}>Velkommen, {userInfo.name}</Text>
          )}
          <Text style={styles.description}>
            Din identitet er bekræftet med MitID. Du er nu klar til at bruge TrygKode.
          </Text>
          {!useDemo && (
            <Card style={styles.verifiedCard} variant="outlined">
              <View style={styles.verifiedRow}>
                <Ionicons name="shield-checkmark" size={20} color={colors.secondary} />
                <Text style={styles.verifiedText}>MitID verificeret</Text>
              </View>
            </Card>
          )}
          {useDemo && (
            <Card style={styles.demoCard} variant="outlined">
              <View style={styles.verifiedRow}>
                <Ionicons name="information-circle" size={20} color={colors.warning} />
                <Text style={styles.demoText}>Demo-tilstand — ikke MitID-verificeret</Text>
              </View>
            </Card>
          )}
        </View>
        <View style={styles.buttonContainer}>
          <Button title="Fortsæt til TrygKode" onPress={() => onVerified(userInfo)} />
        </View>
      </View>
    );
  }

  if (state === 'error') {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.errorIcon}>
            <Ionicons name="alert-circle" size={80} color={colors.danger} />
          </View>
          <Text style={styles.title}>Noget gik galt</Text>
          <Text style={styles.description}>{errorMessage}</Text>
        </View>
        <View style={styles.buttonContainer}>
          <Button title="Prøv igen med MitID" onPress={handleMitIDLogin} />
          <Button
            title="Fortsæt uden MitID (demo)"
            onPress={handleDemoLogin}
            variant="ghost"
            size="medium"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.mitidBadge}>
            <Text style={styles.mitidBadgeText}>MitID</Text>
          </View>
        </View>
        <Text style={styles.title}>Bekræft din identitet</Text>
        <Text style={styles.description}>
          For at sikre at alle brugere er rigtige personer, skal du verificere dig med MitID.
          {'\n\n'}
          Du vil blive sendt til MitID-login, præcis som du kender det fra din bank.
        </Text>

        <Card style={styles.infoCard} variant="outlined">
          <View style={styles.infoRow}>
            <Ionicons name="lock-closed" size={20} color={colors.primary} />
            <Text style={styles.infoText}>Vi gemmer ingen MitID-oplysninger</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
            <Text style={styles.infoText}>Sikker forbindelse via OpenID Connect</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="eye-off" size={20} color={colors.primary} />
            <Text style={styles.infoText}>Dine data er krypteret og private</Text>
          </View>
        </Card>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Log ind med MitID"
          onPress={handleMitIDLogin}
          loading={state === 'verifying'}
          icon={
            state !== 'verifying' ? (
              <View style={styles.mitidIcon}>
                <Text style={styles.mitidIconText}>MitID</Text>
              </View>
            ) : undefined
          }
        />
        <Button
          title="Prøv uden MitID (demo)"
          onPress={handleDemoLogin}
          variant="ghost"
          size="medium"
        />
        <Text style={styles.footerText}>
          Ved at fortsætte accepterer du vores vilkår og privatlivspolitik.
          {'\n'}MitID-login leveres af Criipto, en godkendt MitID-broker.
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
  mitidBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  mitidBadgeText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 1,
  },
  successIcon: {
    marginBottom: spacing.lg,
  },
  errorIcon: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  welcomeName: {
    ...typography.h3,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
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
  verifiedCard: {
    borderColor: colors.secondary,
    backgroundColor: colors.successLight,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  verifiedText: {
    ...typography.bodyBold,
    color: colors.secondaryDark,
  },
  demoCard: {
    borderColor: colors.warning,
    backgroundColor: colors.warningLight,
  },
  demoText: {
    ...typography.caption,
    color: colors.warning,
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  mitidIcon: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mitidIconText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  footerText: {
    ...typography.small,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 18,
  },
});
