"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, MapPinIcon, MusicIcon, UserIcon, PlayIcon, PauseIcon } from "@/components/icons"
import { formatDateTime } from "@/lib/utils/time"
import type { Capsule } from "@/lib/types"

interface CapsuleViewerProps {
  capsule: Capsule
  currentUserId: string
}

export function CapsuleViewer({ capsule, currentUserId }: CapsuleViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const isSender = capsule.sender_id === currentUserId
  const otherUser = isSender ? capsule.receiver : capsule.sender

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-4 p-4 border-b border-border bg-background/80 backdrop-blur-sm">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ChevronLeftIcon className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="font-semibold text-foreground truncate">{capsule.title || "Capsule sans titre"}</h1>
          <p className="text-xs text-muted-foreground">
            {isSender ? "Envoyée à" : "De"} {otherUser?.username || "Vous-même"}
          </p>
        </div>
      </header>

      {/* Video Player */}
      <div className="relative aspect-[9/16] md:aspect-video max-w-3xl mx-auto bg-black">
        <video
          ref={videoRef}
          src={`/placeholder.svg?height=720&width=1280&query=video message from ${capsule.sender?.username}`}
          className="w-full h-full object-contain"
          playsInline
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        />
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity hover:bg-black/30"
        >
          <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center">
            {isPlaying ? (
              <PauseIcon className="w-8 h-8 text-primary-foreground" />
            ) : (
              <PlayIcon className="w-8 h-8 text-primary-foreground ml-1" />
            )}
          </div>
        </button>
      </div>

      {/* Capsule Info */}
      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
        {/* Metadata */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserIcon className="w-4 h-4" />
            <span>
              {isSender ? "Envoyée à" : "Envoyée par"}{" "}
              <span className="text-foreground font-medium">{otherUser?.username || "Vous-même"}</span>
            </span>
          </div>
          {capsule.music_title && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MusicIcon className="w-4 h-4" />
              <span>{capsule.music_title}</span>
            </div>
          )}
        </div>

        {/* Note */}
        {capsule.note && (
          <div className="p-4 rounded-xl bg-card border border-border">
            <p className="text-sm text-foreground whitespace-pre-wrap">{capsule.note}</p>
          </div>
        )}

        {/* Location Map */}
        {capsule.location_data && (
          <div className="rounded-xl overflow-hidden border border-border">
            <div className="p-3 bg-card flex items-center gap-2">
              <MapPinIcon className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Lieu d'enregistrement</span>
            </div>
            <div className="aspect-video bg-muted">
              <img
                src={`/map-location.png?height=400&width=800&query=map location ${capsule.location_data.lat} ${capsule.location_data.lng}`}
                alt="Location map"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Créée le {formatDateTime(capsule.created_at)}</span>
          <span>Déverrouillée le {formatDateTime(capsule.unlock_date)}</span>
        </div>
      </div>
    </div>
  )
}
