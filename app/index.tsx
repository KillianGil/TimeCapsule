"use client"

import React, { useEffect, useRef } from "react"
import { View, Text, StyleSheet, Pressable, Dimensions, Animated, Easing, Image } from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { ArrowRight, Sparkles } from "lucide-react-native"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"

const { width, height } = Dimensions.get("window")

// Floating particle component
const FloatingParticle = ({ delay, startX, size }: { delay: number; startX: number; size: number }) => {
  const translateY = useRef(new Animated.Value(height + 50)).current
  const translateX = useRef(new Animated.Value(startX)).current
  const opacity = useRef(new Animated.Value(0)).current
  const scale = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const animate = () => {
      translateY.setValue(height + 50)
      opacity.setValue(0)
      scale.setValue(0)

      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -50,
            duration: 8000 + Math.random() * 4000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 0.6,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.delay(5000),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(scale, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: startX + (Math.random() - 0.5) * 100,
            duration: 8000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => animate())
    }
    animate()
  }, [])

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: size,
          height: size,
          transform: [{ translateY }, { translateX }, { scale }],
          opacity,
        },
      ]}
    />
  )
}

export default function HomePage() {
  const router = useRouter()

  // Entrance animations
  const logoOpacity = useRef(new Animated.Value(0)).current
  const logoScale = useRef(new Animated.Value(0.5)).current
  const taglineOpacity = useRef(new Animated.Value(0)).current
  const taglineY = useRef(new Animated.Value(20)).current
  const titleOpacity = useRef(new Animated.Value(0)).current
  const titleY = useRef(new Animated.Value(30)).current
  const subtitleOpacity = useRef(new Animated.Value(0)).current
  const subtitleY = useRef(new Animated.Value(20)).current
  const buttonsOpacity = useRef(new Animated.Value(0)).current
  const buttonsY = useRef(new Animated.Value(40)).current
  const glowAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Staggered entrance animation
    Animated.sequence([
      // Logo entrance
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      // Tagline entrance
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(taglineY, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]),
      // Title entrance
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(titleY, {
          toValue: 0,
          duration: 700,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
      ]),
      // Subtitle entrance
      Animated.parallel([
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(subtitleY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      // Buttons entrance
      Animated.parallel([
        Animated.timing(buttonsOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(buttonsY, {
          toValue: 0,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start()

    // Continuous glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [])

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  })

  return (
    <AnimatedBackground>
      {/* Floating particles */}
      <View style={styles.particlesContainer}>
        {[...Array(8)].map((_, i) => (
          <FloatingParticle
            key={i}
            delay={i * 800}
            startX={Math.random() * width}
            size={4 + Math.random() * 8}
          />
        ))}
      </View>

      <View style={styles.container}>
        {/* Logo with animation */}
        <Animated.View style={[styles.header, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* Hero with staggered animations */}
        <View style={styles.hero}>
          <Animated.View style={{ opacity: taglineOpacity, transform: [{ translateY: taglineY }] }}>
            <View style={styles.taglineContainer}>
              <Sparkles size={14} color="#FF6B35" />
              <Text style={styles.tagline}>SOUVENIRS FUTURS</Text>
              <Sparkles size={14} color="#FF6B35" />
            </View>
          </Animated.View>

          <Animated.Text style={[styles.title, { opacity: titleOpacity, transform: [{ translateY: titleY }] }]}>
            Capturez{"\n"}l'instant.
          </Animated.Text>

          <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity, transform: [{ translateY: subtitleY }] }]}>
            Envoyez des messages vidéo{"\n"}à ouvrir dans le futur.
          </Animated.Text>
        </View>

        {/* Actions with animation */}
        <Animated.View style={[styles.actions, { opacity: buttonsOpacity, transform: [{ translateY: buttonsY }] }]}>
          <Pressable
            onPress={() => router.push("/auth/sign-up")}
            style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.97 : 1 }] }]}
          >
            <LinearGradient
              colors={["#FF6B35", "#FF8F65"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Commencer</Text>
              <ArrowRight size={20} color="#FFF" strokeWidth={2.5} />
            </LinearGradient>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.secondaryButton, { opacity: pressed ? 0.7 : 1 }]}
            onPress={() => router.push("/auth/login")}
          >
            <Text style={styles.secondaryButtonText}>J'ai déjà un compte</Text>
          </Pressable>
        </Animated.View>
      </View>
    </AnimatedBackground>
  )
}

const styles = StyleSheet.create({
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  particle: {
    position: "absolute",
    backgroundColor: "#FF6B35",
    borderRadius: 100,
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: 40,
    justifyContent: "flex-start",
  },
  header: {
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logoImage: {
    width: width * 0.95,
    height: 220,
  },
  hero: {
    alignItems: "center",
    marginBottom: 30,
  },
  taglineContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 24,
  },
  tagline: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FF6B35",
    letterSpacing: 4,
  },
  title: {
    fontSize: 48,
    fontWeight: "900",
    color: "#FEFEFE",
    textAlign: "center",
    lineHeight: 54,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 17,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    lineHeight: 26,
  },
  actions: {
    gap: 16,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 60,
    borderRadius: 18,
    gap: 10,
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 18,
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
    color: "rgba(255, 255, 255, 0.6)",
  },
})
