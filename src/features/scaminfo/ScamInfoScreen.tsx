import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Card, ScreenHeader, Button } from '../../components';
import { useAppStore, ScamTip } from '../../store/useAppStore';
import { mockScamTips } from '../../utils/mockData';

export const ScamInfoScreen: React.FC = () => {
  const { scamTips, setScamTips } = useAppStore();
  const [selectedTip, setSelectedTip] = useState<ScamTip | null>(null);

  useEffect(() => {
    if (scamTips.length === 0) {
      setScamTips(mockScamTips);
    }
  }, []);

  const getCategoryIcon = (category: ScamTip['category']): keyof typeof Ionicons.glyphMap => {
    switch (category) {
      case 'warning': return 'warning';
      case 'tip': return 'bulb';
      case 'news': return 'newspaper';
    }
  };

  const getCategoryColor = (category: ScamTip['category']): string => {
    switch (category) {
      case 'warning': return colors.danger;
      case 'tip': return colors.warning;
      case 'news': return colors.primary;
    }
  };

  const getCategoryLabel = (category: ScamTip['category']): string => {
    switch (category) {
      case 'warning': return 'Advarsel';
      case 'tip': return 'Tip';
      case 'news': return 'Nyhed';
    }
  };

  const renderTip = ({ item }: { item: ScamTip }) => (
    <Card style={styles.tipCard} onPress={() => setSelectedTip(item)}>
      <View style={styles.tipHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) + '20' }]}>
          <Ionicons
            name={getCategoryIcon(item.category)}
            size={14}
            color={getCategoryColor(item.category)}
          />
          <Text style={[styles.categoryText, { color: getCategoryColor(item.category) }]}>
            {getCategoryLabel(item.category)}
          </Text>
        </View>
        <Text style={styles.tipDate}>{item.date}</Text>
      </View>
      <Text style={styles.tipTitle}>{item.title}</Text>
      <Text style={styles.tipSummary} numberOfLines={2}>{item.summary}</Text>
      <View style={styles.readMore}>
        <Text style={styles.readMoreText}>Læs mere</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.primary} />
      </View>
    </Card>
  );

  const renderHeader = () => (
    <Card style={styles.headerCard} variant="elevated">
      <View style={styles.headerContent}>
        <Ionicons name="shield" size={40} color={colors.primary} />
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Bliv klogere på svindel</Text>
          <Text style={styles.headerSub}>
            Hold dig opdateret om de nyeste svindelmetoder i Danmark
          </Text>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="Svindelinfo" subtitle="Tips og nyheder" />
      <FlatList
        data={scamTips}
        renderItem={renderTip}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={!!selectedTip}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedTip(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <ScreenHeader
            title={getCategoryLabel(selectedTip?.category ?? 'tip')}
            onBack={() => setSelectedTip(null)}
          />
          <ScrollView contentContainerStyle={styles.modalContent}>
            {selectedTip && (
              <>
                <Text style={styles.modalDate}>{selectedTip.date}</Text>
                <Text style={styles.modalTitle}>{selectedTip.title}</Text>
                <Text style={styles.modalBody}>{selectedTip.content}</Text>
              </>
            )}
          </ScrollView>
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
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  headerCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.primaryLight + '15',
    borderWidth: 1,
    borderColor: colors.primaryLight + '30',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  headerSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  tipCard: {
    marginBottom: spacing.md,
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  categoryText: {
    ...typography.small,
    fontWeight: '600',
  },
  tipDate: {
    ...typography.small,
    color: colors.textLight,
  },
  tipTitle: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  tipSummary: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  readMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
  },
  readMoreText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  modalDate: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  modalTitle: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  modalBody: {
    ...typography.body,
    color: colors.text,
    lineHeight: 28,
  },
});
