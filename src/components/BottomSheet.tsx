import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Animated,
  PanResponder,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StyleProp,
  ViewStyle,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxHeightRatio?: number; // e.g. 0.88
  dismissable?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  headerRight?: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  children,
  maxHeightRatio = 0.9,
  dismissable = true,
  contentContainerStyle,
  headerRight,
}) => {
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(visible);

  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const maxSheetHeight = SCREEN_HEIGHT * maxHeightRatio;

  // Open animation
  const animateIn = useCallback(() => {
    setModalVisible(true);
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        damping: 28,
        stiffness: 260,
        mass: 0.8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [backdropOpacity, translateY]);

  // Close animation
  const animateOut = useCallback((callback?: () => void) => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      callback?.();
    });
  }, [backdropOpacity, translateY]);

  useEffect(() => {
    if (visible) {
      animateIn();
    } else if (modalVisible) {
      animateOut();
    }
  }, [visible, modalVisible, animateIn, animateOut]);

  const handleClose = () => {
    if (!dismissable) return;
    animateOut(onClose);
  };

  // Drag down to dismiss gesture responder on header handle
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.7) {
          handleClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            damping: 24,
            stiffness: 240,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  if (!modalVisible) return null;

  return (
    <Modal
      transparent
      visible={modalVisible}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" />

      {/* Dimmed backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: backdropOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.55],
            }),
          },
        ]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleClose}
          accessibilityRole="button"
          accessibilityLabel="Dismiss sheet"
        />
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[
            styles.sheetContainer,
            {
              maxHeight: maxSheetHeight,
              paddingBottom: Math.max(insets.bottom, 16),
              transform: [{ translateY }],
            },
          ]}
        >
          {/* Top Drag Handle Bar */}
          <View {...panResponder.panHandlers} style={styles.handleArea}>
            <View style={styles.handleBar} />
          </View>

          {/* Header */}
          {(title || dismissable) && (
            <View style={styles.header}>
              <View style={styles.headerTitleContainer}>
                {title ? <Text style={styles.title}>{title}</Text> : null}
                {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
              </View>

              <View style={styles.headerRightContainer}>
                {headerRight}
                {dismissable && (
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={handleClose}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                  >
                    <X size={20} color="#78716C" strokeWidth={2.4} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Sheet Body Content */}
          <View style={[styles.body, contentContainerStyle]}>{children}</View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default BottomSheet;

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0F172A',
    zIndex: 1,
  },
  keyboardAvoid: {
    flex: 1,
    justifyContent: 'flex-end',
    zIndex: 2,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 20,
    width: '100%',
    overflow: 'hidden',
  },
  handleArea: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#E2E8F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleContainer: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  body: {
    flexShrink: 1,
  },
});
