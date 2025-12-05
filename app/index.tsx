"use client"

import React from "react"
import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { ArrowRight } from "lucide-react-native"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"

const { width } = Dimensions.get("window")

export default function HomePage() {
  const router = useRouter()

  return (
    <AnimatedBackground>
      <View style={styles.container}>
        {/* Logo */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <LinearGradient colors={["#FF6B35", "#D4A574"]} style={styles.logoIcon} />
            <Text style={styles.logoText}>TimeCapsule</Text>
          </View>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.tagline}>SOUVENIRS FUTURS</Text>
          <Text style={styles.title}>
            Capturez{"\n"}l'instant.
          </Text>
          <Text style={styles.subtitle}>
            Envoyez des messages à ouvrir plus tard.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable onPress={() => router.push("/auth/sign-up")}>
            <LinearGradient
              colors={["#FF6B35", "#D4A574"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Commencer</Text>
              <ArrowRight size={20} color="#FFF" strokeWidth={2.5} />
            </LinearGradient>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={() => router.push("/auth/login")}>
            <Text style={styles.secondaryButtonText}>J'ai déjà un compte</Text>
          </Pressable>
        </View>
      </View>
    </AnimatedBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 50,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
  },
  logoText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FEFEFE",
  },
  hero: {
    alignItems: "center",
  },
  tagline: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FF6B35",
    letterSpacing: 3,
    marginBottom: 20,
  },
  title: {
    fontSize: 44,
    fontWeight: "800",
    color: "#FEFEFE",
    textAlign: "center",
    lineHeight: 50,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.5)",
    textAlign: "center",
  },
  actions: {
    gap: 16,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: 16,
    gap: 10,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFF",
  },
  secondaryButton: {
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.5)",
  },
})
