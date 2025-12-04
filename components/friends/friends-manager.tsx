"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FriendSearch } from "./friend-search"
import { FriendsList } from "./friends-list"
import { PendingRequests } from "./pending-requests"
import type { Friendship } from "@/lib/types"

interface FriendsManagerProps {
  userId: string
  acceptedFriends: Friendship[]
  pendingReceived: Friendship[]
  pendingSent: Friendship[]
}

export function FriendsManager({ userId, acceptedFriends, pendingReceived, pendingSent }: FriendsManagerProps) {
  const [friends, setFriends] = useState(acceptedFriends)
  const [received, setReceived] = useState(pendingReceived)
  const [sent, setSent] = useState(pendingSent)

  const handleRequestAccepted = (friendshipId: string) => {
    const request = received.find((r) => r.id === friendshipId)
    if (request) {
      setReceived((prev) => prev.filter((r) => r.id !== friendshipId))
      setFriends((prev) => [...prev, { ...request, status: "accepted" }])
    }
  }

  const handleRequestRejected = (friendshipId: string) => {
    setReceived((prev) => prev.filter((r) => r.id !== friendshipId))
  }

  const handleRequestCancelled = (friendshipId: string) => {
    setSent((prev) => prev.filter((r) => r.id !== friendshipId))
  }

  const handleFriendRemoved = (friendshipId: string) => {
    setFriends((prev) => prev.filter((f) => f.id !== friendshipId))
  }

  const handleRequestSent = (friendship: Friendship) => {
    setSent((prev) => [...prev, friendship])
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <FriendSearch userId={userId} onRequestSent={handleRequestSent} />

      {/* Tabs */}
      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="friends">Amis ({friends.length})</TabsTrigger>
          <TabsTrigger value="received" className="relative">
            Reçues
            {received.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                {received.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent">Envoyées ({sent.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="mt-4">
          <FriendsList userId={userId} friendships={friends} onFriendRemoved={handleFriendRemoved} />
        </TabsContent>

        <TabsContent value="received" className="mt-4">
          <PendingRequests
            requests={received}
            type="received"
            onAccept={handleRequestAccepted}
            onReject={handleRequestRejected}
          />
        </TabsContent>

        <TabsContent value="sent" className="mt-4">
          <PendingRequests requests={sent} type="sent" onCancel={handleRequestCancelled} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
