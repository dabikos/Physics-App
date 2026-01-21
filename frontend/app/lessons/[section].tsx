import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/services/api';

interface Subsection {
  id: string;
  name: string;
}

interface Section {
  name: string;
  color: string;
  subsections: Subsection[];
}

interface Topic {
  id: string;
  title: string;
  brief_info: string;
}

export default function SectionScreen() {
  const router = useRouter();
  const { section } = useLocalSearchParams<{ section: string }>();
  const [sectionData, setSectionData] = useState<Section | null>(null);
  const [topics, setTopics] = useState<Record<string, Topic[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedSubsection, setSelectedSubsection] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [section]);

  const fetchData = async () => {
    try {
      const [sectionRes, topicsRes] = await Promise.all([
        api.get(`/sections/${section}`),
        api.get(`/topics?section=${section}`),
      ]);
      setSectionData(sectionRes.data);
      
      // Group topics by subsection
      const grouped: Record<string, Topic[]> = {};
      topicsRes.data.forEach((topic: Topic & { subsection: string }) => {
        if (!grouped[topic.subsection]) {
          grouped[topic.subsection] = [];
        }
        grouped[topic.subsection].push(topic);
      });
      setTopics(grouped);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{sectionData?.name}</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <Text style={styles.sectionTitle}>Подразделы</Text>

        {sectionData?.subsections.map((subsection) => (
          <View key={subsection.id}>
            <TouchableOpacity
              style={[
                styles.subsectionCard,
                selectedSubsection === subsection.id && styles.subsectionCardActive,
              ]}
              onPress={() =>
                setSelectedSubsection(
                  selectedSubsection === subsection.id ? null : subsection.id
                )
              }
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.subsectionDot,
                  { backgroundColor: sectionData.color },
                ]}
              />
              <Text style={styles.subsectionName}>{subsection.name}</Text>
              <Ionicons
                name={selectedSubsection === subsection.id ? 'chevron-down' : 'chevron-forward'}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>

            {selectedSubsection === subsection.id && (
              <View style={styles.topicsList}>
                {topics[subsection.id]?.map((topic) => (
                  <TouchableOpacity
                    key={topic.id}
                    style={styles.topicCard}
                    onPress={() => router.push(`/lessons/topic/${topic.id}`)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.topicContent}>
                      <Text style={styles.topicTitle}>{topic.title}</Text>
                      <Text style={styles.topicBrief} numberOfLines={2}>
                        {topic.brief_info}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                )) || (
                  <Text style={styles.noTopics}>Темы в разработке</Text>
                )}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerPlaceholder: {
    width: 44,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  subsectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  subsectionCardActive: {
    backgroundColor: '#EEF2FF',
  },
  subsectionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  subsectionName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  topicsList: {
    paddingLeft: 22,
    marginBottom: 8,
  },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#6C63FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  topicContent: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  topicBrief: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  noTopics: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 16,
  },
});
