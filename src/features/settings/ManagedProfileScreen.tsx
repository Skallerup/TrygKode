import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Avatar, Card, Button, ScreenHeader, CodeWordDisplay } from '../../components';
import { useAppStore, ManagedProfile, Contact } from '../../store/useAppStore';
import { generateCodeWord, generateRotatingCode, getExpiryDate, formatDate } from '../../utils/codeGenerator';
import { showAlert, confirmAction } from '../../utils/alerts';

interface ManagedProfileScreenProps {
  profileId: string;
  onBack: () => void;
}

export const ManagedProfileScreen: React.FC<ManagedProfileScreenProps> = ({
  profileId,
  onBack,
}) => {
  const {
    managedProfiles,
    addManagedContact,
    removeManagedContact,
    updateManagedCodeWord,
    removeManagedProfile,
  } = useAppStore();

  const profile = managedProfiles.find((p) => p.id === profileId);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  if (!profile) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScreenHeader title="Profil ikke fundet" onBack={onBack} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Denne profil findes ikke længere.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleAddContact = () => {
    if (!newContactName.trim()) {
      showAlert('Mangler navn', 'Skriv kontaktens navn.');
      return;
    }
    const codeWord = generateCodeWord();
    addManagedContact(profile.id, {
      id: Date.now().toString(),
      name: newContactName.trim(),
      phone: newContactPhone.trim() || undefined,
      codeWord,
      codeType: 'static',
      createdAt: new Date().toISOString(),
      status: 'accepted',
      requestedAt: new Date().toISOString(),
      acceptedAt: new Date().toISOString(),
      requestedBy: 'me',
    });
    setShowAddContact(false);
    setNewContactName('');
    setNewContactPhone('');
    showAlert('Kontakt tilføjet', `${newContactName.trim()} er tilføjet med kodeordet "${codeWord}". Husk at dele det ansigt til ansigt.`);
  };

  const handleRegenerateCode = (contact: Contact) => {
    const newCode = generateCodeWord();
    confirmAction(
      'Nyt kodeord',
      `Opret et nyt kodeord for ${contact.name}? Husk at informere ${profile.name} om det nye kodeord.`,
      () => {
        updateManagedCodeWord(profile.id, contact.id, newCode);
        showAlert('Nyt kodeord', `Det nye kodeord er "${newCode}". Del det ansigt til ansigt.`);
      }
    );
  };

  const handleRemoveContact = (contact: Contact) => {
    confirmAction(
      'Fjern kontakt',
      `Fjern ${contact.name} fra ${profile.name}s kontakter?`,
      () => removeManagedContact(profile.id, contact.id)
    );
  };

  const handleRemoveProfile = () => {
    confirmAction(
      'Fjern person',
      `Fjern ${profile.name} og alle deres kontakter og kodeord?`,
      () => {
        removeManagedProfile(profile.id);
        onBack();
      }
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title={profile.name} onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <Avatar name={profile.name} size={80} />
          <Text style={styles.relationship}>{profile.relationship}</Text>
          {profile.phone ? <Text style={styles.phone}>{profile.phone}</Text> : null}
          <Text style={styles.memberSince}>Tilføjet {formatDate(profile.createdAt)}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {profile.name}s kontakter ({profile.contacts.length})
            </Text>
          </View>

          {profile.contacts.length === 0 ? (
            <Card variant="outlined" style={styles.emptyCard}>
              <View style={styles.emptyCardContent}>
                <Ionicons name="people-outline" size={32} color={colors.textLight} />
                <Text style={styles.emptyCardText}>
                  Ingen kontakter endnu. Tilføj kontakter og kodeord på vegne af {profile.name}.
                </Text>
              </View>
            </Card>
          ) : (
            profile.contacts.map((contact) => (
              <Card key={contact.id} style={styles.contactCard} variant="outlined">
                <View style={styles.contactRow}>
                  <Avatar name={contact.name} size={44} />
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    {contact.phone && <Text style={styles.contactPhone}>{contact.phone}</Text>}
                  </View>
                </View>
                {contact.codeWord && (
                  <View style={styles.codeSection}>
                    <CodeWordDisplay
                      codeWord={contact.codeWord}
                      type={contact.codeType}
                      contactName={contact.name}
                    />
                  </View>
                )}
                <View style={styles.contactActions}>
                  <Button
                    title="Nyt kodeord"
                    onPress={() => handleRegenerateCode(contact)}
                    variant="outline"
                    size="small"
                    icon={<Ionicons name="refresh-outline" size={16} color={colors.primary} />}
                  />
                  <Button
                    title="Fjern"
                    onPress={() => handleRemoveContact(contact)}
                    variant="ghost"
                    size="small"
                    icon={<Ionicons name="trash-outline" size={16} color={colors.danger} />}
                  />
                </View>
              </Card>
            ))
          )}
        </View>

        <View style={styles.addSection}>
          <Button
            title="Tilføj kontakt"
            onPress={() => setShowAddContact(true)}
            variant="outline"
            icon={<Ionicons name="add-circle-outline" size={20} color={colors.primary} />}
          />
        </View>

        <View style={styles.dangerZone}>
          <Button
            title="Fjern person"
            onPress={handleRemoveProfile}
            variant="ghost"
            size="medium"
            icon={<Ionicons name="trash-outline" size={18} color={colors.danger} />}
          />
        </View>
      </ScrollView>

      <Modal visible={showAddContact} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAddContact(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <ScreenHeader title={`Tilføj kontakt for ${profile.name}`} onBack={() => setShowAddContact(false)} />
          <View style={styles.modalContent}>
            <Text style={styles.modalDescription}>
              Tilføj en kontakt og et kodeord, som {profile.name} kan bruge til at verificere opkald.
            </Text>
            <Text style={styles.inputLabel}>Kontaktens navn</Text>
            <TextInput
              style={styles.input}
              value={newContactName}
              onChangeText={setNewContactName}
              placeholder="F.eks. Naboens Per"
              placeholderTextColor={colors.textLight}
              autoFocus
            />
            <Text style={styles.inputLabel}>Telefonnummer (valgfrit)</Text>
            <TextInput
              style={styles.input}
              value={newContactPhone}
              onChangeText={setNewContactPhone}
              placeholder="+45 12 34 56 78"
              placeholderTextColor={colors.textLight}
              keyboardType="phone-pad"
            />
            <View style={{ marginTop: spacing.lg }}>
              <Button title="Tilføj og generer kodeord" onPress={handleAddContact} />
            </View>
          </View>
        </SafeAreaView>
      </Modal>
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
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  relationship: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  phone: {
    ...typography.body,
    color: colors.textSecondary,
  },
  memberSince: {
    ...typography.small,
    color: colors.textLight,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  emptyCard: {
    paddingVertical: spacing.lg,
  },
  emptyCardContent: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyCardText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  contactCard: {
    marginBottom: spacing.sm,
    gap: spacing.sm,
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
  contactPhone: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  codeSection: {
    marginTop: spacing.sm,
  },
  contactActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  addSection: {
    marginBottom: spacing.lg,
  },
  dangerZone: {
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalContent: {
    padding: spacing.lg,
  },
  modalDescription: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
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
});
