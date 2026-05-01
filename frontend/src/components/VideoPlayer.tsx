import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Dimensions,
} from 'react-native';
import { useEvent, useEventListener } from 'expo';
import { VideoSource, VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface VideoPlayerProps {
  videoSource: string | number;
  color?: string;
  useNativeControls?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIDEO_WIDTH = SCREEN_WIDTH - 32;
const VIDEO_HEIGHT = (VIDEO_WIDTH * 9) / 16;

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoSource,
  color = '#6C63FF',
  useNativeControls = true,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedSource, setResolvedSource] = useState<VideoSource>(null);

  const player = useVideoPlayer(null, (videoPlayer) => {
    videoPlayer.loop = false;
  });
  const { isPlaying } = useEvent(player, 'playingChange', {
    isPlaying: player.playing,
  });
  const { status: playerStatus } = useEvent(player, 'statusChange', {
    status: player.status,
  });

  React.useEffect(() => {
    setError(null);
    setIsLoading(true);
    setResolvedSource(
      typeof videoSource === 'number'
        ? { assetId: videoSource }
        : { uri: videoSource }
    );
  }, [videoSource]);

  React.useEffect(() => {
    if (!resolvedSource) {
      return;
    }

    player.replaceAsync(resolvedSource).catch((loadError: Error) => {
      setError(loadError.message || 'Ошибка воспроизведения');
      setIsLoading(false);
    });
  }, [player, resolvedSource]);

  React.useEffect(() => {
    if (playerStatus === 'readyToPlay') {
      setIsLoading(false);
    } else if (playerStatus === 'loading') {
      setIsLoading(true);
    }
  }, [playerStatus]);

  useEventListener(player, 'statusChange', ({ status, error: playerError }) => {
    if (status === 'error') {
      setError(playerError?.message || 'Ошибка воспроизведения');
      setIsLoading(false);
    }
  });

  const handlePlayPause = () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <LinearGradient
          colors={['#FEF2F2', '#FFFFFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.errorGradient}
        >
          <View style={[styles.errorIconContainer, { backgroundColor: '#EF444420' }]}>
            <Ionicons name="videocam-off" size={32} color="#EF4444" />
          </View>
          <Text style={styles.errorTitle}>Не удалось загрузить видео</Text>
          <Text style={styles.errorText}>
            Проверьте подключение к интернету или попробуйте позже
          </Text>
        </LinearGradient>
      </View>
    );
  }

  if (!resolvedSource) {
    return (
      <View style={styles.container}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={color} />
          <Text style={styles.loadingText}>Подготовка видео...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[color + '15', color + '08', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBorder}
      >
        <View style={styles.videoWrapper}>
          {isLoading && (
            <View style={styles.loader}>
              <LinearGradient
                colors={[color + '20', color + '10']}
                style={styles.loaderGradient}
              >
                <ActivityIndicator size="large" color={color} />
                <Text style={styles.loadingText}>Загрузка видео...</Text>
              </LinearGradient>
            </View>
          )}

          <VideoView
            player={player}
            style={styles.video}
            nativeControls={useNativeControls}
            contentFit="contain"
          />

          {(!useNativeControls || isLoading) && playerStatus === 'readyToPlay' && (
            <TouchableOpacity
              style={styles.playButton}
              onPress={handlePlayPause}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[color, color + 'DD']}
                style={styles.playButtonGradient}
              >
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={28}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 4,
  },
  gradientBorder: {
    borderRadius: 16,
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  videoWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 9,
    minHeight: VIDEO_HEIGHT,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  loaderGradient: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -30 }, { translateY: -30 }],
    width: 60,
    height: 60,
    borderRadius: 30,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  playButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  errorGradient: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  errorIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
});
