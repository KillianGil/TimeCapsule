"use client"

import { View, Text, StyleSheet } from "react-native"
import { Link, useLocalSearchParams } from "expo-router"

export default function AuthErrorPage() {
  const params = useLocalSearchParams<{ error: string }>()

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logoText}>TimeCapsule</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Erreur d'authentification</Text>
        <Text style={styles.message}>
          {params?.error ? `Code d'erreur: ${params.error}` : "Une erreur inattendue s'est produite."}
        </Text>

        <Link href="/auth/login" style={styles.button}>
          <Text style={styles.buttonText}>Retour à la connexion</Text>
        </Link>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
})
