"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator, Dimensions, Animated } from "react-native"
import { Link, useRouter, useFocusEffect } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { Clock, Send, Users, User, ChevronRight, Plus, Inbox, Gift } from "lucide-react-native"
import { supabase } from "@/lib/supabase/mobile"
import type { Capsule } from "@/lib/types"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"

const { width } = Dimensions.get("window")

export default function DashboardPage() {
  const router = useRouter()
  const [receivedCapsules, setReceivedCapsules] = useState<Capsule[]>([])
  const [sentCapsules, setSentCapsules] = useState<Capsule[]>([])
  const [stats, setStats] = useState({ received: 0, sent: 0, unviewed: 0 })
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState("")

  const scaleAnim = useRef(new Animated.Value(1)).current

  // Rafraîchit les données à chaque fois que la page est visible
  useFocusEffect(
    useCallback(() => {
      fetchData()
    }, [])
  )

  async function fetchData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace("/auth/login"); return }

      const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).single()
      if (profile) setUsername(profile.username || "")

      const { data: received } = await supabase
        .from("capsules")
        .select(`*, sender:profiles!capsules_sender_id_fkey(*), receiver:profiles!capsules_receiver_id_fkey(*)`)
        .eq("receiver_id", user.id)
        .order("unlock_date", { ascending: true })
        .limit(5)
      if (received) setReceivedCapsules(received as Capsule[])

      const { data: sent } = await supabase
        .from("capsules")
        .select(`*, sender:profiles!capsules_sender_id_fkey(*), receiver:profiles!capsules_receiver_id_fkey(*)`)
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)
      if (sent) setSentCapsules(sent as Capsule[])

      const { count: totalReceived } = await supabase.from("capsules").select("*", { count: "exact", head: true }).eq("receiver_id", user.id)
      const { count: totalSent } = await supabase.from("capsules").select("*", { count: "exact", head: true }).eq("sender_id", user.id)
      const { count: unviewedCount } = await supabase.from("capsules").select("*", { count: "exact", head: true }).eq("receiver_id", user.id).eq("is_viewed", false).lte("unlock_date", new Date().toISOString())

      setStats({ received: totalReceived || 0, sent: totalSent || 0, unviewed: unviewedCount || 0 })
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true }).start()
  }

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start()
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
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header - Consistent with Home */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingLabel}>BON RETOUR</Text>
            <Text style={styles.greeting}>{username || "Voyageur"}</Text>
          </View>
          <Pressable style={styles.profileButton} onPress={() => router.push("/dashboard/profile")}>
            <User size={20} color="#FF6B35" strokeWidth={1.5} />
          </Pressable>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Inbox size={20} color="#FF6B35" strokeWidth={1.5} />
            <Text style={styles.statValue}>{stats.received}</Text>
            <Text style={styles.statLabel}>Reçues</Text>
          </View>
          <View style={styles.statCard}>
            <Send size={20} color="#FF6B35" strokeWidth={1.5} />
            <Text style={styles.statValue}>{stats.sent}</Text>
            <Text style={styles.statLabel}>Envoyées</Text>
          </View>
          <View style={[styles.statCard, styles.statCardHighlight]}>
            <Gift size={20} color="#FF6B35" strokeWidth={1.5} />
            <Text style={[styles.statValue, styles.statValueHighlight]}>{stats.unviewed}</Text>
            <Text style={styles.statLabel}>À ouvrir</Text>
          </View>
        </View>

        {/* Create Button - Main Action */}
        <Pressable onPress={() => router.push("/dashboard/create")} onPressIn={handlePressIn} onPressOut={handlePressOut}>
          <Animated.View style={[styles.createButton, { transform: [{ scale: scaleAnim }] }]}>
            <LinearGradient colors={["#FF6B35", "#D4A574"]} style={styles.createButtonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <View style={styles.createButtonHighlight} />
              <View style={styles.createButtonContent}>
                <Plus size={20} color="#FFFFFF" strokeWidth={2} />
                <Text style={styles.createButtonText}>Créer une nouvelle capsule</Text>
              </View>
            </LinearGradient>
          </Animated.View>
        </Pressable>

        {/* Received Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Capsules reçues</Text>
            <Link href="/dashboard/received">
              <Text style={styles.seeAllText}>Voir tout</Text>
            </Link>
          </View>
          {receivedCapsules.length > 0 ? (
            receivedCapsules.map((capsule) => {
              const isUnlocked = new Date(capsule.unlock_date) <= new Date()
              return (
                <Pressable
                  key={capsule.id}
                  style={[styles.capsuleCard, isUnlocked && styles.capsuleCardUnlocked]}
                  onPress={() => isUnlocked && router.push(`/dashboard/capsule/${capsule.id}`)}
                  disabled={!isUnlocked}
                >
                  <View style={styles.capsuleIcon}>
                    {isUnlocked ? <Gift size={20} color="#FF6B35" strokeWidth={1.5} /> : <Clock size={20} color="rgba(255,255,255,0.4)" strokeWidth={1.5} />}
                  </View>
                  <View style={styles.capsuleContent}>
                    <Text style={styles.capsuleTitle}>{capsule.title || "Sans titre"}</Text>
                    <Text style={styles.capsuleInfo}>De {capsule.sender?.username}</Text>
                  </View>
                  <View style={[styles.capsuleBadge, isUnlocked && styles.capsuleBadgeUnlocked]}>
                    <Text style={styles.capsuleBadgeText}>
                      {isUnlocked ? "Ouvrir" : new Date(capsule.unlock_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </Text>
                  </View>
                </Pressable>
              )
            })
          ) : (
            <View style={styles.emptyState}>
              <Inbox size={32} color="rgba(255,255,255,0.2)" strokeWidth={1} />
              <Text style={styles.emptyText}>Aucune capsule reçue</Text>
            </View>
          )}
        </View>

        {/* Sent Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Capsules envoyées</Text>
            <Link href="/dashboard/sent">
              <Text style={styles.seeAllText}>Voir tout</Text>
            </Link>
          </View>
          {sentCapsules.length > 0 ? (
            sentCapsules.map((capsule) => (
              <View key={capsule.id} style={styles.capsuleCard}>
                <View style={styles.capsuleIcon}>
                  <Send size={20} color="rgba(255,255,255,0.4)" strokeWidth={1.5} />
                </View>
                <View style={styles.capsuleContent}>
                  <Text style={styles.capsuleTitle}>{capsule.title || "Sans titre"}</Text>
                  <Text style={styles.capsuleInfo}>À {capsule.receiver?.username}</Text>
                </View>
                <View style={styles.capsuleBadge}>
                  <Text style={styles.capsuleBadgeText}>
                    {new Date(capsule.unlock_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Send size={32} color="rgba(255,255,255,0.2)" strokeWidth={1} />
              <Text style={styles.emptyText}>Aucune capsule envoyée</Text>
            </View>
          )}
        </View>

        {/* Quick Links */}
        <View style={styles.quickLinks}>
          <Pressable style={styles.quickLink} onPress={() => router.push("/dashboard/friends")}>
            <Users size={20} color="#FF6B35" strokeWidth={1.5} />
            <Text style={styles.quickLinkText}>Gérer mes amis</Text>
            <ChevronRight size={16} color="rgba(255,255,255,0.3)" strokeWidth={1.5} />
          </Pressable>
        </View>
      </ScrollView>
    </AnimatedBackground>
  )
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0F0D0B" },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 100 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 32 },
  greetingLabel: { fontSize: 11, fontWeight: "600", color: "#FF6B35", letterSpacing: 2, marginBottom: 4 },
  greeting: { fontSize: 28, fontWeight: "700", color: "#FEFEFE" },
  profileButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 28 },
  statCard: { flex: 1, padding: 16, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 16, alignItems: "center", gap: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  statCardHighlight: { backgroundColor: "rgba(255, 107, 53, 0.08)", borderColor: "rgba(255, 107, 53, 0.15)" },
  statValue: { fontSize: 24, fontWeight: "700", color: "#FEFEFE" },
  statValueHighlight: { color: "#FF6B35" },
  statLabel: { fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: "500" },
  createButton: { marginBottom: 32, borderRadius: 16, overflow: "hidden", shadowColor: "#FF6B35", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  createButtonGradient: { borderRadius: 16, overflow: "hidden", position: "relative" },
  createButtonHighlight: { position: "absolute", top: 0, left: 0, right: 0, height: "50%", backgroundColor: "rgba(255,255,255,0.1)" },
  createButtonContent: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 18, gap: 10 },
  createButtonText: { color: "#FFFFFF", fontSize: 17, fontWeight: "600", letterSpacing: 0.3 },
  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#FEFEFE" },
  seeAllText: { fontSize: 14, color: "#FF6B35", fontWeight: "500" },
  capsuleCard: { flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  capsuleCardUnlocked: { backgroundColor: "rgba(255, 107, 53, 0.08)", borderColor: "rgba(255, 107, 53, 0.15)" },
  capsuleIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center", marginRight: 14 },
  capsuleContent: { flex: 1 },
  capsuleTitle: { fontSize: 15, fontWeight: "600", color: "#FEFEFE", marginBottom: 2 },
  capsuleInfo: { fontSize: 13, color: "rgba(255,255,255,0.5)" },
  capsuleBadge: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 8 },
  capsuleBadgeUnlocked: { backgroundColor: "rgba(255, 107, 53, 0.2)" },
  capsuleBadgeText: { fontSize: 12, color: "#FF6B35", fontWeight: "600" },
  emptyState: { alignItems: "center", padding: 32, backgroundColor: "rgba(255,255,255,0.02)", borderRadius: 16, gap: 12 },
  emptyText: { fontSize: 14, color: "rgba(255,255,255,0.4)" },
  quickLinks: { marginTop: 8 },
  quickLink: { flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", gap: 12 },
  quickLinkText: { flex: 1, fontSize: 15, fontWeight: "500", color: "#FEFEFE" },
})
