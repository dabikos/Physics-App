import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface MenuCardProps {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
}

const MenuCard: React.FC<MenuCardProps> = ({ title, subtitle, icon, color, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
    <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={28} color={color} />
    </View>
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardSubtitle}>{subtitle}</Text>
  </TouchableOpacity>
);

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.appTitle}>Физика AI</Text>
        </View>

        <View style={styles.bannerContainer}>
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
              <Ionicons name="planet" size={80} color="rgba(255,255,255,0.3)" />
            </View>
          </LinearGradient>
        </View>

        <View style={styles.menuContainer}>
          <View style={styles.menuRow}>
            <MenuCard
              title="Уроки"
              subtitle="Интерактивные уроки"
              icon="book"
              color="#4A90D9"
              onPress={() => router.push('/lessons')}
            />
            <MenuCard
              title="Задачи"
              subtitle="Практические задания"
              icon="calculator"
              color="#E74C3C"
              onPress={() => router.push('/tasks')}
            />
          </View>
          <View style={styles.menuRow}>
            <MenuCard
              title="Тесты"
              subtitle="Проверка знаний"
              icon="checkbox"
              color="#1ABC9C"
              onPress={() => router.push('/tests')}
            />
            <MenuCard
              title="Формулы"
              subtitle="Справочник"
              icon="flask"
              color="#9B59B6"
              onPress={() => router.push('/formulas')}
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
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
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
