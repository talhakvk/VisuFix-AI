import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadFault } from '../api/faultApi';

export default function CameraScreen({ navigation }) {
  const [imageUri, setImageUri] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Kamera izni isteyip fotoğraf çeker.
   */
  async function handleTakePhoto() {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Kamera İzni Gerekli',
          'Fotoğraf çekebilmek için kamera erişimine izin vermeniz gerekmektedir. Lütfen ayarlardan izni etkinleştirin.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(() => result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Hata', 'Kamera açılırken bir hata oluştu.');
    }
  }

  /**
   * Galeri izni isteyip fotoğraf seçtirir.
   */
  async function handlePickFromGallery() {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Galeri İzni Gerekli',
          'Galeriden fotoğraf seçebilmek için medya kitaplığı erişimine izin vermeniz gerekmektedir. Lütfen ayarlardan izni etkinleştirin.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(() => result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Hata', 'Galeri açılırken bir hata oluştu.');
    }
  }

  /**
   * Seçilen fotoğrafı backend'e yükleyip Gemini AI analizini başlatır.
   */
  async function handleAnalyze() {
    if (!imageUri) return;

    setIsLoading(() => true);

    try {
      const data = await uploadFault(imageUri);
      const fault = data.fault;
      navigation.navigate('Simulation', { fault });
    } catch (error) {
      Alert.alert(
        'Analiz Hatası',
        error.message || 'Fotoğraf analiz edilirken bir hata oluştu.'
      );
    } finally {
      setIsLoading(() => false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Fotoğraf Önizleme Alanı */}
      <View style={styles.previewContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>📷</Text>
            <Text style={styles.placeholderText}>
              Fotoğraf çekin veya galeriden seçin
            </Text>
          </View>
        )}
      </View>

      {/* Buton Alanı */}
      <View style={styles.buttonContainer}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.cameraButton, isLoading && styles.buttonDisabled]}
            onPress={handleTakePhoto}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonIcon}>📸</Text>
            <Text style={styles.buttonText}>Fotoğraf Çek</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.galleryButton, isLoading && styles.buttonDisabled]}
            onPress={handlePickFromGallery}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonIcon}>🖼️</Text>
            <Text style={styles.buttonText}>Galeriden Seç</Text>
          </TouchableOpacity>
        </View>

        {imageUri && (
          <TouchableOpacity
            style={[styles.analyzeButton, isLoading && styles.buttonDisabled]}
            onPress={handleAnalyze}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            {isLoading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.analyzeButtonText}>Analiz ediliyor...</Text>
              </View>
            ) : (
              <Text style={styles.analyzeButtonText}>🔍 Analiz Et</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  previewContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#e0e0e0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e8e8e8',
  },
  placeholderIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cameraButton: {
    backgroundColor: '#4A90D9',
  },
  galleryButton: {
    backgroundColor: '#5C6BC0',
  },
  buttonIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  analyzeButton: {
    marginTop: 12,
    backgroundColor: '#43A047',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
