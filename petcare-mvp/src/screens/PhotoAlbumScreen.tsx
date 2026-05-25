import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert, Image, Modal, useWindowDimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { format, parseISO } from 'date-fns';
import { RootStackParamList } from '../navigation/RootNavigator';
import { usePetStore } from '../store/petStore';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { TextInput } from '../components/TextInput';
import { styling } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'PhotoAlbum'>;

export const PhotoAlbumScreen: React.FC<Props> = ({ route }) => {
  const { petId } = route.params;
  const pet = usePetStore((s) => s.pets.find((p) => p.id === petId));
  const addPhoto = usePetStore((s) => s.addPhoto);
  const deletePhoto = usePetStore((s) => s.deletePhoto);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();

  const [caption, setCaption] = useState('');
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);

  const cellSize = (width - 32 - 8) / 3;

  const sortedPhotos = useMemo(() =>
    [...(pet?.photos ?? [])].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()),
    [pet?.photos]
  );

  const handlePickPhoto = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) { Alert.alert(t('permissionNeeded'), t('photoPermissionMsg')); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85, allowsEditing: true });
    if (!result.canceled && result.assets[0]) {
      setPreviewUri(result.assets[0].uri);
    }
  };

  const handleSavePhoto = () => {
    if (!previewUri) return;
    addPhoto(petId, { uri: previewUri, date: new Date().toISOString(), caption: caption.trim() || undefined });
    setPreviewUri(null);
    setCaption('');
  };

  const handleDelete = (photoId: string) => {
    Alert.alert(t('delete'), t('deletePhoto'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: () => deletePhoto(petId, photoId) },
    ]);
  };

  const handleShare = useCallback(async (uri: string) => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert(t('sharingNotAvailable'), t('sharingNotSupportedMsg'));
      }
    } catch {
      Alert.alert(t('errorTitle'), t('photoShareError'));
    }
  }, [t]);

  const handlePhotoPress = useCallback((photoId: string, uri: string) => {
    Alert.alert(t('photoOptions'), t('photoOptionsMsg'), [
      { text: t('viewFull'), onPress: () => { setSelectedPhoto(uri); setSelectedPhotoId(photoId); } },
      { text: t('shareProfile'), onPress: () => handleShare(uri) },
      { text: t('cancel'), style: 'cancel' },
    ]);
  }, [handleShare, t]);

  if (!pet) return null;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Add photo section */}
      {previewUri ? (
        <Card style={[styles.previewCard, { backgroundColor: colors.card }]}>
          <Image source={{ uri: previewUri }} style={[styles.previewImage, { height: width - 64 }]} resizeMode="cover" />
          <TextInput label={t('photoCaption')} value={caption} onChangeText={setCaption} placeholder="A sunny morning walk..." />
          <View style={styles.previewActions}>
            <Button title={t('cancel')} variant="secondary" style={styles.actionBtn} onPress={() => { setPreviewUri(null); setCaption(''); }} />
            <View style={{ width: 12 }} />
            <Button title={t('save')} style={styles.actionBtn} onPress={handleSavePhoto} />
          </View>
        </Card>
      ) : (
        <Pressable style={[styles.addPhotoBtn, { borderColor: colors.primary[500], backgroundColor: colors.card }]} onPress={handlePickPhoto} accessibilityRole="button">
          <Ionicons name="camera-outline" size={28} color={colors.primary[500]} />
          <Typography style={{ color: colors.primary[500], marginLeft: 10, fontWeight: '600' }}>{t('addPhoto')}</Typography>
        </Pressable>
      )}

      {/* Count */}
      {sortedPhotos.length > 0 && (
        <Typography variant="caption" style={[styles.countLabel, { color: colors.subtext }]}>
          {sortedPhotos.length} {t('photos').toLowerCase()}
        </Typography>
      )}

      {/* Photo grid */}
      {sortedPhotos.length === 0 && !previewUri ? (
        <Card style={[styles.emptyCard, { backgroundColor: colors.card }]}>
          <Ionicons name="images-outline" size={48} color={colors.neutral[300]} />
          <Typography variant="caption" style={{ color: colors.subtext, marginTop: 12, textAlign: 'center' }}>{t('noPhotos')}</Typography>
        </Card>
      ) : (
        <View style={styles.grid}>
          {sortedPhotos.map((photo) => (
            <Pressable key={photo.id} style={[styles.gridCell, { width: cellSize, height: cellSize }]}
              onPress={() => handlePhotoPress(photo.id, photo.uri)}
              onLongPress={() => handleDelete(photo.id)}
              accessibilityRole="button">
              <Image source={{ uri: photo.uri }} style={styles.gridImage} resizeMode="cover" />
              {photo.caption ? (
                <View style={styles.captionOverlay}>
                  <Typography style={{ color: '#fff', fontSize: 10 }} numberOfLines={1}>{photo.caption}</Typography>
                </View>
              ) : null}
            </Pressable>
          ))}
        </View>
      )}

      <Typography variant="caption" style={{ color: colors.neutral[300], textAlign: 'center', marginTop: 8 }}>
        {t('longPressToDelete')}
      </Typography>

      {/* Full screen viewer */}
      <Modal visible={!!selectedPhoto} transparent animationType="fade" onRequestClose={() => { setSelectedPhoto(null); setSelectedPhotoId(null); }}>
        <View style={styles.viewerOverlay}>
          <Pressable style={styles.viewerClose} onPress={() => { setSelectedPhoto(null); setSelectedPhotoId(null); }} accessibilityRole="button">
            <Ionicons name="close" size={28} color="#fff" />
          </Pressable>
          {selectedPhoto && (
            <Image source={{ uri: selectedPhoto }} style={styles.viewerImage} resizeMode="contain" />
          )}
          {selectedPhoto && (
            <Pressable
              style={styles.viewerShare}
              onPress={() => handleShare(selectedPhoto)}
              accessibilityRole="button"
              accessibilityLabel="Share photo"
            >
              <Ionicons name="share-outline" size={24} color="#fff" />
              <Typography style={{ color: '#fff', marginLeft: 6 }}>Share</Typography>
            </Pressable>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  addPhotoBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderWidth: 1.5, borderStyle: 'dashed', borderRadius: styling.borderRadius, marginBottom: 16 },
  previewCard: { marginBottom: 16, padding: 16 },
  previewImage: { width: '100%', borderRadius: styling.borderRadius, marginBottom: 12 },
  previewActions: { flexDirection: 'row', marginTop: 8 },
  actionBtn: { flex: 1 },
  countLabel: { marginBottom: 8 },
  emptyCard: { alignItems: 'center', paddingVertical: 32 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  gridCell: { borderRadius: 6, overflow: 'hidden' },
  gridImage: { width: '100%', height: '100%' },
  captionOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', padding: 4 },
  viewerOverlay: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  viewerClose: { position: 'absolute', top: 48, right: 16, zIndex: 10 },
  viewerImage: { width: '100%', height: '80%' },
  viewerShare: {
    position: 'absolute', bottom: 48,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 24,
  },
});
