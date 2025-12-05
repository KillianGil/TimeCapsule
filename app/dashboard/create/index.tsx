"use client"

import { useEffect, useState, useRef } from "react"
import { View, Text, ScrollView, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert, Platform, Image } from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { ArrowLeft, Send, Calendar, Users, MessageSquare, Video, X, Music, Search, Check } from "lucide-react-native"
import { supabase } from "@/lib/supabase/mobile"
import type { Profile } from "@/lib/types"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
import DateTimePicker from "@react-native-community/datetimepicker"
import * as ImagePicker from "expo-image-picker"
import * as FileSystem from "expo-file-system/legacy"
import { decode } from "base64-arraybuffer"
import { Audio } from "expo-av"
import { searchMusic, type MusicTrack } from "@/lib/services/musicSearch"
import { sendPushToUser, scheduleCapsuleUnlockNotification } from "@/lib/services/notifications"

export default function CreateCapsulePage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [friends, setFriends] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  const [title, setTitle] = useState("")
  const [note, setNote] = useState("")
  const [selectedFriends, setSelectedFriends] = useState<string[]>([])

  // Date Picker State - Always visible for better UX
  const [unlockDate, setUnlockDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
  const [showDatePicker, setShowDatePicker] = useState(Platform.OS === 'ios') // Always show on iOS

  const [videoUri, setVideoUri] = useState<string | null>(null)

  // Music states
  const [musicQuery, setMusicQuery] = useState("")
  const [musicResults, setMusicResults] = useState<MusicTrack[]>([])
  const [selectedMusic, setSelectedMusic] = useState<MusicTrack | null>(null)
  const [searchingMusic, setSearchingMusic] = useState(false)
  const [previewSound, setPreviewSound] = useState<Audio.Sound | null>(null)
  const [playingPreviewId, setPlayingPreviewId] = useState<number | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace("/auth/login")
        return
      }
      setUserId(user.id)

      const { data: friendships } = await supabase
        .from("friendships")
        .select(`*, requester:profiles!friendships_requester_id_fkey(*), receiver:profiles!friendships_receiver_id_fkey(*)`)
        .eq("status", "accepted")
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)

      const friendsList: Profile[] = (friendships || [])
        .map((f: any) => f.requester_id === user.id ? f.receiver : f.requester)
        .filter(Boolean)

      setFriends(friendsList)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const showVideoOptions = () => {
    Alert.alert(
      "Ajouter une vidéo",
      "Comment voulez-vous ajouter votre vidéo ?",
      [
        {
          text: "📹 Enregistrer",
          onPress: () => recordVideo()
        },
        {
          text: "📂 Galerie",
          onPress: () => pickFromGallery()
        },
        {
          text: "Annuler",
          style: "cancel"
        }
      ]
    )
  }

  const recordVideo = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert("Permission refusée", "Autorisez l'accès à la caméra dans les réglages.")
        return
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['videos'],
        allowsEditing: true,
        quality: 0.7,
        videoMaxDuration: 60, // Max 60 secondes
      })

      if (!result.canceled && result.assets[0].uri) {
        setVideoUri(result.assets[0].uri)
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'enregistrer la vidéo")
    }
  }

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        allowsEditing: true,
        quality: 0.7,
      })

      if (!result.canceled && result.assets[0].uri) {
        setVideoUri(result.assets[0].uri)
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de sélectionner la vidéo")
    }
  }

  // Music search and preview functions
  const handleMusicSearch = async () => {
    if (musicQuery.trim().length < 2) return
    setSearchingMusic(true)
    try {
      const results = await searchMusic(musicQuery)
      setMusicResults(results)
    } finally {
      setSearchingMusic(false)
    }
  }

  const playPreview = async (track: MusicTrack) => {
    // Stop current preview if playing
    if (previewSound) {
      await previewSound.unloadAsync()
      setPreviewSound(null)
    }

    // If clicking same track, just stop
    if (playingPreviewId === track.id) {
      setPlayingPreviewId(null)
      return
    }

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: track.previewUrl },
        { shouldPlay: true, volume: 0.5 }
      )
      setPreviewSound(sound)
      setPlayingPreviewId(track.id)

      // Auto-stop when finished
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingPreviewId(null)
        }
      })
    } catch (error) {
      console.error("Preview error:", error)
    }
  }

  const selectMusic = (track: MusicTrack) => {
    setSelectedMusic(track)
    setMusicResults([])
    setMusicQuery("")
    // Stop preview
    if (previewSound) {
      previewSound.unloadAsync()
      setPreviewSound(null)
      setPlayingPreviewId(null)
    }
  }

  const clearMusic = async () => {
    setSelectedMusic(null)
    if (previewSound) {
      await previewSound.unloadAsync()
      setPreviewSound(null)
      setPlayingPreviewId(null)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (previewSound) {
        previewSound.unloadAsync()
      }
    }
  }, [previewSound])

  const handleDateChange = (event: any, selectedDate?: Date) => {
    // On Android, close picker after selection. On iOS, keep it open (inline mode)
    if (Platform.OS === 'android') {
      setShowDatePicker(false)
    }
    if (selectedDate) {
      setUnlockDate(selectedDate)
    }
  }

  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    )
  }

  const handleSend = async () => {
    if (selectedFriends.length === 0) {
      Alert.alert("Ami(s) manquant(s)", "Sélectionnez au moins un ami.")
      return
    }
    if (!videoUri) {
      Alert.alert("Vidéo manquante", "Le concept est de laisser une vidéo ! Ajoutez-en une.")
      return
    }

    setSending(true)
    try {
      let videoPath = null

      if (videoUri) {
        // Détecter l'extension du fichier
        const fileExtension = videoUri.split('.').pop()?.toLowerCase() || 'mp4'
        const mimeType = fileExtension === 'mov' ? 'video/quicktime' : 'video/mp4'
        const fileName = `${userId}/${Date.now()}.${fileExtension}`

        // Obtenir le token d'authentification
        const { data: { session } } = await supabase.auth.getSession()

        // Upload direct avec FileSystem.uploadAsync (méthode native recommandée)
        const uploadUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/capsules/${fileName}`

        const uploadResult = await FileSystem.uploadAsync(uploadUrl, videoUri, {
          httpMethod: 'POST',
          uploadType: 0, // BINARY_CONTENT = 0
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': mimeType,
            'x-upsert': 'true',
          },
        })

        console.log("Upload result:", uploadResult.status, uploadResult.body)

        if (uploadResult.status !== 200) {
          const errorBody = JSON.parse(uploadResult.body || '{}')
          if (errorBody.message?.includes("Bucket not found")) {
            throw new Error("Erreur Configuration: Le dossier 'capsules' n'existe pas sur le serveur.")
          }
          throw new Error(errorBody.message || "Erreur d'upload")
        }

        const { data: { publicUrl } } = supabase.storage.from("capsules").getPublicUrl(fileName)
        videoPath = publicUrl
        console.log("✅ Video uploaded:", videoPath)
      }

      // Create a capsule for each selected friend
      const capsulesToInsert = selectedFriends.map(friendId => ({
        sender_id: userId,
        receiver_id: friendId,
        title,
        note,
        video_path: videoPath,
        music_title: selectedMusic?.title || null,
        music_artist: selectedMusic?.artist || null,
        music_preview_url: selectedMusic?.previewUrl || null,
        music_cover_url: selectedMusic?.cover || null,
        unlock_date: unlockDate.toISOString(),
        is_viewed: false,
      }))

      const { error } = await supabase.from("capsules").insert(capsulesToInsert)

      if (error) throw error

      // Send push notifications to all recipients
      const myProfile = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single()

      const senderName = myProfile.data?.username || 'Quelqu\'un'

      for (const friendId of selectedFriends) {
        // Notify about new capsule
        sendPushToUser(
          friendId,
          '📬 Nouvelle capsule !',
          `${senderName} vous a envoyé une capsule temporelle`,
          { type: 'new_capsule' }
        )
      }

      const friendCount = selectedFriends.length
      Alert.alert(
        "🎉 Envoyée !",
        `Capsule envoyée à ${friendCount} ami${friendCount > 1 ? 's' : ''} !`,
        [{ text: "Génial", onPress: () => router.back() }]
      )
    } catch (error: any) {
      Alert.alert("Erreur", error.message)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    )
  }

  return (
    <AnimatedBackground>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={24} color="#FEFEFE" />
          </Pressable>
          <Text style={styles.headerTitle}>Nouvelle Capsule</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Titre</Text>
            <View style={styles.inputContainer}>
              <MessageSquare size={18} color="rgba(255,255,255,0.4)" />
              <TextInput
                style={styles.input}
                placeholder="Titre de la capsule"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={title}
                onChangeText={setTitle}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Destinataire{selectedFriends.length > 1 ? 's' : ''}
              {selectedFriends.length > 0 && ` (${selectedFriends.length})`}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.friendsScroll}>
              {friends.map((friend) => {
                const isSelected = selectedFriends.includes(friend.id)
                return (
                  <Pressable
                    key={friend.id}
                    style={[styles.friendChip, isSelected && styles.friendChipSelected]}
                    onPress={() => toggleFriendSelection(friend.id)}
                  >
                    {isSelected && <Check size={14} color="#FFF" />}
                    <Users size={14} color={isSelected ? "#FFF" : "#FF6B35"} />
                    <Text style={[styles.friendChipText, isSelected && styles.friendChipTextSelected]}>
                      {friend.username}
                    </Text>
                  </Pressable>
                )
              })}
              {friends.length === 0 && (
                <Text style={styles.noFriends}>Ajoutez des amis d'abord</Text>
              )}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Message vidéo</Text>
            {videoUri ? (
              <View style={styles.videoPreview}>
                <Video size={32} color="#FF6B35" />
                <Text style={styles.videoText}>Vidéo sélectionnée</Text>
                <Pressable onPress={() => setVideoUri(null)} style={styles.removeVideo}>
                  <X size={16} color="#FFF" />
                </Pressable>
              </View>
            ) : (
              <Pressable style={styles.uploadButton} onPress={showVideoOptions}>
                <Video size={24} color="#FF6B35" />
                <Text style={styles.uploadText}>Enregistrer ou choisir une vidéo</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>🎵 Musique d'ambiance (Optionnel)</Text>

            {selectedMusic ? (
              <View style={styles.selectedMusicCard}>
                <Image source={{ uri: selectedMusic.cover }} style={styles.musicCover} />
                <View style={styles.selectedMusicInfo}>
                  <Text style={styles.selectedMusicTitle} numberOfLines={1}>{selectedMusic.title}</Text>
                  <Text style={styles.selectedMusicArtist} numberOfLines={1}>{selectedMusic.artist}</Text>
                </View>
                <Pressable onPress={clearMusic} style={styles.removeMusicButton}>
                  <X size={16} color="#FFF" />
                </Pressable>
              </View>
            ) : (
              <>
                <View style={styles.musicSearchContainer}>
                  <Search size={18} color="rgba(255,255,255,0.4)" />
                  <TextInput
                    style={styles.musicSearchInput}
                    placeholder="Rechercher une chanson..."
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={musicQuery}
                    onChangeText={setMusicQuery}
                    onSubmitEditing={handleMusicSearch}
                    returnKeyType="search"
                  />
                  {searchingMusic ? (
                    <ActivityIndicator size="small" color="#FF6B35" />
                  ) : (
                    <Pressable onPress={handleMusicSearch}>
                      <Music size={20} color="#FF6B35" />
                    </Pressable>
                  )}
                </View>

                {musicResults.length > 0 && (
                  <View style={styles.musicResultsContainer}>
                    {musicResults.map((track) => (
                      <Pressable
                        key={track.id}
                        style={styles.musicResultItem}
                        onPress={() => playPreview(track)}
                      >
                        <Image source={{ uri: track.cover }} style={styles.musicResultCover} />
                        <View style={styles.musicResultInfo}>
                          <Text style={styles.musicResultTitle} numberOfLines={1}>{track.title}</Text>
                          <Text style={styles.musicResultArtist} numberOfLines={1}>{track.artist}</Text>
                        </View>
                        {playingPreviewId === track.id ? (
                          <View style={styles.playingIndicator}>
                            <Text style={styles.playingText}>♫</Text>
                          </View>
                        ) : (
                          <Pressable onPress={() => selectMusic(track)} style={styles.selectMusicButton}>
                            <Check size={16} color="#FFF" />
                          </Pressable>
                        )}
                      </Pressable>
                    ))}
                  </View>
                )}
              </>
            )}
            <Text style={styles.musicHint}>Tap pour prévisualiser, ✓ pour sélectionner</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Note (Optionnel)</Text>
            <TextInput
              style={styles.messageInput}
              placeholder="Une petite note pour accompagner la vidéo..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date d'ouverture</Text>
            <Pressable style={styles.dateContainer} onPress={() => setShowDatePicker(true)}>
              <Calendar size={18} color="#FF6B35" />
              <Text style={styles.dateText}>
                {unlockDate.toLocaleDateString("fr-FR", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </Text>
            </Pressable>
            {showDatePicker && (
              <View style={styles.datePickerContainer}>
                <DateTimePicker
                  value={unlockDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                  themeVariant="dark"
                  accentColor="#FF6B35"
                  textColor="#FEFEFE"
                  locale="fr-FR"
                />
              </View>
            )}
          </View>

          <Pressable onPress={handleSend} disabled={sending}>
            <LinearGradient
              colors={sending ? ["#8B7355", "#8B7355"] : ["#FF6B35", "#D4A574"]}
              style={styles.sendButton}
            >
              {sending ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Send size={18} color="#FFF" />
                  <Text style={styles.sendButtonText}>Envoyer la capsule</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </AnimatedBackground>
  )
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0F0D0B" },
  container: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 120 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 32 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#FEFEFE" },
  form: { gap: 24 },
  inputGroup: { gap: 10 },
  label: { fontSize: 14, fontWeight: "600", color: "rgba(255,255,255,0.6)" },
  inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 14, paddingHorizontal: 16, height: 52, gap: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  input: { flex: 1, fontSize: 16, color: "#FEFEFE" },
  messageInput: { backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 14, padding: 16, fontSize: 16, color: "#FEFEFE", minHeight: 80, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  friendsScroll: { flexDirection: "row" },
  friendChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: "rgba(255, 107, 53, 0.1)", borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: "rgba(255, 107, 53, 0.3)" },
  friendChipSelected: { backgroundColor: "#FF6B35" },
  friendChipText: { color: "#FF6B35", fontSize: 14, fontWeight: "500" },
  friendChipTextSelected: { color: "#FFF" },
  noFriends: { color: "rgba(255,255,255,0.4)", fontSize: 14 },
  dateContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, gap: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  dateText: { color: "#FEFEFE", fontSize: 15, flex: 1, textTransform: "capitalize" },
  datePickerContainer: { marginTop: 12, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  sendButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, height: 56, borderRadius: 14, marginTop: 16 },
  sendButtonText: { color: "#FFF", fontSize: 17, fontWeight: "700" },
  uploadButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255, 107, 53, 0.1)", borderRadius: 14, height: 80, borderWidth: 1, borderColor: "rgba(255, 107, 53, 0.3)", borderStyle: "dashed", gap: 10 },
  uploadText: { color: "#FF6B35", fontSize: 15, fontWeight: "500" },
  videoPreview: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 14, padding: 16, gap: 12 },
  videoText: { color: "#FEFEFE", flex: 1 },
  removeVideo: { padding: 4, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 12 },

  // Music search styles
  musicSearchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, gap: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  musicSearchInput: { flex: 1, color: "#FEFEFE", fontSize: 15 },
  musicResultsContainer: { marginTop: 12, gap: 8 },
  musicResultItem: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 12, padding: 10, gap: 12 },
  musicResultCover: { width: 48, height: 48, borderRadius: 8 },
  musicResultInfo: { flex: 1 },
  musicResultTitle: { color: "#FEFEFE", fontSize: 14, fontWeight: "600" },
  musicResultArtist: { color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 2 },
  playingIndicator: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#FF6B35", alignItems: "center", justifyContent: "center" },
  playingText: { color: "#FFF", fontSize: 16 },
  selectMusicButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,107,53,0.3)", alignItems: "center", justifyContent: "center" },

  // Selected music card
  selectedMusicCard: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,107,53,0.15)", borderRadius: 14, padding: 12, gap: 12, borderWidth: 1, borderColor: "rgba(255,107,53,0.3)" },
  musicCover: { width: 56, height: 56, borderRadius: 10 },
  selectedMusicInfo: { flex: 1 },
  selectedMusicTitle: { color: "#FEFEFE", fontSize: 15, fontWeight: "600" },
  selectedMusicArtist: { color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 2 },
  removeMusicButton: { padding: 6, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 12 },

  musicHint: { color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 8 },
})
