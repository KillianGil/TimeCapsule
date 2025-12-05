"use client"

import { useEffect, useState } from "react"
import { View, Text, ScrollView, StyleSheet } from "react-native"
import { supabase } from "@/lib/supabase/mobile"
import type { Profile } from "@/lib/types"
// import { UserManagement } from "@/components/admin/user-management"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      if (data) setUsers(data)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Utilisateurs</Text>
        <Text style={styles.subtitle}>
          Gérer les comptes utilisateurs ({users.length} total)
        </Text>
      </View>

      {/* <UserManagement users={users} /> */}

      <View style={styles.list}>
        {users.map((user) => (
          <View key={user.id} style={styles.card}>
            <Text style={styles.cardTitle}>{user.username}</Text>
            <Text>Inscrit le: {new Date(user.created_at).toLocaleDateString("fr-FR")}</Text>
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
