import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Avatar, Card, ScreenHeader } from '../../components';
import { useAppStore, Contact } from '../../store/useAppStore';
import { mockContacts } from '../../utils/mockData';
import { showAlert } from '../../utils/alerts';
import { daysUntilExpiry } from '../../utils/codeGenerator';

interface HomeScreenProps {
  onContactPress: (contact: Contact) => void;
  onAddContact: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onContactPress,
  onAddContact,
}) => {
  const { contacts, user, addContact, hasSeedData, setHasSeedData } = useAppStore();

  useEffect(() => {
    if (!hasSeedData) {
      mockContacts.forEach(addContact);
      setHasSeedData(true);
    }
  }, []);

  const renderContactItem = ({ item }: { item: Contact }) => {
    const expiryDays = item.expiresAt ? daysUntilExpiry(item.expiresAt) : null;

    return (
      <Card
        style={styles.contactCard}
        onPress={() => onContactPress(item)}
      >
        <View style={styles.contactRow}>
          <Avatar name={item.name} size={52} />
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{item.name}</Text>
            <View style={styles.contactMeta}>
              <Ionicons
                name={item.codeType === 'static' ? 'key-outline' : 'refresh-outline'}
                size={14}
                color={colors.textSecondary}
              />
              <Text style={styles.contactType}>
                {item.codeType === 'static' ? 'Fast kodeord' : 'Skiftende kodeord'}
              </Text>
            </View>
          </View>
          <View style={styles.contactRight}>
            {expiryDays !== null && expiryDays <= 7 && (
              <View style={styles.expiryBadge}>
                <Text style={styles.expiryText}>{expiryDays}d</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </View>
        </View>
      </Card>
    );
  };

  const renderHeader = () => (
    <View>
      <Card style={styles.welcomeCard} variant="elevated">
        <View style={styles.welcomeRow}>
          <View style={styles.welcomeIcon}>
            <Ionicons name="shield-checkmark" size={32} color={colors.primary} />
          </View>
          <View style={styles.welcomeText}>
            <Text style={styles.welcomeTitle}>Du er beskyttet</Text>
            <Text style={styles.welcomeSub}>
              {contacts.length} kontakt{contacts.length !== 1 ? 'er' : ''} med aktive kodeord
            </Text>
          </View>
        </View>
      </Card>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Dine kontakter</Text>
        <TouchableOpacity onPress={onAddContact} style={styles.addButton}>
          <Ionicons name="add-circle" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={64} color={colors.textLight} />
      <Text style={styles.emptyTitle}>Ingen kontakter endnu</Text>
      <Text style={styles.emptyText}>
        Tilføj familie og venner for at komme i gang med at beskytte jer mod svindel.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader
        title="TrygKode"
        subtitle="Din tryghed, dit kodeord"
        rightAction={{ icon: 'notifications-outline', onPress: () => showAlert('Notifikationer', 'Du har ingen nye notifikationer.') }}
      />
      <FlatList
        data={contacts}
        renderItem={renderContactItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  welcomeCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.primary,
  },
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  welcomeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    flex: 1,
  },
  welcomeTitle: {
    ...typography.h2,
    color: colors.textOnPrimary,
  },
  welcomeSub: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  addButton: {
    padding: spacing.xs,
  },
  contactCard: {
    marginBottom: spacing.sm,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    ...typography.bodyBold,
    color: colors.text,
  },
  contactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  contactType: {
    ...typography.small,
    color: colors.textSecondary,
  },
  contactRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  expiryBadge: {
    backgroundColor: colors.warningLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  expiryText: {
    ...typography.small,
    color: colors.warning,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
