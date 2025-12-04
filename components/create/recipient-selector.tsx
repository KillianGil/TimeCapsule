"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserIcon, SearchIcon, CheckIcon } from "@/components/icons"
import { cn } from "@/lib/utils"
import type { Profile } from "@/lib/types"

interface RecipientSelectorProps {
  userId: string
  userProfile: Profile | null
  friends: Profile[]
  selectedId: string
  onSelect: (recipientId: string) => void
}

export function RecipientSelector({ userId, userProfile, friends, selectedId, onSelect }: RecipientSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selected, setSelected] = useState(selectedId)

  const filteredFriends = friends.filter((friend) => friend.username.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleSelect = (id: string) => {
    setSelected(id)
  }

  const handleSubmit = () => {
    onSelect(selected)
  }

  return (
    <div className="p-4 md:p-8 max-w-lg mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-2">À qui envoyer ?</h2>
        <p className="text-sm text-muted-foreground">Choisissez le destinataire de votre capsule</p>
      </div>

      {/* Self option */}
      <button
        onClick={() => handleSelect(userId)}
        className={cn(
          "w-full p-4 rounded-xl border flex items-center gap-4 transition-all text-left",
          selected === userId ? "border-primary bg-primary/10" : "border-border hover:border-muted-foreground",
        )}
      >
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <UserIcon className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-foreground">Moi-même</p>
          <p className="text-sm text-muted-foreground">@{userProfile?.username || "vous"}</p>
        </div>
        {selected === userId && <CheckIcon className="w-5 h-5 text-primary" />}
      </button>

      {/* Divider */}
      {friends.length > 0 && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Ou envoyer à un ami</span>
          </div>
        </div>
      )}

      {/* Search */}
      {friends.length > 0 && (
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un ami..."
            className="pl-10"
          />
        </div>
      )}

      {/* Friends list */}
      {friends.length > 0 ? (
        <div className="space-y-2 max-h-64 overflow-auto">
          {filteredFriends.map((friend) => (
            <button
              key={friend.id}
              onClick={() => handleSelect(friend.id)}
              className={cn(
                "w-full p-4 rounded-xl border flex items-center gap-4 transition-all text-left",
                selected === friend.id ? "border-primary bg-primary/10" : "border-border hover:border-muted-foreground",
              )}
            >
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {friend.avatar_url ? (
                  <img
                    src={friend.avatar_url || "/placeholder.svg"}
                    alt={friend.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{friend.username}</p>
                {friend.bio && <p className="text-sm text-muted-foreground truncate">{friend.bio}</p>}
              </div>
              {selected === friend.id && <CheckIcon className="w-5 h-5 text-primary" />}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-center text-sm text-muted-foreground py-4">
          Vous n'avez pas encore d'amis. Ajoutez des amis pour leur envoyer des capsules !
        </p>
      )}

      <Button onClick={handleSubmit} className="w-full" size="lg">
        Continuer
      </Button>
    </div>
  )
}
