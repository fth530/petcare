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
import { styling } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { Pet } from '../types/PetCare';
import { WEIGHT_MAX_KG, NAME_MAX_LENGTH, FOOD_TARGET_GRAMS, WATER_TARGET_SERVINGS } from '../constants';

type Props = NativeStackScreenProps<RootStackParamList, 'AddEditPet'>;

const isValidIsoDate = (v: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  return !isNaN(new Date(v).getTime());
};

export const AddEditPetScreen: React.FC<Props> = ({ route, navigation }) => {
  const { petId } = route.params;
  const isEditing = !!petId;
  const pets = usePetStore((s) => s.pets);
  const addPet = usePetStore((s) => s.addPet);
  const updatePet = usePetStore((s) => s.updatePet);
  const deletePet = usePetStore((s) => s.deletePet);
  const { colors } = useTheme();
  const { t } = useTranslation();

  const existing = isEditing ? pets.find((p) => p.id === petId) : null;

  const [name, setName] = useState(existing?.name ?? '');
  const [type, setType] = useState<Pet['type']>(existing?.type ?? 'dog');
  const [gender, setGender] = useState<Pet['gender']>(existing?.gender ?? 'male');
  const [breed, setBreed] = useState(existing?.breed ?? '');
  const [weightStr, setWeightStr] = useState(existing?.weightKg?.toString() ?? '');
  const [dobStr, setDobStr] = useState(existing?.dateOfBirth ? existing.dateOfBirth.split('T')[0] : '');
  const [avatarUri, setAvatarUri] = useState(existing?.avatarUri ?? '');
  const [foodTarget, setFoodTarget] = useState(existing?.foodTargetGrams?.toString() ?? FOOD_TARGET_GRAMS.toString());
  const [waterTarget, setWaterTarget] = useState(existing?.waterTargetServings?.toString() ?? WATER_TARGET_SERVINGS.toString());
  const [vetName, setVetName] = useState(existing?.vet?.name ?? '');
  const [vetClinic, setVetClinic] = useState(existing?.vet?.clinic ?? '');
  const [vetPhone, setVetPhone] = useState(existing?.vet?.phone ?? '');
  const [vetNotes, setVetNotes] = useState(existing?.vet?.notes ?? '');

  const handleSave = () => {
    if (!name.trim()) return;
    if (name.trim().length > NAME_MAX_LENGTH) {
      Alert.alert(t('nameTooLong'), t('nameTooLongMsg'));
      return;
    }
    if (dobStr && !isValidIsoDate(dobStr)) {
      Alert.alert(t('invalidDate'), t('invalidDateMsg'));
      return;
    }
    const parsedWeight = parseFloat(weightStr);
    if (weightStr && (!isFinite(parsedWeight) || parsedWeight < 0 || parsedWeight > WEIGHT_MAX_KG)) {
      Alert.alert(t('invalidWeight'), t('invalidWeightMsg'));
      return;
    }
    const petData = {
      name: name.trim(), type, breed: breed.trim(),
      weightKg: parseFloat(weightStr) || 0, gender,
      dateOfBirth: dobStr ? new Date(dobStr).toISOString() : existing?.dateOfBirth ?? new Date().toISOString(),
      avatarUri: avatarUri || undefined,
      foodTargetGrams: parseInt(foodTarget, 10) || FOOD_TARGET_GRAMS,
      waterTargetServings: parseInt(waterTarget, 10) || WATER_TARGET_SERVINGS,
      vet: { name: vetName.trim(), clinic: vetClinic.trim(), phone: vetPhone.trim(), notes: vetNotes.trim() },
    };
    if (isEditing && petId) updatePet(petId, petData);
    else addPet(petData);
    navigation.goBack();
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleSave} disabled={!name.trim()}>
          <Typography style={{ color: name.trim() ? colors.accent[500] : colors.neutral[300], fontWeight: 'bold' }}>
            {t('save')}
          </Typography>
        </Pressable>
      ),
    });
  }, [navigation, name, type, gender, breed, weightStr, dobStr, avatarUri, foodTarget, waterTarget, vetName, vetClinic, vetPhone, vetNotes]);

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { Alert.alert(t('permissionNeeded'), t('photoPermissionMsg')); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) setAvatarUri(result.assets[0].uri);
  };

  const handleDelete = () => {
    Alert.alert(t('deletePet'), t('deletePetConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: () => { if (petId) deletePet(petId); navigation.popToTop(); } },
    ]);
  };

  const S = makeStyles(colors);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <Pressable onPress={handlePickImage} style={styles.avatarPressable} accessibilityLabel="Change pet photo" accessibilityRole="button">
          <Avatar uri={avatarUri} size={120} />
          <View style={[styles.cameraIconContainer, { backgroundColor: colors.accent[500], borderColor: colors.background }]}>
            <Ionicons name="camera" size={20} color="#fff" />
          </View>
        </Pressable>
        <Typography variant="caption" style={{ marginTop: 8, color: colors.subtext }}>{t('tapToChangePhoto')}</Typography>
      </View>

      <View style={styles.form}>
        <TextInput label={`${t('petName')} *`} value={name} onChangeText={setName} placeholder="e.g., Max" />

        {/* Type */}
        <Typography variant="caption" style={[styles.label, { color: colors.subtext }]}>{t('type')}</Typography>
        <View style={styles.typeSelector}>
          {(['dog', 'cat', 'other'] as const).map((tp) => (
            <Pressable key={tp} onPress={() => setType(tp)}
              style={[styles.typeBtn, { borderColor: type === tp ? colors.primary[500] : colors.border, backgroundColor: type === tp ? colors.primary[100] : colors.card }]}>
              <Typography style={{ color: type === tp ? colors.primary[700] : colors.subtext, textTransform: 'capitalize' }}>
                {t(tp as any)}
              </Typography>
            </Pressable>
          ))}
        </View>

        {/* Gender */}
        <Typography variant="caption" style={[styles.label, { color: colors.subtext }]}>{t('gender')}</Typography>
        <View style={styles.typeSelector}>
          {(['male', 'female'] as const).map((g) => (
            <Pressable key={g} onPress={() => setGender(g)}
              style={[styles.typeBtn, { borderColor: gender === g ? colors.primary[500] : colors.border, backgroundColor: gender === g ? colors.primary[100] : colors.card }]}>
              <Typography style={{ color: gender === g ? colors.primary[700] : colors.subtext, textTransform: 'capitalize' }}>
                {t(g as any)}
              </Typography>
            </Pressable>
          ))}
        </View>

        <TextInput label={t('breed')} value={breed} onChangeText={setBreed} placeholder="e.g., Golden Retriever" />
        <TextInput label={t('weight')} value={weightStr} onChangeText={setWeightStr} placeholder="e.g., 12.5" keyboardType="numeric" />
        <TextInput label={t('dateOfBirth')} value={dobStr} onChangeText={setDobStr} placeholder="e.g., 2021-05-10" autoCapitalize="none" autoCorrect={false} />

        {/* Nutrition targets */}
        <Typography variant="heading" style={[styles.sectionHeader, { color: colors.text }]}>{t('nutritionTargets')}</Typography>
        <TextInput label={t('foodTarget')} value={foodTarget} onChangeText={setFoodTarget} keyboardType="numeric" placeholder="300" />
        <TextInput label={t('waterTarget')} value={waterTarget} onChangeText={setWaterTarget} keyboardType="numeric" placeholder="4" />

        {/* Vet info */}
        <Typography variant="heading" style={[styles.sectionHeader, { color: colors.text }]}>{t('vetInfo')}</Typography>
        <TextInput label={t('vetName')} value={vetName} onChangeText={setVetName} placeholder="Dr. Smith" />
        <TextInput label={t('vetClinic')} value={vetClinic} onChangeText={setVetClinic} placeholder="City Vet Clinic" />
        <TextInput label={t('vetPhone')} value={vetPhone} onChangeText={setVetPhone} placeholder="+1 555 0123" keyboardType="phone-pad" />
        <TextInput label={t('vetNotes')} value={vetNotes} onChangeText={setVetNotes} placeholder="Any notes..." multiline numberOfLines={2} />
      </View>

      {isEditing && (
        <Button title={t('deletePet')} variant="danger" onPress={handleDelete} style={styles.deleteBtn} />
      )}
    </ScrollView>
  );
};

const makeStyles = (colors: any) => ({});

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: styling.spacing[16] },
  avatarSection: { alignItems: 'center', marginVertical: styling.spacing[24] },
  avatarPressable: { position: 'relative' },
  cameraIconContainer: {
    position: 'absolute', bottom: 0, right: 0,
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', borderWidth: 3,
  },
  form: { marginBottom: styling.spacing[32] },
  label: { marginBottom: 8, fontWeight: '500' },
  sectionHeader: { fontSize: 16, marginTop: styling.spacing[16], marginBottom: styling.spacing[8] },
  typeSelector: { flexDirection: 'row', marginBottom: styling.spacing[16] },
  typeBtn: {
    flex: 1, paddingVertical: 12, borderWidth: 1,
    alignItems: 'center', marginHorizontal: 4, borderRadius: styling.borderRadius,
  },
  deleteBtn: { marginTop: styling.spacing[32] },
});
