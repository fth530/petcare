import React, { useState, useEffect } from 'react';
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

type Props = NativeStackScreenProps<RootStackParamList, 'AddEditPet'>;

export const AddEditPetScreen: React.FC<Props> = ({ route, navigation }) => {
  const { petId } = route.params;
  const isEditing = !!petId;
  const pets = usePetStore(state => state.pets);
  const addPet = usePetStore(state => state.addPet);
  const updatePet = usePetStore(state => state.updatePet);
  const deletePet = usePetStore(state => state.deletePet);

  const existingPet = isEditing ? pets.find(p => p.id === petId) : null;

  const [name, setName] = useState(existingPet?.name || '');
  const [type, setType] = useState<Pet['type']>(existingPet?.type || 'dog');
  const [breed, setBreed] = useState(existingPet?.breed || '');
  const [weightStr, setWeightStr] = useState(existingPet?.weightKg.toString() || '');
  const [avatarUri, setAvatarUri] = useState(existingPet?.avatarUri || '');

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleSave} disabled={!name}>
          <Typography style={{ color: name ? colors.accent[500] : colors.neutral[300], fontWeight: 'bold' }}>
            Save
          </Typography>
        </Pressable>
      ),
    });
  }, [navigation, name, type, breed, weightStr, avatarUri]);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;

    const petData = {
      name,
      type,
      breed,
      weightKg: parseFloat(weightStr) || 0,
      gender: 'male' as const, // Simplified for MVP
      dateOfBirth: new Date().toISOString(), // Simplified for MVP
      avatarUri,
    };

    if (isEditing && petId) {
      updatePet(petId, petData);
      navigation.goBack();
    } else {
      addPet(petData);
      navigation.goBack();
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
          navigation.navigate('PetList');
        }
      }
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarSection}>
        <Pressable onPress={handlePickImage} style={styles.avatarPressable}>
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
          {(['dog', 'cat', 'other'] as const).map(t => (
            <Pressable
              key={t}
              onPress={() => setType(t)}
              style={[styles.typeBtn, type === t && styles.typeBtnActive]}
            >
              <Typography style={{ color: type === t ? colors.primary[700] : colors.neutral[700], textTransform: 'capitalize' }}>
                {t}
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
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: styling.spacing[16],
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: styling.spacing[24],
  },
  avatarPressable: {
    position: 'relative',
  },
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
  form: {
    marginBottom: styling.spacing[32],
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: styling.spacing[16],
  },
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
  deleteBtn: {
    marginTop: styling.spacing[32],
  }
});
