import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/RootNavigator';
import { usePetStore } from '../store/petStore';
import { Typography } from '../components/Typography';
import { TextInput } from '../components/TextInput';
import { Button } from '../components/Button';
import { Avatar } from '../components/Avatar';
import { colors, styling } from '../theme';
import { Pet } from '../types/PetCare';
import { WEIGHT_MAX_KG, NAME_MAX_LENGTH } from '../constants';

type Props = NativeStackScreenProps<RootStackParamList, 'AddEditPet'>;

const isValidIsoDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(value);
  return !isNaN(d.getTime());
};

export const AddEditPetScreen: React.FC<Props> = ({ route, navigation }) => {
  const { petId } = route.params;
  const isEditing = !!petId;
  const pets = usePetStore((state) => state.pets);
  const addPet = usePetStore((state) => state.addPet);
  const updatePet = usePetStore((state) => state.updatePet);
  const deletePet = usePetStore((state) => state.deletePet);

  const existingPet = isEditing ? pets.find((p) => p.id === petId) : null;

  const [name, setName] = useState(existingPet?.name || '');
  const [type, setType] = useState<Pet['type']>(existingPet?.type || 'dog');
  const [gender, setGender] = useState<Pet['gender']>(existingPet?.gender || 'male');
  const [breed, setBreed] = useState(existingPet?.breed || '');
  const [weightStr, setWeightStr] = useState(existingPet?.weightKg?.toString() || '');
  const [dobStr, setDobStr] = useState(
    existingPet?.dateOfBirth ? existingPet.dateOfBirth.split('T')[0] : ''
  );
  const [avatarUri, setAvatarUri] = useState(existingPet?.avatarUri || '');

  const handleSave = () => {
    if (!name.trim()) return;

    if (name.trim().length > NAME_MAX_LENGTH) {
      Alert.alert('Name Too Long', `Pet name must be ${NAME_MAX_LENGTH} characters or fewer.`);
      return;
    }

    if (dobStr && !isValidIsoDate(dobStr)) {
      Alert.alert('Invalid Date', 'Date of birth must be YYYY-MM-DD.');
      return;
    }

    const parsedWeight = parseFloat(weightStr);
    if (weightStr && (!isFinite(parsedWeight) || parsedWeight < 0 || parsedWeight > WEIGHT_MAX_KG)) {
      Alert.alert('Invalid Weight', `Weight must be between 0 and ${WEIGHT_MAX_KG} kg.`);
      return;
    }

    const petData = {
      name: name.trim(),
      type,
      breed: breed.trim(),
      weightKg: parseFloat(weightStr) || 0,
      gender,
      dateOfBirth: dobStr
        ? new Date(dobStr).toISOString()
        : existingPet?.dateOfBirth || new Date().toISOString(),
      avatarUri: avatarUri || undefined,
    };

    if (isEditing && petId) {
      updatePet(petId, petData);
    } else {
      addPet(petData);
    }
    navigation.goBack();
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleSave} disabled={!name.trim()}>
          <Typography
            style={{
              color: name.trim() ? colors.accent[500] : colors.neutral[300],
              fontWeight: 'bold',
            }}
          >
            Save
          </Typography>
        </Pressable>
      ),
    });
  }, [navigation, name, type, gender, breed, weightStr, dobStr, avatarUri]);

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo library access.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Pet', 'Are you sure you want to remove this pet?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          if (petId) deletePet(petId);
          navigation.popToTop();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.avatarSection}>
        <Pressable
          onPress={handlePickImage}
          style={styles.avatarPressable}
          accessibilityLabel="Change pet photo"
          accessibilityRole="button"
        >
          <Avatar uri={avatarUri} size={120} />
          <View style={styles.cameraIconContainer}>
            <Ionicons name="camera" size={20} color={colors.neutral.white} />
          </View>
        </Pressable>
        <Typography variant="caption" style={{ marginTop: 8 }}>Tap to change photo</Typography>
      </View>

      <View style={styles.form}>
        <TextInput
          label="Pet Name *"
          value={name}
          onChangeText={setName}
          placeholder="e.g., Max"
        />

        <Typography variant="caption" style={styles.label}>Pet Type</Typography>
        <View style={styles.typeSelector}>
          {(['dog', 'cat', 'other'] as const).map((t) => (
            <Pressable
              key={t}
              onPress={() => setType(t)}
              style={[styles.typeBtn, type === t && styles.typeBtnActive]}
            >
              <Typography
                style={{
                  color: type === t ? colors.primary[700] : colors.neutral[700],
                  textTransform: 'capitalize',
                }}
              >
                {t}
              </Typography>
            </Pressable>
          ))}
        </View>

        <Typography variant="caption" style={styles.label}>Gender</Typography>
        <View style={styles.typeSelector}>
          {(['male', 'female'] as const).map((g) => (
            <Pressable
              key={g}
              onPress={() => setGender(g)}
              style={[styles.typeBtn, gender === g && styles.typeBtnActive]}
            >
              <Typography
                style={{
                  color: gender === g ? colors.primary[700] : colors.neutral[700],
                  textTransform: 'capitalize',
                }}
              >
                {g}
              </Typography>
            </Pressable>
          ))}
        </View>

        <TextInput
          label="Breed"
          value={breed}
          onChangeText={setBreed}
          placeholder="e.g., Golden Retriever"
        />

        <TextInput
          label="Weight (kg)"
          value={weightStr}
          onChangeText={setWeightStr}
          placeholder="e.g., 12.5"
          keyboardType="numeric"
        />

        <TextInput
          label="Date of Birth (YYYY-MM-DD)"
          value={dobStr}
          onChangeText={setDobStr}
          placeholder="e.g., 2021-05-10"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {isEditing && (
        <Button
          title="Delete Pet"
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
  avatarSection: { alignItems: 'center', marginVertical: styling.spacing[24] },
  avatarPressable: { position: 'relative' },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.accent[500],
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  form: { marginBottom: styling.spacing[32] },
  label: { marginBottom: 8, fontWeight: '500' },
  typeSelector: { flexDirection: 'row', marginBottom: styling.spacing[16] },
  typeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    alignItems: 'center',
    marginHorizontal: 4,
    borderRadius: styling.borderRadius,
    backgroundColor: colors.neutral.white,
  },
  typeBtnActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[100],
  },
  deleteBtn: { marginTop: styling.spacing[32] },
});
