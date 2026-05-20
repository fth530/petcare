import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { usePetStore } from '../store/petStore';
import { Typography } from '../components/Typography';
import { TextInput } from '../components/TextInput';
import { Button } from '../components/Button';
import { colors, styling } from '../theme';
import { HealthEvent } from '../types/PetCare';

type Props = NativeStackScreenProps<RootStackParamList, 'AddEditHealthEvent'>;

const isValidIsoDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(value);
  return !isNaN(d.getTime());
};

const todayIsoDate = () => new Date().toISOString().split('T')[0];

export const AddEditHealthEventScreen: React.FC<Props> = ({ route, navigation }) => {
  const { petId, eventId } = route.params;
  const isEditing = !!eventId;
  const pet = usePetStore((state) => state.pets.find((p) => p.id === petId));
  const existingEvent =
    isEditing && pet ? pet.healthEvents.find((e) => e.id === eventId) : null;

  const addHealthEvent = usePetStore((state) => state.addHealthEvent);
  const updateHealthEvent = usePetStore((state) => state.updateHealthEvent);
  const deleteHealthEvent = usePetStore((state) => state.deleteHealthEvent);

  const [title, setTitle] = useState(existingEvent?.title || '');
  const [type, setType] = useState<HealthEvent['type']>(existingEvent?.type || 'vaccine');
  const [dateStr, setDateStr] = useState(
    existingEvent?.date ? existingEvent.date.split('T')[0] : todayIsoDate()
  );
  const [nextDueDateStr, setNextDueDateStr] = useState(
    existingEvent?.nextDueDate ? existingEvent.nextDueDate.split('T')[0] : ''
  );
  const [notes, setNotes] = useState(existingEvent?.notes || '');

  const handleSave = () => {
    if (!title.trim()) return;
    if (!isValidIsoDate(dateStr)) {
      Alert.alert('Invalid Date', 'Event date must be YYYY-MM-DD.');
      return;
    }
    if (nextDueDateStr && !isValidIsoDate(nextDueDateStr)) {
      Alert.alert('Invalid Date', 'Next due date must be YYYY-MM-DD.');
      return;
    }

    const data: Omit<HealthEvent, 'id'> = {
      title: title.trim(),
      type,
      date: new Date(dateStr).toISOString(),
      nextDueDate: nextDueDateStr ? new Date(nextDueDateStr).toISOString() : undefined,
      notes: notes.trim() || undefined,
    };

    if (isEditing && eventId) {
      updateHealthEvent(petId, eventId, data);
    } else {
      addHealthEvent(petId, data);
    }
    navigation.goBack();
  };

  const handleDelete = () => {
    if (!eventId) return;
    Alert.alert('Delete Event', 'Remove this health event?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteHealthEvent(petId, eventId);
          navigation.goBack();
        },
      },
    ]);
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleSave} disabled={!title.trim()}>
          <Typography
            style={{
              color: title.trim() ? colors.accent[500] : colors.neutral[300],
              fontWeight: 'bold',
            }}
          >
            Save
          </Typography>
        </Pressable>
      ),
    });
  }, [navigation, title, type, dateStr, nextDueDateStr, notes]);

  const types: { label: string; value: HealthEvent['type'] }[] = [
    { label: 'Vaccine', value: 'vaccine' },
    { label: 'Vet Visit', value: 'vet_visit' },
    { label: 'Meds', value: 'medication' },
    { label: 'Deworm', value: 'deworming' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        <Typography variant="caption" style={styles.label}>Event Type</Typography>
        <View style={styles.typeSelector}>
          {types.map((t) => (
            <Pressable
              key={t.value}
              onPress={() => setType(t.value)}
              style={[styles.typeBtn, type === t.value && styles.typeBtnActive]}
            >
              <Typography
                style={{
                  color: type === t.value ? colors.primary[700] : colors.neutral[700],
                  fontSize: 13,
                }}
              >
                {t.label}
              </Typography>
            </Pressable>
          ))}
        </View>

        <TextInput
          label="Title *"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g., Rabies Booster"
        />

        <TextInput
          label="Date (YYYY-MM-DD)"
          value={dateStr}
          onChangeText={setDateStr}
          placeholder="2025-05-20"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          label="Next Due Date (optional, YYYY-MM-DD)"
          value={nextDueDateStr}
          onChangeText={setNextDueDateStr}
          placeholder="2026-05-20"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          label="Notes (optional)"
          value={notes}
          onChangeText={setNotes}
          placeholder="Any additional details..."
          multiline
          numberOfLines={3}
          style={styles.notesInput}
        />
      </View>

      {isEditing && (
        <Button
          title="Delete Event"
          variant="danger"
          onPress={handleDelete}
          style={styles.deleteBtn}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: styling.spacing[16] },
  form: { marginBottom: styling.spacing[32] },
  label: { marginBottom: 8, fontWeight: '500' },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: styling.spacing[16],
    gap: 8,
  },
  typeBtn: {
    width: '48%',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    alignItems: 'center',
    borderRadius: styling.borderRadius,
    backgroundColor: colors.neutral.white,
  },
  typeBtnActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[100],
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  deleteBtn: { marginTop: styling.spacing[16] },
});
