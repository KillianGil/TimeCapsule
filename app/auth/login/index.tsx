"use client"

import { useState } from "react"
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native"
import { Link, useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { ArrowLeft, Mail, Lock } from "lucide-react-native"
import { supabase } from "@/lib/supabase/mobile"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.replace("/dashboard")
    } catch (error: any) {
      setError(error.message || "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatedBackground>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#FEFEFE" strokeWidth={2} />
          </Pressable>

          <View style={styles.header}>
            <Text style={styles.title}>Connexion</Text>
            <Text style={styles.subtitle}>Content de vous revoir !</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Mail size={20} color="rgba(255,255,255,0.4)" />
                <TextInput
                  style={styles.input}
                  placeholder="votre@email.com"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mot de passe</Text>
              <View style={styles.inputContainer}>
                <Lock size={20} color="rgba(255,255,255,0.4)" />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Pressable onPress={handleLogin} disabled={isLoading}>
              <LinearGradient
                colors={isLoading ? ["#8B7355", "#8B7355"] : ["#FF6B35", "#D4A574"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitButton}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Se connecter</Text>
                )}
              </LinearGradient>
            </Pressable>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Pas encore de compte ? </Text>
            <Link href="/auth/sign-up">
              <Text style={styles.linkText}>Créer un compte</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AnimatedBackground>
  )
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 60, paddingBottom: 40 },
  backButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center", marginLeft: -10, marginBottom: 20 },
  header: { marginBottom: 40 },
  title: { fontSize: 32, fontWeight: "800", color: "#FEFEFE", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "rgba(255,255,255,0.5)" },
  form: { gap: 20 },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: "600", color: "rgba(255,255,255,0.6)", marginLeft: 4 },
  inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 14, paddingHorizontal: 16, height: 56, gap: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  input: { flex: 1, fontSize: 16, color: "#FEFEFE" },
  errorContainer: { backgroundColor: "rgba(239, 68, 68, 0.15)", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "rgba(239, 68, 68, 0.3)" },
  errorText: { color: "#EF4444", fontSize: 14, textAlign: "center", fontWeight: "500" },
  submitButton: { height: 56, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 8 },
  submitButtonText: { fontSize: 17, fontWeight: "700", color: "#FFF" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 32 },
  footerText: { color: "rgba(255,255,255,0.4)", fontSize: 15 },
  linkText: { color: "#FF6B35", fontWeight: "600", fontSize: 15 },
})
