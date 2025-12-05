"use client"

import { useEffect, useState } from "react"
import { View, Text, ScrollView, StyleSheet } from "react-native"
import { supabase } from "@/lib/supabase/mobile"
import type { Capsule } from "@/lib/types"

export default function AdminCapsulesPage() {
  const [capsules, setCapsules] = useState<Capsule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCapsules()
  }, [])

  async function fetchCapsules() {
    try {
      const { data, error } = await supabase
        .from("capsules")
        .select(`
          *,
          sender:profiles!capsules_sender_id_fkey(*),
          receiver:profiles!capsules_receiver_id_fkey(*)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      if (data) setCapsules(data as Capsule[])
    } catch (error) {
      console.error("Error fetching capsules:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Capsules</Text>
        <Text style={styles.subtitle}>
          Modérer et gérer les capsules ({capsules.length} total)
        </Text>
      </View>

      {/* CapsuleManagement component is temporarily disabled as it needs refactoring for mobile */}
      {/* <CapsuleManagement capsules={capsules} /> */}

      <View style={styles.list}>
        {capsules.map((capsule) => (
          <View key={capsule.id} style={styles.card}>
            <Text style={styles.cardTitle}>{capsule.title || "Sans titre"}</Text>
            <Text>De: {capsule.sender?.username}</Text>
            <Text>Pour: {capsule.receiver?.username}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  list: {
    gap: 16,
  },
  card: {
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
})
