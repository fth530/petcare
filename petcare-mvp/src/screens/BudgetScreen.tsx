import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert, Modal } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO, startOfMonth, endOfMonth, startOfYear } from 'date-fns';
import { RootStackParamList } from '../navigation/RootNavigator';
import { usePetStore } from '../store/petStore';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { TextInput } from '../components/TextInput';
import { styling } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { Expense } from '../types/PetCare';

type Props = NativeStackScreenProps<RootStackParamList, 'Budget'>;
type Category = Expense['category'];

const CAT_ICONS: Record<Category, string> = {
  vet: 'medical-outline', food: 'restaurant-outline', medicine: 'pill-outline',
  grooming: 'cut-outline', accessories: 'bag-outline', other: 'ellipse-outline',
};

const CAT_COLORS: Record<Category, string> = {
  vet: '#ef4444', food: '#f59e0b', medicine: '#6c63ff',
  grooming: '#10b981', accessories: '#3b82f6', other: '#8b5cf6',
};

const CATEGORIES: Category[] = ['vet', 'food', 'medicine', 'grooming', 'accessories', 'other'];

export const BudgetScreen: React.FC<Props> = ({ route }) => {
  const { petId } = route.params;
  const pet = usePetStore((s) => s.pets.find((p) => p.id === petId));
  const addExpense = usePetStore((s) => s.addExpense);
  const deleteExpense = usePetStore((s) => s.deleteExpense);
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [modalVisible, setModalVisible] = useState(false);
  const [category, setCategory] = useState<Category>('vet');
  const [amountStr, setAmountStr] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');

  const catLabel: Record<Category, string> = {
    vet: t('catVet'), food: t('catFood'), medicine: t('catMedicine'),
    grooming: t('catGrooming'), accessories: t('catAccessories'), other: t('catOther'),
  };

  const sortedExpenses = useMemo(() =>
    [...(pet?.expenses ?? [])].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()),
    [pet?.expenses]
  );

  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const yearStart = startOfYear(now);
    const all = pet?.expenses ?? [];
    const thisMonth = all.filter((e) => parseISO(e.date) >= monthStart);
    const thisYear = all.filter((e) => parseISO(e.date) >= yearStart);
    const total = all.reduce((s, e) => s + e.amount, 0);
    const monthly = thisMonth.reduce((s, e) => s + e.amount, 0);
    const yearly = thisYear.reduce((s, e) => s + e.amount, 0);

    const byCategory: Record<Category, number> = {
      vet: 0, food: 0, medicine: 0, grooming: 0, accessories: 0, other: 0,
    };
    for (const e of all) byCategory[e.category] += e.amount;

    return { total, monthly, yearly, byCategory };
  }, [pet?.expenses]);

  const handleAdd = () => {
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) { Alert.alert('Invalid Amount', 'Please enter a valid amount.'); return; }
    if (!description.trim()) { Alert.alert('Description Required', 'Please add a description.'); return; }
    addExpense(petId, {
      date: new Date().toISOString(),
      category, amount,
      description: description.trim(),
      notes: notes.trim() || undefined,
    });
    setModalVisible(false);
    setAmountStr(''); setDescription(''); setNotes(''); setCategory('vet');
  };

  const handleDelete = (expenseId: string) => {
    Alert.alert(t('delete'), t('deleteExpense'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: () => deleteExpense(petId, expenseId) },
    ]);
  };

  if (!pet) return null;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Summary cards */}
      <View style={styles.statsRow}>
        {[
          { label: t('thisMonth'), value: `$${stats.monthly.toFixed(0)}`, color: colors.primary[500] },
          { label: t('thisYear'), value: `$${stats.yearly.toFixed(0)}`, color: colors.accent[500] },
          { label: t('total'), value: `$${stats.total.toFixed(0)}`, color: colors.success },
        ].map((s) => (
          <Card key={s.label} style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Typography style={{ fontSize: 20, fontWeight: 'bold', color: s.color }}>{s.value}</Typography>
            <Typography variant="caption" style={{ color: colors.subtext, textAlign: 'center' }}>{s.label}</Typography>
          </Card>
        ))}
      </View>

      {/* Category breakdown */}
      <Card style={[styles.breakdownCard, { backgroundColor: colors.card }]}>
        {CATEGORIES.filter((c) => stats.byCategory[c] > 0).map((c) => {
          const pct = stats.total > 0 ? (stats.byCategory[c] / stats.total) * 100 : 0;
          return (
            <View key={c} style={styles.catRow}>
              <View style={[styles.catIcon, { backgroundColor: CAT_COLORS[c] + '22' }]}>
                <Ionicons name={CAT_ICONS[c] as any} size={16} color={CAT_COLORS[c]} />
              </View>
              <Typography style={{ flex: 1, color: colors.text }}>{catLabel[c]}</Typography>
              <View style={[styles.catBar, { backgroundColor: colors.border }]}>
                <View style={[styles.catBarFill, { width: `${pct}%` as any, backgroundColor: CAT_COLORS[c] }]} />
              </View>
              <Typography style={{ color: colors.text, fontWeight: '600', minWidth: 48, textAlign: 'right' }}>${stats.byCategory[c].toFixed(0)}</Typography>
            </View>
          );
        })}
        {stats.total === 0 && (
          <Typography variant="caption" style={{ color: colors.subtext, textAlign: 'center', padding: 12 }}>{t('noExpenses')}</Typography>
        )}
      </Card>

      <Button title={`+ ${t('addExpense')}`} onPress={() => setModalVisible(true)} style={styles.addBtn} accessibilityLabel={t('addExpense')} />

      {/* Expense list */}
      {sortedExpenses.length === 0 ? (
        <Card style={[styles.emptyCard, { backgroundColor: colors.card }]}>
          <Ionicons name="wallet-outline" size={48} color={colors.neutral[300]} />
          <Typography variant="caption" style={{ color: colors.subtext, marginTop: 12, textAlign: 'center' }}>{t('noExpenses')}</Typography>
        </Card>
      ) : (
        <Card style={{ backgroundColor: colors.card, padding: 0, overflow: 'hidden' }}>
          {sortedExpenses.map((exp, i) => (
            <View key={exp.id} style={[styles.expRow, { borderBottomColor: colors.border, borderBottomWidth: i < sortedExpenses.length - 1 ? 1 : 0 }]}>
              <View style={[styles.expIcon, { backgroundColor: CAT_COLORS[exp.category] + '22' }]}>
                <Ionicons name={CAT_ICONS[exp.category] as any} size={18} color={CAT_COLORS[exp.category]} />
              </View>
              <View style={{ flex: 1 }}>
                <Typography style={{ fontWeight: '600', color: colors.text }}>{exp.description}</Typography>
                <Typography variant="caption" style={{ color: colors.subtext }}>
                  {catLabel[exp.category]} · {format(parseISO(exp.date), 'dd MMM yyyy')}
                </Typography>
              </View>
              <Typography style={{ fontWeight: '700', color: colors.text, marginRight: 12 }}>${exp.amount.toFixed(2)}</Typography>
              <Pressable onPress={() => handleDelete(exp.id)} accessibilityRole="button" accessibilityLabel={t('delete')}>
                <Ionicons name="trash-outline" size={18} color={colors.error} />
              </Pressable>
            </View>
          ))}
        </Card>
      )}

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.overlay}>
          <ScrollView style={[styles.modal, { backgroundColor: colors.card }]} keyboardShouldPersistTaps="handled">
            <Typography variant="heading" style={{ marginBottom: 16, color: colors.text }}>{t('addExpense')}</Typography>

            <Typography variant="caption" style={[styles.label, { color: colors.subtext }]}>{t('expenseCategory')}</Typography>
            <View style={styles.catGrid}>
              {CATEGORIES.map((c) => (
                <Pressable key={c} onPress={() => setCategory(c)}
                  style={[styles.catChip, { borderColor: category === c ? CAT_COLORS[c] : colors.border, backgroundColor: category === c ? CAT_COLORS[c] + '22' : colors.background }]}
                  accessibilityRole="button">
                  <Ionicons name={CAT_ICONS[c] as any} size={18} color={category === c ? CAT_COLORS[c] : colors.subtext} />
                  <Typography style={{ fontSize: 11, color: category === c ? CAT_COLORS[c] : colors.subtext, marginTop: 4 }}>{catLabel[c]}</Typography>
                </Pressable>
              ))}
            </View>

            <TextInput label={`${t('amount')} * ($)`} value={amountStr} onChangeText={setAmountStr} keyboardType="decimal-pad" placeholder="0.00" />
            <TextInput label={`${t('description')} *`} value={description} onChangeText={setDescription} placeholder="e.g., Annual checkup" />
            <TextInput label={t('notes')} value={notes} onChangeText={setNotes} placeholder="Any notes..." multiline numberOfLines={2} />

            <View style={styles.actionRow}>
              <Button title={t('cancel')} variant="secondary" style={styles.actionBtn} onPress={() => setModalVisible(false)} />
              <View style={{ width: 12 }} />
              <Button title={t('save')} style={styles.actionBtn} onPress={handleAdd} />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statCard: { flex: 1, alignItems: 'center', padding: 12, marginBottom: 0 },
  breakdownCard: { marginBottom: 16, padding: 12 },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  catIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  catBar: { width: 60, height: 6, borderRadius: 3, overflow: 'hidden' },
  catBarFill: { height: '100%', borderRadius: 3 },
  addBtn: { marginBottom: 16 },
  emptyCard: { alignItems: 'center', paddingVertical: 32 },
  expRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  expIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modal: { maxHeight: '90%', padding: 24, borderRadius: styling.borderRadius },
  label: { marginBottom: 8 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  catChip: { width: '30%', alignItems: 'center', paddingVertical: 10, borderRadius: styling.borderRadius, borderWidth: 1 },
  actionRow: { flexDirection: 'row', marginTop: 8, paddingBottom: 24 },
  actionBtn: { flex: 1 },
});
