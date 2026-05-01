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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { claimRewardedChatCredit, ChatQuota, getChatQuota, sendChatMessage } from '../../src/services/aiService';
import { MathText } from '../../src/components/MathText';
import { useTheme } from '../../src/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../src/context/LanguageContext';
import { CHAT_REWARDED_AD_UNIT_ID, initializeMobileAds, showRewardedChatAd } from '../../src/services/adService';

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const [chatQuota, setChatQuota] = useState<ChatQuota | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const { colors, isDark } = useTheme();
  void isDark;
  const { t } = useTranslation();
  const { getAILanguageName } = useLanguage();
  const insets = useSafeAreaInsets();
  const tabBarBottomOffset = insets.bottom;
  const tabBarHeight = 64;
  const chatBottomClearance = tabBarBottomOffset + tabBarHeight;
  const inputDockGap = 8;
  const inputBottomOffset = isKeyboardVisible ? 0 : chatBottomClearance + inputDockGap;


  const legacySendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    const history: ChatHistoryMessage[] = messages.slice(-10).map(m => ({
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
    } else {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ ${result.error || t('aiChat.errorConnection')}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setIsLoading(false);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 300);
  };
  void legacySendMessage;

  useEffect(() => {
    initializeMobileAds().catch(() => { });
    getChatQuota().then((result) => {
      if (result.success && result.quota) {
        setChatQuota(result.quota);
      }
    });
  }, []);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);



  const scrollToEnd = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 300);
  };

  const sendPreparedMessage = async (rawText: string) => {
    if (!rawText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: rawText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

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
        t('aiChat.limitTitle'),
        t('aiChat.limitMessage'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('aiChat.watchAd'),
            onPress: async () => {
              setIsLoading(true);
              const watched = await showRewardedChatAd();
              if (!watched) {
                setIsLoading(false);
                Alert.alert(t('aiChat.adNotFinishedTitle'), t('aiChat.adNotFinishedMessage'));
                return;
              }

              const claim = await claimRewardedChatCredit(CHAT_REWARDED_AD_UNIT_ID);
              if (!claim.success) {
                setIsLoading(false);
                Alert.alert(t('common.error'), claim.error || t('aiChat.rewardClaimError'));
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
      content: `⚠️ ${result.error || t('aiChat.errorConnection')}`,
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

  const chatBody = (
    <>
      <View style={styles.chatContentArea}>
        {messages.length === 0 ? (
          <ScrollView
            style={styles.messagesList}
            contentContainerStyle={styles.emptyStateContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.emptyState}>
              <Ionicons name="chatbubble-ellipses" size={64} color={colors.border} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('aiChat.emptyTitle')}</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textTertiary }]}>
                {t('aiChat.emptySubtitle')}
              </Text>
              <View style={styles.examplesContainer}>
                <Text style={[styles.examplesTitle, { color: colors.textTertiary }]}>{t('aiChat.examplesTitle')}</Text>
                <TouchableOpacity
                  style={[styles.exampleButton, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}
                  onPress={() => setInputText(t('aiChat.example1').replace(/^[^\p{L}]*/u, ''))}
                >
                  <Text style={[styles.exampleText, { color: colors.textSecondary }]}>{t('aiChat.example1')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.exampleButton, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}
                  onPress={() => setInputText(t('aiChat.example2').replace(/^[^\p{L}]*/u, ''))}
                >
                  <Text style={[styles.exampleText, { color: colors.textSecondary }]}>{t('aiChat.example2')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.exampleButton, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}
                  onPress={() => setInputText(t('aiChat.example3').replace(/^[^\p{L}]*/u, ''))}
                >
                  <Text style={[styles.exampleText, { color: colors.textSecondary }]}>{t('aiChat.example3')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesList}
            contentContainerStyle={[
              styles.messagesContent,
              { paddingBottom: 16 },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => {
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 100);
            }}
          >
            {messages.map((message) =>
              message.role === 'user'
                ? renderUserMessage(message)
                : renderAssistantMessage(message)
            )}

            {isLoading && (
              <View style={[styles.loadingContainer, { backgroundColor: colors.card }]}>
                <ActivityIndicator size="small" color={colors.accent} />
                <Text style={[styles.loadingText, { color: colors.text }]}>{t('aiChat.sending')}</Text>
                <Text style={[styles.loadingSubtext, { color: colors.textTertiary }]}>{t('aiChat.sendingSubtext')}</Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.headerBg,
            borderColor: colors.border,
            marginBottom: inputBottomOffset,
            marginHorizontal: isKeyboardVisible ? 0 : 10,
            borderRadius: isKeyboardVisible ? 0 : 18,
            borderLeftWidth: isKeyboardVisible ? 0 : 1,
            borderRightWidth: isKeyboardVisible ? 0 : 1,
            borderBottomWidth: isKeyboardVisible ? 0 : 1,
            shadowColor: colors.shadowColor,
          },
        ]}
      >
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text }]}
          value={inputText}
          onChangeText={setInputText}
          onFocus={() => setIsKeyboardVisible(true)}
          placeholder={t('aiChat.placeholder')}
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: colors.accent },
            (!inputText.trim() || isLoading) && { backgroundColor: colors.border },
          ]}
          onPress={sendMessage}
          disabled={!inputText.trim() || isLoading}
        >
          <Ionicons name="send" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </>
  );

  // Рендер сообщения пользователя
  function renderUserMessage(message: Message) {
    return (
      <View key={message.id} style={styles.userMessageContainer}>
        <View style={styles.userBubble}>
          <Text style={styles.userText}>{message.content}</Text>
        </View>
      </View>
    );
  }

  // Рендер сообщения AI - используем MathText как в "Изучить больше"
  function renderAssistantMessage(message: Message) {
    return (
      <View key={message.id} style={styles.assistantMessageContainer}>
        <View style={styles.assistantHeader}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.accentLight }]}>
            <Ionicons name="sparkles" size={16} color={colors.accent} />
          </View>
          <Text style={[styles.assistantLabel, { color: colors.accent }]}>{t('aiChat.assistant')}</Text>
        </View>
        {/* Точно как в expanded - карточка с MathText */}
        <View style={[styles.assistantCard, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}>
          <MathText
            content={message.content}
            textColor={colors.text}
            fontSize={15}
            backgroundColor={colors.card}
          />
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('aiChat.title')}</Text>
        <View style={[styles.headerBadge, { backgroundColor: colors.accentLight }]}>
          <Ionicons name="flask" size={12} color={colors.accent} />
          <Text style={[styles.headerBadgeText, { color: colors.accent }]}>LaTeX</Text>
        </View>
      </View>
      {chatQuota && (
        <View style={[styles.quotaBar, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
          <Text style={[styles.quotaText, { color: colors.textSecondary }]}>
            {t('aiChat.freeToday')}: {chatQuota.free_remaining}/{chatQuota.free_limit} | {t('aiChat.forAd')}: {chatQuota.rewarded_credits}
          </Text>
        </View>
      )}

      <View style={styles.chatContainer}>
        {chatBody}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6C63FF',
  },
  quotaBar: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  quotaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  chatContainer: {
    flex: 1,
  },
  chatContentArea: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 12,
    paddingBottom: 12,
    flexGrow: 1,
  },
  // Сообщение пользователя
  userMessageContainer: {
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  userBubble: {
    maxWidth: '80%',
    backgroundColor: '#6C63FF',
    borderRadius: 16,
    borderBottomRightRadius: 4,
    padding: 12,
  },
  userText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#FFFFFF',
  },
  // Сообщение AI
  assistantMessageContainer: {
    marginBottom: 16,
  },
  assistantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  avatarContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  assistantLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6C63FF',
  },
  // Карточка с ответом AI - точно как в expanded
  assistantCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  // Empty state
  emptyStateContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  examplesContainer: {
    marginTop: 24,
    width: '100%',
    maxWidth: 300,
  },
  examplesTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    textAlign: 'center',
  },
  exampleButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  exampleText: {
    fontSize: 14,
    color: '#374151',
  },
  // Loading
  loadingContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginVertical: 8,
  },
  loadingText: {
    marginTop: 12,
    color: '#1F2937',
    fontSize: 15,
    fontWeight: '500',
  },
  loadingSubtext: {
    marginTop: 4,
    color: '#6B7280',
    fontSize: 13,
  },
  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: 18,
    height: 64,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    minHeight: 44,
    maxHeight: 44,
    color: '#1F2937',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
});
