import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { usePetStore } from '../store/petStore';
import { Typography } from '../components/Typography';
import { TextInput } from '../components/TextInput';
import { colors, styling } from '../theme';
import { HealthEvent } from '../types/PetCare';

type Props = NativeStackScreenProps<RootStackParamList, 'AddEditHealthEvent'>;

export const AddEditHealthEventScreen: React.FC<Props> = ({ route, navigation }) => {
  const { petId, eventId } = route.params;
  const isEditing = !!eventId;
  const pet = usePetStore(state => state.pets.find(p => p.id === petId));
  const existingEvent = isEditing ? pet?.healthEvents.find(e => e.id === eventId) : null;
  const addHealthEvent = usePetStore(state => state.addHealthEvent);

  const [title, setTitle] = useState(existingEvent?.title || '');
  const [type, setType] = useState<HealthEvent['type']>(existingEvent?.type || 'vaccine');

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleSave} disabled={!title}>
          <Typography style={{ color: title ? colors.accent[500] : colors.neutral[300], fontWeight: 'bold' }}>
            Save
          </Typography>
        </Pressable>
      ),
    });
  }, [navigation, title, type]);

  const handleSave = () => {
    if (!title.trim()) return;

    if (!isEditing) {
      addHealthEvent(petId, {
        title,
        type,
        date: new Date().toISOString(), // Simplified: defaults to today
      });
    }
    // Update logic would go here for MVP completeness

    navigation.goBack();
  };

  const types: { label: string, value: HealthEvent['type'] }[] = [
    { label: 'Vaccine 💉', value: 'vaccine' },
    { label: 'Vet Visit 🏥', value: 'vet_visit' },
    { label: 'Meds 💊', value: 'medication' },
    { label: 'Deworm 🐛', value: 'deworming' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.form}>
        <Typography variant="caption" style={styles.label}>Event Type</Typography>
        <View style={styles.typeSelector}>
          {types.map(t => (
            <Pressable
              key={t.value}
              onPress={() => setType(t.value)}
              style={[styles.typeBtn, type === t.value && styles.typeBtnActive]}
            >
              <Typography style={{ color: type === t.value ? colors.primary[700] : colors.neutral[700], fontSize: 12 }}>
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
          label="Date (Defaults to Today for MVP)"
          value="Today"
          editable={false}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: styling.spacing[16],
  },
  form: {
    marginBottom: styling.spacing[32],
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
  },
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
});
