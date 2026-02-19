import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Card, Avatar, ScreenHeader } from '../../components';
import { useAppStore } from '../../store/useAppStore';

export const SettingsScreen: React.FC = () => {
  const { user, contacts } = useAppStore();
  const [biometricsEnabled, setBiometricsEnabled] = React.useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  const settingsSections = [
    {
      title: 'Sikkerhed',
      items: [
        {
          icon: 'finger-print' as const,
          label: 'Biometrisk lås',
          subtitle: 'Fingeraftryk eller Face ID',
          type: 'toggle' as const,
          value: biometricsEnabled,
          onToggle: setBiometricsEnabled,
        },
        {
          icon: 'card' as const,
          label: 'MitID-verifikation',
          subtitle: 'Verificeret',
          type: 'info' as const,
          valueText: 'Aktiv',
          valueColor: colors.secondary,
        },
      ],
    },
    {
      title: 'Notifikationer',
      items: [
        {
          icon: 'notifications' as const,
          label: 'Push-notifikationer',
          subtitle: 'Kodeord-udløb og check-ins',
          type: 'toggle' as const,
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled,
        },
      ],
    },
    {
      title: 'Familieadministrator',
      items: [
        {
          icon: 'people-circle' as const,
          label: 'Administrer for andre',
          subtitle: 'Hjælp familiemedlemmer med deres kodeord',
          type: 'link' as const,
          onPress: () => Alert.alert('Familieadministrator', 'Denne funktion lader dig hjælpe ældre familiemedlemmer med at styre deres kodeord. Kommer i en opdatering.'),
        },
      ],
    },
    {
      title: 'Om appen',
      items: [
        {
          icon: 'information-circle' as const,
          label: 'Om TrygKode',
          subtitle: 'Version 1.0.0',
          type: 'link' as const,
          onPress: () => Alert.alert('TrygKode', 'Version 1.0.0\n\nBeskyt dig selv og dine nærmeste mod AI-svindel med personlige kodeord.'),
        },
        {
          icon: 'document-text' as const,
          label: 'Privatlivspolitik',
          type: 'link' as const,
          onPress: () => {},
        },
        {
          icon: 'help-circle' as const,
          label: 'Hjælp og support',
          type: 'link' as const,
          onPress: () => {},
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="Indstillinger" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.profileCard}>
          <View style={styles.profileRow}>
            <Avatar name={user?.name || 'Bruger'} size={56} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || 'Din profil'}</Text>
              <Text style={styles.profileSub}>
                {contacts.length} kontakt{contacts.length !== 1 ? 'er' : ''} forbundet
              </Text>
            </View>
            <TouchableOpacity style={styles.editProfile}>
              <Ionicons name="pencil" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </Card>

        {settingsSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Card variant="outlined">
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.settingsItem,
                    index < section.items.length - 1 && styles.settingsItemBorder,
                  ]}
                  onPress={item.type === 'link' ? item.onPress : undefined}
                  activeOpacity={item.type === 'link' ? 0.7 : 1}
                >
                  <View style={styles.settingsIcon}>
                    <Ionicons name={item.icon} size={22} color={colors.primary} />
                  </View>
                  <View style={styles.settingsContent}>
                    <Text style={styles.settingsLabel}>{item.label}</Text>
                    {item.subtitle && (
                      <Text style={styles.settingsSubtitle}>{item.subtitle}</Text>
                    )}
                  </View>
                  {item.type === 'toggle' && (
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ true: colors.primary, false: colors.border }}
                      thumbColor="#FFFFFF"
                    />
                  )}
                  {item.type === 'info' && (
                    <Text style={[styles.valueText, { color: item.valueColor }]}>
                      {item.valueText}
                    </Text>
                  )}
                  {item.type === 'link' && (
                    <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                  )}
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  profileCard: {
    marginBottom: spacing.lg,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...typography.h3,
    color: colors.text,
  },
  profileSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  editProfile: {
    padding: spacing.sm,
    backgroundColor: colors.primaryLight + '20',
    borderRadius: borderRadius.sm,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  settingsItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  settingsIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primaryLight + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsContent: {
    flex: 1,
  },
  settingsLabel: {
    ...typography.body,
    color: colors.text,
  },
  settingsSubtitle: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  valueText: {
    ...typography.caption,
    fontWeight: '600',
  },
});
