"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { UserIcon, XIcon, UsersIcon } from "@/components/icons"
import type { Friendship, Profile } from "@/lib/types"

interface FriendsListProps {
  userId: string
  friendships: Friendship[]
  onFriendRemoved: (friendshipId: string) => void
}

export function FriendsList({ userId, friendships, onFriendRemoved }: FriendsListProps) {
  const router = useRouter()
  const [removingId, setRemovingId] = useState<string | null>(null)

  const handleRemoveFriend = async (friendshipId: string) => {
    setRemovingId(friendshipId)

    const supabase = createClient()
    const { error } = await supabase.from("friendships").delete().eq("id", friendshipId)

    if (!error) {
      onFriendRemoved(friendshipId)
      router.refresh()
    }

    setRemovingId(null)
  }

  const getFriendProfile = (friendship: Friendship): Profile => {
    return friendship.requester_id === userId ? friendship.receiver! : friendship.requester!
  }

  if (friendships.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <UsersIcon className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">Vous n'avez pas encore d'amis</p>
        <p className="text-sm text-muted-foreground">Recherchez des utilisateurs pour les ajouter</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {friendships.map((friendship) => {
        const friend = getFriendProfile(friendship)
        return (
          <div key={friendship.id} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              {friend.avatar_url ? (
                <img
                  src={friend.avatar_url || "/placeholder.svg"}
                  alt={friend.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <UserIcon className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">{friend.username}</p>
              {friend.bio && <p className="text-sm text-muted-foreground truncate">{friend.bio}</p>}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveFriend(friendship.id)}
              disabled={removingId === friendship.id}
              className="text-muted-foreground hover:text-destructive"
            >
              <XIcon className="w-4 h-4" />
            </Button>
          </div>
        )
      })}
    </div>
  )
}
