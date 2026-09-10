import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Keyboard,
  Platform,
  LayoutChangeEvent,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { claimRewardedChatCredit, ChatQuota, getChatQuota, sendChatMessage } from '../../src/services/aiService';
import { MathText } from '../../src/components/MathText';
import { useTheme } from '../../src/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../src/context/LanguageContext';
import { CHAT_REWARDED_AD_UNIT_ID, initializeMobileAds, showRewardedChatAd } from '../../src/services/adService';
import { logAIChatSent } from '../../src/services/analyticsService';

const triggerHaptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
  try {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(style);
    }
  } catch {}
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ prompt?: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [containerHeight, setContainerHeight] = useState<number | null>(null);
  const initialContainerHeight = useRef<number | null>(null);
  const [chatQuota, setChatQuota] = useState<ChatQuota | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const { getAILanguageName } = useLanguage();
  const insets = useSafeAreaInsets();

  const tabBarBottomOffset = insets.bottom;
  const tabBarHeight = 64;
  const chatBottomClearance = tabBarBottomOffset + tabBarHeight;
  const inputDockGap = 10;
  const defaultBottomMargin = chatBottomClearance + inputDockGap;

  const bottomAnim = useRef(new Animated.Value(defaultBottomMargin)).current;

  const isWindowResized =
    initialContainerHeight.current !== null &&
    containerHeight !== null &&
    initialContainerHeight.current - containerHeight > 100;

  const starterPrompts = [
    {
      icon: 'flash-outline' as const,
      gradient: ['#3B82F6', '#1D4ED8'] as [string, string],
      title: t('aiChat.starter1_title', { defaultValue: 'Закон Ома' }),
      subtitle: t('aiChat.starter1_subtitle', { defaultValue: 'Объясни закон Ома простыми словами' }),
      query: t('aiChat.starter1_query', { defaultValue: 'Объясни закон Ома простыми словами и приведи формулу' }),
    },
    {
      icon: 'planet-outline' as const,
      gradient: ['#8B5CF6', '#6D28D9'] as [string, string],
      title: t('aiChat.starter2_title', { defaultValue: 'Гравитация' }),
      subtitle: t('aiChat.starter2_subtitle', { defaultValue: 'Почему планеты вращаются вокруг Солнца?' }),
      query: t('aiChat.starter2_query', { defaultValue: 'Почему планеты вращаются вокруг Солнца и не падают на него?' }),
    },
    {
      icon: 'speedometer-outline' as const,
      gradient: ['#EC4899', '#BE185D'] as [string, string],
      title: t('aiChat.starter3_title', { defaultValue: '2-й закон Ньютона' }),
      subtitle: t('aiChat.starter3_subtitle', { defaultValue: 'Как ускорение связано с силой?' }),
      query: t('aiChat.starter3_query', { defaultValue: 'Объясни второй закон Ньютона и покажи пример решения задачи' }),
    },
    {
      icon: 'calculator-outline' as const,
      gradient: ['#10B981', '#047857'] as [string, string],
      title: t('aiChat.starter4_title', { defaultValue: 'Решить задачу' }),
      subtitle: t('aiChat.starter4_subtitle', { defaultValue: 'Помощь с пошаговым решением' }),
      query: t('aiChat.starter4_query', { defaultValue: 'Помоги мне пошагово решить физическую задачу' }),
    },
  ];

  useEffect(() => {
    if (!isKeyboardVisible) {
      bottomAnim.setValue(defaultBottomMargin);
    }
  }, [defaultBottomMargin, isKeyboardVisible]);

  useEffect(() => {
    if (params.prompt && typeof params.prompt === 'string') {
      setInputText(params.prompt);
    }
  }, [params.prompt]);

  useEffect(() => {
    initializeMobileAds().catch(() => {});
    getChatQuota().then((result) => {
      if (result.success && result.quota) {
        setChatQuota(result.quota);
      }
    });
  }, []);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      const h = e?.endCoordinates?.height || 0;
      if (h > 0) {
        setKeyboardHeight(h);
      }
      setIsKeyboardVisible(true);

      let targetOffset: number;
      if (Platform.OS === 'ios') {
        // On iOS, the keyboard rises from the physical bottom of the screen.
        // Dock sits neatly 10px above the top edge of the keyboard.
        targetOffset = (h > 0 ? h : 336) + 10;
      } else {
        // Android:
        if (isWindowResized) {
          targetOffset = 16;
        } else {
          const bottomNav = insets.bottom > 0 ? insets.bottom : 28;
          targetOffset = (h > 0 ? h : 320) + bottomNav + 16;
        }
      }

      Animated.timing(bottomAnim, {
        toValue: targetOffset,
        duration: Platform.OS === 'ios' ? (e?.duration || 250) : 150,
        useNativeDriver: false,
      }).start();

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    const hideSub = Keyboard.addListener(hideEvent, (e) => {
      setKeyboardHeight(0);
      setIsKeyboardVisible(false);

      Animated.timing(bottomAnim, {
        toValue: defaultBottomMargin,
        duration: Platform.OS === 'ios' ? (e?.duration || 250) : 150,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [defaultBottomMargin, insets.bottom, isWindowResized]);

  const scrollToEnd = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 250);
  };

  const sendPreparedMessage = async (rawText: string) => {
    if (!rawText.trim()) return;

    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    logAIChatSent(rawText.length);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: rawText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    scrollToEnd();

    const history: ChatHistoryMessage[] = messages.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const result = await sendChatMessage(userMessage.content, history, getAILanguageName());

    if (result.success) {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      if (result.quota) setChatQuota(result.quota);
      setIsLoading(false);
      scrollToEnd();
      return;
    }

    if (result.errorCode === 'CHAT_LIMIT_REACHED') {
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
      if (result.quota) setChatQuota(result.quota);
      setInputText(userMessage.content);
      setIsLoading(false);

      Alert.alert(
        t('aiChat.limitTitle', { defaultValue: 'Лимит AI-чата' }),
        t('aiChat.limitMessage', { defaultValue: '3 бесплатных сообщения на сегодня закончились. Посмотреть короткую рекламу и отправить сообщение?' }),
        [
          { text: t('common.cancel', { defaultValue: 'Отмена' }), style: 'cancel' },
          {
            text: t('aiChat.watchAd', { defaultValue: 'Смотреть рекламу' }),
            onPress: async () => {
              setIsLoading(true);
              const watched = await showRewardedChatAd();
              if (!watched) {
                setIsLoading(false);
                Alert.alert(t('aiChat.adNotFinishedTitle', { defaultValue: 'Реклама не досмотрена' }), t('aiChat.adNotFinishedMessage', { defaultValue: 'Чтобы отправить сообщение, нужно досмотреть рекламу.' }));
                return;
              }

              const claim = await claimRewardedChatCredit(CHAT_REWARDED_AD_UNIT_ID);
              if (!claim.success) {
                setIsLoading(false);
                Alert.alert(t('common.error', { defaultValue: 'Ошибка' }), claim.error || t('aiChat.rewardClaimError', { defaultValue: 'Не удалось начислить попытку.' }));
                return;
              }

              if (claim.quota) setChatQuota(claim.quota);
              await sendPreparedMessage(userMessage.content);
            },
          },
        ]
      );
      return;
    }

    const errorMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: `⚠️ ${result.error || t('aiChat.errorConnection', { defaultValue: 'Ошибка соединения' })}`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, errorMessage]);
    setIsLoading(false);
    scrollToEnd();
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;
    const textToSend = inputText.trim();
    setInputText('');
    await sendPreparedMessage(textToSend);
  };

  const handleStarterPress = (query: string) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    setInputText(query);
  };

  // User Message
  const renderUserMessage = (message: Message) => {
    return (
      <View key={message.id} style={styles.userMessageContainer}>
        <LinearGradient
          colors={['#4F46E5', '#6366F1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.userBubble}
        >
          <Text style={styles.userText}>{message.content}</Text>
        </LinearGradient>
      </View>
    );
  };

  // Assistant Message
  const renderAssistantMessage = (message: Message) => {
    return (
      <View key={message.id} style={styles.assistantMessageContainer}>
        <View style={styles.assistantHeader}>
          <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.assistantAvatarCircle}
          >
            <Ionicons name="sparkles" size={13} color="#FFFFFF" />
          </LinearGradient>
          <Text style={[styles.assistantName, { color: colors.text }]}>Физика AI</Text>
          <View style={[styles.assistantBadge, { backgroundColor: colors.accentLight }]}>
            <Text style={[styles.assistantBadgeText, { color: colors.accent }]}>LaTeX</Text>
          </View>
        </View>

        <View
          style={[
            styles.assistantBubble,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              shadowColor: colors.shadowColor,
            },
          ]}
        >
          <MathText
            content={message.content}
            textColor={colors.text}
            fontSize={15}
            backgroundColor={colors.card}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
      onLayout={(e: LayoutChangeEvent) => {
        const { height } = e.nativeEvent.layout;
        if (initialContainerHeight.current === null || initialContainerHeight.current === 0) {
          initialContainerHeight.current = height;
        }
        setContainerHeight(height);
      }}
    >
      <View style={{ flex: 1 }}>
        {/* ==================== Top Header ==================== */}
      <View style={[styles.topHeader, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <LinearGradient
            colors={['#6366F1', '#A855F7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerBotAvatar}
          >
            <Ionicons name="sparkles" size={18} color="#FFFFFF" />
          </LinearGradient>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {t('aiChat.title', { defaultValue: 'AI Помощник' })}
            </Text>
            <View style={styles.statusIndicatorRow}>
              <View style={styles.onlineDot} />
              <Text style={[styles.statusText, { color: colors.textTertiary }]}>
                {t('aiChat.engine', { defaultValue: 'Физический движок GPT-4o' })}
              </Text>
            </View>
          </View>
        </View>

        {chatQuota && (
          <View style={[styles.quotaPill, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
            <Ionicons name="flash" size={12} color="#F59E0B" />
            <Text style={[styles.quotaPillText, { color: colors.textSecondary }]}>
              {chatQuota.free_remaining > 0
                ? `${chatQuota.free_remaining} ${t('aiChat.remaining', { defaultValue: 'ост.' })}`
                : `+${chatQuota.rewarded_credits}`}
            </Text>
          </View>
        )}
      </View>

      {/* ==================== Chat Content Area ==================== */}
      <View style={styles.chatArea}>
        {messages.length === 0 ? (
          <ScrollView
            style={styles.emptyScroll}
            contentContainerStyle={styles.emptyScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <View style={styles.emptyHero}>
              <LinearGradient
                colors={['#6366F1', '#8B5CF6', '#A855F7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.emptyHeroIconBadge}
              >
                <Ionicons name="sparkles" size={32} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[styles.emptyHeroTitle, { color: colors.text }]}>
                {t('aiChat.emptyTitle', { defaultValue: 'Чем могу помочь по физике?' })}
              </Text>
              <Text style={[styles.emptyHeroSubtitle, { color: colors.textTertiary }]}>
                {t('aiChat.emptySubtitle', {
                  defaultValue: 'Задай вопрос, отправь условие сложной задачи или попроси объяснить любую формулу.',
                })}
              </Text>
            </View>

            <View style={styles.startersGrid}>
              <Text style={[styles.startersTitle, { color: colors.textSecondary }]}>
                {t('aiChat.startersTitle', { defaultValue: '💡 Популярные темы для старта:' })}
              </Text>

              <View style={styles.startersRow}>
                {starterPrompts.slice(0, 2).map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.starterCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        shadowColor: colors.shadowColor,
                      },
                    ]}
                    onPress={() => handleStarterPress(item.query)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={item.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.starterIconGradient}
                    >
                      <Ionicons name={item.icon} size={18} color="#FFFFFF" />
                    </LinearGradient>
                    <Text style={[styles.starterCardTitle, { color: colors.text }]}>{item.title}</Text>
                    <Text style={[styles.starterCardSubtitle, { color: colors.textTertiary }]} numberOfLines={2}>
                      {item.subtitle}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.startersRow}>
                {starterPrompts.slice(2, 4).map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.starterCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        shadowColor: colors.shadowColor,
                      },
                    ]}
                    onPress={() => handleStarterPress(item.query)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={item.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.starterIconGradient}
                    >
                      <Ionicons name={item.icon} size={18} color="#FFFFFF" />
                    </LinearGradient>
                    <Text style={[styles.starterCardTitle, { color: colors.text }]}>{item.title}</Text>
                    <Text style={[styles.starterCardSubtitle, { color: colors.textTertiary }]} numberOfLines={2}>
                      {item.subtitle}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            {messages.map((m) =>
              m.role === 'user' ? renderUserMessage(m) : renderAssistantMessage(m)
            )}

            {isLoading && (
              <View style={styles.typingContainer}>
                <View style={[styles.typingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <ActivityIndicator size="small" color="#6366F1" />
                  <Text style={[styles.typingText, { color: colors.textSecondary }]}>
                    {t('aiChat.typingText', { defaultValue: 'AI решает задачу и формулирует вывод...' })}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        )}
      </View>

      {/* ==================== Modern Input Dock ==================== */}
      <Animated.View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.headerBg,
            borderColor: colors.border,
            marginBottom: bottomAnim,
            marginHorizontal: 14,
            borderRadius: 24,
            borderWidth: 1,
            shadowColor: colors.shadowColor,
          },
        ]}
      >
        <TextInput
          style={[styles.textInput, { color: colors.text }]}
          value={inputText}
          onChangeText={setInputText}
          placeholder={t('aiChat.placeholder', { defaultValue: 'Задайте вопрос по физике...' })}
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={1000}
        />

        <TouchableOpacity
          style={[
            styles.sendBtn,
            (!inputText.trim() || isLoading) && styles.sendBtnDisabled,
          ]}
          onPress={sendMessage}
          disabled={!inputText.trim() || isLoading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={
              !inputText.trim() || isLoading
                ? [colors.border, colors.border]
                : ['#4F46E5', '#7C3AED']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sendBtnGradient}
          >
            <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerBotAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  statusIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  quotaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  quotaPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  chatArea: {
    flex: 1,
  },
  emptyScroll: {
    flex: 1,
  },
  emptyScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 28,
    paddingBottom: 24,
  },
  emptyHero: {
    alignItems: 'center',
    marginBottom: 28,
  },
  emptyHeroIconBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    marginBottom: 16,
  },
  emptyHeroTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyHeroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  startersGrid: {
    gap: 12,
  },
  startersTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  startersRow: {
    flexDirection: 'row',
    gap: 12,
  },
  starterCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  starterIconGradient: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  starterCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  starterCardSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  userBubble: {
    maxWidth: '82%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomRightRadius: 4,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  userText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '500',
  },
  assistantMessageContainer: {
    marginBottom: 20,
  },
  assistantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  assistantAvatarCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  assistantName: {
    fontSize: 13,
    fontWeight: '700',
  },
  assistantBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  assistantBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  assistantBubble: {
    borderRadius: 20,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    padding: 16,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  typingContainer: {
    marginTop: 8,
    alignItems: 'flex-start',
  },
  typingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
  },
  typingText: {
    fontSize: 13,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    maxHeight: 120,
    paddingTop: 8,
    paddingBottom: 8,
    paddingRight: 10,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.6,
  },
});
