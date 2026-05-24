import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert, useWindowDimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { RootStackParamList } from '../navigation/RootNavigator';
import { usePetStore } from '../store/petStore';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { TextInput } from '../components/TextInput';
import { LineChart } from '../components/LineChart';
import { Modal } from 'react-native';
import { styling } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'WeightHistory'>;

export const WeightHistoryScreen: React.FC<Props> = ({ route }) => {
  const { petId } = route.params;
  const pet = usePetStore((s) => s.pets.find((p) => p.id === petId));
  const addWeightLog = usePetStore((s) => s.addWeightLog);
  const deleteWeightLog = usePetStore((s) => s.deleteWeightLog);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const [modalVisible, setModalVisible] = useState(false);
  const [weightInput, setWeightInput] = useState('');

  const sortedLogs = useMemo(() =>
    [...(pet?.weightLogs ?? [])].sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()),
    [pet?.weightLogs]);

  const chartData = useMemo(() =>
    sortedLogs.map((l, i) => ({
      x: parseISO(l.date).getTime(),
      y: l.weightKg,
      label: format(parseISO(l.date), 'MMM d'),
    })),
    [sortedLogs]);

  const handleAdd = () => {
    const kg = parseFloat(weightInput);
    if (!isNaN(kg) && kg > 0 && kg < 1000) {
      addWeightLog(petId, { date: new Date().toISOString(), weightKg: kg });
      setModalVisible(false); setWeightInput('');
    }
  };

  const handleDelete = (logId: string, kg: number) => {
    Alert.alert('Delete', `Remove ${kg} kg entry?`, [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: () => deleteWeightLog(petId, logId) },
    ]);
  };

  if (!pet) return null;
  const chartWidth = width - 32;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Card style={[styles.card, { backgroundColor: colors.card }]}>
        <Typography variant="heading" style={[styles.title, { color: colors.text }]}>{t('weightHistory')}</Typography>
        {sortedLogs.length >= 2 ? (
          <LineChart data={chartData} width={chartWidth - 32} unit=" kg" color={colors.primary[500]} />
        ) : (
          <Typography variant="caption" style={{ color: colors.subtext, textAlign: 'center', marginVertical: 24 }}>
            {t('noWeightLogs')} Add at least 2 entries to see the chart.
          </Typography>
        )}
      </Card>

      <Button title={t('logWeightBtn')} onPress={() => setModalVisible(true)} style={styles.addBtn} accessibilityLabel={t('weightLog')} />

      {sortedLogs.length > 0 && (
        <Card style={[styles.card, { backgroundColor: colors.card }]}>
          {[...sortedLogs].reverse().map((log) => (
            <Pressable
              key={log.id}
              style={[styles.logRow, { borderBottomColor: colors.border }]}
              onLongPress={() => handleDelete(log.id, log.weightKg)}
              accessibilityRole="button"
              accessibilityLabel={`${log.weightKg} kg on ${format(parseISO(log.date), 'MMM d yyyy')}`}
            >
              <View>
                <Typography style={{ fontWeight: '600', color: colors.text }}>{log.weightKg} kg</Typography>
                <Typography variant="caption" style={{ color: colors.subtext }}>{format(parseISO(log.date), 'dd MMM yyyy, HH:mm')}</Typography>
              </View>
              <Ionicons name="trash-outline" size={18} color={colors.error} onPress={() => handleDelete(log.id, log.weightKg)} />
            </Pressable>
          ))}
        </Card>
      )}

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Typography variant="heading" style={{ marginBottom: 16, color: colors.text }}>{t('weightLog')}</Typography>
            <TextInput label={t('weightKg')} keyboardType="numeric" value={weightInput} onChangeText={setWeightInput} placeholder="e.g., 32.5" autoFocus />
            <View style={styles.actionRow}>
              <Button title={t('cancel')} variant="secondary" style={styles.actionBtn} onPress={() => { setModalVisible(false); setWeightInput(''); }} />
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
  card: { marginBottom: 16 },
  title: { fontSize: 17, marginBottom: 16 },
  addBtn: { marginBottom: 16 },
  logRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalContent: { padding: 24, borderRadius: styling.borderRadius },
  actionRow: { flexDirection: 'row', marginTop: 16 },
  actionBtn: { flex: 1 },
});
