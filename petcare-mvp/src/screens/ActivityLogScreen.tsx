import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert, Modal } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO, subDays } from 'date-fns';
import { RootStackParamList } from '../navigation/RootNavigator';
import { usePetStore } from '../store/petStore';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { TextInput } from '../components/TextInput';
import { styling } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { ActivityLog } from '../types/PetCare';

type Props = NativeStackScreenProps<RootStackParamList, 'ActivityLog'>;
type ActType = ActivityLog['type'];

const ACT_ICONS: Record<ActType, string> = {
  walk: 'walk-outline', run: 'fitness-outline', play: 'game-controller-outline',
  swim: 'water-outline', training: 'school-outline', other: 'ellipse-outline',
};

const ACT_COLORS: Record<ActType, string> = {
  walk: '#6c63ff', run: '#ef4444', play: '#f59e0b',
  swim: '#3b82f6', training: '#10b981', other: '#8b5cf6',
};

export const ActivityLogScreen: React.FC<Props> = ({ route }) => {
  const { petId } = route.params;
  const pet = usePetStore((s) => s.pets.find((p) => p.id === petId));
  const addActivityLog = usePetStore((s) => s.addActivityLog);
  const deleteActivityLog = usePetStore((s) => s.deleteActivityLog);
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [modalVisible, setModalVisible] = useState(false);
  const [actType, setActType] = useState<ActType>('walk');
  const [durationStr, setDurationStr] = useState('');
  const [distanceStr, setDistanceStr] = useState('');
  const [notes, setNotes] = useState('');

  const actTypes: ActType[] = ['walk', 'run', 'play', 'swim', 'training', 'other'];
  const typeLabel: Record<ActType, string> = {
    walk: t('actWalk'), run: t('actRun'), play: t('actPlay'),
    swim: t('actSwim'), training: t('actTraining'), other: t('actOther'),
  };

  const sortedLogs = useMemo(() =>
    [...(pet?.activityLogs ?? [])].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()),
    [pet?.activityLogs]
  );

  const stats = useMemo(() => {
    const cutoff = subDays(new Date(), 30);
    const recent = (pet?.activityLogs ?? []).filter((l) => parseISO(l.date) >= cutoff);
    const totalMin = recent.reduce((s, l) => s + l.durationMinutes, 0);
    const totalKm = recent.reduce((s, l) => s + (l.distanceKm ?? 0), 0);
    return { totalMin, totalKm };
  }, [pet?.activityLogs]);

  const handleAdd = () => {
    const dur = parseInt(durationStr, 10);
    if (isNaN(dur) || dur <= 0) { Alert.alert(t('invalidWeight'), 'Duration must be a positive number.'); return; }
    const dist = distanceStr ? parseFloat(distanceStr) : undefined;
    addActivityLog(petId, {
      date: new Date().toISOString(),
      type: actType,
      durationMinutes: dur,
      distanceKm: dist && !isNaN(dist) ? dist : undefined,
      notes: notes.trim() || undefined,
    });
    setModalVisible(false);
    setDurationStr(''); setDistanceStr(''); setNotes(''); setActType('walk');
  };

  const handleDelete = (logId: string) => {
    Alert.alert(t('delete'), t('deleteActivity'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: () => deleteActivityLog(petId, logId) },
    ]);
  };

  if (!pet) return null;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Stats summary */}
      <View style={styles.statsRow}>
        <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Typography style={{ fontSize: 22, fontWeight: 'bold', color: colors.primary[500] }}>{stats.totalMin}</Typography>
          <Typography variant="caption" style={{ color: colors.subtext }}>{t('minutes')} (30d)</Typography>
        </Card>
        <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Typography style={{ fontSize: 22, fontWeight: 'bold', color: colors.accent[500] }}>{stats.totalKm.toFixed(1)}</Typography>
          <Typography variant="caption" style={{ color: colors.subtext }}>{t('km')} (30d)</Typography>
        </Card>
        <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Typography style={{ fontSize: 22, fontWeight: 'bold', color: colors.success }}>{sortedLogs.length}</Typography>
          <Typography variant="caption" style={{ color: colors.subtext }}>{t('activities')}</Typography>
        </Card>
      </View>

      <Button title={`+ ${t('addActivity')}`} onPress={() => setModalVisible(true)} style={styles.addBtn} accessibilityLabel={t('addActivity')} />

      {sortedLogs.length === 0 ? (
        <Card style={[styles.emptyCard, { backgroundColor: colors.card }]}>
          <Ionicons name="walk-outline" size={48} color={colors.neutral[300]} />
          <Typography variant="caption" style={{ color: colors.subtext, marginTop: 12, textAlign: 'center' }}>{t('noActivities')}</Typography>
        </Card>
      ) : (
        <Card style={{ backgroundColor: colors.card, padding: 0, overflow: 'hidden' }}>
          {sortedLogs.map((log, i) => (
            <View key={log.id} style={[styles.logRow, { borderBottomColor: colors.border, borderBottomWidth: i < sortedLogs.length - 1 ? 1 : 0 }]}>
              <View style={[styles.iconCircle, { backgroundColor: ACT_COLORS[log.type] + '22' }]}>
                <Ionicons name={ACT_ICONS[log.type] as any} size={20} color={ACT_COLORS[log.type]} />
              </View>
              <View style={{ flex: 1 }}>
                <Typography style={{ fontWeight: '600', color: colors.text }}>{typeLabel[log.type]}</Typography>
                <Typography variant="caption" style={{ color: colors.subtext }}>
                  {log.durationMinutes} {t('minutes')}
                  {log.distanceKm ? ` · ${log.distanceKm} ${t('km')}` : ''}
                  {' · '}{format(parseISO(log.date), 'dd MMM yyyy')}
                </Typography>
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
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            <Typography variant="heading" style={{ marginBottom: 16, color: colors.text }}>{t('addActivity')}</Typography>

            <Typography variant="caption" style={[styles.label, { color: colors.subtext }]}>{t('activityType')}</Typography>
            <View style={styles.typeGrid}>
              {actTypes.map((a) => (
                <Pressable key={a} onPress={() => setActType(a)}
                  style={[styles.typeChip, { borderColor: actType === a ? ACT_COLORS[a] : colors.border, backgroundColor: actType === a ? ACT_COLORS[a] + '22' : colors.background }]}
                  accessibilityRole="button">
                  <Ionicons name={ACT_ICONS[a] as any} size={18} color={actType === a ? ACT_COLORS[a] : colors.subtext} />
                  <Typography style={{ fontSize: 11, color: actType === a ? ACT_COLORS[a] : colors.subtext, marginTop: 4 }}>{typeLabel[a]}</Typography>
                </Pressable>
              ))}
            </View>

            <TextInput label={`${t('duration')} *`} value={durationStr} onChangeText={setDurationStr} keyboardType="numeric" placeholder="30" />
            <TextInput label={t('distance')} value={distanceStr} onChangeText={setDistanceStr} keyboardType="decimal-pad" placeholder="2.5" />
            <TextInput label={t('notes')} value={notes} onChangeText={setNotes} placeholder="Great walk!" multiline numberOfLines={2} />

            <View style={styles.actionRow}>
              <Button title={t('cancel')} variant="secondary" style={styles.actionBtn} onPress={() => setModalVisible(false)} />
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
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statCard: { flex: 1, alignItems: 'center', padding: 12, marginBottom: 0 },
  addBtn: { marginBottom: 16 },
  emptyCard: { alignItems: 'center', paddingVertical: 32 },
  logRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modal: { padding: 24, borderRadius: styling.borderRadius },
  label: { marginBottom: 8 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeChip: { width: '30%', alignItems: 'center', paddingVertical: 10, borderRadius: styling.borderRadius, borderWidth: 1 },
  actionRow: { flexDirection: 'row', marginTop: 8 },
  actionBtn: { flex: 1 },
});
