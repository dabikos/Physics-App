import React, { useCallback, useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AnimatedIconProps {
  name: keyof typeof Ionicons.glyphMap;
  size: number;
  color: string;
  animation?: 'bounce' | 'pulse' | 'rotate' | 'shake';
  delay?: number;
}

export const AnimatedIcon: React.FC<AnimatedIconProps> = ({
  name,
  size,
  color,
  animation = 'bounce',
  delay = 0,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const rotateValue = useRef(new Animated.Value(0)).current;

  const startAnimation = useCallback(() => {
    switch (animation) {
      case 'bounce':
        Animated.loop(
          Animated.sequence([
            Animated.timing(animatedValue, {
              toValue: -10,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ])
        ).start();
        break;
      case 'pulse':
        Animated.loop(
          Animated.sequence([
            Animated.timing(scaleValue, {
              toValue: 1.2,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(scaleValue, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
          ])
        ).start();
        break;
      case 'rotate':
        Animated.loop(
          Animated.timing(rotateValue, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          })
        ).start();
        break;
      case 'shake':
        Animated.loop(
          Animated.sequence([
            Animated.timing(animatedValue, {
              toValue: 5,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
              toValue: -5,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
              toValue: 0,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.delay(2000),
          ])
        ).start();
        break;
    }
  }, [animatedValue, animation, rotateValue, scaleValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      startAnimation();
    }, delay);
    return () => clearTimeout(timeout);
  }, [delay, startAnimation]);

  const spin = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getTransform = () => {
    switch (animation) {
      case 'bounce':
        return [{ translateY: animatedValue }];
      case 'pulse':
        return [{ scale: scaleValue }];
      case 'rotate':
        return [{ rotate: spin }];
      case 'shake':
        return [{ translateX: animatedValue }];
      default:
        return [];
    }
  };

  return (
    <Animated.View style={{ transform: getTransform() }}>
      <Ionicons name={name} size={size} color={color} />
    </Animated.View>
  );
};
