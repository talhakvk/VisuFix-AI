import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { getSteps } from '../api/faultApi';
import { API_BASE_URL } from '../constants/config';
import MarkerOverlay from '../components/MarkerOverlay';
import StepCard from '../components/StepCard';

const COLORS = {
  bgPrimary: '#0a0a0a',
  bgSecondary: '#111111',
  bgCard: '#1a1a1a',
  border: '#2a2a2a',
  textPrimary: '#ffffff',
  textSecondary: '#a0a0a0',
  accent: '#FF3B30',
  accentHover: '#ff5247',
  success: '#30D158',
  warning: '#FFD60A',
  error: '#FF3B30',
};

export default function SimulationScreen({ route }) {
  const { fault } = route.params;

  const [steps, setSteps] = useState([]);
  const [activeStepOrder, setActiveStepOrder] = useState(null);
  const [imageLayout, setImageLayout] = useState({ width: 0, height: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Ekran açıldığında fault'a ait onarım adımlarını backend'den çeker.
   */
  useEffect(() => {
    async function fetchSteps() {
      try {
        const data = await getSteps(fault.id);
        setSteps(() => data);
        setIsLoading(() => false);
      } catch (error) {
        setIsLoading(() => false);
        Alert.alert(
          'Hata',
          error.message || 'Onarım adımları alınırken bir hata oluştu.'
        );
      }
    }

    fetchSteps();
  }, [fault.id]);

  /**
   * imageWrapper View'ının onLayout event'inden fotoğrafın ekrandaki
   * gerçek boyutlarını alır. MarkerOverlay buna göre konumlanır.
   */
  function handleWrapperLayout(event) {
    const { width, height } = event.nativeEvent.layout;
    setImageLayout(() => ({ width, height }));
  }

  /**
   * Image yüklenince orijinal (natural) boyutları kaydeder.
   * Bu, contain modundaki letterbox offset hesabı için gereklidir.
   */
  function handleImageLoad(event) {
    const { width, height } = event.nativeEvent.source;
    setImageSize(() => ({ width, height }));
  }

  /**
   * İşaretleyiciye basınca ilgili adımı aktif yapar.
   */
  function handleMarkerPress(stepOrder) {
    setActiveStepOrder(() => stepOrder);
  }

  /**
   * Bir önceki adıma geçer. İlk adımdaysa bir şey yapmaz.
   */
  function handlePrev() {
    setActiveStepOrder((prev) => {
      if (prev === null || prev <= 1) return prev;
      return prev - 1;
    });
  }

  /**
   * Bir sonraki adıma geçer. Son adımdaysa bir şey yapmaz.
   */
  function handleNext() {
    setActiveStepOrder((prev) => {
      if (prev === null || prev >= steps.length) return prev;
      return prev + 1;
    });
  }

  /** Aktif step objesini bul. */
  const activeStep = steps.find((s) => s.step_order === activeStepOrder) || null;

  /** Fotoğrafın tam URL'si. */
  const photoUri = `${API_BASE_URL}/${fault.photo_url}`;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  /** Yükleme tamamlandı, arıza tespit edilmedi. */
  const noFaultDetected = !isLoading && steps.length === 0;

  return (
    <View style={styles.container}>
      {/* Fotoğraf + AR İşaretleyici Katmanı */}
      <View style={styles.imageWrapper} onLayout={handleWrapperLayout}>
        <Image
          source={{ uri: photoUri }}
          style={styles.image}
          onLoad={handleImageLoad}
          resizeMode="contain"
        />

        {!noFaultDetected && imageLayout.width > 0 && (
          <MarkerOverlay
            steps={steps}
            imageLayout={imageLayout}
            imageSize={imageSize}
            activeStep={activeStepOrder}
            onMarkerPress={handleMarkerPress}
          />
        )}
      </View>

      {/* Arıza Yok Bilgi Kartı */}
      {noFaultDetected ? (
        <View style={styles.noFaultCard}>
          <Text style={styles.noFaultIcon}>✓</Text>
          <Text style={styles.noFaultTitle}>Arıza Tespit Edilmedi</Text>
          <Text style={styles.noFaultSubtitle}>
            Bu cihazda görsel analiz sonucunda herhangi bir fiziksel arıza bulunamadı.
          </Text>
        </View>
      ) : (
        /* Adım Açıklama Kartı */
        <StepCard
          step={activeStep}
          totalSteps={steps.length}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bgPrimary,
  },
  imageWrapper: {
    flex: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  noFaultCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#0d2e1a',
    borderWidth: 1,
    borderColor: COLORS.success,
    alignItems: 'center',
  },
  noFaultIcon: {
    fontSize: 24,
    color: COLORS.success,
    marginBottom: 6,
  },
  noFaultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.success,
    marginBottom: 6,
  },
  noFaultSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
