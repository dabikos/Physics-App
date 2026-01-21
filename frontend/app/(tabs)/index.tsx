import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedIcon } from '../../src/components/AnimatedIcon';

interface MenuCardProps {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
  index: number;
  animation: 'bounce' | 'pulse' | 'rotate' | 'shake';
}

const MenuCard: React.FC<MenuCardProps> = ({ 
  title, 
  subtitle, 
  icon, 
  color, 
  onPress, 
  index,
  animation 
}) => {
  const translateY = useRef(new Animated.Value(50)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
        delay: index * 100,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          transform: [{ translateY }, { scale }],
          opacity,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <AnimatedIcon 
            name={icon} 
            size={28} 
            color={color} 
            animation={animation}
            delay={index * 200 + 500}
          />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const bannerScale = useRef(new Animated.Value(0.9)).current;
  const bannerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(bannerScale, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(bannerOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.appTitle}>Физика AI</Text>
        </View>

        <Animated.View 
          style={[
            styles.bannerContainer,
            { 
              transform: [{ scale: bannerScale }],
              opacity: bannerOpacity,
            }
          ]}
        >
          <LinearGradient
            colors={['#6C63FF', '#4A90D9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.banner}
          >
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>Изучай Физику с AI</Text>
              <Text style={styles.bannerSubtitle}>
                Твой персональный помощник в обучении
              </Text>
            </View>
            <View style={styles.bannerImageContainer}>
              <AnimatedIcon 
                name="planet" 
                size={80} 
                color="rgba(255,255,255,0.4)" 
                animation="rotate"
              />
            </View>
          </LinearGradient>
        </Animated.View>

        <View style={styles.menuContainer}>
          <View style={styles.menuRow}>
            <MenuCard
              title="Уроки"
              subtitle="Интерактивные уроки"
              icon="book"
              color="#4A90D9"
              onPress={() => router.push('/lessons')}
              index={0}
              animation="bounce"
            />
            <MenuCard
              title="Задачи"
              subtitle="Практические задания"
              icon="calculator"
              color="#E74C3C"
              onPress={() => router.push('/tasks')}
              index={1}
              animation="shake"
            />
          </View>
          <View style={styles.menuRow}>
            <MenuCard
              title="Тесты"
              subtitle="Проверка знаний"
              icon="checkbox"
              color="#1ABC9C"
              onPress={() => router.push('/tests')}
              index={2}
              animation="pulse"
            />
            <MenuCard
              title="Формулы"
              subtitle="Справочник"
              icon="flask"
              color="#9B59B6"
              onPress={() => router.push('/formulas')}
              index={3}
              animation="bounce"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6C63FF',
  },
  bannerContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  banner: {
    borderRadius: 20,
    padding: 24,
    minHeight: 180,
    flexDirection: 'row',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  bannerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
  },
  bannerImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    paddingHorizontal: 16,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardWrapper: {
    flex: 1,
    marginHorizontal: 6,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
});
