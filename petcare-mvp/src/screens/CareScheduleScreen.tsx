import React, { useState, useMemo, useCallback } from 'react';
import {
  View, StyleSheet, ScrollView, Pressable, Modal, Alert, TextInput as RNTextInput,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { parseISO, differenceInDays, addDays, format } from 'date-fns';
import { RootStackParamList } from '../navigation/RootNavigator';
import { usePetStore } from '../store/petStore';
import { CareTask } from '../types/PetCare';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { styling } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'CareSchedule'>;

const CARE_ICONS: Record<CareTask['type'], string> = {
  bath: 'water-outline',
  nails: 'hand-left-outline',
  dental: 'happy-outline',
  deworming: 'bug-outline',
  flea_treatment: 'medkit-outline',
  ear_clean: 'ear-outline',
  other: 'ellipse-outline',
};

const CARE_TYPES: CareTask['type'][] = ['bath', 'nails', 'dental', 'deworming', 'flea_treatment', 'ear_clean', 'other'];

type TaskWithStatus = CareTask & { daysUntilDue: number; isOverdue: boolean; dueDate: Date | null };

export const CareScheduleScreen: React.FC<Props> = ({ route }) => {
  const { petId } = route.params;
  const pet = usePetStore((s) => s.pets.find((p) => p.id === petId));
  const addCareTask = usePetStore((s) => s.addCareTask);
  const deleteCareTask = usePetStore((s) => s.deleteCareTask);
  const markCareTaskDone = usePetStore((s) => s.markCareTaskDone);
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [modalVisible, setModalVisible] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [selectedType, setSelectedType] = useState<CareTask['type']>('bath');
  const [frequencyDays, setFrequencyDays] = useState('14');

  const now = useMemo(() => new Date(), []);

  const tasksWithStatus = useMemo<TaskWithStatus[]>(() => {
    const tasks = pet?.careTasks ?? [];
    return tasks.map((task) => {
      if (!task.lastDone) {
        return { ...task, daysUntilDue: -999, isOverdue: true, dueDate: null };
      }
      const lastDoneDate = parseISO(task.lastDone);
      const dueDate = addDays(lastDoneDate, task.frequencyDays);
      const daysUntilDue = differenceInDays(dueDate, now);
      return { ...task, daysUntilDue, isOverdue: daysUntilDue < 0, dueDate };
    }).sort((a, b) => {
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      return a.daysUntilDue - b.daysUntilDue;
    });
  }, [pet?.careTasks, now]);

  const handleAddTask = useCallback(() => {
    const name = taskName.trim();
    const freq = parseInt(frequencyDays, 10);
    if (!name || isNaN(freq) || freq < 1) return;
    addCareTask(petId, { name, type: selectedType, frequencyDays: freq });
    setTaskName('');
    setFrequencyDays('14');
    setSelectedType('bath');
    setModalVisible(false);
  }, [taskName, frequencyDays, selectedType, petId, addCareTask]);

  const handleDelete = useCallback((taskId: string, name: string) => {
    Alert.alert(t('delete'), t('deleteCareTask'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: () => deleteCareTask(petId, taskId) },
    ]);
  }, [petId, deleteCareTask, t]);

  const handleMarkDone = useCallback((taskId: string) => {
    markCareTaskDone(petId, taskId);
  }, [petId, markCareTaskDone]);

  if (!pet) return null;

  const typeLabel = (type: CareTask['type']): string => {
    const labels: Record<CareTask['type'], string> = {
      bath: 'Bath', nails: 'Nails', dental: 'Dental',
      deworming: 'Deworming', flea_treatment: 'Flea Treatment',
      ear_clean: 'Ear Clean', other: 'Other',
    };
    return labels[type];
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {tasksWithStatus.length === 0 ? (
          <Card style={[styles.emptyCard, { backgroundColor: colors.card }]}>
            <Ionicons name="checkmark-circle-outline" size={48} color={colors.neutral[300]} />
            <Typography variant="caption" style={{ color: colors.subtext, marginTop: 12, textAlign: 'center' }}>
              {t('noCareTask')}
            </Typography>
          </Card>
        ) : (
          tasksWithStatus.map((task) => {
            const statusColor = task.isOverdue ? colors.error : task.daysUntilDue <= 2 ? colors.warning : colors.success;
            const statusLabel = task.isOverdue
              ? (task.dueDate === null ? 'Never done — Due now' : `${Math.abs(task.daysUntilDue)} ${t('daysAgo')} — ${t('careOverdue')}`)
              : task.daysUntilDue === 0
              ? t('careDue')
              : `${task.daysUntilDue} ${t('daysLeft')}`;

            return (
              <Card key={task.id} style={[styles.taskCard, { backgroundColor: colors.card, borderLeftColor: statusColor, borderLeftWidth: 4 }]}>
                <View style={styles.taskHeader}>
                  <View style={styles.taskLeft}>
                    <View style={[styles.iconCircle, { backgroundColor: colors.primary[100] }]}>
                      <Ionicons name={CARE_ICONS[task.type] as any} size={20} color={colors.primary[500]} />
                    </View>
                    <View style={styles.taskInfo}>
                      <Typography style={{ fontWeight: '600', color: colors.text }}>{task.name}</Typography>
                      <Typography variant="caption" style={{ color: colors.subtext }}>
                        {typeLabel(task.type)} · Every {task.frequencyDays}d
                      </Typography>
                    </View>
                  </View>
                  <Pressable onPress={() => handleDelete(task.id, task.name)} accessibilityRole="button" style={{ padding: 4 }}>
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                  </Pressable>
                </View>

                <View style={styles.taskFooter}>
                  <View style={[styles.statusBadge, { backgroundColor: task.isOverdue ? '#fee2e2' : '#dcfce7' }]}>
                    <Typography style={{ fontSize: 12, fontWeight: '600', color: statusColor }}>{statusLabel}</Typography>
                  </View>
                  {task.lastDone && (
                    <Typography variant="caption" style={{ color: colors.subtext, fontSize: 11 }}>
                      {t('careLastDone')}: {format(parseISO(task.lastDone), 'MMM d')}
                    </Typography>
                  )}
                </View>

                <Button
                  title={t('markDone')}
                  variant="secondary"
                  onPress={() => handleMarkDone(task.id)}
                  style={styles.markDoneBtn}
                  accessibilityLabel={`${t('markDone')} ${task.name}`}
                />
              </Card>
            );
          })
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* FAB */}
      <Pressable
        style={[styles.fab, { backgroundColor: colors.primary[500] }]}
        onPress={() => setModalVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={t('addCareTask')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      {/* Add Task Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Typography variant="heading" style={{ color: colors.text, marginBottom: 16 }}>{t('addCareTask')}</Typography>

            <Typography variant="caption" style={{ color: colors.subtext, marginBottom: 4 }}>{t('careTaskName')}</Typography>
            <RNTextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              value={taskName}
              onChangeText={setTaskName}
              placeholder="e.g., Bath"
              placeholderTextColor={colors.subtext}
              accessibilityLabel={t('careTaskName')}
            />

            <Typography variant="caption" style={{ color: colors.subtext, marginBottom: 4, marginTop: 12 }}>Type</Typography>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {CARE_TYPES.map((type) => (
                  <Pressable
                    key={type}
                    onPress={() => setSelectedType(type)}
                    accessibilityRole="button"
                    style={[
                      styles.typeChip,
                      {
                        borderColor: selectedType === type ? colors.primary[500] : colors.border,
                        backgroundColor: selectedType === type ? colors.primary[100] : colors.background,
                      },
                    ]}
                  >
                    <Ionicons name={CARE_ICONS[type] as any} size={16} color={selectedType === type ? colors.primary[500] : colors.subtext} />
                    <Typography style={{ fontSize: 12, marginLeft: 4, color: selectedType === type ? colors.primary[700] : colors.subtext }}>
                      {typeLabel(type)}
                    </Typography>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <Typography variant="caption" style={{ color: colors.subtext, marginBottom: 4 }}>{t('careFrequency')}</Typography>
            <RNTextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              value={frequencyDays}
              onChangeText={setFrequencyDays}
              keyboardType="numeric"
              placeholder="14"
              placeholderTextColor={colors.subtext}
              accessibilityLabel={t('careFrequency')}
            />

            <View style={styles.modalActions}>
              <Button title={t('cancel')} variant="secondary" style={styles.actionBtn} onPress={() => setModalVisible(false)} />
              <View style={{ width: 12 }} />
              <Button title={t('save')} style={styles.actionBtn} onPress={handleAddTask} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  emptyCard: { alignItems: 'center', paddingVertical: 40 },
  taskCard: { marginBottom: 12, padding: 12 },
  taskHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  taskLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  taskInfo: { flex: 1 },
  taskFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  markDoneBtn: { marginTop: 4 },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { padding: 24, borderTopLeftRadius: styling.borderRadius * 2, borderTopRightRadius: styling.borderRadius * 2 },
  input: {
    borderWidth: 1, borderRadius: styling.borderRadius,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 15, marginBottom: 4,
  },
  typeChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 16, borderWidth: 1,
  },
  modalActions: { flexDirection: 'row', marginTop: 16 },
  actionBtn: { flex: 1 },
});
