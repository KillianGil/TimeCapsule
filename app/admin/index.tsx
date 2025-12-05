"use client"

import { useEffect, useState } from "react"
import { View, Text, ScrollView, StyleSheet } from "react-native"
import { supabase } from "@/lib/supabase/mobile"
import type { Capsule, Profile } from "@/lib/types"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCapsules: 0,
    unlockedCapsules: 0,
    pendingCapsules: 0,
  })
  const [recentCapsules, setRecentCapsules] = useState<Capsule[]>([])
  const [recentUsers, setRecentUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      // Fetch stats
      const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })
      const { count: totalCapsules } = await supabase.from("capsules").select("*", { count: "exact", head: true })

      const { count: unlockedCapsules } = await supabase
        .from("capsules")
        .select("*", { count: "exact", head: true })
        .lte("unlock_date", new Date().toISOString())

      const { count: pendingCapsules } = await supabase
        .from("capsules")
        .select("*", { count: "exact", head: true })
        .gt("unlock_date", new Date().toISOString())

      setStats({
        totalUsers: totalUsers || 0,
        totalCapsules: totalCapsules || 0,
        unlockedCapsules: unlockedCapsules || 0,
        pendingCapsules: pendingCapsules || 0,
      })

      // Recent activity
      const { data: recentCapsulesData } = await supabase
        .from("capsules")
        .select(`
          *,
          sender:profiles!capsules_sender_id_fkey(username),
          receiver:profiles!capsules_receiver_id_fkey(username)
        `)
        .order("created_at", { ascending: false })
        .limit(5)

      if (recentCapsulesData) setRecentCapsules(recentCapsulesData as Capsule[])

      const { data: recentUsersData } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5)

      if (recentUsersData) setRecentUsers(recentUsersData)

    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard Admin</Text>
        <Text style={styles.subtitle}>Vue d'ensemble de la plateforme</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.grid}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Utilisateurs</Text>
          <Text style={styles.cardValue}>{stats.totalUsers}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Total Capsules</Text>
          <Text style={styles.cardValue}>{stats.totalCapsules}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Déverrouillées</Text>
          <Text style={[styles.cardValue, { color: '#7c3aed' }]}>{stats.unlockedCapsules}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>En attente</Text>
          <Text style={styles.cardValue}>{stats.pendingCapsules}</Text>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Derniers inscrits</Text>
        {recentUsers.length > 0 ? (
          recentUsers.map((user) => (
            <View key={user.id} style={styles.listItem}>
              <Text style={styles.listItemTitle}>{user.username}</Text>
              <Text style={styles.listItemSubtitle}>
                {new Date(user.created_at).toLocaleDateString("fr-FR")}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Aucun utilisateur</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dernières capsules</Text>
        {recentCapsules.length > 0 ? (
          recentCapsules.map((capsule) => (
            <View key={capsule.id} style={styles.listItem}>
              <Text style={styles.listItemTitle}>{capsule.title || "Sans titre"}</Text>
              <Text style={styles.listItemSubtitle}>
                {capsule.sender?.username} → {capsule.receiver?.username}
              </Text>
              <Text style={styles.listItemDate}>
                {new Date(capsule.created_at).toLocaleDateString("fr-FR")}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Aucune capsule</Text>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
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
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  card: {
    width: '48%', // Approx 2 columns
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  listItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  listItemSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  listItemDate: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  emptyText: {
    color: '#999',
    fontStyle: 'italic',
  },
})
