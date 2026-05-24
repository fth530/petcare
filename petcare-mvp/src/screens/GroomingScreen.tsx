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
import { GroomingLog } from '../types/PetCare';

type Props = NativeStackScreenProps<RootStackParamList, 'Grooming'>;
type GroomType = GroomingLog['type'];

const GROOMING_ICONS: Record<GroomType, string> = {
  bath: 'water-outline', haircut: 'cut-outline', nails: 'hand-left-outline',
  ears: 'ear-outline', teeth: 'happy-outline', other: 'paw-outline',
};

export const GroomingScreen: React.FC<Props> = ({ route }) => {
  const { petId } = route.params;
  const pet = usePetStore((s) => s.pets.find((p) => p.id === petId));
  const addGroomingLog = usePetStore((s) => s.addGroomingLog);
  const deleteGroomingLog = usePetStore((s) => s.deleteGroomingLog);
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState<GroomType>('bath');
  const [notes, setNotes] = useState('');

  const sortedLogs = useMemo(() =>
    [...(pet?.groomingLogs ?? [])].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()),
    [pet?.groomingLogs]);

  const handleAdd = () => {
    addGroomingLog(petId, { date: new Date().toISOString(), type: selectedType, notes: notes.trim() || undefined });
    setModalVisible(false); setNotes(''); setSelectedType('bath');
  };

  const handleDelete = (logId: string) => {
    Alert.alert(t('delete'), 'Remove this grooming entry?', [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: () => deleteGroomingLog(petId, logId) },
    ]);
  };

  const groomTypes: GroomType[] = ['bath', 'haircut', 'nails', 'ears', 'teeth', 'other'];
  const typeLabel: Record<GroomType, string> = {
    bath: t('bath'), haircut: t('haircut'), nails: t('nails'),
    ears: t('ears'), teeth: t('teeth'), other: t('otherGrooming'),
  };

  if (!pet) return null;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Button title={`+ ${t('groomingLog')}`} onPress={() => setModalVisible(true)} style={styles.addBtn} accessibilityLabel={t('groomingLog')} />

      {sortedLogs.length === 0 ? (
        <Card style={[styles.emptyCard, { backgroundColor: colors.card }]}>
          <Ionicons name="cut-outline" size={48} color={colors.neutral[300]} />
          <Typography variant="caption" style={{ color: colors.subtext, marginTop: 12, textAlign: 'center' }}>{t('noGroomingLogs')}</Typography>
        </Card>
      ) : (
        <Card style={[{ backgroundColor: colors.card }]}>
          {sortedLogs.map((log, i) => (
            <View key={log.id} style={[styles.logRow, { borderBottomColor: colors.border, borderBottomWidth: i < sortedLogs.length - 1 ? 1 : 0 }]}>
              <View style={[styles.iconCircle, { backgroundColor: colors.primary[100] }]}>
                <Ionicons name={GROOMING_ICONS[log.type] as any} size={20} color={colors.primary[700]} />
              </View>
              <View style={{ flex: 1 }}>
                <Typography style={{ fontWeight: '600', color: colors.text }}>{typeLabel[log.type]}</Typography>
                <Typography variant="caption" style={{ color: colors.subtext }}>{format(parseISO(log.date), 'dd MMM yyyy, HH:mm')}</Typography>
                {log.notes ? <Typography variant="caption" style={{ color: colors.subtext, fontStyle: 'italic' }}>{log.notes}</Typography> : null}
              </View>
              <Pressable onPress={() => handleDelete(log.id)} accessibilityRole="button" accessibilityLabel={t('delete')}>
                <Ionicons name="trash-outline" size={18} color={colors.error} />
              </Pressable>
            </View>
          ))}
        </Card>
      )}

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Typography variant="heading" style={{ marginBottom: 16, color: colors.text }}>{t('groomingLog')}</Typography>

            <Typography variant="caption" style={[styles.label, { color: colors.subtext }]}>{t('groomingType')}</Typography>
            <View style={styles.typeGrid}>
              {groomTypes.map((gType) => (
                <Pressable key={gType} onPress={() => setSelectedType(gType)}
                  style={[styles.typeChip, { borderColor: selectedType === gType ? colors.primary[500] : colors.border, backgroundColor: selectedType === gType ? colors.primary[100] : colors.background }]}
                  accessibilityRole="button">
                  <Ionicons name={GROOMING_ICONS[gType] as any} size={16} color={selectedType === gType ? colors.primary[700] : colors.subtext} />
                  <Typography style={{ fontSize: 12, color: selectedType === gType ? colors.primary[700] : colors.subtext, marginTop: 4 }}>{typeLabel[gType]}</Typography>
                </Pressable>
              ))}
            </View>

            <TextInput label={`${t('notes')} (optional)`} value={notes} onChangeText={setNotes} placeholder="Any details..." multiline numberOfLines={2} />

            <View style={styles.actionRow}>
              <Button title={t('cancel')} variant="secondary" style={styles.actionBtn} onPress={() => { setModalVisible(false); setNotes(''); }} />
              <View style={{ width: 12 }} />
              <Button title={t('save')} style={styles.actionBtn} onPress={handleAdd} />
            </View>
          </View>
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
  logRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalContent: { padding: 24, borderRadius: styling.borderRadius },
  label: { marginBottom: 8 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeChip: { width: '30%', alignItems: 'center', paddingVertical: 10, borderRadius: styling.borderRadius, borderWidth: 1 },
  actionRow: { flexDirection: 'row', marginTop: 16 },
  actionBtn: { flex: 1 },
});
