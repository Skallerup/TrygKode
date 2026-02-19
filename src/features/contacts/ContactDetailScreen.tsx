import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Avatar, Button, Card, CodeWordDisplay, ScreenHeader } from '../../components';
import { useAppStore, Contact } from '../../store/useAppStore';
import { generateCodeWord, generateRotatingCode, formatDate, getExpiryDate } from '../../utils/codeGenerator';

interface ContactDetailScreenProps {
  contact: Contact;
  onBack: () => void;
}

export const ContactDetailScreen: React.FC<ContactDetailScreenProps> = ({
  contact,
  onBack,
}) => {
  const { updateContact, updateCodeWord, removeContact } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [newCodeWord, setNewCodeWord] = useState('');

  const handleCheckIn = () => {
    Alert.alert(
      'Check-in sendt',
      `En påmindelse er sendt til ${contact.name} om at huske jeres kodeord.`,
      [{ text: 'OK' }]
    );
    updateContact(contact.id, { lastCheckIn: new Date().toISOString() });
  };

  const handleRegenerateCode = () => {
    const newCode = contact.codeType === 'static'
      ? generateCodeWord()
      : generateRotatingCode();

    Alert.alert(
      'Nyt kodeord',
      `Er du sikker på at du vil oprette et nyt kodeord? Husk at dele det nye kodeord med ${contact.name} ansigt til ansigt.`,
      [
        { text: 'Annuller', style: 'cancel' },
        {
          text: 'Ja, opret nyt',
          onPress: () => {
            updateCodeWord(contact.id, newCode);
            if (contact.codeType === 'rotating') {
              updateContact(contact.id, { expiresAt: getExpiryDate(30) });
            }
          },
        },
      ]
    );
  };

  const handleSaveCustomCode = () => {
    if (newCodeWord.trim().length < 3) {
      Alert.alert('For kort', 'Kodeordet skal være mindst 3 tegn langt.');
      return;
    }
    updateCodeWord(contact.id, newCodeWord.trim());
    setIsEditing(false);
    setNewCodeWord('');
    Alert.alert('Gemt', 'Det nye kodeord er gemt. Husk at dele det ansigt til ansigt.');
  };

  const handleRemoveContact = () => {
    Alert.alert(
      'Fjern kontakt',
      `Er du sikker på at du vil fjerne ${contact.name}? Jeres kodeord vil blive slettet permanent.`,
      [
        { text: 'Annuller', style: 'cancel' },
        {
          text: 'Fjern',
          style: 'destructive',
          onPress: () => {
            removeContact(contact.id);
            onBack();
          },
        },
      ]
    );
  };

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
          <Text style={styles.memberSince}>
            Forbundet siden {formatDate(contact.createdAt)}
          </Text>
        </View>

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

        <View style={styles.dangerZone}>
          <Button
            title="Fjern kontakt"
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
  dangerZone: {
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    alignItems: 'center',
  },
});
