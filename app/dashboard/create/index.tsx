"use client"

import { useEffect, useState } from "react"
import { View, Text, ScrollView, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert, Platform } from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { ArrowLeft, Send, Calendar, Users, MessageSquare, Video, X } from "lucide-react-native"
import { supabase } from "@/lib/supabase/mobile"
import type { Profile } from "@/lib/types"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
import DateTimePicker from "@react-native-community/datetimepicker"
import * as ImagePicker from "expo-image-picker"

export default function CreateCapsulePage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [friends, setFriends] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  const [title, setTitle] = useState("")
  const [note, setNote] = useState("")
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null)

  // Date Picker State - Always visible for better UX
  const [unlockDate, setUnlockDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
  const [showDatePicker, setShowDatePicker] = useState(Platform.OS === 'ios') // Always show on iOS

  const [videoUri, setVideoUri] = useState<string | null>(null)

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

  const pickVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
      })

      if (!result.canceled && result.assets[0].uri) {
        setVideoUri(result.assets[0].uri)
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de sélectionner la vidéo")
    }
  }

  const handleDateChange = (event: any, selectedDate?: Date) => {
    // On Android, close picker after selection. On iOS, keep it open (inline mode)
    if (Platform.OS === 'android') {
      setShowDatePicker(false)
    }
    if (selectedDate) {
      setUnlockDate(selectedDate)
    }
  }

  const handleSend = async () => {
    if (!title || !selectedFriend) {
      Alert.alert("Erreur", "Veuillez remplir le titre et choisir un ami")
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
        const fileName = `${userId}/${Date.now()}.mp4`
        const response = await fetch(videoUri)
        const blob = await response.blob()

        const { error: uploadError } = await supabase.storage
          .from("capsules")
          .upload(fileName, blob, {
            contentType: "video/mp4",
            upsert: true
          })

        if (uploadError) {
          if (uploadError.message.includes("Bucket not found")) {
            throw new Error("Erreur Configuration: Le dossier 'capsules' n'existe pas sur le serveur. Veuillez le créer dans le Dashboard Supabase (Storage > New Bucket 'capsules' Public).")
          }
          throw uploadError
        }

        const { data: { publicUrl } } = supabase.storage.from("capsules").getPublicUrl(fileName)
        videoPath = publicUrl
      }

      const { error } = await supabase.from("capsules").insert({
        sender_id: userId,
        receiver_id: selectedFriend,
        title,
        note,
        video_path: videoPath,
        unlock_date: unlockDate.toISOString(),
        is_viewed: false,
      })

      if (error) throw error
      Alert.alert("Succès", "Capsule envoyée dans le futur !", [{ text: "Génial", onPress: () => router.back() }])
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
            <Text style={styles.label}>Destinataire</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.friendsScroll}>
              {friends.map((friend) => (
                <Pressable
                  key={friend.id}
                  style={[styles.friendChip, selectedFriend === friend.id && styles.friendChipSelected]}
                  onPress={() => setSelectedFriend(friend.id)}
                >
                  <Users size={14} color={selectedFriend === friend.id ? "#FFF" : "#FF6B35"} />
                  <Text style={[styles.friendChipText, selectedFriend === friend.id && styles.friendChipTextSelected]}>
                    {friend.username}
                  </Text>
                </Pressable>
              ))}
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
              <Pressable style={styles.uploadButton} onPress={pickVideo}>
                <Video size={24} color="#FF6B35" />
                <Text style={styles.uploadText}>Enregistrer ou choisir une vidéo</Text>
              </Pressable>
            )}
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
})
