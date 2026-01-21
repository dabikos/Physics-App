import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  score?: number;
  type: 'lesson' | 'task' | 'test';
}

const Confetti: React.FC<{ delay: number; left: number }> = ({ delay, left }) => {
  const translateY = useRef(new Animated.Value(-50)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: height,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 10,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(2000),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }, delay);
    return () => clearTimeout(timeout);
  }, []);

  const spin = rotate.interpolate({
    inputRange: [0, 10],
    outputRange: ['0deg', '3600deg'],
  });

  const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#6C63FF'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  return (
    <Animated.View
      style={[
        styles.confetti,
        {
          left,
          backgroundColor: randomColor,
          transform: [{ translateY }, { rotate: spin }],
          opacity,
        },
      ]}
    />
  );
};

const Star: React.FC<{ delay: number; style: any }> = ({ delay, style }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <Animated.View style={[style, { transform: [{ scale }], opacity }]}>
      <Ionicons name="star" size={24} color="#FFD700" />
    </Animated.View>
  );
};

export const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  score,
  type,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0);
      checkAnim.setValue(0);
      textAnim.setValue(0);

      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.spring(checkAnim, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
          }),
          Animated.timing(textAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [visible]);

  const getIcon = () => {
    switch (type) {
      case 'lesson':
        return 'book';
      case 'task':
        return 'checkmark-circle';
      case 'test':
        return 'trophy';
      default:
        return 'checkmark-circle';
    }
  };

  const getGradient = (): [string, string] => {
    switch (type) {
      case 'lesson':
        return ['#4A90D9', '#6C63FF'];
      case 'task':
        return ['#10B981', '#34D399'];
      case 'test':
        return ['#F59E0B', '#FBBF24'];
      default:
        return ['#6C63FF', '#4A90D9'];
    }
  };

  const confettiPositions = Array.from({ length: 20 }, () => Math.random() * width);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        {confettiPositions.map((left, index) => (
          <Confetti key={index} delay={index * 100} left={left} />
        ))}

        <Animated.View
          style={[
            styles.modalContent,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <LinearGradient
            colors={getGradient()}
            style={styles.iconCircle}
          >
            <Animated.View style={{ transform: [{ scale: checkAnim }] }}>
              <Ionicons name={getIcon()} size={48} color="#FFFFFF" />
            </Animated.View>
          </LinearGradient>

          {type === 'test' && score !== undefined && (
            <View style={styles.starsContainer}>
              <Star delay={400} style={styles.star1} />
              <Star delay={500} style={styles.star2} />
              <Star delay={600} style={styles.star3} />
            </View>
          )}

          <Animated.View style={{ opacity: textAnim }}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            
            {score !== undefined && (
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreLabel}>Результат</Text>
                <Text style={[
                  styles.scoreValue,
                  { color: score >= 70 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444' }
                ]}>
                  {score}%
                </Text>
              </View>
            )}
          </Animated.View>

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <LinearGradient
              colors={getGradient()}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Продолжить</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 20,
    borderRadius: 2,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: width - 48,
    maxWidth: 340,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  starsContainer: {
    position: 'absolute',
    top: 20,
    width: '100%',
    height: 60,
  },
  star1: {
    position: 'absolute',
    left: 30,
    top: 10,
  },
  star2: {
    position: 'absolute',
    right: 30,
    top: 10,
  },
  star3: {
    position: 'absolute',
    right: 60,
    top: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  scoreContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  button: {
    marginTop: 24,
    width: '100%',
  },
  buttonGradient: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
