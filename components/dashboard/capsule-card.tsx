"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { LockIcon, UnlockIcon, MapPinIcon, MusicIcon, UserIcon } from "@/components/icons"
import { formatTimeRemaining, isUnlocked, formatDate } from "@/lib/utils/time"
import type { Capsule } from "@/lib/types"

interface CapsuleCardProps {
  capsule: Capsule
  currentUserId: string
}

export function CapsuleCard({ capsule, currentUserId }: CapsuleCardProps) {
  const [timeRemaining, setTimeRemaining] = useState(formatTimeRemaining(capsule.unlock_date))
  const unlocked = isUnlocked(capsule.unlock_date)
  const isSender = capsule.sender_id === currentUserId
  const otherUser = isSender ? capsule.receiver : capsule.sender

  useEffect(() => {
    if (unlocked) return

    const interval = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(capsule.unlock_date))
    }, 1000)

    return () => clearInterval(interval)
  }, [capsule.unlock_date, unlocked])

  return (
    <Link
      href={unlocked ? `/dashboard/capsule/${capsule.id}` : "#"}
      className={cn(
        "block p-4 rounded-xl border transition-all",
        unlocked
          ? "bg-card border-primary/30 hover:border-primary hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
          : "bg-card/50 border-border cursor-not-allowed opacity-70",
      )}
    >
      <div className="flex items-start gap-4">
        {/* Lock Status Icon */}
        <div
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
            unlocked ? "bg-primary/10" : "bg-muted",
          )}
        >
          {unlocked ? (
            <UnlockIcon className="w-6 h-6 text-primary" />
          ) : (
            <LockIcon className="w-6 h-6 text-muted-foreground" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-semibold text-foreground truncate">{capsule.title || "Capsule sans titre"}</h3>
            {!capsule.is_viewed && unlocked && (
              <span className="px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full flex-shrink-0">
                Nouveau
              </span>
            )}
          </div>

          {/* From/To */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <UserIcon className="w-4 h-4" />
            <span>
              {isSender ? "Envoyée à" : "De"}{" "}
              <span className="text-foreground">{otherUser?.username || "Vous-même"}</span>
            </span>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {capsule.location_data && (
              <span className="flex items-center gap-1">
                <MapPinIcon className="w-3 h-3" />
                Localisée
              </span>
            )}
            {capsule.music_title && (
              <span className="flex items-center gap-1">
                <MusicIcon className="w-3 h-3" />
                {capsule.music_title}
              </span>
            )}
          </div>
        </div>

        {/* Time/Status */}
        <div className="text-right flex-shrink-0">
          {unlocked ? (
            <span className="text-sm font-medium text-primary">{formatDate(capsule.unlock_date)}</span>
          ) : (
            <div className="text-right">
              <span className="text-lg font-bold text-foreground tabular-nums">{timeRemaining}</span>
              <p className="text-xs text-muted-foreground">restant</p>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
