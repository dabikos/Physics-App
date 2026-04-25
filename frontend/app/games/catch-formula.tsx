import React, { useState, useEffect, useRef } from 'react';
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
import { useTranslation } from 'react-i18next';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FallingBlock {
  id: string;
  value: string;
  isCorrect: boolean;
  position: Animated.ValueXY;
  opacity: Animated.Value;
  scale: Animated.Value;
}

interface GameFormula {
  formula: string;
  missingPart: string;
  correctAnswer: string;
  wrongAnswers: string[];
}

const GAME_FORMULAS: GameFormula[] = [
  {
    formula: 'F = m * _',
    missingPart: 'a',
    correctAnswer: 'a',
    wrongAnswers: ['v', 't', 's', 'g', 'h'],
  },
  {
    formula: 'E = m * _²',
    missingPart: 'c',
    correctAnswer: 'c',
    wrongAnswers: ['v', 'a', 'F', 'g', 'h'],
  },
  {
    formula: 'P = _ / t',
    missingPart: 'W',
    correctAnswer: 'W',
    wrongAnswers: ['F', 'E', 'm', 'Q', 'A'],
  },
  {
    formula: 'V = _ * t',
    missingPart: 'a',
    correctAnswer: 'a',
    wrongAnswers: ['F', 'm', 'E', 'g', 'v₀'],
  },
  {
    formula: 'S = v * _',
    missingPart: 't',
    correctAnswer: 't',
    wrongAnswers: ['a', 'm', 'F', 's', 'h'],
  },
  {
    formula: 'E = _ * v² / 2',
    missingPart: 'm',
    correctAnswer: 'm',
    wrongAnswers: ['F', 'a', 't', 'g', 'h'],
  },
  {
    formula: 'Q = _ * c * ΔT',
    missingPart: 'm',
    correctAnswer: 'm',
    wrongAnswers: ['F', 'E', 'P', 'V', 't'],
  },
  {
    formula: 'p = _ / S',
    missingPart: 'F',
    correctAnswer: 'F',
    wrongAnswers: ['m', 'a', 'E', 'P', 'V'],
  },
  {
    formula: 'I = _ / R',
    missingPart: 'U',
    correctAnswer: 'U',
    wrongAnswers: ['P', 'Q', 'E', 'W', 'A'],
  },
  {
    formula: 'A = F * _',
    missingPart: 's',
    correctAnswer: 's',
    wrongAnswers: ['t', 'v', 'a', 'm', 'h'],
  },
  {
    formula: 'ω = 2π * _',
    missingPart: 'f',
    correctAnswer: 'f',
    wrongAnswers: ['T', 'v', 'a', 'r', 't'],
  },
  {
    formula: 'F = k * _',
    missingPart: 'x',
    correctAnswer: 'x',
    wrongAnswers: ['m', 'a', 'v', 't', 's'],
  },
  {
    formula: 'ρ = _ / V',
    missingPart: 'm',
    correctAnswer: 'm',
    wrongAnswers: ['F', 'P', 'E', 'Q', 'A'],
  },
  {
    formula: 'T = 2π * √(_ / k)',
    missingPart: 'm',
    correctAnswer: 'm',
    wrongAnswers: ['F', 'a', 'v', 'x', 't'],
  },
  {
    formula: 'E = _ * h',
    missingPart: 'f',
    correctAnswer: 'f',
    wrongAnswers: ['m', 'c', 'v', 'λ', 'T'],
  },
];

