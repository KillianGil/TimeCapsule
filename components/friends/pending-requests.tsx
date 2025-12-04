"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { UserIcon, CheckIcon, XIcon, InboxIcon } from "@/components/icons"
import type { Friendship, Profile } from "@/lib/types"

interface PendingRequestsProps {
  requests: Friendship[]
  type: "received" | "sent"
  onAccept?: (friendshipId: string) => void
  onReject?: (friendshipId: string) => void
  onCancel?: (friendshipId: string) => void
}

export function PendingRequests({ requests, type, onAccept, onReject, onCancel }: PendingRequestsProps) {
  const router = useRouter()
  const [processingId, setProcessingId] = useState<string | null>(null)

  const handleAccept = async (friendshipId: string) => {
    setProcessingId(friendshipId)

    const supabase = createClient()
    const { error } = await supabase
      .from("friendships")
      .update({ status: "accepted", updated_at: new Date().toISOString() })
      .eq("id", friendshipId)

    if (!error && onAccept) {
      onAccept(friendshipId)
      router.refresh()
    }

    setProcessingId(null)
  }

  const handleReject = async (friendshipId: string) => {
    setProcessingId(friendshipId)

    const supabase = createClient()
    const { error } = await supabase.from("friendships").delete().eq("id", friendshipId)

    if (!error && onReject) {
      onReject(friendshipId)
      router.refresh()
    }

    setProcessingId(null)
  }

  const handleCancel = async (friendshipId: string) => {
    setProcessingId(friendshipId)

    const supabase = createClient()
    const { error } = await supabase.from("friendships").delete().eq("id", friendshipId)

    if (!error && onCancel) {
      onCancel(friendshipId)
      router.refresh()
    }

    setProcessingId(null)
  }

  const getOtherProfile = (friendship: Friendship): Profile => {
    return type === "received" ? friendship.requester! : friendship.receiver!
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <InboxIcon className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">
          {type === "received" ? "Aucune demande reçue" : "Aucune demande en attente"}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {requests.map((request) => {
        const profile = getOtherProfile(request)
        const isProcessing = processingId === request.id

        return (
          <div key={request.id} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border">
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

            {type === "received" ? (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleAccept(request.id)} disabled={isProcessing} className="gap-1">
                  <CheckIcon className="w-4 h-4" />
                  Accepter
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReject(request.id)}
                  disabled={isProcessing}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <XIcon className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCancel(request.id)}
                disabled={isProcessing}
                className="text-muted-foreground"
              >
                Annuler
              </Button>
            )}
          </div>
        )
      })}
    </div>
  )
}
