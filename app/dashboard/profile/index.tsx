"use client"

import { useEffect, useState } from "react"
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Image, Pressable, Alert } from "react-native"
import { useRouter } from "expo-router"
import { supabase } from "@/lib/supabase/mobile"
import type { Profile } from "@/lib/types"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
import { LinearGradient } from "expo-linear-gradient"
import { LogOut, Camera, Mail, Calendar, User, Send, Inbox, Users, Music } from "lucide-react-native"
import * as ImagePicker from "expo-image-picker"
import { decode } from "base64-arraybuffer"

interface Stats {
  sentCount: number
  receivedCount: number
  friendsCount: number
  musicCapsulesCount: number
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [userEmail, setUserEmail] = useState("")
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [stats, setStats] = useState<Stats>({ sentCount: 0, receivedCount: 0, friendsCount: 0, musicCapsulesCount: 0 })

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
      setUserEmail(user.email || "")

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (data) setProfile(data)

      // Fetch stats
      const [sentResult, receivedResult, friendsResult, musicResult] = await Promise.all([
        supabase.from("capsules").select("*", { count: "exact", head: true }).eq("sender_id", user.id),
        supabase.from("capsules").select("*", { count: "exact", head: true }).eq("receiver_id", user.id),
        supabase.from("friendships").select("*", { count: "exact", head: true })
          .eq("status", "accepted")
          .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`),
        supabase.from("capsules").select("*", { count: "exact", head: true })
          .eq("sender_id", user.id)
          .not("music_title", "is", null),
      ])

      setStats({
        sentCount: sentResult.count || 0,
        receivedCount: receivedResult.count || 0,
        friendsCount: friendsResult.count || 0,
        musicCapsulesCount: musicResult.count || 0,
      })
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    Alert.alert(
      "Déconnexion",
      "Voulez-vous vraiment vous déconnecter ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Déconnexion",
          style: "destructive",
          onPress: async () => {
            await supabase.auth.signOut()
            router.replace("/")
          }
        }
      ]
    )
  }

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      })

      if (!result.canceled && result.assets[0].base64) {
        uploadImage(result.assets[0].base64)
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'ouvrir la galerie")
    }
  }

  const uploadImage = async (base64Image: string) => {
    try {
      setUploading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const fileName = `${user.id}/${Date.now()}.jpg`

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, decode(base64Image), {
          contentType: "image/jpeg",
          upsert: true
        })

      if (uploadError) {
        if (uploadError.message.includes("Bucket not found") || uploadError.message.includes("not found")) {
          throw new Error("Le bucket 'avatars' n'existe pas. Créez-le dans Supabase Dashboard > Storage > New Bucket 'avatars' (public).")
        }
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName)

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id)

      if (updateError) throw updateError

      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null)
      Alert.alert("Succès", "Photo de profil mise à jour !")
    } catch (error: any) {
      Alert.alert("Erreur", error.message || "Impossible de mettre à jour la photo")
      console.error(error)
    } finally {
      setUploading(false)
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
        <Text style={styles.headerTitle}>Mon Profil</Text>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <Pressable style={styles.avatarContainer} onPress={pickImage} disabled={uploading}>
            <LinearGradient colors={["#FF6B35", "#D4A574"]} style={styles.avatarGradient} />
            <View style={styles.avatarInner}>
              {uploading ? (
                <ActivityIndicator color="#FFF" />
              ) : profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
              ) : (
                <User size={40} color="#FEFEFE" />
              )}
            </View>
            <View style={styles.editBadge}>
              <Camera size={14} color="#FEFEFE" />
            </View>
          </Pressable>
          <Text style={styles.username}>{profile?.username || "Utilisateur"}</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <LinearGradient colors={["rgba(255,107,53,0.15)", "rgba(255,107,53,0.05)"]} style={styles.statGradient}>
              <Send size={22} color="#FF6B35" />
              <Text style={styles.statNumber}>{stats.sentCount}</Text>
              <Text style={styles.statLabel}>Envoyées</Text>
            </LinearGradient>
          </View>
          <View style={styles.statCard}>
            <LinearGradient colors={["rgba(34,197,94,0.15)", "rgba(34,197,94,0.05)"]} style={styles.statGradient}>
              <Inbox size={22} color="#22c55e" />
              <Text style={[styles.statNumber, { color: "#22c55e" }]}>{stats.receivedCount}</Text>
              <Text style={styles.statLabel}>Reçues</Text>
            </LinearGradient>
          </View>
          <View style={styles.statCard}>
            <LinearGradient colors={["rgba(59,130,246,0.15)", "rgba(59,130,246,0.05)"]} style={styles.statGradient}>
              <Users size={22} color="#3b82f6" />
              <Text style={[styles.statNumber, { color: "#3b82f6" }]}>{stats.friendsCount}</Text>
              <Text style={styles.statLabel}>Amis</Text>
            </LinearGradient>
          </View>
          <View style={styles.statCard}>
            <LinearGradient colors={["rgba(168,85,247,0.15)", "rgba(168,85,247,0.05)"]} style={styles.statGradient}>
              <Music size={22} color="#a855f7" />
              <Text style={[styles.statNumber, { color: "#a855f7" }]}>{stats.musicCapsulesCount}</Text>
              <Text style={styles.statLabel}>Avec musique</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Mail size={18} color="#FF6B35" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{userEmail}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Calendar size={18} color="#FF6B35" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Membre depuis</Text>
              <Text style={styles.infoValue}>
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "-"}
              </Text>
            </View>
          </View>
        </View>

        {/* Logout */}
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={18} color="#FF6B35" />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </Pressable>
      </ScrollView>
    </AnimatedBackground>
  )
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0F0D0B" },
  container: { flex: 1 },
  content: { padding: 24, paddingTop: 60, paddingBottom: 120 },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#FEFEFE", textAlign: "center", marginBottom: 32 },

  avatarSection: { alignItems: "center", marginBottom: 32 },
  avatarContainer: { width: 100, height: 100, borderRadius: 50, padding: 3, marginBottom: 16 },
  avatarGradient: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: 50 },
  avatarInner: { flex: 1, backgroundColor: "#1A1512", borderRadius: 50, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  avatarImage: { width: "100%", height: "100%" },
  editBadge: { position: "absolute", bottom: 0, right: 0, backgroundColor: "#FF6B35", padding: 8, borderRadius: 20, borderWidth: 3, borderColor: "#0F0D0B" },
  username: { fontSize: 22, fontWeight: "700", color: "#FEFEFE" },

  // Stats
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  statCard: { width: "47%", borderRadius: 16, overflow: "hidden" },
  statGradient: { padding: 16, alignItems: "center", gap: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", borderRadius: 16 },
  statNumber: { fontSize: 28, fontWeight: "800", color: "#FF6B35" },
  statLabel: { fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: "500" },

  infoCard: { backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 4, marginBottom: 32, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  infoRow: { flexDirection: "row", alignItems: "center", padding: 16, gap: 14 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 2 },
  infoValue: { fontSize: 15, color: "#FEFEFE", fontWeight: "500" },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.06)", marginLeft: 48 },

  logoutButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255, 107, 53, 0.3)", backgroundColor: "rgba(255, 107, 53, 0.1)" },
  logoutText: { color: "#FF6B35", fontSize: 15, fontWeight: "600" },
})
