import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Switch, Pressable, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/RootNavigator';
import { usePetStore } from '../store/petStore';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { styling } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { exportPetsAsJSON } from '../services/ExportService';
import {
  requestNotificationPermission,
  scheduleVaccineReminders,
  scheduleDailyFeedingReminder,
  cancelAllReminders,
} from '../services/NotificationService';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export const SettingsScreen: React.FC<Props> = () => {
  const pets = usePetStore((s) => s.pets);
  const { colors, isDark, toggleTheme } = useTheme();
  const { t, language, setLanguage } = useTranslation();
  const [notifsEnabled, setNotifsEnabled] = useState(false);
  const [feedingEnabled, setFeedingEnabled] = useState(false);
  const [vaccineEnabled, setVaccineEnabled] = useState(false);

  const toggleNotifs = async (val: boolean) => {
    if (val) {
      const granted = await requestNotificationPermission();
      if (!granted) { Alert.alert('Permission Needed', 'Please enable notifications in your device settings.'); return; }
    }
    setNotifsEnabled(val);
    if (!val) { setFeedingEnabled(false); setVaccineEnabled(false); await cancelAllReminders(); }
  };

  const toggleFeeding = async (val: boolean) => {
    setFeedingEnabled(val);
    if (val) { await scheduleDailyFeedingReminder(8, 0); Alert.alert(t('notifScheduled'), 'Daily feeding reminder set for 8:00 AM'); }
    else await cancelAllReminders();
  };

  const toggleVaccine = async (val: boolean) => {
    setVaccineEnabled(val);
    if (val) { await scheduleVaccineReminders(pets); Alert.alert(t('notifScheduled'), 'Vaccine reminders scheduled!'); }
  };

  const handleExport = async () => {
    try {
      await exportPetsAsJSON(pets);
    } catch {
      Alert.alert('Error', 'Could not export data. Please try again.');
    }
  };

  const handleClearData = () => {
    Alert.alert(t('clearData'), t('clearDataConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: () => usePetStore.setState({ pets: [] }) },
    ]);
  };

  const Row = ({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) => (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon as any} size={20} color={colors.primary[500]} style={{ marginRight: 12 }} />
        <Typography style={{ color: colors.text }}>{label}</Typography>
      </View>
      {children}
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Appearance */}
      <Typography variant="caption" style={[styles.sectionLabel, { color: colors.subtext }]}>{t('appearance').toUpperCase()}</Typography>
      <Card style={[styles.card, { backgroundColor: colors.card }]}>
        <Row icon="moon-outline" label={t('darkMode')}>
          <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ true: colors.primary[500] }} />
        </Row>
      </Card>

      {/* Language */}
      <Typography variant="caption" style={[styles.sectionLabel, { color: colors.subtext }]}>{t('language').toUpperCase()}</Typography>
      <Card style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.langRow}>
          {(['en', 'tr'] as const).map((lang) => (
            <Pressable key={lang} onPress={() => setLanguage(lang)}
              style={[styles.langBtn, { borderColor: language === lang ? colors.primary[500] : colors.border, backgroundColor: language === lang ? colors.primary[100] : colors.background }]}
              accessibilityRole="button">
              <Typography style={{ color: language === lang ? colors.primary[700] : colors.subtext, fontWeight: language === lang ? '600' : '400' }}>
                {lang === 'en' ? '🇬🇧 English' : '🇹🇷 Türkçe'}
              </Typography>
            </Pressable>
          ))}
        </View>
      </Card>

      {/* Notifications */}
      <Typography variant="caption" style={[styles.sectionLabel, { color: colors.subtext }]}>{t('notifications').toUpperCase()}</Typography>
      <Card style={[styles.card, { backgroundColor: colors.card }]}>
        <Row icon="notifications-outline" label={t('enableNotifs')}>
          <Switch value={notifsEnabled} onValueChange={toggleNotifs} trackColor={{ true: colors.primary[500] }} />
        </Row>
        {notifsEnabled && (
          <>
            <Row icon="restaurant-outline" label={t('feedingReminder')}>
              <Switch value={feedingEnabled} onValueChange={toggleFeeding} trackColor={{ true: colors.primary[500] }} />
            </Row>
            <Row icon="medical-outline" label={t('vaccineReminder')}>
              <Switch value={vaccineEnabled} onValueChange={toggleVaccine} trackColor={{ true: colors.primary[500] }} />
            </Row>
          </>
        )}
      </Card>

      {/* Data & Backup */}
      <Typography variant="caption" style={[styles.sectionLabel, { color: colors.subtext }]}>{t('dataBackup').toUpperCase()}</Typography>
      <Card style={[styles.card, { backgroundColor: colors.card }]}>
        <Button title={t('exportData')} variant="secondary" onPress={handleExport} style={styles.dataBtn} accessibilityLabel={t('exportData')} />
        <View style={{ height: 12 }} />
        <Button title={t('clearData')} variant="danger" onPress={handleClearData} style={styles.dataBtn} accessibilityLabel={t('clearData')} />
      </Card>

      {/* App info */}
      <Typography variant="caption" style={{ color: colors.subtext, textAlign: 'center', marginTop: 8, marginBottom: 32 }}>
        PetCare MVP v1.0.0
      </Typography>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  sectionLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 8, marginLeft: 4 },
  card: { marginBottom: 24, padding: 0, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  langRow: { flexDirection: 'row', padding: 12, gap: 8 },
  langBtn: { flex: 1, paddingVertical: 10, borderRadius: styling.borderRadius, borderWidth: 1, alignItems: 'center' },
  dataBtn: { marginHorizontal: 16, marginVertical: 8 },
});
