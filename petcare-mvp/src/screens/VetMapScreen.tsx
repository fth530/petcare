import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../components/Typography';
import { Button } from '../components/Button';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'VetMap'>;

export const VetMapScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.iconWrapper, { backgroundColor: colors.primary[100] }]}>
        <Ionicons name="map-outline" size={64} color={colors.primary[500]} />
      </View>
      <Typography variant="heading" style={[styles.title, { color: colors.text }]}>{t('vetMap')}</Typography>
      <Typography style={[styles.desc, { color: colors.subtext }]}>{t('comingSoonMsg')}</Typography>
      <Typography variant="caption" style={[styles.sub, { color: colors.neutral[300] }]}>
        {t('vetMapDesc')}
      </Typography>
      <Button title={t('back')} variant="secondary" onPress={() => navigation.goBack()} style={styles.btn} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  iconWrapper: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  desc: { fontSize: 16, textAlign: 'center', marginBottom: 8 },
  sub: { textAlign: 'center', marginBottom: 32 },
  btn: { width: 200 },
});
