"use client"

import { useState } from "react"
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Image, ScrollView, Alert } from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { ArrowLeft, Search, UserPlus, Users } from "lucide-react-native"
import { supabase } from "@/lib/supabase/mobile"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
import type { Profile } from "@/lib/types"

export default function AddFriendPage() {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<Profile[]>([])
    const [loading, setLoading] = useState(false)
    const [sendingTo, setSendingTo] = useState<string | null>(null)

    const handleSearch = async () => {
        if (searchQuery.length < 2) return
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data } = await supabase
                .from("profiles")
                .select("*")
                .ilike("username", `%${searchQuery}%`)
                .neq("id", user.id)
                .limit(10)

            setSearchResults(data || [])
        } catch (error) {
            console.error("Error searching:", error)
        } finally {
            setLoading(false)
        }
    }

    const sendFriendRequest = async (receiverId: string) => {
        setSendingTo(receiverId)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { error } = await supabase
                .from("friendships")
                .insert({
                    requester_id: user.id,
                    receiver_id: receiverId,
                    status: "pending"
                })

            if (error) throw error

            Alert.alert("Succès", "Demande d'ami envoyée !")
            setSearchResults(prev => prev.filter(p => p.id !== receiverId))
        } catch (error: any) {
            Alert.alert("Erreur", error.message || "Une erreur est survenue")
        } finally {
            setSendingTo(null)
        }
    }

    return (
        <AnimatedBackground>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Pressable style={styles.backButton} onPress={() => router.back()}>
                        <ArrowLeft size={24} color="#FEFEFE" strokeWidth={2} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Ajouter un ami</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Search */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Search size={20} color="rgba(255,255,255,0.4)" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Rechercher un pseudo..."
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={handleSearch}
                            returnKeyType="search"
                            autoCapitalize="none"
                        />
                    </View>
                    <Pressable style={styles.searchButton} onPress={handleSearch}>
                        <LinearGradient colors={["#FF6B35", "#D4A574"]} style={styles.searchButtonGradient}>
                            <Text style={styles.searchButtonText}>Chercher</Text>
                        </LinearGradient>
                    </Pressable>
                </View>

                {/* Results */}
                <ScrollView style={styles.results} contentContainerStyle={styles.resultsContent}>
                    {loading ? (
                        <ActivityIndicator color="#FF6B35" style={{ marginTop: 40 }} />
                    ) : searchResults.length > 0 ? (
                        searchResults.map((profile) => (
                            <View key={profile.id} style={styles.userCard}>
                                <View style={styles.userInfo}>
                                    <View style={styles.avatar}>
                                        {profile.avatar_url ? (
                                            <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
                                        ) : (
                                            <Users size={20} color="#D4A574" />
                                        )}
                                    </View>
                                    <Text style={styles.userName}>{profile.username}</Text>
                                </View>
                                <Pressable
                                    style={styles.addUserButton}
                                    onPress={() => sendFriendRequest(profile.id)}
                                    disabled={sendingTo === profile.id}
                                >
                                    {sendingTo === profile.id ? (
                                        <ActivityIndicator size="small" color="#FFF" />
                                    ) : (
                                        <UserPlus size={18} color="#FFF" />
                                    )}
                                </Pressable>
                            </View>
                        ))
                    ) : searchQuery.length >= 2 && !loading ? (
                        <View style={styles.emptyState}>
                            <Users size={48} color="rgba(255,255,255,0.2)" />
                            <Text style={styles.emptyText}>Aucun utilisateur trouvé</Text>
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <Search size={48} color="rgba(255,255,255,0.2)" />
                            <Text style={styles.emptyText}>Recherchez un ami par son pseudo</Text>
                        </View>
                    )}
                </ScrollView>
            </View>
        </AnimatedBackground>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 60 },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 24 },
    backButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
    headerTitle: { fontSize: 18, fontWeight: "700", color: "#FEFEFE" },
    searchContainer: { paddingHorizontal: 20, marginBottom: 20, gap: 12 },
    searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 16, paddingHorizontal: 16, height: 52, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", gap: 12 },
    searchInput: { flex: 1, color: "#FEFEFE", fontSize: 16 },
    searchButton: { borderRadius: 14, overflow: "hidden" },
    searchButtonGradient: { paddingVertical: 14, alignItems: "center" },
    searchButtonText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
    results: { flex: 1 },
    resultsContent: { paddingHorizontal: 20, paddingBottom: 100 },
    userCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
    userInfo: { flexDirection: "row", alignItems: "center", gap: 14 },
    avatar: { width: 48, height: 48, borderRadius: 14, backgroundColor: "rgba(212, 165, 116, 0.15)", alignItems: "center", justifyContent: "center", overflow: "hidden" },
    avatarImage: { width: "100%", height: "100%" },
    userName: { fontSize: 16, fontWeight: "600", color: "#FEFEFE" },
    addUserButton: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#FF6B35", alignItems: "center", justifyContent: "center" },
    emptyState: { alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 16 },
    emptyText: { color: "rgba(255,255,255,0.4)", fontSize: 15 },
})
