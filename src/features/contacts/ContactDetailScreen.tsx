import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Avatar, Button, Card, CodeWordDisplay, ScreenHeader } from '../../components';
import { useAppStore, Contact } from '../../store/useAppStore';
import { generateCodeWord, generateRotatingCode, formatDate, getExpiryDate } from '../../utils/codeGenerator';
import { confirmAction, showAlert } from '../../utils/alerts';

interface ContactDetailScreenProps {
  contact: Contact;
  onBack: () => void;
  onSetupCode?: (contact: Contact) => void;
}

export const ContactDetailScreen: React.FC<ContactDetailScreenProps> = ({
  contact,
  onBack,
  onSetupCode,
}) => {
  const { updateContact, updateCodeWord, removeContact, acceptContact } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [newCodeWord, setNewCodeWord] = useState('');

  const handleCheckIn = () => {
    updateContact(contact.id, { lastCheckIn: new Date().toISOString() });
    showAlert('Check-in sendt', `En påmindelse er sendt til ${contact.name} om at huske jeres kodeord.`);
  };

  const handleRegenerateCode = () => {
    const newCode = contact.codeType === 'static'
      ? generateCodeWord()
      : generateRotatingCode();

    confirmAction(
      'Nyt kodeord',
      `Er du sikker på at du vil oprette et nyt kodeord? Husk at dele det nye kodeord med ${contact.name} ansigt til ansigt.`,
      () => {
        updateCodeWord(contact.id, newCode);
        if (contact.codeType === 'rotating') {
          updateContact(contact.id, { expiresAt: getExpiryDate(30) });
        }
        showAlert('Nyt kodeord oprettet', 'Husk at dele det nye kodeord ansigt til ansigt.');
      }
    );
  };

  const handleSaveCustomCode = () => {
    if (newCodeWord.trim().length < 3) {
      showAlert('For kort', 'Kodeordet skal være mindst 3 tegn langt.');
      return;
    }
    updateCodeWord(contact.id, newCodeWord.trim());
    setIsEditing(false);
    setNewCodeWord('');
    showAlert('Gemt', 'Det nye kodeord er gemt. Husk at dele det ansigt til ansigt.');
  };

  const handleRemoveContact = () => {
    confirmAction(
      'Fjern kontakt',
      `Er du sikker på at du vil fjerne ${contact.name}? Jeres kodeord vil blive slettet permanent.`,
      () => {
        removeContact(contact.id);
        onBack();
      }
    );
  };

  const handleSimulateAccept = () => {
    acceptContact(contact.id);
    showAlert('Godkendt!', `${contact.name} har accepteret din anmodning. I kan nu oprette et kodeord.`);
  };

  const renderPendingContent = () => (
    <View style={styles.pendingContainer}>
      <View style={styles.pendingIconContainer}>
        <Ionicons name="time-outline" size={64} color={colors.warning} />
      </View>

      {contact.status === 'pending_sent' ? (
        <>
          <Text style={styles.pendingTitle}>Venter på godkendelse</Text>
          <Text style={styles.pendingDescription}>
            Du har sendt en forbindelsesanmodning til {contact.name}.
            Personen skal acceptere, før I kan oprette et fælles kodeord.
          </Text>

          <Card style={styles.pendingInfoCard} variant="outlined">
            <View style={styles.pendingInfoRow}>
              <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.pendingInfoText}>
                Sendt: {formatDate(contact.requestedAt)}
              </Text>
            </View>
          </Card>

          <Card style={styles.demoCard} variant="outlined">
            <View style={styles.demoHeader}>
              <Ionicons name="flask-outline" size={20} color={colors.primary} />
              <Text style={styles.demoTitle}>Demo-tilstand</Text>
            </View>
            <Text style={styles.demoDescription}>
              I den rigtige app ville {contact.name} modtage anmodningen.
              Tryk herunder for at simulere en godkendelse.
            </Text>
            <Button
              title="Simuler godkendelse"
              onPress={handleSimulateAccept}
              variant="outline"
              icon={<Ionicons name="checkmark-circle-outline" size={20} color={colors.primary} />}
            />
          </Card>
        </>
      ) : (
        <>
          <Text style={styles.pendingTitle}>Anmodning modtaget</Text>
          <Text style={styles.pendingDescription}>
            {contact.name} vil gerne forbindes med dig.
            Accepter anmodningen for at oprette et fælles kodeord.
          </Text>
        </>
      )}
    </View>
  );

  const renderAcceptedContent = () => (
    <>
      {contact.codeWord ? (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Jeres kodeord</Text>
            <CodeWordDisplay
              codeWord={contact.codeWord}
              type={contact.codeType}
              expiresAt={contact.expiresAt ? formatDate(contact.expiresAt) : undefined}
              contactName={contact.name}
            />
          </View>

          {isEditing ? (
            <Card style={styles.editCard} variant="outlined">
              <Text style={styles.editLabel}>Skriv nyt kodeord</Text>
              <TextInput
                style={styles.editInput}
                value={newCodeWord}
                onChangeText={setNewCodeWord}
                placeholder="F.eks. jordbær-pandekage"
                placeholderTextColor={colors.textLight}
                autoFocus
              />
              <View style={styles.editButtons}>
                <Button
                  title="Annuller"
                  onPress={() => { setIsEditing(false); setNewCodeWord(''); }}
                  variant="ghost"
                  size="small"
                />
                <Button
                  title="Gem kodeord"
                  onPress={handleSaveCustomCode}
                  size="small"
                />
              </View>
            </Card>
          ) : (
            <View style={styles.actions}>
              <Button
                title="Send check-in"
                onPress={handleCheckIn}
                variant="outline"
                icon={<Ionicons name="chatbubble-outline" size={20} color={colors.primary} />}
              />
              <Button
                title="Nyt tilfældigt kodeord"
                onPress={handleRegenerateCode}
                variant="outline"
                icon={<Ionicons name="refresh-outline" size={20} color={colors.primary} />}
              />
              {contact.codeType === 'static' && (
                <Button
                  title="Skriv eget kodeord"
                  onPress={() => setIsEditing(true)}
                  variant="outline"
                  icon={<Ionicons name="pencil-outline" size={20} color={colors.primary} />}
                />
              )}
            </View>
          )}

          {contact.lastCheckIn && (
            <Card style={styles.infoCard} variant="outlined">
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.infoText}>
                  Sidst checked ind: {formatDate(contact.lastCheckIn)}
                </Text>
              </View>
            </Card>
          )}
        </>
      ) : (
        <View style={styles.noCodeContainer}>
          <View style={styles.noCodeIcon}>
            <Ionicons name="key-outline" size={48} color={colors.primary} />
          </View>
          <Text style={styles.noCodeTitle}>Intet kodeord endnu</Text>
          <Text style={styles.noCodeDescription}>
            {contact.name} har accepteret din anmodning!
            I skal nu oprette et fælles kodeord.
          </Text>
          <Button
            title="Opret kodeord"
            onPress={() => onSetupCode?.(contact)}
            icon={<Ionicons name="add-circle-outline" size={20} color={colors.surface} />}
          />
        </View>
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title={contact.name} onBack={onBack} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          <Avatar name={contact.name} size={80} />
          {contact.phone && (
            <Text style={styles.phone}>{contact.phone}</Text>
          )}
          {contact.status === 'accepted' && (
            <Text style={styles.memberSince}>
              Forbundet siden {formatDate(contact.acceptedAt || contact.createdAt)}
            </Text>
          )}
          {contact.status === 'pending_sent' && (
            <View style={styles.statusBadge}>
              <Ionicons name="time-outline" size={14} color={colors.warning} />
              <Text style={styles.statusBadgeText}>Afventer godkendelse</Text>
            </View>
          )}
        </View>

        {contact.status === 'accepted' ? renderAcceptedContent() : renderPendingContent()}

        <View style={styles.dangerZone}>
          <Button
            title={contact.status === 'accepted' ? 'Fjern kontakt' : 'Annuller anmodning'}
            onPress={handleRemoveContact}
            variant="ghost"
            size="medium"
            icon={<Ionicons name="trash-outline" size={18} color={colors.danger} />}
          />
        </View>
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
  profileSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  phone: {
    ...typography.body,
    color: colors.textSecondary,
  },
  memberSince: {
    ...typography.small,
    color: colors.textLight,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.warningLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  statusBadgeText: {
    ...typography.small,
    color: colors.warning,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  actions: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  editCard: {
    marginBottom: spacing.lg,
  },
  editLabel: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  editInput: {
    ...typography.body,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  infoCard: {
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  pendingContainer: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  pendingIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.warningLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingTitle: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
  },
  pendingDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  pendingInfoCard: {
    width: '100%',
    marginTop: spacing.sm,
  },
  pendingInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pendingInfoText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  demoCard: {
    width: '100%',
    marginTop: spacing.sm,
    gap: spacing.sm,
    borderColor: colors.primaryLight,
    borderStyle: 'dashed',
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  demoTitle: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  demoDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  noCodeContainer: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  noCodeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noCodeTitle: {
    ...typography.h3,
    color: colors.text,
  },
  noCodeDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  dangerZone: {
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    alignItems: 'center',
  },
});
