import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert, Modal } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { RootStackParamList } from '../navigation/RootNavigator';
import { usePetStore } from '../store/petStore';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { TextInput } from '../components/TextInput';
import { styling } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { Medication } from '../types/PetCare';

type Props = NativeStackScreenProps<RootStackParamList, 'Medications'>;
type Frequency = Medication['frequency'];

const FREQ_OPTIONS: Frequency[] = ['daily', 'weekly', 'monthly', 'as_needed'];

const isValidIsoDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(new Date(v).getTime());
const todayStr = () => new Date().toISOString().split('T')[0];

export const MedicationsScreen: React.FC<Props> = ({ route }) => {
  const { petId } = route.params;
  const pet = usePetStore((s) => s.pets.find((p) => p.id === petId));
  const addMedication = usePetStore((s) => s.addMedication);
  const deleteMedication = usePetStore((s) => s.deleteMedication);
  const logMedicationDose = usePetStore((s) => s.logMedicationDose);
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('daily');
  const [startDate, setStartDate] = useState(todayStr());
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');

  const sortedMeds = useMemo(() =>
    [...(pet?.medications ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
    [pet?.medications]
  );

  const freqLabel: Record<Frequency, string> = {
    daily: t('freqDaily'), weekly: t('freqWeekly'),
    monthly: t('freqMonthly'), as_needed: t('freqAsNeeded'),
  };

  const handleAdd = () => {
    if (!name.trim() || !dosage.trim()) return;
    if (!isValidIsoDate(startDate)) { Alert.alert(t('invalidDate'), t('invalidDateMsg')); return; }
    if (endDate && !isValidIsoDate(endDate)) { Alert.alert(t('invalidDate'), t('invalidDateMsg')); return; }
    addMedication(petId, {
      name: name.trim(), dosage: dosage.trim(), frequency,
      startDate: new Date(startDate).toISOString(),
      endDate: endDate ? new Date(endDate).toISOString() : undefined,
      notes: notes.trim() || undefined,
    });
    setModalVisible(false);
    setName(''); setDosage(''); setFrequency('daily');
    setStartDate(todayStr()); setEndDate(''); setNotes('');
  };

  const handleDelete = (medId: string, medName: string) => {
    Alert.alert(t('deleteMedication'), t('deleteMedicationConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: () => deleteMedication(petId, medId) },
    ]);
  };

  const handleLogDose = (medId: string) => {
    logMedicationDose(petId, medId);
    Alert.alert('✓', t('doseLogged'));
  };

  if (!pet) return null;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Button title={`+ ${t('addMedication')}`} onPress={() => setModalVisible(true)} style={styles.addBtn} accessibilityLabel={t('addMedication')} />

      {sortedMeds.length === 0 ? (
        <Card style={[styles.emptyCard, { backgroundColor: colors.card }]}>
          <Ionicons name="medkit-outline" size={48} color={colors.neutral[300]} />
          <Typography variant="caption" style={{ color: colors.subtext, marginTop: 12, textAlign: 'center' }}>{t('noMedications')}</Typography>
        </Card>
      ) : (
        sortedMeds.map((med) => {
          const lastDose = med.logs.length
            ? med.logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
            : null;
          return (
            <Card key={med.id} style={[styles.medCard, { backgroundColor: colors.card }]}>
              <View style={styles.medHeader}>
                <View style={[styles.medIcon, { backgroundColor: colors.primary[100] }]}>
                  <Ionicons name="medical-outline" size={22} color={colors.primary[700]} />
                </View>
                <View style={{ flex: 1 }}>
                  <Typography style={{ fontWeight: '700', fontSize: 16, color: colors.text }}>{med.name}</Typography>
                  <Typography variant="caption" style={{ color: colors.subtext }}>{med.dosage} · {freqLabel[med.frequency]}</Typography>
                </View>
                <Pressable onPress={() => handleDelete(med.id, med.name)} accessibilityRole="button" accessibilityLabel={t('delete')}>
                  <Ionicons name="trash-outline" size={18} color={colors.error} />
                </Pressable>
              </View>

              <View style={[styles.medInfo, { borderTopColor: colors.border }]}>
                <View style={styles.infoItem}>
                  <Typography variant="caption" style={{ color: colors.subtext }}>{t('startDate').replace(' (YYYY-MM-DD)', '')}</Typography>
                  <Typography style={{ color: colors.text, fontWeight: '500' }}>{format(parseISO(med.startDate), 'dd MMM yyyy')}</Typography>
                </View>
                <View style={styles.infoItem}>
                  <Typography variant="caption" style={{ color: colors.subtext }}>{t('lastDose')}</Typography>
                  <Typography style={{ color: colors.text, fontWeight: '500' }}>
                    {lastDose ? format(parseISO(lastDose.date), 'dd MMM') : '—'}
                  </Typography>
                </View>
                <View style={styles.infoItem}>
                  <Typography variant="caption" style={{ color: colors.subtext }}>{t('totalDoses')}</Typography>
                  <Typography style={{ color: colors.text, fontWeight: '500' }}>{med.logs.length}</Typography>
                </View>
              </View>

              {med.notes ? (
                <Typography variant="caption" style={[styles.medNotes, { color: colors.subtext, borderTopColor: colors.border }]}>{med.notes}</Typography>
              ) : null}

              <Button title={t('logDose')} onPress={() => handleLogDose(med.id)} style={styles.logBtn} accessibilityLabel={t('logDose')} />
            </Card>
          );
        })
      )}

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.overlay}>
          <ScrollView style={[styles.modal, { backgroundColor: colors.card }]} keyboardShouldPersistTaps="handled">
            <Typography variant="heading" style={{ marginBottom: 16, color: colors.text }}>{t('addMedication')}</Typography>

            <TextInput label={`${t('medicationName')} *`} value={name} onChangeText={setName} placeholder="e.g., Heartgard Plus" />
            <TextInput label={`${t('dosage')} *`} value={dosage} onChangeText={setDosage} placeholder="e.g., 1 chewable" />

            <Typography variant="caption" style={[styles.label, { color: colors.subtext }]}>{t('frequency')}</Typography>
            <View style={styles.freqRow}>
              {FREQ_OPTIONS.map((f) => (
                <Pressable key={f} onPress={() => setFrequency(f)}
                  style={[styles.freqBtn, { borderColor: frequency === f ? colors.primary[500] : colors.border, backgroundColor: frequency === f ? colors.primary[100] : colors.background }]}
                  accessibilityRole="button">
                  <Typography style={{ fontSize: 12, color: frequency === f ? colors.primary[700] : colors.subtext }}>{freqLabel[f]}</Typography>
                </Pressable>
              ))}
            </View>

            <TextInput label={t('startDate')} value={startDate} onChangeText={setStartDate} autoCapitalize="none" autoCorrect={false} placeholder="2025-01-01" />
            <TextInput label={t('endDate')} value={endDate} onChangeText={setEndDate} autoCapitalize="none" autoCorrect={false} placeholder="2025-12-31" />
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
  addBtn: { marginBottom: 16 },
  emptyCard: { alignItems: 'center', paddingVertical: 32 },
  medCard: { marginBottom: 12, padding: 16 },
  medHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  medIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  medInfo: { flexDirection: 'row', borderTopWidth: 1, paddingTop: 12, marginBottom: 12 },
  infoItem: { flex: 1, alignItems: 'center' },
  medNotes: { fontStyle: 'italic', borderTopWidth: 1, paddingTop: 8, marginBottom: 12 },
  logBtn: { marginTop: 4 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modal: { maxHeight: '90%', padding: 24, borderRadius: styling.borderRadius },
  label: { marginBottom: 8, fontWeight: '500' },
  freqRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  freqBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  actionRow: { flexDirection: 'row', marginTop: 8, paddingBottom: 24 },
  actionBtn: { flex: 1 },
});
