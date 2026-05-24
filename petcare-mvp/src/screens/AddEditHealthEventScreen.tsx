import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/RootNavigator';
import { usePetStore } from '../store/petStore';
import { Typography } from '../components/Typography';
import { TextInput } from '../components/TextInput';
import { Button } from '../components/Button';
import { styling } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { HealthEvent } from '../types/PetCare';

type Props = NativeStackScreenProps<RootStackParamList, 'AddEditHealthEvent'>;

const isValidIsoDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(new Date(v).getTime());
const todayIsoDate = () => new Date().toISOString().split('T')[0];

export const AddEditHealthEventScreen: React.FC<Props> = ({ route, navigation }) => {
  const { petId, eventId } = route.params;
  const isEditing = !!eventId;
  const pet = usePetStore((s) => s.pets.find((p) => p.id === petId));
  const existing = isEditing && pet ? pet.healthEvents.find((e) => e.id === eventId) : null;
  const addHealthEvent = usePetStore((s) => s.addHealthEvent);
  const updateHealthEvent = usePetStore((s) => s.updateHealthEvent);
  const deleteHealthEvent = usePetStore((s) => s.deleteHealthEvent);
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [title, setTitle] = useState(existing?.title ?? '');
  const [type, setType] = useState<HealthEvent['type']>(existing?.type ?? 'vaccine');
  const [dateStr, setDateStr] = useState(existing?.date ? existing.date.split('T')[0] : todayIsoDate());
  const [nextDueDateStr, setNextDueDateStr] = useState(existing?.nextDueDate ? existing.nextDueDate.split('T')[0] : '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [documentUri, setDocumentUri] = useState(existing?.documentUri ?? '');

  const handleSave = () => {
    if (!title.trim()) return;
    if (!isValidIsoDate(dateStr)) { Alert.alert(t('invalidDate'), t('invalidDateMsg')); return; }
    if (nextDueDateStr && !isValidIsoDate(nextDueDateStr)) { Alert.alert(t('invalidDate'), t('invalidDateMsg')); return; }
    const data: Omit<HealthEvent, 'id'> = {
      title: title.trim(), type,
      date: new Date(dateStr).toISOString(),
      nextDueDate: nextDueDateStr ? new Date(nextDueDateStr).toISOString() : undefined,
      notes: notes.trim() || undefined,
      documentUri: documentUri || undefined,
    };
    if (isEditing && eventId) updateHealthEvent(petId, eventId, data);
    else addHealthEvent(petId, data);
    navigation.goBack();
  };

  const handleDelete = () => {
    if (!eventId) return;
    Alert.alert(t('deleteEvent'), t('deleteEventConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: () => { deleteHealthEvent(petId, eventId); navigation.goBack(); } },
    ]);
  };

  const handlePickDocument = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) { Alert.alert(t('permissionNeeded'), t('photoPermissionMsg')); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 });
    if (!result.canceled && result.assets[0]) setDocumentUri(result.assets[0].uri);
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleSave} disabled={!title.trim()}>
          <Typography style={{ color: title.trim() ? colors.accent[500] : colors.neutral[300], fontWeight: 'bold' }}>
            {t('save')}
          </Typography>
        </Pressable>
      ),
    });
  }, [navigation, title, type, dateStr, nextDueDateStr, notes, documentUri]);

  const types: { label: string; value: HealthEvent['type'] }[] = [
    { label: t('vaccine'), value: 'vaccine' },
    { label: t('vetVisit'), value: 'vet_visit' },
    { label: t('medication'), value: 'medication' },
    { label: t('deworming'), value: 'deworming' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        <Typography variant="caption" style={[styles.label, { color: colors.subtext }]}>{t('eventType')}</Typography>
        <View style={styles.typeSelector}>
          {types.map((tp) => (
            <Pressable key={tp.value} onPress={() => setType(tp.value)}
              style={[styles.typeBtn, { borderColor: type === tp.value ? colors.primary[500] : colors.border, backgroundColor: type === tp.value ? colors.primary[100] : colors.card }]}>
              <Typography style={{ color: type === tp.value ? colors.primary[700] : colors.subtext, fontSize: 13 }}>{tp.label}</Typography>
            </Pressable>
          ))}
        </View>

        <TextInput label={`${t('title')} *`} value={title} onChangeText={setTitle} placeholder="e.g., Rabies Booster" />
        <TextInput label={t('date')} value={dateStr} onChangeText={setDateStr} placeholder="2025-05-20" autoCapitalize="none" autoCorrect={false} />
        <TextInput label={t('nextDueDate')} value={nextDueDateStr} onChangeText={setNextDueDateStr} placeholder="2026-05-20" autoCapitalize="none" autoCorrect={false} />
        <TextInput label={t('notes')} value={notes} onChangeText={setNotes} placeholder="Any additional details..." multiline numberOfLines={3} style={styles.notesInput} />

        {/* Document attachment */}
        <Typography variant="caption" style={[styles.label, { color: colors.subtext }]}>{t('attachDocument')}</Typography>
        {documentUri ? (
          <View style={styles.docPreview}>
            <Image source={{ uri: documentUri }} style={styles.docImage} resizeMode="cover" />
            <Pressable style={[styles.removeDoc, { backgroundColor: colors.error }]} onPress={() => setDocumentUri('')} accessibilityRole="button">
              <Ionicons name="close" size={16} color="#fff" />
            </Pressable>
          </View>
        ) : (
          <Pressable style={[styles.docPicker, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={handlePickDocument} accessibilityRole="button">
            <Ionicons name="attach-outline" size={22} color={colors.primary[500]} />
            <Typography style={{ color: colors.primary[500], marginLeft: 8 }}>{t('attachDocument')}</Typography>
          </Pressable>
        )}
      </View>

      {isEditing && <Button title={t('deleteEvent')} variant="danger" onPress={handleDelete} style={styles.deleteBtn} />}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: styling.spacing[16] },
  form: { marginBottom: styling.spacing[32] },
  label: { marginBottom: 8, fontWeight: '500' },
  typeSelector: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: styling.spacing[16], gap: 8 },
  typeBtn: { width: '48%', paddingVertical: 12, borderWidth: 1, alignItems: 'center', borderRadius: styling.borderRadius },
  notesInput: { minHeight: 80, textAlignVertical: 'top' },
  docPicker: { flexDirection: 'row', alignItems: 'center', padding: 14, borderWidth: 1, borderRadius: styling.borderRadius, borderStyle: 'dashed', marginBottom: 16 },
  docPreview: { position: 'relative', marginBottom: 16 },
  docImage: { width: '100%', height: 160, borderRadius: styling.borderRadius },
  removeDoc: { position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  deleteBtn: { marginTop: styling.spacing[16] },
});
