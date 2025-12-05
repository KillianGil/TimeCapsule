"use client"

import { useEffect, useState } from "react"
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native"
import { useRouter } from "expo-router"
import { supabase } from "@/lib/supabase/mobile"
import type { Capsule } from "@/lib/types"

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📤 Capsules envoyées</Text>
        <Text style={styles.subtitle}>{capsules.length} capsule{capsules.length > 1 ? "s" : ""}</Text>
      </View>

      {capsules.length > 0 ? (
        capsules.map((capsule) => (
          <View key={capsule.id} style={styles.capsuleCard}>
            <Text style={styles.capsuleTitle}>{capsule.title || "Sans titre"}</Text>
            <Text style={styles.capsuleInfo}>À: {capsule.receiver?.username}</Text>
            <Text style={styles.capsuleDate}>
              Déverrouillage: {new Date(capsule.unlock_date).toLocaleDateString("fr-FR")}
            </Text>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>Vous n'avez pas encore envoyé de capsule</Text>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  capsuleCard: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  capsuleTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  capsuleInfo: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  capsuleDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyText: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
})
