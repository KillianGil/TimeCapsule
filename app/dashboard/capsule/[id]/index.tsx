"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, ActivityIndicator } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { supabase } from "@/lib/supabase/mobile"
import type { Capsule } from "@/lib/types"
// import { CapsuleViewer } from "@/components/dashboard/capsule-viewer"

export default function CapsulePage() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const [capsule, setCapsule] = useState<Capsule | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCapsule()
  }, [id])

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

      // Check access
      if (data.sender_id !== user.id && data.receiver_id !== user.id) {
        setError("Accès refusé")
        return
      }

      // Check if unlocked
      const isUnlocked = new Date(data.unlock_date) <= new Date()
      if (!isUnlocked) {
        router.replace("/dashboard")
        return
      }

      // Mark as viewed if receiver
      if (data.receiver_id === user.id && !data.is_viewed) {
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

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    )
  }

  if (!capsule) return null

  // Temporarily render basic info until CapsuleViewer is refactored
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{capsule.title || "Sans titre"}</Text>
      <Text style={styles.info}>Type: {capsule.content_type}</Text>
      <Text style={styles.info}>
        De: {capsule.sender?.username} → {capsule.receiver?.username}
      </Text>
      <Text style={styles.info}>
        Déverrouillée le: {new Date(capsule.unlock_date).toLocaleDateString("fr-FR")}
      </Text>
      {capsule.message && (
        <View style={styles.messageBox}>
          <Text style={styles.messageLabel}>Message:</Text>
          <Text style={styles.message}>{capsule.message}</Text>
        </View>
      )}
      {/* <CapsuleViewer capsule={capsule} currentUserId={currentUserId!} /> */}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
    color: '#666',
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  info: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  messageBox: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  messageLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
  },
})
