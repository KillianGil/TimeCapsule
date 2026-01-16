"use client"

import { useEffect, useState, useRef } from "react"
import { View, Text, StyleSheet, ActivityIndicator, Pressable, Animated, Dimensions, ScrollView, Image, Modal } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { ArrowLeft, Lock, Clock, Gift, Play, User, Calendar, MessageSquare, Video as VideoIcon, Music, Pause, Scan } from "lucide-react-native"
import { supabase } from "@/lib/supabase/mobile"
import type { Capsule } from "@/lib/types"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
import { useVideoPlayer, VideoView } from "expo-video"
import { Audio } from "expo-av"
import LottieView from "lottie-react-native"

const { width, height: screenHeight } = Dimensions.get("window")

// Composant VideoPlayer séparé pour utiliser le hook correctement
function VideoPlayer({ videoUrl }: { videoUrl: string }) {
  const player = useVideoPlayer(videoUrl, (player) => {
    player.loop = false
  })

  return (
    <View style={styles.videoContainer}>
      <VideoView
        style={styles.video}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
      />
    </View>
  )
}

export default function CapsulePage() {
  const { id, autoOpen } = useLocalSearchParams<{ id: string; autoOpen?: string }>()
  const router = useRouter()
  const [capsule, setCapsule] = useState<Capsule | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [showContent, setShowContent] = useState(false)
  const [showOpeningAnimation, setShowOpeningAnimation] = useState(false)

  // Music playback state
  const [musicSound, setMusicSound] = useState<Audio.Sound | null>(null)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.8)).current
  const glowAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    fetchCapsule()
  }, [id])

  // Auto-open capsule if coming from AR mode
  useEffect(() => {
    if (autoOpen === 'true' && capsule && isUnlocked && !showContent) {
      // Skip animation and show content directly
      setShowContent(true)
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start()
    }
  }, [autoOpen, capsule, isUnlocked])

  useEffect(() => {
    if (capsule && !isUnlocked) {
      const interval = setInterval(() => {
        const now = new Date().getTime()
        const unlockTime = new Date(capsule.unlock_date).getTime()
        const distance = unlockTime - now

        if (distance <= 0) {
          setIsUnlocked(true)
          clearInterval(interval)
          return
        }

        setCountdown({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [capsule, isUnlocked])

  useEffect(() => {
    if (!isUnlocked) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0.3, duration: 1500, useNativeDriver: true }),
        ])
      ).start()

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start()
    }
  }, [isUnlocked])

  async function fetchCapsule() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace("/auth/login")
        return
      }
      setCurrentUserId(user.id)

      const { data, error } = await supabase
        .from("capsules")
        .select(`
          *,
          sender:profiles!capsules_sender_id_fkey(*),
          receiver:profiles!capsules_receiver_id_fkey(*)
        `)
        .eq("id", id)
        .single()

      if (error || !data) {
        setError("Capsule non trouvée")
        return
      }

      if (data.sender_id !== user.id && data.receiver_id !== user.id) {
        setError("Accès refusé")
        return
      }

      const unlocked = new Date(data.unlock_date) <= new Date()
      setIsUnlocked(unlocked)

      if (unlocked && data.receiver_id === user.id && !data.is_viewed) {
        await supabase
          .from("capsules")
          .update({ is_viewed: true, viewed_at: new Date().toISOString() })
          .eq("id", id)
      }

      setCapsule(data as Capsule)
    } catch (err) {
      console.error("Error fetching capsule:", err)
      setError("Erreur lors du chargement")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCapsule = () => {
    console.log('Opening capsule...')
    // Show opening animation first - animation will call onOpeningAnimationFinish when done
    setShowOpeningAnimation(true)
  }

  const onOpeningAnimationFinish = () => {
    setShowOpeningAnimation(false)
    setShowContent(true)
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start()
  }

  // Load and toggle music playback
  const toggleMusic = async () => {
    if (!capsule?.music_preview_url) return

    try {
      if (musicSound) {
        const status = await musicSound.getStatusAsync()

        if (status.isLoaded) {
          if (status.isPlaying) {
            await musicSound.pauseAsync()
            setIsMusicPlaying(false)
          } else if (status.didJustFinish) {
            // Replay from start if finished
            await musicSound.replayAsync()
            setIsMusicPlaying(true)
          } else {
            // Resume
            await musicSound.playAsync()
            setIsMusicPlaying(true)
          }
        }
      } else {
        // First time - load and play
        const { sound } = await Audio.Sound.createAsync(
          { uri: capsule.music_preview_url },
          { shouldPlay: true, volume: 0.3 }
        )
        setMusicSound(sound)
        setIsMusicPlaying(true)

        // Listen for playback finish
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsMusicPlaying(false)
          }
        })
      }
    } catch (error) {
      console.error("Music playback error:", error)
    }
  }

  // Cleanup music on unmount
  useEffect(() => {
    return () => {
      if (musicSound) {
        musicSound.unloadAsync()
      }
    }
  }, [musicSound])

  if (loading) {
    return (
      <AnimatedBackground>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Chargement de la capsule...</Text>
        </View>
      </AnimatedBackground>
    )
  }

  if (error) {
    return (
      <AnimatedBackground>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.backButtonCenter} onPress={() => router.replace('/dashboard')}>
            <Text style={styles.backButtonText}>Retour</Text>
          </Pressable>
        </View>
      </AnimatedBackground>
    )
  }

  if (!capsule) return null

  // ÉTAT VERROUILLÉ
  if (!isUnlocked) {
    return (
      <AnimatedBackground>
        <View style={styles.container}>
          <Pressable style={styles.headerBack} onPress={() => router.replace('/dashboard')}>
            <ArrowLeft size={24} color="#FEFEFE" />
          </Pressable>

          <View style={styles.lockedContent}>
            <Animated.View style={[styles.lockIconContainer, { transform: [{ scale: pulseAnim }] }]}>
              <Animated.View style={[styles.lockGlowOuter, { opacity: glowAnim }]} />
              <Animated.View style={[styles.lockGlowInner, { opacity: Animated.add(0.5, Animated.multiply(glowAnim, 0.5)) }]} />
              <LinearGradient colors={["rgba(255,107,53,0.3)", "rgba(255,107,53,0.1)"]} style={styles.lockBackground}>
                <Lock size={48} color="#FF6B35" strokeWidth={1.5} />
              </LinearGradient>
            </Animated.View>

            <Text style={styles.lockedTitle}>Capsule verrouillée</Text>
            <Text style={styles.lockedSubtitle}>De {capsule.sender?.username}</Text>

            <View style={styles.countdownContainer}>
              {[
                { value: countdown.days, label: 'jours' },
                { value: countdown.hours, label: 'heures' },
                { value: countdown.minutes, label: 'min' },
                { value: countdown.seconds, label: 'sec' },
              ].map((item, index) => (
                <View key={item.label} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  {index > 0 && <Text style={styles.countdownSeparator}>:</Text>}
                  <View style={styles.countdownItem}>
                    <LinearGradient colors={["rgba(255,107,53,0.15)", "rgba(255,107,53,0.05)"]} style={styles.countdownBox}>
                      <Text style={styles.countdownNumber}>{String(item.value).padStart(2, '0')}</Text>
                    </LinearGradient>
                    <Text style={styles.countdownLabel}>{item.label}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.capsuleInfo}>
              <Calendar size={16} color="#FF6B35" />
              <Text style={styles.infoText}>
                Ouverture le {new Date(capsule.unlock_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </Text>
            </View>

            <Pressable
              style={styles.arButton}
              onPress={() => router.push({
                pathname: '/ar-mode',
                params: {
                  capsuleId: id,
                  isUnlocked: 'false',
                  unlockDate: capsule.unlock_date,
                  senderName: capsule.sender?.username || 'Inconnu',
                  title: capsule.title || 'Capsule temporelle'
                }
              })}
            >
              <LinearGradient
                colors={["#F4D35E", "#D4A574"]}
                style={styles.arGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Scan size={20} color="#0F0D0B" strokeWidth={2.5} />
                <Text style={styles.arButtonText}>Voir en RA</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </AnimatedBackground>
    )
  }

  // ÉTAT DÉVERROUILLÉ - Avant ouverture
  if (!showContent) {
    return (
      <AnimatedBackground>
        {/* Opening Animation Modal */}
        <Modal
          visible={showOpeningAnimation}
          transparent
          animationType="fade"
        >
          <View style={styles.animationOverlay}>
            <View style={styles.animationContainer}>
              <LottieView
                source={require('../../../../assets/anim-ouverture.json')}
                autoPlay
                loop={false}
                style={styles.lottieAnimation}
                onAnimationFinish={onOpeningAnimationFinish}
              />
              <Text style={styles.openingText}>🎁 Ouverture de la capsule...</Text>
            </View>
          </View>
        </Modal>

        <View style={styles.container}>
          <Pressable style={styles.headerBack} onPress={() => router.replace('/dashboard')}>
            <ArrowLeft size={24} color="#FEFEFE" />
          </Pressable>

          <View style={styles.unlockedContent}>
            <View style={styles.giftIconContainer}>
              <View style={styles.giftGlowOuter} />
              <LinearGradient colors={["#FF6B35", "#FF8B5A"]} style={styles.giftIcon}>
                <Gift size={56} color="#FFFFFF" strokeWidth={1.5} />
              </LinearGradient>
            </View>

            <Text style={styles.unlockedTitle}>{capsule.title || "Capsule temporelle"}</Text>
            <Text style={styles.unlockedSubtitle}>De {capsule.sender?.username}</Text>
            <Text style={styles.readyText}>✨ Prête à être ouverte !</Text>

            <Pressable onPress={handleOpenCapsule} style={styles.openButtonContainer}>
              <LinearGradient colors={["#FF6B35", "#D4A574"]} style={styles.openButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Play size={24} color="#FFFFFF" fill="#FFFFFF" />
                <Text style={styles.openButtonText}>Ouvrir la capsule</Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              style={[styles.arButton, { marginTop: 16 }]}
              onPress={() => router.push({
                pathname: '/ar-mode',
                params: {
                  capsuleId: id,
                  isUnlocked: 'true',
                  isOpened: 'false',
                  unlockDate: capsule.unlock_date,
                  senderName: capsule.sender?.username || 'Inconnu',
                  title: capsule.title || 'Capsule temporelle'
                }
              })}
            >
              <LinearGradient
                colors={["#F4D35E", "#D4A574"]}
                style={styles.arGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Scan size={20} color="#0F0D0B" strokeWidth={2.5} />
                <Text style={styles.arButtonText}>Ouvrir en RA</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </AnimatedBackground>
    )
  }

  // ÉTAT DÉVERROUILLÉ - Contenu visible (seulement si showContent est true)
  if (!showContent) {
    // Fallback - ne devrait jamais arriver mais empêche le flash
    return (
      <AnimatedBackground>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      </AnimatedBackground>
    )
  }

  return (
    <AnimatedBackground>
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <Pressable style={styles.headerBack} onPress={() => router.replace('/dashboard')}>
            <ArrowLeft size={24} color="#FEFEFE" />
          </Pressable>

          <Animated.View style={[styles.contentContainer, {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: slideAnim }]
          }]}>
            <View style={styles.successBadge}>
              <Text style={styles.successEmoji}>🎉</Text>
              <Text style={styles.successText}>Capsule ouverte !</Text>
            </View>

            <View style={styles.contentHeader}>
              <Text style={styles.contentTitle}>{capsule.title || "Capsule temporelle"}</Text>
              <View style={styles.senderInfo}>
                <LinearGradient colors={["#FF6B35", "#D4A574"]} style={styles.senderAvatar}>
                  <User size={14} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.senderName}>De {capsule.sender?.username}</Text>
              </View>
            </View>

            {/* Video Player */}
            {capsule.video_path ? (
              <VideoPlayer videoUrl={capsule.video_path} />
            ) : (
              <View style={styles.noVideoContainer}>
                <VideoIcon size={32} color="rgba(255,255,255,0.3)" />
                <Text style={styles.noVideoText}>Pas de vidéo attachée</Text>
              </View>
            )}

            {/* Music Player */}
            {capsule.music_preview_url && (
              <View style={styles.musicPlayerContainer}>
                <View style={styles.musicPlayerHeader}>
                  <Text style={styles.musicLabel}>🎵 MUSIQUE D'AMBIANCE</Text>
                </View>
                <View style={styles.musicPlayerContent}>
                  {capsule.music_cover_url && (
                    <Image source={{ uri: capsule.music_cover_url }} style={styles.musicPlayerCover} />
                  )}
                  <View style={styles.musicPlayerInfo}>
                    <Text style={styles.musicPlayerTitle} numberOfLines={1}>{capsule.music_title}</Text>
                    <Text style={styles.musicPlayerArtist} numberOfLines={1}>{capsule.music_artist}</Text>
                  </View>
                  <Pressable
                    onPress={toggleMusic}
                    style={[styles.musicToggleButton, isMusicPlaying && styles.musicToggleButtonActive]}
                  >
                    {isMusicPlaying ? (
                      <Pause size={20} color="#FFF" />
                    ) : (
                      <Music size={20} color="#FFF" />
                    )}
                  </Pressable>
                </View>
              </View>
            )}

            {/* Note */}
            {capsule.note && (
              <View style={styles.messageContainer}>
                <View style={styles.messageHeader}>
                  <MessageSquare size={16} color="#FF6B35" />
                  <Text style={styles.messageLabel}>Message</Text>
                </View>
                <Text style={styles.messageText}>{capsule.note}</Text>
              </View>
            )}

            <View style={styles.dateInfo}>
              <Clock size={14} color="rgba(255,255,255,0.4)" />
              <Text style={styles.dateText}>
                Envoyée le {new Date(capsule.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </Text>
            </View>

            <Pressable
              style={[styles.arButton, { marginTop: 24, alignSelf: 'center' }]}
              onPress={() => router.push({
                pathname: '/ar-mode',
                params: {
                  capsuleId: id,
                  isUnlocked: 'true',
                  isOpened: 'true',
                  unlockDate: capsule.unlock_date,
                  senderName: capsule.sender?.username || 'Inconnu',
                  title: capsule.title || 'Capsule temporelle'
                }
              })}
            >
              <LinearGradient
                colors={["#F4D35E", "#D4A574"]}
                style={styles.arGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Scan size={20} color="#0F0D0B" strokeWidth={2.5} />
                <Text style={styles.arButtonText}>Revoir en RA</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </View>
      </ScrollView>
    </AnimatedBackground>
  )
}

const styles = StyleSheet.create({
  scrollContainer: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 24 },
  centerContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  loadingText: { marginTop: 16, color: "rgba(255,255,255,0.6)", fontSize: 15 },
  errorText: { color: "#FF6B35", fontSize: 16, textAlign: "center", marginBottom: 20 },
  backButtonCenter: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 12 },
  backButtonText: { color: "#FEFEFE", fontWeight: "600" },

  headerBack: { width: 44, height: 44, alignItems: "center", justifyContent: "center", marginBottom: 20 },

  // Locked State
  lockedContent: { flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 100 },
  lockIconContainer: { marginBottom: 32, alignItems: "center", justifyContent: "center" },
  lockGlowOuter: { position: "absolute", width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(255,107,53,0.15)" },
  lockGlowInner: { position: "absolute", width: 140, height: 140, borderRadius: 70, backgroundColor: "rgba(255,107,53,0.2)" },
  lockBackground: { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "rgba(255,107,53,0.4)" },
  lockedTitle: { fontSize: 28, fontWeight: "700", color: "#FEFEFE", marginBottom: 8 },
  lockedSubtitle: { fontSize: 16, color: "rgba(255,255,255,0.5)", marginBottom: 40 },

  countdownContainer: { flexDirection: "row", alignItems: "flex-start", marginBottom: 40 },
  countdownItem: { alignItems: "center" },
  countdownBox: { width: 60, height: 70, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,107,53,0.2)" },
  countdownNumber: { fontSize: 28, fontWeight: "700", color: "#FF6B35" },
  countdownLabel: { fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1, marginTop: 8 },
  countdownSeparator: { fontSize: 28, color: "#FF6B35", marginTop: 18, marginHorizontal: 4 },

  capsuleInfo: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "rgba(255,255,255,0.04)", paddingHorizontal: 20, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", marginBottom: 24 },
  infoText: { color: "rgba(255,255,255,0.6)", fontSize: 14 },

  arButton: { width: "100%", maxWidth: 220, shadowColor: "#F4D35E", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  arGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, gap: 10 },
  arButtonText: { color: "#0F0D0B", fontSize: 16, fontWeight: "700" },

  // Unlocked - Before Open
  unlockedContent: { flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 100 },
  giftIconContainer: { marginBottom: 32, alignItems: "center", justifyContent: "center" },
  giftGlowOuter: { position: "absolute", width: 160, height: 160, borderRadius: 80, backgroundColor: "rgba(255,107,53,0.2)" },
  giftIcon: { width: 110, height: 110, borderRadius: 55, alignItems: "center", justifyContent: "center", shadowColor: "#FF6B35", shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.5, shadowRadius: 30, elevation: 20 },
  unlockedTitle: { fontSize: 28, fontWeight: "700", color: "#FEFEFE", marginBottom: 8, textAlign: "center" },
  unlockedSubtitle: { fontSize: 16, color: "rgba(255,255,255,0.5)", marginBottom: 8 },
  readyText: { fontSize: 15, color: "#FF6B35", marginBottom: 40 },
  openButtonContainer: { shadowColor: "#FF6B35", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 25, elevation: 15 },
  openButton: { flexDirection: "row", alignItems: "center", paddingHorizontal: 36, paddingVertical: 20, borderRadius: 18, gap: 14 },
  openButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },

  // Content View
  contentContainer: { flex: 1 },
  successBadge: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 24, paddingVertical: 12, paddingHorizontal: 20, backgroundColor: "rgba(255,107,53,0.1)", borderRadius: 20, alignSelf: "center" },
  successEmoji: { fontSize: 18 },
  successText: { color: "#FF6B35", fontSize: 15, fontWeight: "600" },
  contentHeader: { marginBottom: 24 },
  contentTitle: { fontSize: 26, fontWeight: "700", color: "#FEFEFE", marginBottom: 12 },
  senderInfo: { flexDirection: "row", alignItems: "center", gap: 10 },
  senderAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  senderName: { color: "rgba(255,255,255,0.6)", fontSize: 15 },

  videoContainer: { backgroundColor: "#000", borderRadius: 16, overflow: "hidden", marginBottom: 24, height: 220 },
  video: { width: "100%", height: "100%" },

  noVideoContainer: { height: 180, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 16, alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  noVideoText: { color: "rgba(255,255,255,0.4)", fontSize: 14 },

  messageContainer: { backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  messageHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  messageLabel: { color: "#FF6B35", fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 },
  messageText: { color: "#FEFEFE", fontSize: 16, lineHeight: 26 },

  // Music Player styles
  musicPlayerContainer: { backgroundColor: "rgba(255,107,53,0.1)", borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: "rgba(255,107,53,0.2)" },
  musicPlayerHeader: { marginBottom: 12 },
  musicLabel: { color: "#FF6B35", fontSize: 12, fontWeight: "600", letterSpacing: 1 },
  musicPlayerContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  musicPlayerCover: { width: 56, height: 56, borderRadius: 10 },
  musicPlayerInfo: { flex: 1 },
  musicPlayerTitle: { color: "#FEFEFE", fontSize: 16, fontWeight: "600" },
  musicPlayerArtist: { color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 2 },
  musicToggleButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,107,53,0.3)", alignItems: "center", justifyContent: "center" },
  musicToggleButtonActive: { backgroundColor: "#FF6B35" },

  dateInfo: { flexDirection: "row", alignItems: "center", gap: 8, justifyContent: "center" },
  dateText: { color: "rgba(255,255,255,0.4)", fontSize: 13 },

  // Animation modal styles
  animationOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  animationContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  lottieAnimation: {
    width: width * 0.9,
    height: width * 0.9,
  },
  openingText: {
    color: "#FEFEFE",
    fontSize: 20,
    fontWeight: "600",
    marginTop: -30,
  },
})
