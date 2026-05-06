import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';

/**
 * Fotoğrafın üzerine koordinat bazlı AR işaretleyici noktalar koyan katman.
 * Her işaretleyici sonsuz döngüde pulse animasyonu yapar.
 *
 * @param {Array}    steps        - Backend'den gelen steps dizisi
 * @param {Object}   imageLayout  - { width, height } fotoğrafın ekrandaki boyutları
 * @param {number}   activeStep   - Aktif adımın step_order'ı
 * @param {Function} onMarkerPress - İşaretleyiciye basınca çağrılır (step_order)
 */
export default function MarkerOverlay({ steps, imageLayout, activeStep, onMarkerPress }) {
  const pulseAnims = useRef([]);
  const animationRefs = useRef([]);

  /**
   * steps.length değişince pulse Animated.Value'ları yeniden oluştur
   * ve sonsuz döngü animasyonlarını başlat.
   * Unmount veya steps değişince eski animasyonları durdur.
   */
  useEffect(() => {
    // Eski animasyonları durdur
    animationRefs.current.forEach((anim) => {
      if (anim) anim.stop();
    });

    // Yeni Animated.Value'lar oluştur
    pulseAnims.current = steps.map(() => new Animated.Value(0));
    animationRefs.current = [];

    // Her marker için pulse animasyonu başlat
    steps.forEach((_step, index) => {
      const loopAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnims.current[index], {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.delay(200),
          Animated.timing(pulseAnims.current[index], {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );

      animationRefs.current.push(loopAnim);
      loopAnim.start();
    });

    // Cleanup: unmount olunca animasyonları durdur
    return () => {
      animationRefs.current.forEach((anim) => {
        if (anim) anim.stop();
      });
    };
  }, [steps.length]);

  if (!imageLayout || imageLayout.width <= 0 || imageLayout.height <= 0) {
    return null;
  }

  return (
    <View
      style={[
        styles.overlay,
        { width: imageLayout.width, height: imageLayout.height },
      ]}
      pointerEvents="box-none"
    >
      {steps.map((step, index) => {
        const pixelX = (step.coord_x / 100) * imageLayout.width;
        const pixelY = (step.coord_y / 100) * imageLayout.height;
        const isActive = step.step_order === activeStep;

        const pulseAnim = pulseAnims.current[index];

        // Pulse halkası interpolasyonları
        const pulseScale = pulseAnim
          ? pulseAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 2.5],
            })
          : 1;

        const pulseOpacity = pulseAnim
          ? pulseAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.6, 0],
            })
          : 0;

        return (
          <View
            key={step.id}
            style={[
              styles.markerContainer,
              { left: pixelX, top: pixelY },
            ]}
          >
            {/* Katman 1: Pulse Halkası */}
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  transform: [{ scale: pulseScale }],
                  opacity: pulseOpacity,
                },
              ]}
            />

            {/* Katman 2: Dış Halka + Katman 3: Numara */}
            <TouchableOpacity
              style={[
                styles.markerCircle,
                isActive ? styles.markerActive : styles.markerInactive,
              ]}
              activeOpacity={0.7}
              onPress={() => onMarkerPress(step.step_order)}
            >
              <Text style={[styles.markerText, isActive && styles.markerTextActive]}>
                {step.step_order}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  markerContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 0,
    height: 0,
  },
  pulseRing: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 59, 48, 0.3)',
    marginLeft: -24,
    marginTop: -24,
  },
  markerCircle: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -14,
    marginTop: -14,
    elevation: 8,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  markerActive: {
    backgroundColor: '#FF3B30',
  },
  markerInactive: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
  },
  markerText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  markerTextActive: {
    color: '#FFFFFF',
  },
});
