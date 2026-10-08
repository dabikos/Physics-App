import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';
import { useSubscription } from '../../src/context/SubscriptionContext';
import { canOpenOzp, FREE_OZP_SESSION_ID, OZP_SESSIONS } from '../../src/features/tests/ozpAccess';

export default function ExamsHome() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { isPro, loading } = useSubscription();
  const openExam = (session: string) => {
    if (!canOpenOzp(session, isPro)) {
      Alert.alert(t('exam.premiumRequired'), t('exam.accessSummary'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('exam.viewPremium'), onPress: () => router.push('/subscription') },
      ]);
      return;
    }
    router.push({ pathname: '/exams/ozp' as any, params: { session } });
  };
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
    <View style={[styles.header, { backgroundColor: colors.headerBg, borderColor: colors.border }]}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}><Ionicons name="arrow-back" size={23} color={colors.text} /></TouchableOpacity>
      <Text style={[styles.headerText, { color: colors.text }]}>{t('exam.title')}</Text>
      <View style={styles.back} />
    </View>
    <ScrollView contentContainerStyle={styles.content}>
      <View style={[styles.hero, { backgroundColor: colors.accentLight }]}>
        <Ionicons name="school-outline" size={26} color={colors.accentText} />
        <Text style={[styles.title, { color: colors.text }]}>{t('exam.prepareTitle')}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('exam.prepareSubtitle')}</Text>
        <Text style={[styles.accessSummary, { color: colors.accentText }]}>{t('exam.accessSummary')}</Text>
      </View>
      <Text style={[styles.section, { color: colors.text }]}>{t('exam.ozpTitle')}</Text>
      <Text style={[styles.sectionSubtitle, { color: colors.textTertiary }]}>{t('exam.ozpStructure')}</Text>
      {OZP_SESSIONS.map(session => <ExamCard
        key={session.id}
        name={t(`exam.${session.titleKey}`)} detail={t(`exam.${session.detailKey}`)}
        badge={t(session.id === FREE_OZP_SESSION_ID ? 'exam.availableToEveryone' : 'exam.premiumBadge')}
        locked={!canOpenOzp(session.id, isPro)} disabled={loading && session.id !== FREE_OZP_SESSION_ID}
        onPress={() => openExam(session.id)}
      />)}
      <Text style={[styles.section, { color: colors.text }]}>{t('exam.entTitle')}</Text>
      <View style={[styles.entCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="construct-outline" size={22} color={colors.textTertiary} />
        <View style={{ flex: 1 }}><Text style={[styles.cardTitle, { color: colors.text }]}>{t('exam.entPhysics')}</Text><Text style={[styles.cardDetail, { color: colors.textTertiary }]}>{t('exam.entComing')}</Text></View>
      </View>
      <Text style={[styles.disclaimer, { color: colors.textTertiary }]}>{t('exam.previewNote')}</Text>
    </ScrollView>
  </SafeAreaView>;
}

function ExamCard({ name, detail, badge, locked, disabled, onPress }: { name: string; detail: string; badge: string; locked: boolean; disabled: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return <TouchableOpacity activeOpacity={0.8} onPress={onPress} disabled={disabled} accessibilityLabel={`${name}. ${badge}`} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
    <View style={[styles.cardIcon, { backgroundColor: colors.accentLight }]}><Ionicons name="document-text-outline" size={24} color={colors.accentText} /></View>
    <View style={{ flex: 1 }}><Text style={[styles.cardTitle, { color: colors.text }]}>{name}</Text><Text style={[styles.cardDetail, { color: colors.textTertiary }]}>{detail}</Text><Text style={[styles.badge, { color: colors.accentText }]}>{badge}</Text></View>
    <Ionicons name={locked ? 'lock-closed-outline' : 'arrow-forward'} size={19} color={colors.accentText} />
  </TouchableOpacity>;
}

const styles = StyleSheet.create({
  header: { height: 58, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, paddingHorizontal: 12 },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700' },
  content: { padding: 18, paddingBottom: 35 },
  hero: { padding: 20, borderRadius: 20, marginBottom: 19 },
  title: { fontSize: 25, fontWeight: '800', marginTop: 12, marginBottom: 6 },
  subtitle: { fontSize: 14, lineHeight: 21 },
  accessSummary: { fontSize: 12, lineHeight: 18, marginTop: 10 },
  badge: { fontSize: 11, fontWeight: '700', marginTop: 4 },
  section: { fontSize: 19, fontWeight: '800', marginTop: 14, marginBottom: 5 },
  sectionSubtitle: { fontSize: 13, lineHeight: 19, marginBottom: 12 },
  card: { minHeight: 84, borderWidth: 1, borderRadius: 17, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  cardIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  cardDetail: { fontSize: 12, lineHeight: 18 },
  entCard: { minHeight: 74, borderWidth: 1, borderRadius: 17, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 13 },
  disclaimer: { fontSize: 12, lineHeight: 18, marginTop: 18 },
});
