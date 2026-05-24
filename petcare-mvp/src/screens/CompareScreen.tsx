import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { subDays, parseISO } from 'date-fns';
import { RootStackParamList } from '../navigation/RootNavigator';
import { usePetStore } from '../store/petStore';
import { Pet } from '../types/PetCare';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { styling } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { formatAge } from '../utils/dateUtils';

type Props = NativeStackScreenProps<RootStackParamList, 'Compare'>;

function avg7dFood(pet: Pet): number {
  const sevenDaysAgo = subDays(new Date(), 7);
  const logs = pet.foodLogs.filter((l) => parseISO(l.date) >= sevenDaysAgo);
  if (logs.length === 0) return 0;
  return Math.round(logs.reduce((s, l) => s + l.amountGrams, 0) / 7);
}

function avg7dWater(pet: Pet): number {
  const sevenDaysAgo = subDays(new Date(), 7);
  const logs = pet.waterLogs.filter((l) => parseISO(l.date) >= sevenDaysAgo);
  if (logs.length === 0) return 0;
  return Math.round((logs.reduce((s, l) => s + l.servings, 0) / 7) * 10) / 10;
}

function totalSpent(pet: Pet): number {
  return Math.round(pet.expenses.reduce((s, e) => s + e.amount, 0));
}

export const CompareScreen: React.FC<Props> = () => {
  const pets = usePetStore((s) => s.pets);
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  }, []);

  const selectedPets = useMemo(() =>
    selectedIds.map((id) => pets.find((p) => p.id === id)).filter(Boolean) as Pet[],
    [selectedIds, pets]
  );

  const comparisonRows = useMemo(() => {
    if (selectedPets.length < 2) return [];
    const [a, b] = selectedPets;
    return [
      { label: t('weight'), valA: `${a.weightKg} kg`, valB: `${b.weightKg} kg` },
      { label: t('age'), valA: formatAge(a.dateOfBirth, t) ?? '—', valB: formatAge(b.dateOfBirth, t) ?? '—' },
      { label: `${t('food')} (avg 7d)`, valA: `${avg7dFood(a)} g`, valB: `${avg7dFood(b)} g` },
      { label: `${t('water')} (avg 7d)`, valA: `${avg7dWater(a)} srv`, valB: `${avg7dWater(b)} srv` },
      { label: t('totalEvents'), valA: `${a.healthEvents.length}`, valB: `${b.healthEvents.length}` },
      { label: t('activities'), valA: `${a.activityLogs.length}`, valB: `${b.activityLogs.length}` },
      { label: t('totalGrooming'), valA: `${a.groomingLogs.length}`, valB: `${b.groomingLogs.length}` },
      { label: t('totalSpent'), valA: `$${totalSpent(a)}`, valB: `$${totalSpent(b)}` },
    ];
  }, [selectedPets, t]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Typography variant="caption" style={[styles.hint, { color: colors.subtext }]}>{t('selectToCompare')}</Typography>

      {/* Pet chips */}
      <View style={styles.chipsRow}>
        {pets.map((pet) => {
          const isSelected = selectedIds.includes(pet.id);
          return (
            <Pressable
              key={pet.id}
              onPress={() => toggleSelect(pet.id)}
              accessibilityRole="button"
              accessibilityLabel={`Select ${pet.name}`}
              style={[
                styles.chip,
                {
                  borderColor: isSelected ? colors.primary[500] : colors.border,
                  backgroundColor: isSelected ? colors.primary[100] : colors.card,
                },
              ]}
            >
              <Avatar uri={pet.avatarUri} size={32} />
              <Typography style={{ marginLeft: 8, color: isSelected ? colors.primary[700] : colors.text, fontWeight: isSelected ? '600' : '400' }}>
                {pet.name}
              </Typography>
              {isSelected && (
                <View style={[styles.badge, { backgroundColor: colors.primary[500] }]}>
                  <Typography style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
                    {selectedIds.indexOf(pet.id) + 1}
                  </Typography>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {pets.length < 2 && (
        <Card style={[styles.emptyCard, { backgroundColor: colors.card }]}>
          <Typography variant="caption" style={{ color: colors.subtext, textAlign: 'center' }}>
            Add more pets to compare
          </Typography>
        </Card>
      )}

      {selectedPets.length === 2 && (
        <Card style={[styles.tableCard, { backgroundColor: colors.card }]}>
          {/* Column headers */}
          <View style={[styles.headerRow, { borderBottomColor: colors.border }]}>
            <View style={styles.labelCol} />
            {selectedPets.map((pet) => (
              <View key={pet.id} style={styles.valueCol}>
                <Avatar uri={pet.avatarUri} size={36} />
                <Typography style={{ color: colors.text, fontWeight: '600', marginTop: 4, textAlign: 'center', fontSize: 13 }}>
                  {pet.name}
                </Typography>
              </View>
            ))}
          </View>

          {/* Data rows */}
          {comparisonRows.map((row, i) => (
            <View
              key={row.label}
              style={[
                styles.dataRow,
                { borderBottomColor: colors.border, backgroundColor: i % 2 === 0 ? 'transparent' : colors.neutral[50] },
              ]}
            >
              <View style={styles.labelCol}>
                <Typography variant="caption" style={{ color: colors.subtext, fontSize: 12 }}>{row.label}</Typography>
              </View>
              <View style={styles.valueCol}>
                <Typography style={{ color: colors.text, fontWeight: '600', textAlign: 'center' }}>{row.valA}</Typography>
              </View>
              <View style={styles.valueCol}>
                <Typography style={{ color: colors.text, fontWeight: '600', textAlign: 'center' }}>{row.valB}</Typography>
              </View>
            </View>
          ))}
        </Card>
      )}

      {selectedPets.length === 1 && (
        <Card style={[styles.emptyCard, { backgroundColor: colors.card }]}>
          <Typography variant="caption" style={{ color: colors.subtext, textAlign: 'center' }}>
            Select one more pet to see the comparison
          </Typography>
        </Card>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  hint: { marginBottom: 12 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 24, borderWidth: 1.5,
  },
  badge: {
    marginLeft: 6, width: 20, height: 20,
    borderRadius: 10, alignItems: 'center', justifyContent: 'center',
  },
  emptyCard: { alignItems: 'center', paddingVertical: 32 },
  tableCard: { padding: 0, overflow: 'hidden' },
  headerRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, paddingHorizontal: 8,
  },
  dataRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, paddingHorizontal: 8 },
  labelCol: { flex: 1.2 },
  valueCol: { flex: 1, alignItems: 'center' },
});
