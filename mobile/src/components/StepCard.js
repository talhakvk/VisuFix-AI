import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Animated,
  PanResponder,
  Dimensions,
  StyleSheet,
} from 'react-native';

const WINDOW_HEIGHT = Dimensions.get('window').height;
const COLLAPSED_HEIGHT = 160;
const EXPANDED_HEIGHT = WINDOW_HEIGHT * 0.7;
const DRAG_THRESHOLD = 20;

/**
 * Bottom Sheet davranışına sahip adım açıklama kartı.
 * PanResponder ile sürüklenebilir, kapalı 160px, açık %70 ekran yüksekliği.
 *
 * @param {Object|null} step       - Aktif step objesi (null olabilir)
 * @param {number}      totalSteps - Toplam adım sayısı
 * @param {Function}    onPrev     - Önceki adıma geçiş fonksiyonu
 * @param {Function}    onNext     - Sonraki adıma geçiş fonksiyonu
 */
export default function StepCard({ step, totalSteps, onPrev, onNext }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const sheetHeight = useRef(new Animated.Value(COLLAPSED_HEIGHT)).current;
  const lastHeight = useRef(COLLAPSED_HEIGHT);

  /**
   * Paneli belirtilen yüksekliğe animasyonla götürür.
   */
  const animateTo = useCallback((toValue) => {
    lastHeight.current = toValue;
    setIsExpanded(() => toValue === EXPANDED_HEIGHT);
    Animated.spring(sheetHeight, {
      toValue,
      tension: 50,
      friction: 9,
      useNativeDriver: false,
    }).start();
  }, [sheetHeight]);

  /**
   * PanResponder — dikey sürüklemeyi yakalar.
   * Yukarı çekince açar, aşağı itince kapatır.
   */
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_evt, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_evt, gestureState) => {
        const newHeight = lastHeight.current - gestureState.dy;
        const clamped = Math.max(COLLAPSED_HEIGHT, Math.min(EXPANDED_HEIGHT, newHeight));
        sheetHeight.setValue(clamped);
      },
      onPanResponderRelease: (_evt, gestureState) => {
        if (gestureState.dy < -DRAG_THRESHOLD) {
          // Yukarı çekildi — aç
          animateTo(EXPANDED_HEIGHT);
        } else if (gestureState.dy > DRAG_THRESHOLD) {
          // Aşağı itildi — kapat
          animateTo(COLLAPSED_HEIGHT);
        } else {
          // Eşik aşılmadı — eski konuma dön
          animateTo(lastHeight.current);
        }
      },
    })
  ).current;

  /**
   * Overlay'e dokunulunca paneli kapat.
   */
  function handleOverlayPress() {
    animateTo(COLLAPSED_HEIGHT);
  }

  const isFirst = !step || step.step_order <= 1;
  const isLast = !step || step.step_order >= totalSteps;

  return (
    <>
      {/* Yarı saydam overlay — sadece panel açıkken görünür */}
      {isExpanded && (
        <TouchableWithoutFeedback onPress={handleOverlayPress}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}

      {/* Bottom Sheet */}
      <Animated.View style={[styles.sheet, { height: sheetHeight }]}>
        {/* Drag Handle */}
        <View {...panResponder.panHandlers} style={styles.handleArea}>
          <View style={styles.dragHandle} />
        </View>

        {/* İçerik */}
        {!step ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>👆</Text>
            <Text style={styles.emptyText}>Bir işaretleyiciye dokunun</Text>
          </View>
        ) : (
          <View style={styles.contentContainer}>
            {/* Adım Etiketi */}
            <View style={styles.header}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  Adım {step.step_order} / {totalSteps}
                </Text>
              </View>
            </View>

            {/* Açıklama — ScrollView ile */}
            <ScrollView
              style={styles.scrollArea}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={isExpanded}
              scrollEnabled={isExpanded}
            >
              <Text
                style={styles.description}
                numberOfLines={isExpanded ? undefined : 2}
                ellipsizeMode="tail"
              >
                {step.description}
              </Text>
            </ScrollView>

            {/* Navigasyon Butonları — altta sabit */}
            <View style={styles.navigation}>
              <TouchableOpacity
                style={[styles.navButton, isFirst && styles.navButtonDisabled]}
                onPress={onPrev}
                disabled={isFirst}
                activeOpacity={0.7}
              >
                <Text style={[styles.navButtonText, isFirst && styles.navButtonTextDisabled]}>
                  ← Önceki
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.navButton, styles.navButtonNext, isLast && styles.navButtonDisabled]}
                onPress={onNext}
                disabled={isLast}
                activeOpacity={0.7}
              >
                <Text style={[styles.navButtonText, styles.navButtonNextText, isLast && styles.navButtonTextDisabled]}>
                  Sonraki →
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 10,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 20,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  handleArea: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ccc',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  badge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#FFFFFF',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 12,
  },
  navButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonNext: {
    backgroundColor: '#FF3B30',
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  navButtonNextText: {
    color: '#FFFFFF',
  },
  navButtonTextDisabled: {
    color: '#FFFFFF',
  },
});
