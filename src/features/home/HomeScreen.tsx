import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Avatar, Card, Button, ScreenHeader } from '../../components';
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
  const { contacts, user, addContact, hasSeedData, setHasSeedData, acceptContact, declineContact } = useAppStore();

  useEffect(() => {
    if (!hasSeedData) {
      mockContacts.forEach(addContact);
      setHasSeedData(true);
    }
  }, []);

  const acceptedContacts = contacts.filter((c) => c.status === 'accepted');
  const pendingContacts = contacts.filter(
    (c) => c.status === 'pending_sent' || c.status === 'pending_received'
  );

  const sections = [
    ...(pendingContacts.length > 0
      ? [{ title: 'Afventende anmodninger', data: pendingContacts, key: 'pending' }]
      : []),
    { title: 'Dine kontakter', data: acceptedContacts, key: 'accepted' },
  ];

  const handleAccept = (contact: Contact) => {
    acceptContact(contact.id);
  };

  const handleDecline = (contact: Contact) => {
    declineContact(contact.id);
  };

  const renderPendingItem = (item: Contact) => (
    <Card style={styles.pendingCard}>
      <View style={styles.contactRow}>
        <Avatar name={item.name} size={48} />
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{item.name}</Text>
          {item.status === 'pending_sent' ? (
            <View style={styles.pendingStatus}>
              <Ionicons name="time-outline" size={14} color={colors.warning} />
              <Text style={styles.pendingText}>Venter på svar...</Text>
            </View>
          ) : (
            <Text style={styles.incomingText}>Vil forbindes med dig</Text>
          )}
        </View>
        {item.status === 'pending_sent' && (
          <TouchableOpacity onPress={() => onContactPress(item)} style={styles.chevron}>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>
        )}
      </View>
      {item.status === 'pending_received' && (
        <View style={styles.pendingActions}>
          <TouchableOpacity
            style={styles.declineButton}
            onPress={() => handleDecline(item)}
          >
            <Ionicons name="close-circle-outline" size={20} color={colors.danger} />
            <Text style={styles.declineText}>Afvis</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => handleAccept(item)}
          >
            <Ionicons name="checkmark-circle" size={20} color={colors.surface} />
            <Text style={styles.acceptText}>Accepter</Text>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );

  const renderAcceptedItem = (item: Contact) => {
    const expiryDays = item.expiresAt ? daysUntilExpiry(item.expiresAt) : null;
    return (
      <Card style={styles.contactCard} onPress={() => onContactPress(item)}>
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

  const renderItem = ({ item, section }: { item: Contact; section: { key: string } }) => {
    if (section.key === 'pending') {
      return renderPendingItem(item);
    }
    return renderAcceptedItem(item);
  };

  const renderSectionHeader = ({ section }: { section: { title: string; key: string } }) => {
    if (section.key === 'pending') {
      return (
        <View style={styles.pendingSectionHeader}>
          <Ionicons name="notifications-outline" size={18} color={colors.warning} />
          <Text style={styles.pendingSectionTitle}>{section.title}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{pendingContacts.length}</Text>
          </View>
        </View>
      );
    }
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <TouchableOpacity onPress={onAddContact} style={styles.addButton}>
          <Ionicons name="add-circle" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderHeader = () => (
    <Card style={styles.welcomeCard} variant="elevated">
      <View style={styles.welcomeRow}>
        <View style={styles.welcomeIcon}>
          <Ionicons name="shield-checkmark" size={32} color={colors.primary} />
        </View>
        <View style={styles.welcomeText}>
          <Text style={styles.welcomeTitle}>Du er beskyttet</Text>
          <Text style={styles.welcomeSub}>
            {acceptedContacts.length} kontakt{acceptedContacts.length !== 1 ? 'er' : ''} med aktive kodeord
          </Text>
        </View>
      </View>
    </Card>
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
      <SectionList
        sections={sections}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
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
  pendingSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  pendingSectionTitle: {
    ...typography.bodyBold,
    color: colors.warning,
    flex: 1,
  },
  badge: {
    backgroundColor: colors.warning,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    ...typography.small,
    color: colors.surface,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  addButton: {
    padding: spacing.xs,
  },
  pendingCard: {
    marginBottom: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
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
  chevron: {
    padding: spacing.xs,
  },
  pendingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  pendingText: {
    ...typography.small,
    color: colors.warning,
    fontStyle: 'italic',
  },
  incomingText: {
    ...typography.small,
    color: colors.primary,
    marginTop: 4,
  },
  pendingActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  declineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  declineText: {
    ...typography.small,
    color: colors.danger,
    fontWeight: '600',
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: borderRadius.md,
    backgroundColor: colors.success,
  },
  acceptText: {
    ...typography.small,
    color: colors.surface,
    fontWeight: '600',
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
