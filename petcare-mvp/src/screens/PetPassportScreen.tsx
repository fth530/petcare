import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { RootStackParamList } from '../navigation/RootNavigator';
import { usePetStore } from '../store/petStore';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Avatar } from '../components/Avatar';
import { styling } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { exportPetPassportAsPDF } from '../services/PDFService';
import { formatAge } from '../utils/dateUtils';

type Props = NativeStackScreenProps<RootStackParamList, 'PetPassport'>;

export const PetPassportScreen: React.FC<Props> = ({ route }) => {
  const { petId } = route.params;
  const pet = usePetStore((s) => s.pets.find((p) => p.id === petId));
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [exporting, setExporting] = useState(false);

  const handleExportPDF = async () => {
    if (!pet) return;
    setExporting(true);
    try {
      await exportPetPassportAsPDF(pet);
    } catch {
      Alert.alert('Error', 'Could not export PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  if (!pet) return null;

  const vaccines = pet.healthEvents
    .filter((e) => e.type === 'vaccine')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const activeMeds = (pet.medications ?? []);

  const Section = ({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon as any} size={16} color={colors.primary[500]} />
        <Typography style={[styles.sectionTitle, { color: colors.primary[500] }]}>{title.toUpperCase()}</Typography>
      </View>
      {children}
    </View>
  );

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
      <Typography variant="caption" style={{ color: colors.subtext, flex: 1 }}>{label}</Typography>
      <Typography style={{ color: colors.text, fontWeight: '500', flex: 2, textAlign: 'right' }}>{value}</Typography>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Passport header */}
      <Card style={[styles.headerCard, { backgroundColor: colors.primary[700] }]}>
        <View style={styles.passportHeader}>
          <View>
            <Typography style={{ color: '#fff', opacity: 0.7, fontSize: 11, letterSpacing: 2 }}>PET PASSPORT</Typography>
            <Typography style={{ color: '#fff', fontSize: 26, fontWeight: '800', marginTop: 4 }}>{pet.name}</Typography>
            <Typography style={{ color: '#fff', opacity: 0.8, fontSize: 14, marginTop: 2 }}>
              {pet.breed} · {pet.type === 'dog' ? '🐕' : pet.type === 'cat' ? '🐈' : '🐾'}
            </Typography>
          </View>
          <Avatar
            uri={pet.avatarUri}
            size={72}
            style={{ borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' }}
          />
        </View>
        <View style={[styles.passportIdRow, { borderTopColor: 'rgba(255,255,255,0.2)' }]}>
          <Typography style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10 }}>ID: {pet.id.toUpperCase()}</Typography>
        </View>
      </Card>

      {/* Basic info */}
      <Card style={[styles.card, { backgroundColor: colors.card }]}>
        <Section title={t('age')} icon="information-circle-outline">
          <InfoRow label={t('dateOfBirth')} value={format(parseISO(pet.dateOfBirth), 'dd MMM yyyy')} />
          <InfoRow label={t('age')} value={formatAge(pet.dateOfBirth, t)} />
          <InfoRow label={t('gender')} value={pet.gender === 'male' ? t('male') : t('female')} />
          <InfoRow label={t('weightLabel')} value={`${pet.weightKg} kg`} />
        </Section>
      </Card>

      {/* Vet info */}
      {(pet.vet.name || pet.vet.clinic) && (
        <Card style={[styles.card, { backgroundColor: colors.card }]}>
          <Section title={t('vetInfo')} icon="medical-outline">
            {pet.vet.name ? <InfoRow label={t('vetName')} value={pet.vet.name} /> : null}
            {pet.vet.clinic ? <InfoRow label={t('vetClinic')} value={pet.vet.clinic} /> : null}
            {pet.vet.phone ? <InfoRow label={t('vetPhone')} value={pet.vet.phone} /> : null}
          </Section>
        </Card>
      )}

      {/* Vaccines */}
      <Card style={[styles.card, { backgroundColor: colors.card }]}>
        <Section title={t('lastVaccines')} icon="shield-checkmark-outline">
          {vaccines.length === 0 ? (
            <Typography variant="caption" style={{ color: colors.subtext, padding: 8 }}>{t('noEvents')}</Typography>
          ) : (
            vaccines.map((v) => (
              <View key={v.id} style={[styles.vaccineRow, { borderBottomColor: colors.border }]}>
                <View style={[styles.vaccineDot, { backgroundColor: '#6c63ff' }]} />
                <View style={{ flex: 1 }}>
                  <Typography style={{ fontWeight: '600', color: colors.text }}>{v.title}</Typography>
                  <Typography variant="caption" style={{ color: colors.subtext }}>
                    {format(parseISO(v.date), 'dd MMM yyyy')}
                    {v.nextDueDate ? ` → ${format(parseISO(v.nextDueDate), 'dd MMM yyyy')}` : ''}
                  </Typography>
                </View>
              </View>
            ))
          )}
        </Section>
      </Card>

      {/* Active medications */}
      <Card style={[styles.card, { backgroundColor: colors.card }]}>
        <Section title={t('activeMedications')} icon="pill-outline">
          {activeMeds.length === 0 ? (
            <Typography variant="caption" style={{ color: colors.subtext, padding: 8 }}>{t('noMedications')}</Typography>
          ) : (
            activeMeds.map((m) => (
              <View key={m.id} style={[styles.vaccineRow, { borderBottomColor: colors.border }]}>
                <View style={[styles.vaccineDot, { backgroundColor: '#f59e0b' }]} />
                <View style={{ flex: 1 }}>
                  <Typography style={{ fontWeight: '600', color: colors.text }}>{m.name}</Typography>
                  <Typography variant="caption" style={{ color: colors.subtext }}>{m.dosage} · {m.frequency}</Typography>
                </View>
              </View>
            ))
          )}
        </Section>
      </Card>

      {/* Export button */}
      <Button
        title={exporting ? 'Generating PDF...' : t('exportPassport')}
        onPress={handleExportPDF}
        style={styles.exportBtn}
        accessibilityLabel={t('exportPassport')}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  headerCard: { marginBottom: 16, padding: 20 },
  passportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  passportIdRow: { borderTopWidth: 1, marginTop: 16, paddingTop: 10 },
  card: { marginBottom: 12, padding: 0, overflow: 'hidden' },
  section: { padding: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1 },
  vaccineRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, gap: 10 },
  vaccineDot: { width: 8, height: 8, borderRadius: 4 },
  exportBtn: { marginTop: 8, marginBottom: 16 },
});
