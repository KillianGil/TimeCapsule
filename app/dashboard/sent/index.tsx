"use client"

import { useEffect, useState } from "react"
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Pressable, Image } from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { ArrowLeft, Lock, Unlock, Clock, User, Music, Eye, EyeOff } from "lucide-react-native"
import { supabase } from "@/lib/supabase/mobile"
import type { Capsule } from "@/lib/types"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"

export default function SentCapsulesPage() {
  const router = useRouter()
  const [capsules, setCapsules] = useState<Capsule[]>([])
  const [loading, setLoading] = useState(true)

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

      const { data } = await supabase
        .from("capsules")
        .select(`
          *,
          sender:profiles!capsules_sender_id_fkey(*),
          receiver:profiles!capsules_receiver_id_fkey(*)
        `)
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false })

      if (data) setCapsules(data as Capsule[])
    } catch (error) {
      console.error("Error fetching capsules:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    })
  }

  if (loading) {
    return (
      <AnimatedBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      </AnimatedBackground>
    )
  }

  return (
    <AnimatedBackground>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#FEFEFE" />
          </Pressable>
          <View>
            <Text style={styles.title}>📤 Capsules envoyées</Text>
            <Text style={styles.subtitle}>{capsules.length} capsule{capsules.length > 1 ? "s" : ""}</Text>
          </View>
        </View>

        {capsules.length > 0 ? (
          <View style={styles.capsulesList}>
            {capsules.map((capsule) => {
              const isUnlocked = new Date(capsule.unlock_date) <= new Date()
              return (
                <Pressable
                  key={capsule.id}
                  style={styles.capsuleCard}
                  onPress={() => router.push(`/dashboard/capsule/${capsule.id}`)}
                >
                  <View style={styles.capsuleHeader}>
                    <View style={[styles.statusBadge, isUnlocked ? styles.badgeUnlocked : styles.badgeLocked]}>
                      {isUnlocked ? <Unlock size={14} color="#22c55e" /> : <Lock size={14} color="#FF6B35" />}
                      <Text style={[styles.statusText, isUnlocked && styles.statusTextUnlocked]}>
                        {isUnlocked ? "Déverrouillée" : "En attente"}
                      </Text>
                    </View>
                    <View style={styles.rightBadges}>
                      {capsule.is_viewed && (
                        <View style={styles.viewedBadge}>
                          <Eye size={12} color="#22c55e" />
                          <Text style={styles.viewedText}>Vue</Text>
                        </View>
                      )}
                      {capsule.music_title && (
                        <View style={styles.musicBadge}>
                          <Music size={12} color="#FF6B35" />
                        </View>
                      )}
                    </View>
                  </View>

                  <Text style={styles.capsuleTitle}>{capsule.title || "Capsule temporelle"}</Text>

                  <View style={styles.capsuleInfo}>
                    <User size={14} color="rgba(255,255,255,0.5)" />
                    <Text style={styles.capsuleReceiver}>Pour {capsule.receiver?.username || "Inconnu"}</Text>
                  </View>

                  <View style={styles.capsuleInfo}>
                    <Clock size={14} color="rgba(255,255,255,0.5)" />
                    <Text style={styles.capsuleDate}>
                      {isUnlocked
                        ? `Déverrouillée le ${formatDate(capsule.unlock_date)}`
                        : `Déverrouillage le ${formatDate(capsule.unlock_date)}`
                      }
                    </Text>
                  </View>

                  {capsule.note && (
                    <Text style={styles.capsuleNote} numberOfLines={2}>"{capsule.note}"</Text>
                  )}

                  {capsule.music_title && (
                    <View style={styles.musicInfo}>
                      <Music size={14} color="#FF6B35" />
                      <Text style={styles.musicText} numberOfLines={1}>{capsule.music_title}</Text>
                    </View>
                  )}

                  <View style={styles.tapHint}>
                    <Text style={styles.tapHintText}>Voir les détails →</Text>
                  </View>
                </Pressable>
              )
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTitle}>Aucune capsule envoyée</Text>
            <Text style={styles.emptyText}>Créez votre première capsule temporelle pour vos proches !</Text>
            <Pressable
              style={styles.createButton}
              onPress={() => router.push("/dashboard/create")}
            >
              <LinearGradient colors={["#FF6B35", "#FF8F65"]} style={styles.createButtonGradient}>
                <Text style={styles.createButtonText}>+ Créer une capsule</Text>
              </LinearGradient>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </AnimatedBackground>
  )
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  container: { flex: 1 },
  content: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 100 },
  header: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 32 },
  backButton: { padding: 8 },
  title: { fontSize: 24, fontWeight: "700", color: "#FEFEFE" },
  subtitle: { fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 4 },

  capsulesList: { gap: 16 },
  capsuleCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)"
  },
  capsuleHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  badgeLocked: { backgroundColor: "rgba(255,107,53,0.15)" },
  badgeUnlocked: { backgroundColor: "rgba(34,197,94,0.15)" },
  statusText: { fontSize: 12, fontWeight: "600", color: "#FF6B35" },
  statusTextUnlocked: { color: "#22c55e" },
  rightBadges: { flexDirection: "row", gap: 8 },
  viewedBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: "rgba(34,197,94,0.15)", borderRadius: 8 },
  viewedText: { fontSize: 11, color: "#22c55e", fontWeight: "500" },
  musicBadge: { padding: 6, backgroundColor: "rgba(255,107,53,0.15)", borderRadius: 8 },

  capsuleTitle: { fontSize: 18, fontWeight: "600", color: "#FEFEFE", marginBottom: 12 },
  capsuleInfo: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  capsuleReceiver: { fontSize: 14, color: "rgba(255,255,255,0.6)" },
  capsuleDate: { fontSize: 13, color: "rgba(255,255,255,0.5)" },
  capsuleNote: { fontSize: 13, color: "rgba(255,255,255,0.4)", fontStyle: "italic", marginTop: 10, lineHeight: 18 },

  musicInfo: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" },
  musicText: { fontSize: 13, color: "rgba(255,255,255,0.6)", flex: 1 },

  tapHint: { marginTop: 12, alignItems: "flex-end" },
  tapHintText: { fontSize: 13, color: "#FF6B35", fontWeight: "500" },

  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: "#FEFEFE", marginBottom: 8 },
  emptyText: { fontSize: 14, color: "rgba(255,255,255,0.5)", textAlign: "center", marginBottom: 24 },
  createButton: { borderRadius: 14, overflow: "hidden" },
  createButtonGradient: { paddingHorizontal: 24, paddingVertical: 14 },
  createButtonText: { color: "#FFF", fontSize: 15, fontWeight: "600" },
})
