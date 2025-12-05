"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { View, StyleSheet } from "react-native"
import { useRouter } from "expo-router"
import { supabase } from "@/lib/supabase/mobile"
// import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        router.replace("/auth/login")
        return
      }

      // Check if user is admin (via user metadata)
      const isAdmin = user.user_metadata?.is_admin === true
      if (!isAdmin) {
        router.replace("/dashboard")
        return
      }

      setIsAuthorized(true)
    } catch (error) {
      console.error("Auth check failed:", error)
      router.replace("/auth/login")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <View style={styles.container} /> // Or a loading spinner
  }

  if (!isAuthorized) {
    return null
  }

  return (
    <View style={styles.container}>
      {/* <AdminSidebar /> */}
      <View style={styles.content}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row', // Assuming sidebar was on the left
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
})
