"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SearchIcon, UserIcon, PlusIcon } from "@/components/icons"
import type { Profile, Friendship } from "@/lib/types"

interface FriendSearchProps {
  userId: string
  onRequestSent: (friendship: Friendship) => void
}

export function FriendSearch({ userId, onRequestSent }: FriendSearchProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Profile[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isSending, setSending] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!query.trim()) return

    setIsSearching(true)
    setError(null)
    setResults([])

    const supabase = createClient()

    const { data, error: searchError } = await supabase
      .from("profiles")
      .select("*")
      .ilike("username", `%${query}%`)
      .neq("id", userId)
      .limit(10)

    if (searchError) {
      setError("Erreur lors de la recherche")
    } else {
      setResults(data || [])
    }

    setIsSearching(false)
  }

  const handleSendRequest = async (receiverId: string) => {
    setSending(receiverId)
    setError(null)

    const supabase = createClient()

    // Check if friendship already exists
    const { data: existing } = await supabase
      .from("friendships")
      .select("*")
      .or(
        `and(requester_id.eq.${userId},receiver_id.eq.${receiverId}),and(requester_id.eq.${receiverId},receiver_id.eq.${userId})`,
      )
      .single()

    if (existing) {
      setError("Une demande existe déjà avec cet utilisateur")
      setSending(null)
      return
    }

    const { data, error: insertError } = await supabase
      .from("friendships")
      .insert({
        requester_id: userId,
        receiver_id: receiverId,
        status: "pending",
      })
      .select(`
        *,
        requester:profiles!friendships_requester_id_fkey(*),
        receiver:profiles!friendships_receiver_id_fkey(*)
      `)
      .single()

    if (insertError) {
      setError("Erreur lors de l'envoi de la demande")
    } else if (data) {
      onRequestSent(data as Friendship)
      setResults((prev) => prev.filter((p) => p.id !== receiverId))
      router.refresh()
    }

    setSending(null)
  }

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Rechercher par nom d'utilisateur..."
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} disabled={isSearching || !query.trim()}>
          {isSearching ? "..." : "Rechercher"}
        </Button>
      </div>

      {/* Error */}
      {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{error}</p>}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {results.length} résultat{results.length > 1 ? "s" : ""}
          </p>
          {results.map((profile) => (
            <div key={profile.id} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url || "/placeholder.svg"}
                    alt={profile.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{profile.username}</p>
                {profile.bio && <p className="text-sm text-muted-foreground truncate">{profile.bio}</p>}
              </div>
              <Button
                size="sm"
                onClick={() => handleSendRequest(profile.id)}
                disabled={isSending === profile.id}
                className="gap-1"
              >
                <PlusIcon className="w-4 h-4" />
                {isSending === profile.id ? "..." : "Ajouter"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
