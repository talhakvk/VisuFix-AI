import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { getSteps } from '../api/faultApi';
import { API_BASE_URL } from '../constants/config';
import MarkerOverlay from '../components/MarkerOverlay';
import StepCard from '../components/StepCard';

export default function SimulationScreen({ route }) {
  const { fault } = route.params;

  const [steps, setSteps] = useState([]);
  const [activeStepOrder, setActiveStepOrder] = useState(null);
  const [imageLayout, setImageLayout] = useState({ width: 0, height: 0 });
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
   * Image bileşeninin onLayout event'inden fotoğrafın ekrandaki
   * gerçek boyutlarını alır. MarkerOverlay buna göre konumlanır.
   */
  function handleImageLayout(event) {
    const { width, height } = event.nativeEvent.layout;
    setImageLayout(() => ({ width, height }));
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
        <ActivityIndicator size="large" color="#4A90D9" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Fotoğraf + AR İşaretleyici Katmanı */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: photoUri }}
          style={styles.image}
          onLayout={handleImageLayout}
          resizeMode="contain"
        />

        {imageLayout.width > 0 && (
          <MarkerOverlay
            steps={steps}
            imageLayout={imageLayout}
            activeStep={activeStepOrder}
            onMarkerPress={handleMarkerPress}
          />
        )}
      </View>

      {/* Adım Açıklama Kartı */}
      <StepCard
        step={activeStep}
        totalSteps={steps.length}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  imageWrapper: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});
