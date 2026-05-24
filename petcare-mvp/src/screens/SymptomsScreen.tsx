import React, { useState, useMemo, useCallback } from 'react';
import {
  View, StyleSheet, ScrollView, Pressable, Modal, Alert,
  TextInput as RNTextInput,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { RootStackParamList } from '../navigation/RootNavigator';
import { usePetStore } from '../store/petStore';
import { Symptom } from '../types/PetCare';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { styling } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'Symptoms'>;

type Severity = Symptom['severity'];

const SEVERITY_CONFIG: Record<Severity, { color: string; label: string }> = {
  mild: { color: '#10b981', label: 'Mild' },
  moderate: { color: '#f59e0b', label: 'Moderate' },
  severe: { color: '#ef4444', label: 'Severe' },
};

export const SymptomsScreen: React.FC<Props> = ({ route }) => {
  const { petId } = route.params;
  const pet = usePetStore((s) => s.pets.find((p) => p.id === petId));
  const addSymptom = usePetStore((s) => s.addSymptom);
  const deleteSymptom = usePetStore((s) => s.deleteSymptom);
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [modalVisible, setModalVisible] = useState(false);
  const [description, setDescription] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<Severity>('mild');
  const [notes, setNotes] = useState('');

  const sortedSymptoms = useMemo(() =>
    [...(pet?.symptoms ?? [])].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()),
    [pet?.symptoms]
  );

  const handleAddSymptom = useCallback(() => {
    const desc = description.trim();
    if (!desc) return;
    addSymptom(petId, {
      date: new Date().toISOString(),
      description: desc,
      severity: selectedSeverity,
      notes: notes.trim() || undefined,
    });
    setDescription('');
    setNotes('');
    setSelectedSeverity('mild');
    setModalVisible(false);
  }, [description, selectedSeverity, notes, petId, addSymptom]);

  const handleDelete = useCallback((symptomId: string) => {
    Alert.alert(t('delete'), t('deleteSymptom'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: () => deleteSymptom(petId, symptomId) },
    ]);
  }, [petId, deleteSymptom, t]);

  if (!pet) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {sortedSymptoms.length === 0 ? (
          <Card style={[styles.emptyCard, { backgroundColor: colors.card }]}>
            <Ionicons name="heart-outline" size={48} color={colors.neutral[300]} />
            <Typography variant="caption" style={{ color: colors.subtext, marginTop: 12, textAlign: 'center' }}>
              {t('noSymptoms')}
            </Typography>
          </Card>
        ) : (
          sortedSymptoms.map((symptom) => {
            const sevCfg = SEVERITY_CONFIG[symptom.severity];
            return (
              <Card key={symptom.id} style={[styles.symptomCard, { backgroundColor: colors.card, borderLeftColor: sevCfg.color, borderLeftWidth: 4 }]}>
                <View style={styles.symptomHeader}>
                  <View style={styles.symptomLeft}>
                    <View style={[styles.severityDot, { backgroundColor: sevCfg.color }]} />
                    <View>
                      <Typography style={{ fontWeight: '600', color: colors.text }}>{symptom.description}</Typography>
                      <Typography variant="caption" style={{ color: colors.subtext }}>
                        {format(parseISO(symptom.date), 'MMM d, yyyy · h:mm a')}
                      </Typography>
                    </View>
                  </View>
                  <View style={styles.symptomRight}>
                    <View style={[styles.severityBadge, { backgroundColor: sevCfg.color + '22' }]}>
                      <Typography style={{ fontSize: 12, fontWeight: '600', color: sevCfg.color }}>{sevCfg.label}</Typography>
                    </View>
                    <Pressable onPress={() => handleDelete(symptom.id)} accessibilityRole="button" style={{ padding: 4, marginLeft: 8 }}>
                      <Ionicons name="trash-outline" size={16} color={colors.error} />
                    </Pressable>
                  </View>
                </View>
                {symptom.notes ? (
                  <Typography variant="caption" style={{ color: colors.subtext, marginTop: 6 }}>
                    {symptom.notes}
                  </Typography>
                ) : null}
              </Card>
            );
          })
        )}

        {/* AI Analysis placeholder */}
        <Card style={[styles.aiCard, { backgroundColor: colors.primary[100], borderColor: colors.primary[500] }]}>
          <View style={styles.aiHeader}>
            <Ionicons name="sparkles-outline" size={20} color={colors.primary[500]} />
            <Typography style={{ fontWeight: '700', color: colors.primary[700], marginLeft: 8 }}>AI Analysis</Typography>
          </View>
          <Typography style={{ color: colors.primary[700], marginTop: 6, lineHeight: 20 }}>
            No concerning patterns detected in the last 30 days.
          </Typography>
          <Typography variant="caption" style={{ color: colors.subtext, marginTop: 6 }}>
            {t('aiSymptomNote')}
          </Typography>
        </Card>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* FAB */}
      <Pressable
        style={[styles.fab, { backgroundColor: colors.primary[500] }]}
        onPress={() => setModalVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={t('addSymptom')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      {/* Add Symptom Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Typography variant="heading" style={{ color: colors.text, marginBottom: 16 }}>{t('addSymptom')}</Typography>

            <Typography variant="caption" style={{ color: colors.subtext, marginBottom: 4 }}>{t('symptomDesc')}</Typography>
            <RNTextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              value={description}
              onChangeText={setDescription}
              placeholder="e.g., Limping on left leg"
              placeholderTextColor={colors.subtext}
              multiline
              numberOfLines={2}
              accessibilityLabel={t('symptomDesc')}
            />

            <Typography variant="caption" style={{ color: colors.subtext, marginBottom: 8, marginTop: 12 }}>{t('symptomSeverity')}</Typography>
            <View style={styles.severityRow}>
              {(['mild', 'moderate', 'severe'] as Severity[]).map((sev) => {
                const cfg = SEVERITY_CONFIG[sev];
                const isSelected = selectedSeverity === sev;
                const sevLabels: Record<Severity, string> = {
                  mild: t('sevMild'), moderate: t('sevModerate'), severe: t('sevSevere'),
                };
                return (
                  <Pressable
                    key={sev}
                    onPress={() => setSelectedSeverity(sev)}
                    accessibilityRole="button"
                    style={[
                      styles.severityBtn,
                      {
                        borderColor: isSelected ? cfg.color : colors.border,
                        backgroundColor: isSelected ? cfg.color + '22' : colors.background,
                        flex: 1,
                      },
                    ]}
                  >
                    <Typography style={{ fontSize: 13, fontWeight: isSelected ? '700' : '400', color: isSelected ? cfg.color : colors.subtext }}>
                      {sevLabels[sev]}
                    </Typography>
                  </Pressable>
                );
              })}
            </View>

            <Typography variant="caption" style={{ color: colors.subtext, marginBottom: 4, marginTop: 12 }}>{t('notes')} (optional)</Typography>
            <RNTextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Additional details..."
              placeholderTextColor={colors.subtext}
              accessibilityLabel={t('notes')}
            />

            <View style={styles.modalActions}>
              <Button title={t('cancel')} variant="secondary" style={styles.actionBtn} onPress={() => setModalVisible(false)} />
              <View style={{ width: 12 }} />
              <Button title={t('save')} style={styles.actionBtn} onPress={handleAddSymptom} />
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
  symptomCard: { marginBottom: 12, padding: 12 },
  symptomHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  symptomLeft: { flexDirection: 'row', alignItems: 'flex-start', flex: 1 },
  symptomRight: { flexDirection: 'row', alignItems: 'center' },
  severityDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10, marginTop: 4 },
  severityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  aiCard: {
    marginTop: 16, padding: 16,
    borderRadius: styling.borderRadius, borderWidth: 1,
  },
  aiHeader: { flexDirection: 'row', alignItems: 'center' },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    padding: 24,
    borderTopLeftRadius: styling.borderRadius * 2,
    borderTopRightRadius: styling.borderRadius * 2,
  },
  input: {
    borderWidth: 1, borderRadius: styling.borderRadius,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 15,
  },
  severityRow: { flexDirection: 'row', gap: 8 },
  severityBtn: {
    paddingVertical: 8, borderRadius: styling.borderRadius,
    borderWidth: 1.5, alignItems: 'center',
  },
  modalActions: { flexDirection: 'row', marginTop: 16 },
  actionBtn: { flex: 1 },
});
