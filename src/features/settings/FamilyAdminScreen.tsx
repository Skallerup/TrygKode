import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Avatar, Card, Button, ScreenHeader } from '../../components';
import { useAppStore, ManagedProfile } from '../../store/useAppStore';
import { showAlert, confirmAction } from '../../utils/alerts';

interface FamilyAdminScreenProps {
  onBack: () => void;
  onSelectProfile: (profile: ManagedProfile) => void;
}

export const FamilyAdminScreen: React.FC<FamilyAdminScreenProps> = ({
  onBack,
  onSelectProfile,
}) => {
  const { managedProfiles, addManagedProfile, removeManagedProfile } = useAppStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) {
      showAlert('Mangler navn', 'Skriv personens navn.');
      return;
    }
    if (!newRelation.trim()) {
      showAlert('Mangler relation', 'Skriv din relation til personen (f.eks. Mor, Far, Bedstemor).');
      return;
    }
    addManagedProfile({
      id: Date.now().toString(),
      name: newName.trim(),
      phone: newPhone.trim(),
      relationship: newRelation.trim(),
      contacts: [],
      createdAt: new Date().toISOString(),
    });
    setShowAddModal(false);
    setNewName('');
    setNewRelation('');
    setNewPhone('');
    showAlert('Person tilføjet', `${newName.trim()} er nu tilføjet. Du kan nu oprette kontakter og kodeord på deres vegne.`);
  };

  const handleRemove = (profile: ManagedProfile) => {
    confirmAction(
      'Fjern person',
      `Er du sikker på at du vil fjerne ${profile.name}? Alle deres kontakter og kodeord slettes.`,
      () => removeManagedProfile(profile.id)
    );
  };

  const renderItem = ({ item }: { item: ManagedProfile }) => (
    <Card style={styles.profileCard} onPress={() => onSelectProfile(item)}>
      <View style={styles.profileRow}>
        <Avatar name={item.name} size={52} />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{item.name}</Text>
          <Text style={styles.profileRelation}>{item.relationship}</Text>
          <Text style={styles.profileMeta}>
            {item.contacts.length} kontakt{item.contacts.length !== 1 ? 'er' : ''}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
      </View>
    </Card>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={64} color={colors.textLight} />
      <Text style={styles.emptyTitle}>Ingen administrerede personer</Text>
      <Text style={styles.emptyText}>
        Tilføj et familiemedlem for at hjælpe dem med at administrere deres kodeord og kontakter.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="Familieadministrator" onBack={onBack} />

      <View style={styles.infoCard}>
        <Card variant="outlined">
          <View style={styles.infoRow}>
            <Ionicons name="information-circle-outline" size={22} color={colors.primary} />
            <Text style={styles.infoText}>
              Her kan du administrere TrygKode-profiler for familiemedlemmer, der har brug for hjælp med teknik.
              Du kan oprette kontakter og kodeord på deres vegne.
            </Text>
          </View>
        </Card>
      </View>

      <FlatList
        data={managedProfiles}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.bottomBar}>
        <Button
          title="Tilføj person"
          onPress={() => setShowAddModal(true)}
          icon={<Ionicons name="add-circle-outline" size={20} color={colors.surface} />}
        />
      </View>

      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAddModal(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <ScreenHeader title="Tilføj person" onBack={() => setShowAddModal(false)} />
          <View style={styles.modalContent}>
            <Text style={styles.inputLabel}>Navn</Text>
            <TextInput
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
              placeholder="F.eks. Bedstemor Karen"
              placeholderTextColor={colors.textLight}
              autoFocus
            />
            <Text style={styles.inputLabel}>Relation</Text>
            <TextInput
              style={styles.input}
              value={newRelation}
              onChangeText={setNewRelation}
              placeholder="F.eks. Bedstemor, Far, Onkel"
              placeholderTextColor={colors.textLight}
            />
            <Text style={styles.inputLabel}>Telefonnummer (valgfrit)</Text>
            <TextInput
              style={styles.input}
              value={newPhone}
              onChangeText={setNewPhone}
              placeholder="+45 12 34 56 78"
              placeholderTextColor={colors.textLight}
              keyboardType="phone-pad"
            />
            <View style={{ marginTop: spacing.lg }}>
              <Button title="Tilføj person" onPress={handleAdd} />
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
  infoCard: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  infoText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 20,
    flex: 1,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  profileCard: {
    marginBottom: spacing.sm,
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
    ...typography.bodyBold,
    color: colors.text,
  },
  profileRelation: {
    ...typography.small,
    color: colors.primary,
    marginTop: 2,
  },
  profileMeta: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
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
    paddingHorizontal: spacing.lg,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    paddingBottom: spacing.xl,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalContent: {
    padding: spacing.lg,
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
