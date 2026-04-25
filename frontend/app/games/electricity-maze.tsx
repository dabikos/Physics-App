import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CircuitElement {
  id: string;
  type: 'battery' | 'bulb' | 'resistor' | 'switch' | 'wire';
  x: number;
  y: number;
  connected: boolean;
  active?: boolean;
}

interface WireConnection {
  id: string;
  from: string;
  to: string;
  active: boolean;
}

export default function ElectricityMazeGame() {
  const router = useRouter();
  const { t } = useTranslation();
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [draggingWire, setDraggingWire] = useState<{ from: string; x: number; y: number } | null>(null);
  const [circuitComplete, setCircuitComplete] = useState(false);
  const [currentFlow, setCurrentFlow] = useState(false);
  
  // Анимация тока
  const currentAnimation = useRef(new Animated.Value(0)).current;
  const bulbGlow = useRef(new Animated.Value(0)).current;

  // Элементы цепи
  const [elements, setElements] = useState<CircuitElement[]>([
    { id: 'battery', type: 'battery', x: 50, y: SCREEN_HEIGHT / 2, connected: true, active: true },
    { id: 'resistor1', type: 'resistor', x: SCREEN_WIDTH / 3, y: SCREEN_HEIGHT / 3, connected: false },
    { id: 'switch1', type: 'switch', x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2, connected: false },
    { id: 'resistor2', type: 'resistor', x: (SCREEN_WIDTH * 2) / 3, y: SCREEN_HEIGHT / 3, connected: false },
    { id: 'bulb', type: 'bulb', x: SCREEN_WIDTH - 100, y: SCREEN_HEIGHT / 2, connected: false },
  ]);

  const [wires, setWires] = useState<WireConnection[]>([]);

  // Таймер
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameOver]);

  // Анимация тока
  useEffect(() => {
    if (circuitComplete && gameStarted) {
      // Анимация тока по проводам
      Animated.loop(
        Animated.sequence([
          Animated.timing(currentAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(currentAnimation, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
          }),
        ])
      ).start();

      // Анимация свечения лампочки
      Animated.loop(
        Animated.sequence([
          Animated.timing(bulbGlow, {
            toValue: 1,
            duration: 500,
            useNativeDriver: false,
          }),
          Animated.timing(bulbGlow, {
            toValue: 0.7,
            duration: 500,
            useNativeDriver: false,
          }),
        ])
      ).start();

      setCurrentFlow(true);
    } else {
      currentAnimation.setValue(0);
      bulbGlow.setValue(0);
      setCurrentFlow(false);
    }
  }, [bulbGlow, circuitComplete, currentAnimation, gameStarted]);

  const checkCircuitPath = useCallback((from: string, to: string): boolean => {
    const visited = new Set<string>();
    const queue = [from];
    visited.add(from);

    while (queue.length > 0) {
      const current = queue.shift()!;
      
      if (current === to) return true;

      // Находим все соединения из текущего элемента
      const connections = wires.filter(
        (w) => w.active && (w.from === current || w.to === current)
      );

      for (const conn of connections) {
        const next = conn.from === current ? conn.to : conn.from;
        if (!visited.has(next)) {
          visited.add(next);
          queue.push(next);
        }
      }
    }

    return false;
  }, [wires]);

  // Проверка завершения цепи
  useEffect(() => {
    const battery = elements.find((e) => e.id === 'battery');
    const bulb = elements.find((e) => e.id === 'bulb');
    
    if (battery && bulb) {
      // Проверяем, есть ли путь от батареи до лампочки
      const pathExists = checkCircuitPath('battery', 'bulb');
      setCircuitComplete(pathExists);
      
      if (pathExists && !circuitComplete) {
        setScore((prev) => prev + 50);
      }
    }
  }, [checkCircuitPath, circuitComplete, elements]);

  const handleElementPress = (elementId: string) => {
    if (!gameStarted || gameOver) return;

    const element = elements.find((e) => e.id === elementId);
    if (!element || element.type === 'battery' || element.type === 'bulb') return;

    // Переключаем состояние элемента
    if (element.type === 'switch') {
      setElements((prev) =>
        prev.map((e) =>
          e.id === elementId ? { ...e, active: !e.active } : e
        )
      );
    }
  };

  const handleElementLongPress = (elementId: string) => {
    if (!gameStarted || gameOver || draggingWire) return;

    const element = elements.find((e) => e.id === elementId);
    if (!element || element.type === 'battery' || element.type === 'bulb') return;

    setDraggingWire({ from: elementId, x: element.x, y: element.y });
    setSelectedElement(elementId);
  };

  const handleWireDrop = (targetElementId: string) => {
    if (!draggingWire || draggingWire.from === targetElementId) {
      setDraggingWire(null);
      setSelectedElement(null);
      return;
    }

    // Проверяем, нет ли уже такого соединения
    const existingWire = wires.find(
      (w) =>
        (w.from === draggingWire.from && w.to === targetElementId) ||
        (w.from === targetElementId && w.to === draggingWire.from)
    );

    if (!existingWire) {
      // Создаем новое соединение
      const newWire: WireConnection = {
        id: `wire-${Date.now()}`,
        from: draggingWire.from,
        to: targetElementId,
        active: true,
      };

      setWires([...wires, newWire]);
      setScore((prev) => prev + 10);
    }

    setDraggingWire(null);
    setSelectedElement(null);
  };

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setTimeLeft(60);
    setWires([]);
    setCircuitComplete(false);
    setCurrentFlow(false);
    setElements((prev) =>
      prev.map((e) => ({
        ...e,
        connected: e.id === 'battery',
        active: e.id === 'battery' || (e.type === 'switch' ? false : undefined),
      }))
    );
  };

  const stopGame = () => {
    setGameStarted(false);
    setWires([]);
    setCircuitComplete(false);
    setCurrentFlow(false);
  };

  const getElementIcon = (element: CircuitElement) => {
    switch (element.type) {
      case 'battery':
        return 'battery-charging';
      case 'bulb':
        return 'bulb';
      case 'resistor':
        return 'remove';
      case 'switch':
        return element.active ? 'toggle' : 'toggle-outline';
      default:
        return 'flash';
    }
  };

  const getElementColor = (element: CircuitElement) => {
    if (element.type === 'bulb' && circuitComplete) {
      return '#FFD700';
    }
    if (element.type === 'battery') {
      return '#10B981';
    }
    if (element.type === 'switch' && element.active) {
      return '#10B981';
    }
    if (selectedElement === element.id) {
      return '#667EEA';
    }
    return '#6B7280';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Градиентный фон */}
      <LinearGradient
        colors={['#1E3A8A', '#3B82F6', '#60A5FA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Хедер с кнопкой назад, счетом и таймером */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              stopGame();
              router.back();
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="trophy" size={18} color="#FFD700" />
              <Text style={styles.statText}>{score}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time" size={18} color="#FFFFFF" />
              <Text style={styles.statText}>{timeLeft}s</Text>
            </View>
          </View>
        </View>

        {/* Игровая область */}
        <View style={styles.gameArea}>
          {/* Провода - рисуем под элементами */}
          <View style={styles.wiresContainer} pointerEvents="none">
            <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT} style={styles.svg}>
              {wires.map((wire) => {
                const fromElement = elements.find((e) => e.id === wire.from);
                const toElement = elements.find((e) => e.id === wire.to);
                
                if (!fromElement || !toElement) return null;

                const isActive = wire.active && 
                  (wire.from === 'battery' || checkCircuitPath('battery', wire.from));

                // Рисуем обводку для лучшей видимости на синем фоне
                return (
                  <React.Fragment key={wire.id}>
                    {/* Тень/обводка для контраста */}
                    <Path
                      d={`M ${fromElement.x} ${fromElement.y} L ${toElement.x} ${toElement.y}`}
                      stroke="#000000"
                      strokeWidth={isActive && currentFlow ? 8 : 7}
                      opacity={0.4}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Основной провод - яркий белый для контраста */}
                    <Path
                      d={`M ${fromElement.x} ${fromElement.y} L ${toElement.x} ${toElement.y}`}
                      stroke={isActive && currentFlow ? '#FFD700' : '#FFFFFF'}
                      strokeWidth={isActive && currentFlow ? 6 : 5}
                      strokeDasharray={isActive && currentFlow ? '8,4' : '0'}
                      opacity={1}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </React.Fragment>
                );
              })}

              {/* Провод при перетаскивании */}
              {draggingWire && elements.map((element) => {
                if (element.id === draggingWire.from) return null;
                return (
                  <Path
                    key={`temp-${element.id}`}
                    d={`M ${draggingWire.x} ${draggingWire.y} L ${element.x} ${element.y}`}
                    stroke="#FFD700"
                    strokeWidth={4}
                    strokeDasharray="8,4"
                    opacity={0.8}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                );
              })}
            </Svg>
          </View>

          {/* Элементы цепи */}
          {elements.map((element) => {
            const isSelected = selectedElement === element.id;
            const isHovered = draggingWire && draggingWire.from !== element.id;
            const elementColor = getElementColor(element);

            return (
              <TouchableOpacity
                key={element.id}
                style={[
                  styles.elementContainer,
                  {
                    left: element.x - 30,
                    top: element.y - 30,
                  },
                  isSelected && styles.elementSelected,
                  isHovered && styles.elementHovered,
                ]}
                onPress={() => {
                  if (draggingWire) {
                    handleWireDrop(element.id);
                  } else {
                    handleElementPress(element.id);
                  }
                }}
                onLongPress={() => {
                  if (!draggingWire) {
                    handleElementLongPress(element.id);
                  }
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    element.type === 'bulb' && circuitComplete
                      ? ['#FFD700', '#FFA500']
                      : element.type === 'battery'
                      ? ['#10B981', '#059669']
                      : ['#6B7280', '#4B5563']
                  }
                  style={[
                    styles.element,
                    { backgroundColor: elementColor },
                    element.type === 'bulb' && circuitComplete && {
                      shadowColor: '#FFD700',
                      shadowRadius: 20,
                      shadowOpacity: 1,
                    },
                  ]}
                >
                  <Ionicons
                    name={getElementIcon(element)}
                    size={element.type === 'bulb' ? 32 : 24}
                    color="#FFFFFF"
                  />
                </LinearGradient>
                
                {/* Подпись элемента */}
                <Text style={styles.elementLabel}>
                  {element.type === 'battery' && t('games.battery')}
                  {element.type === 'bulb' && t('games.bulb')}
                  {element.type === 'resistor' && t('games.resistor')}
                  {element.type === 'switch' && t('games.switch')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Инструкция */}
        {!gameStarted && !gameOver && (
          <View style={styles.instructionOverlay}>
            <View style={styles.instructionCard}>
              <View style={styles.instructionIcon}>
                <Ionicons name="flash" size={60} color="#3B82F6" />
              </View>
              <Text style={styles.instructionTitle}>{t('games.electricityMaze')}</Text>
              <Text style={styles.instructionText}>
                {t('games.electricityMazeDesc')}
              </Text>
              <TouchableOpacity
                style={styles.startButton}
                onPress={startGame}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#3B82F6', '#1E3A8A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.startButtonGradient}
                >
                  <Ionicons name="play" size={24} color="#FFFFFF" />
                  <Text style={styles.startButtonText}>{t('common.startGame')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Экран окончания игры */}
        {gameOver && (
          <View style={styles.gameOverOverlay}>
            <View style={styles.gameOverCard}>
              <View style={styles.gameOverIcon}>
                <Ionicons name="trophy" size={60} color="#FFD700" />
              </View>
              <Text style={styles.gameOverTitle}>{t('common.gameOver')}!</Text>
              <Text style={styles.gameOverScore}>{t('common.yourScore', { score })}</Text>
              <View style={styles.gameOverButtons}>
                <TouchableOpacity
                  style={styles.restartButton}
                  onPress={startGame}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['#3B82F6', '#1E3A8A']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.restartButtonGradient}
                  >
                    <Ionicons name="refresh" size={20} color="#FFFFFF" />
                    <Text style={styles.restartButtonText}>{t('common.playAgain')}</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => {
                    stopGame();
                    router.back();
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.menuButtonText}>{t('common.toMenu')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Индикатор успеха */}
        {circuitComplete && gameStarted && (
          <View style={styles.successIndicator}>
            <Animated.View
              style={[
                styles.successGlow,
                {
                  opacity: bulbGlow,
                  transform: [
                    {
                      scale: bulbGlow.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.2],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Ionicons name="checkmark-circle" size={40} color="#10B981" />
            </Animated.View>
            <Text style={styles.successText}>{t('games.circuitClosed')}</Text>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  gameArea: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
  wiresContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  elementContainer: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    zIndex: 2,
  },
  elementSelected: {
    transform: [{ scale: 1.2 }],
    zIndex: 3,
  },
  elementHovered: {
    transform: [{ scale: 1.1 }],
    zIndex: 2,
  },
  element: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  elementLabel: {
    marginTop: 4,
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  instructionOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 100,
    elevation: 100,
  },
  instructionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: SCREEN_WIDTH - 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  instructionIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3B82F620',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  instructionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  startButton: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  gameOverOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    zIndex: 100,
    elevation: 100,
  },
  gameOverCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: SCREEN_WIDTH - 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  gameOverIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFD70020',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  gameOverTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 12,
  },
  gameOverScore: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 32,
  },
  gameOverButtons: {
    width: '100%',
    gap: 12,
  },
  restartButton: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
  },
  restartButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  restartButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  menuButton: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  menuButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  successIndicator: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  successGlow: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 30,
    padding: 8,
  },
  successText: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});
