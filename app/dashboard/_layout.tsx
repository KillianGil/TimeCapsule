"use client"

import React, { useEffect, useState, useRef } from "react"
import { View, StyleSheet, ActivityIndicator, Platform } from "react-native"
import { Tabs, useRouter } from "expo-router"
import { supabase } from "@/lib/supabase/mobile"
import { Home, Users, User } from "lucide-react-native"
import { registerForPushNotifications } from "@/lib/services/notifications"
import * as Notifications from 'expo-notifications'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function DashboardLayout() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const notificationListener = useRef<Notifications.EventSubscription | null>(null)
  const responseListener = useRef<Notifications.EventSubscription | null>(null)
  const insets = useSafeAreaInsets()

  useEffect(() => {
    checkAuth()

    // Register for push notifications (wrapped in try-catch for iOS without native module)
    try {
      registerForPushNotifications()

      // Listen for notifications received while app is open
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received:', notification)
      })

      // Listen for user tapping on notification
      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        const data = response.notification.request.content.data
        if (data?.capsuleId) {
          router.push(`/dashboard/capsule/${data.capsuleId}`)
        }
      })
    } catch (error) {
      console.log('Push notifications not available:', error)
    }

    return () => {
      try {
        if (notificationListener.current) notificationListener.current.remove()
        if (responseListener.current) responseListener.current.remove()
      } catch (e) { }
    }
  }, [])

  async function checkAuth() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) { router.replace("/auth/login"); return }
    } catch (error) { router.replace("/auth/login") } finally { setLoading(false) }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    )
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0F0D0B",
          borderTopWidth: 0,
          elevation: 0,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: "#FF6B35",
        tabBarInactiveTintColor: "rgba(255,255,255,0.4)",
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginTop: 2,
        },
      }}
    >
      {/* Main visible tabs - Only these 3 should appear */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color }) => <Home size={24} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: "Amis",
          tabBarIcon: ({ color }) => <Users size={24} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => <User size={24} color={color} strokeWidth={2} />,
        }}
      />

      {/* HIDDEN ROUTES - Use href: null to completely hide from tab bar */}
      <Tabs.Screen
        name="create"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="capsule"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="sent"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="received"
        options={{
          href: null,
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0F0D0B" },
})