export default function CatchFormulaGame() {
  const router = useRouter();
  const { t } = useTranslation();
  const [score, setScore] = useState(0);
  const [currentFormula, setCurrentFormula] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [fallingBlocks, setFallingBlocks] = useState<FallingBlock[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const blockIdCounter = useRef(0);
  const currentFormulaRef = useRef(0); // Ref для актуального значения формулы

  // Получаем текущую формулу (обновляется при изменении currentFormula)
  const formula = GAME_FORMULAS[currentFormula % GAME_FORMULAS.length];

  // Создание нового падающего блока с проверкой наложения
  const createFallingBlock = (isCorrect: boolean, value: string, existingBlocks: FallingBlock[] = [], blockIndex: number = 0): FallingBlock => {
    const id = `block-${blockIdCounter.current++}`;
    const blockWidth = 70;
    const padding = 20;
    
    // Используем равномерное распределение для предотвращения наложения
    const totalBlocks = existingBlocks.length + 1; // +1 для нового блока
    const availableWidth = SCREEN_WIDTH - blockWidth - padding * 2;
    
    // Распределяем блоки равномерно по ширине экрана
    let startX: number;
    if (totalBlocks === 1) {
      // Если это первый блок, размещаем его в случайном месте
      startX = Math.random() * availableWidth + padding;
    } else {
      // Равномерное распределение
      const spacing = availableWidth / (totalBlocks + 1);
      startX = padding + spacing * (blockIndex + 1) + (Math.random() - 0.5) * (spacing * 0.3); // Небольшое случайное смещение
      
      // Ограничиваем в пределах экрана
      startX = Math.max(padding, Math.min(SCREEN_WIDTH - blockWidth - padding, startX));
    }
    
    return {
      id,
      value,
      isCorrect,
      position: new Animated.ValueXY({ x: startX, y: -100 }),
      opacity: new Animated.Value(1),
      scale: new Animated.Value(1),
    };
  };

  // Анимация падения блока
  const animateBlock = (block: FallingBlock) => {
    const fallDuration = 6000 + Math.random() * 4000; // 6-10 секунд (в 2 раза медленнее)

    Animated.parallel([
      Animated.timing(block.position.y, {
        toValue: SCREEN_HEIGHT + 100,
        duration: fallDuration,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(block.opacity, {
          toValue: 0.7,
          duration: fallDuration * 0.5,
          useNativeDriver: true,
        }),
        Animated.timing(block.opacity, {
          toValue: 1,
          duration: fallDuration * 0.5,
          useNativeDriver: true,
        }),
      ]),
    ]).start(({ finished }) => {
      if (finished) {
        // Проверяем, упал ли правильный блок ниже границы
        if (block.isCorrect && !selectedBlock && !gameOver) {
          // Правильный блок упал - игра окончена
          setGameOver(true);
          if (gameLoopRef.current) {
            clearInterval(gameLoopRef.current);
            gameLoopRef.current = null;
          }
        }
        // Удаляем блок
        setFallingBlocks((prev) => prev.filter((b) => b.id !== block.id));
      }
    });
  };

  // Запуск игры
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setCurrentFormula(0);
    currentFormulaRef.current = 0;
    setFallingBlocks([]);
    setSelectedBlock(null);
    blockIdCounter.current = 0;

    const currentFormulaData = GAME_FORMULAS[0];
    
    // Создаем сразу 2-3 блока (1 правильный + 1-2 неправильных)
    const initialBlocks: FallingBlock[] = [];
    
    // Всегда добавляем правильный ответ
    initialBlocks.push(createFallingBlock(true, currentFormulaData.correctAnswer, initialBlocks, 0));
    
    // Добавляем 1-2 неправильных ответа
    const wrongCount = Math.floor(Math.random() * 2) + 1; // 1 или 2
    const shuffledWrong = [...currentFormulaData.wrongAnswers].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < wrongCount && i < shuffledWrong.length; i++) {
      initialBlocks.push(createFallingBlock(false, shuffledWrong[i], initialBlocks, i + 1));
    }

    setFallingBlocks(initialBlocks);
    initialBlocks.forEach(block => animateBlock(block));

    // Игровой цикл - создаем новые блоки группами по 2-3
    gameLoopRef.current = setInterval(() => {
      setFallingBlocks((prev) => {
        if (prev.length >= 8) return prev; // Максимум 8 блоков на экране

        // Используем ref для получения актуального значения формулы
        const currentFormulaData = GAME_FORMULAS[currentFormulaRef.current % GAME_FORMULAS.length];
        const newBlocks: FallingBlock[] = [];
        const totalNewBlocks = 2 + Math.floor(Math.random() * 2); // 2 или 3 блока
        
        // Всегда добавляем правильный ответ
        newBlocks.push(createFallingBlock(true, currentFormulaData.correctAnswer, [...prev, ...newBlocks], 0));
        
        // Добавляем 1-2 неправильных ответа
        const wrongCount = totalNewBlocks - 1; // Остальные блоки - неправильные
        const shuffledWrong = [...currentFormulaData.wrongAnswers].sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < wrongCount && i < shuffledWrong.length; i++) {
          newBlocks.push(createFallingBlock(false, shuffledWrong[i], [...prev, ...newBlocks], i + 1));
        }

        // Анимируем все новые блоки
        newBlocks.forEach(block => animateBlock(block));
        
        return [...prev, ...newBlocks];
      });
    }, 2500); // Новая группа блоков каждые 2.5 секунды
  };

  // Обработка выбора блока
  const handleBlockPress = (block: FallingBlock) => {
    if (selectedBlock || gameOver) return;

    setSelectedBlock(block.id);

    // Анимация выбора
    Animated.parallel([
      Animated.spring(block.scale, {
        toValue: 1.3,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(block.opacity, {
        toValue: 0.5,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Проверка ответа
    setTimeout(() => {
      if (block.isCorrect) {
        setScore((prev) => prev + 10);
        // Переход к следующей формуле
        setTimeout(() => {
          setCurrentFormula((prev) => {
            const nextFormula = prev + 1;
            currentFormulaRef.current = nextFormula; // Обновляем ref
            // Очищаем все блоки и создаем новые для следующей формулы
            setFallingBlocks([]);
            setSelectedBlock(null);
            blockIdCounter.current = 0;
            
            // Создаем новые блоки для следующей формулы
            const nextFormulaData = GAME_FORMULAS[nextFormula % GAME_FORMULAS.length];
            const newBlocks: FallingBlock[] = [];
            
            // Всегда добавляем правильный ответ
            newBlocks.push(createFallingBlock(true, nextFormulaData.correctAnswer, newBlocks, 0));
            
            // Добавляем 1-2 неправильных ответа
            const wrongCount = Math.floor(Math.random() * 2) + 1;
            const shuffledWrong = [...nextFormulaData.wrongAnswers].sort(() => Math.random() - 0.5);
            
            for (let i = 0; i < wrongCount && i < shuffledWrong.length; i++) {
              newBlocks.push(createFallingBlock(false, shuffledWrong[i], newBlocks, i + 1));
            }

            setFallingBlocks(newBlocks);
            newBlocks.forEach(b => animateBlock(b));
            
            return nextFormula;
          });
        }, 500);
      } else {
        // Неправильный ответ - игра окончена
        setGameOver(true);
        if (gameLoopRef.current) {
          clearInterval(gameLoopRef.current);
          gameLoopRef.current = null;
        }
      }
    }, 300);
  };

  // Остановка игры
  const stopGame = () => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    setGameStarted(false);
    setFallingBlocks([]);
  };

  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Градиентный фон */}
      <LinearGradient
        colors={['#667EEA', '#764BA2', '#F093FB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Хедер с кнопкой назад и счетом */}
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
          
          <View style={styles.scoreContainer}>
            <Ionicons name="trophy" size={20} color="#FFD700" />
            <Text style={styles.scoreText}>{score}</Text>
          </View>
        </View>

        {/* Формула с пропуском */}
        <View style={styles.formulaContainer}>
          <View style={styles.formulaCard}>
            <Text style={styles.formulaLabel}>{t('games.fillBlank')}</Text>
            <Text style={styles.formulaText}>
              {formula.formula.replace('_', '?')}
            </Text>
            <View style={styles.formulaHint}>
              <Ionicons name="bulb" size={16} color="#FFD700" />
              <Text style={styles.formulaHintText}>
                {t('games.catchFormulaDesc')}
              </Text>
            </View>
          </View>
        </View>

        {/* Игровая область */}
        <View style={styles.gameArea}>
          {fallingBlocks.map((block) => (
            <Animated.View
              key={block.id}
              style={[
                styles.fallingBlock,
                {
                  transform: [
                    { translateX: block.position.x },
                    { translateY: block.position.y },
                    { scale: block.scale },
                  ],
                  opacity: block.opacity,
                  backgroundColor: '#667EEA', // Единый цвет для всех блоков
                },
              ]}
            >
              <TouchableOpacity
                style={styles.blockTouchable}
                onPress={() => handleBlockPress(block)}
                activeOpacity={0.8}
              >
                <Text style={styles.blockText}>{block.value}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Экран начала игры */}
        {!gameStarted && !gameOver && (
          <View style={styles.startScreen}>
            <View style={styles.startCard}>
              <View style={styles.startIcon}>
                <Ionicons name="flash" size={60} color="#667EEA" />
              </View>
              <Text style={styles.startTitle}>{t('games.catchFormula')}!</Text>
              <Text style={styles.startDescription}>
                {t('games.catchFormulaDesc')}
              </Text>
              <TouchableOpacity
                style={styles.startButton}
                onPress={startGame}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#667EEA', '#764BA2']}
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
          <View style={styles.gameOverScreen}>
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
                    colors={['#667EEA', '#764BA2']}
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
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  formulaContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  formulaCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  formulaLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    fontWeight: '600',
  },
  formulaText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  formulaHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  formulaHintText: {
    fontSize: 13,
    color: '#92400E',
    fontWeight: '500',
  },
  gameArea: {
    flex: 1,
    position: 'relative',
  },
  fallingBlock: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  blockTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  startScreen: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  startCard: {
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
  startIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#667EEA20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  startTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 12,
  },
  startDescription: {
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
  gameOverScreen: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
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
    color: '#667EEA',
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
});
