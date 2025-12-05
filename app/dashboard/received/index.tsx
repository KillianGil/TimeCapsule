"use client"

import { useEffect, useState } from "react"
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Pressable, Image } from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { ArrowLeft, Lock, Unlock, Clock, User, Music } from "lucide-react-native"
import { supabase } from "@/lib/supabase/mobile"
import type { Capsule } from "@/lib/types"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"

export default function ReceivedCapsulesPage() {
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
        .eq("receiver_id", user.id)
        .order("unlock_date", { ascending: true })

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
            <Text style={styles.title}>📥 Capsules reçues</Text>
            <Text style={styles.subtitle}>{capsules.length} capsule{capsules.length > 1 ? "s" : ""}</Text>
          </View>
        </View>

        {capsules.length > 0 ? (
          <View style={styles.capsulesList}>
            {capsules.map((capsule) => {
              const isUnlocked = new Date(capsule.unlock_date) <= new Date()
              const isViewed = capsule.is_viewed

              // 3 states: locked (orange), new/unlocked (green), viewed (gray)
              let statusIcon, statusText, statusStyle, badgeStyle
              if (!isUnlocked) {
                statusIcon = <Lock size={14} color="#FF6B35" />
                statusText = "Verrouillée"
                statusStyle = styles.statusTextLocked
                badgeStyle = styles.badgeLocked
              } else if (!isViewed) {
                statusIcon = <Unlock size={14} color="#22c55e" />
                statusText = "Nouvelle !"
                statusStyle = styles.statusTextNew
                badgeStyle = styles.badgeNew
              } else {
                statusIcon = <Unlock size={14} color="rgba(255,255,255,0.4)" />
                statusText = "Déjà vue"
                statusStyle = styles.statusTextViewed
                badgeStyle = styles.badgeViewed
              }

              return (
                <Pressable
                  key={capsule.id}
                  style={[
                    styles.capsuleCard,
                    isUnlocked && !isViewed && styles.capsuleCardNew,
                    isUnlocked && isViewed && styles.capsuleCardViewed
                  ]}
                  onPress={() => isUnlocked && router.push(`/dashboard/capsule/${capsule.id}`)}
                  disabled={!isUnlocked}
                >
                  <View style={styles.capsuleHeader}>
                    <View style={[styles.statusBadge, badgeStyle]}>
                      {statusIcon}
                      <Text style={[styles.statusText, statusStyle]}>
                        {statusText}
                      </Text>
                    </View>
                    {capsule.music_title && (
                      <View style={styles.musicBadge}>
                        <Music size={12} color="#FF6B35" />
                      </View>
                    )}
                  </View>

                  <Text style={styles.capsuleTitle}>{capsule.title || "Capsule temporelle"}</Text>

                  <View style={styles.capsuleInfo}>
                    <User size={14} color="rgba(255,255,255,0.5)" />
                    <Text style={styles.capsuleSender}>De {capsule.sender?.username || "Anonyme"}</Text>
                  </View>

                  <View style={styles.capsuleInfo}>
                    <Clock size={14} color="rgba(255,255,255,0.5)" />
                    <Text style={styles.capsuleDate}>
                      {isUnlocked ? `Déverrouillée le ${formatDate(capsule.unlock_date)}` : `Déverrouillage le ${formatDate(capsule.unlock_date)}`}
                    </Text>
                  </View>

                  {isUnlocked && (
                    <View style={styles.tapHint}>
                      <Text style={styles.tapHintText}>Tap pour voir →</Text>
                    </View>
                  )}
                </Pressable>
              )
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTitle}>Aucune capsule reçue</Text>
            <Text style={styles.emptyText}>Invitez vos amis à vous envoyer des capsules temporelles !</Text>
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
  capsuleCardNew: {
    backgroundColor: "rgba(34,197,94,0.1)",
    borderColor: "rgba(34,197,94,0.3)"
  },
  capsuleCardViewed: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.06)",
    opacity: 0.8
  },
  capsuleHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  badgeLocked: { backgroundColor: "rgba(255,107,53,0.15)" },
  badgeNew: { backgroundColor: "rgba(34,197,94,0.2)" },
  badgeViewed: { backgroundColor: "rgba(255,255,255,0.08)" },
  statusText: { fontSize: 12, fontWeight: "600", color: "#FF6B35" },
  statusTextLocked: { color: "#FF6B35" },
  statusTextNew: { color: "#22c55e" },
  statusTextViewed: { color: "rgba(255,255,255,0.5)" },
  musicBadge: { padding: 6, backgroundColor: "rgba(255,107,53,0.15)", borderRadius: 8 },

  capsuleTitle: { fontSize: 18, fontWeight: "600", color: "#FEFEFE", marginBottom: 12 },
  capsuleInfo: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  capsuleSender: { fontSize: 14, color: "rgba(255,255,255,0.6)" },
  capsuleDate: { fontSize: 13, color: "rgba(255,255,255,0.5)" },

  tapHint: { marginTop: 12, alignItems: "flex-end" },
  tapHintText: { fontSize: 13, color: "#FF6B35", fontWeight: "500" },

  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: "#FEFEFE", marginBottom: 8 },
  emptyText: { fontSize: 14, color: "rgba(255,255,255,0.5)", textAlign: "center" },
})
