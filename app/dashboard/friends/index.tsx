"use client"

import { useEffect, useState } from "react"
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Image, Pressable } from "react-native"
import { useRouter } from "expo-router"
import { supabase } from "@/lib/supabase/mobile"
import type { Friendship } from "@/lib/types"
import { AnimatedBackground } from "@/components/ui/AnimatedBackground"
import { LinearGradient } from "expo-linear-gradient"
import { Users, UserPlus, Check, X, Clock, Search } from "lucide-react-native"

export default function FriendsPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [acceptedFriends, setAcceptedFriends] = useState<Friendship[]>([])
  const [pendingReceived, setPendingReceived] = useState<Friendship[]>([])
  const [pendingSent, setPendingSent] = useState<Friendship[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace("/auth/login")
        return
      }
      setUserId(user.id)

      const { data: friendships } = await supabase
        .from("friendships")
        .select(`
          *,
          requester:profiles!friendships_requester_id_fkey(*),
          receiver:profiles!friendships_receiver_id_fkey(*)
        `)
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)

      const accepted: Friendship[] = []
      const received: Friendship[] = []
      const sent: Friendship[] = []

        ; (friendships || []).forEach((f: any) => {
          if (f.status === "accepted") {
            accepted.push(f)
          } else if (f.status === "pending") {
            if (f.receiver_id === user.id) {
              received.push(f)
            } else {
              sent.push(f)
            }
          }
        })

      setAcceptedFriends(accepted)
      setPendingReceived(received)
      setPendingSent(sent)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  async function acceptFriendRequest(friendshipId: string) {
    try {
      const { error } = await supabase
        .from("friendships")
        .update({ status: "accepted" })
        .eq("id", friendshipId)

      if (error) throw error

      // Refresh data
      fetchData()
    } catch (error) {
      console.error("Error accepting friend request:", error)
    }
  }

  async function rejectFriendRequest(friendshipId: string) {
    try {
      const { error } = await supabase
        .from("friendships")
        .delete()
        .eq("id", friendshipId)

      if (error) throw error

      // Refresh data
      fetchData()
    } catch (error) {
      console.error("Error rejecting friend request:", error)
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    )
  }

  return (
    <AnimatedBackground>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Mes Amis</Text>
            <Text style={styles.headerSubtitle}>{acceptedFriends.length} ami{acceptedFriends.length > 1 ? "s" : ""}</Text>
          </View>
          <Pressable style={styles.addButton} onPress={() => router.push("/dashboard/friends/add")}>
            <LinearGradient colors={["#FF6B35", "#D4A574"]} style={styles.addButtonGradient} />
            <UserPlus size={20} color="#FEFEFE" />
          </Pressable>
        </View>

        {/* Pending Received */}
        {pendingReceived.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DEMANDES REÇUES</Text>
            {pendingReceived.map((f) => (
              <View key={f.id} style={styles.requestCard}>
                <LinearGradient colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.02)"]} style={styles.cardGradient} />
                <View style={styles.friendInfo}>
                  <View style={styles.avatarContainer}>
                    {f.requester?.avatar_url ? (
                      <Image source={{ uri: f.requester.avatar_url }} style={styles.avatar} />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Users size={20} color="#D4A574" />
                      </View>
                    )}
                  </View>
                  <Text style={styles.friendName}>{f.requester?.username}</Text>
                </View>
                <View style={styles.actions}>
                  <Pressable style={[styles.actionButton, styles.acceptButton]} onPress={() => acceptFriendRequest(f.id)}>
                    <Check size={16} color="#FEFEFE" />
                  </Pressable>
                  <Pressable style={[styles.actionButton, styles.rejectButton]} onPress={() => rejectFriendRequest(f.id)}>
                    <X size={16} color="#FEFEFE" />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Accepted Friends */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AMIS</Text>
          {acceptedFriends.length > 0 ? (
            acceptedFriends.map((f) => {
              const friend = f.requester_id === userId ? f.receiver : f.requester
              return (
                <View key={f.id} style={styles.friendCard}>
                  <LinearGradient colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.01)"]} style={styles.cardGradient} />
                  <View style={styles.friendInfo}>
                    <View style={styles.avatarContainer}>
                      {friend?.avatar_url ? (
                        <Image source={{ uri: friend.avatar_url }} style={styles.avatar} />
                      ) : (
                        <View style={styles.avatarPlaceholder}>
                          <Users size={20} color="#D4A574" />
                        </View>
                      )}
                    </View>
                    <View>
                      <Text style={styles.friendName}>{friend?.username}</Text>
                      <Text style={styles.friendStatus}>@{friend?.username?.toLowerCase()}</Text>
                    </View>
                  </View>
                </View>
              )
            })
          ) : (
            <View style={styles.emptyState}>
              <Users size={48} color="rgba(255,255,255,0.1)" />
              <Text style={styles.emptyText}>Répandez la lumière, invitez un ami</Text>
            </View>
          )}
        </View>

        {/* Pending Sent */}
        {pendingSent.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EN ATTENTE</Text>
            {pendingSent.map((f) => (
              <View key={f.id} style={styles.friendCard}>
                <LinearGradient colors={["rgba(255,255,255,0.03)", "rgba(255,255,255,0.01)"]} style={styles.cardGradient} />
                <View style={styles.friendInfo}>
                  <View style={styles.avatarContainer}>
                    {f.receiver?.avatar_url ? (
                      <Image source={{ uri: f.receiver.avatar_url }} style={styles.avatar} />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Users size={20} color="rgba(255,255,255,0.3)" />
                      </View>
                    )}
                  </View>
                  <Text style={[styles.friendName, { color: 'rgba(255,255,255,0.5)' }]}>{f.receiver?.username}</Text>
                </View>
                <View style={styles.pendingBadge}>
                  <Clock size={14} color="#D4A574" />
                  <Text style={styles.pendingText}>En attente</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </AnimatedBackground>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F0D0B',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FEFEFE',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  addButtonGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 2,
    marginBottom: 16,
  },
  friendCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  requestCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.3)',
  },
  cardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 165, 116, 0.1)',
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FEFEFE',
  },
  friendStatus: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButton: {
    backgroundColor: '#FF6B35',
  },
  rejectButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 165, 116, 0.1)',
  },
  pendingText: {
    fontSize: 12,
    color: '#D4A574',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 16,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 14,
    fontStyle: 'italic',
  },
})
