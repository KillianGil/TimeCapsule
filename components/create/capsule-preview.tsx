"use client"

import { Button } from "@/components/ui/button"
import { UserIcon, CalendarIcon, MapPinIcon, MusicIcon, SendIcon } from "@/components/icons"
import type { Profile } from "@/lib/types"

interface CapsuleData {
  videoBlob: Blob | null
  videoUrl: string | null
  title: string
  note: string
  musicTitle: string
  location: { lat: number; lng: number } | null
  unlockDate: Date | null
  recipientId: string
}

interface CapsulePreviewProps {
  capsuleData: CapsuleData
  userProfile: Profile | null
  friends: Profile[]
  onSubmit: () => void
  isSubmitting: boolean
  error: string | null
}

export function CapsulePreview({
  capsuleData,
  userProfile,
  friends,
  onSubmit,
  isSubmitting,
  error,
}: CapsulePreviewProps) {
  const recipient =
    capsuleData.recipientId === userProfile?.id ? userProfile : friends.find((f) => f.id === capsuleData.recipientId)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="p-4 md:p-8 max-w-lg mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-2">Vérifiez votre capsule</h2>
        <p className="text-sm text-muted-foreground">Relisez les détails avant d'envoyer</p>
      </div>

      {/* Video preview */}
      {capsuleData.videoUrl && (
        <div className="aspect-video rounded-xl overflow-hidden bg-black">
          <video src={capsuleData.videoUrl} controls className="w-full h-full object-cover" />
        </div>
      )}

      {/* Details */}
      <div className="space-y-4">
        {/* Title */}
        {capsuleData.title && (
          <div className="p-4 rounded-xl bg-card border border-border">
            <p className="text-sm text-muted-foreground mb-1">Titre</p>
            <p className="font-medium text-foreground">{capsuleData.title}</p>
          </div>
        )}

        {/* Recipient */}
        <div className="p-4 rounded-xl bg-card border border-border flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Destinataire</p>
            <p className="font-medium text-foreground">
              {recipient?.id === userProfile?.id ? "Moi-même" : recipient?.username || "Inconnu"}
            </p>
          </div>
        </div>

        {/* Unlock date */}
        {capsuleData.unlockDate && (
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date de déverrouillage</p>
              <p className="font-medium text-primary capitalize">{formatDate(capsuleData.unlockDate)}</p>
            </div>
          </div>
        )}

        {/* Optional info */}
        <div className="flex flex-wrap gap-3">
          {capsuleData.location && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-muted text-sm">
              <MapPinIcon className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Localisée</span>
            </div>
          )}
          {capsuleData.musicTitle && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-muted text-sm">
              <MusicIcon className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground truncate max-w-[150px]">{capsuleData.musicTitle}</span>
            </div>
          )}
        </div>

        {/* Note */}
        {capsuleData.note && (
          <div className="p-4 rounded-xl bg-card border border-border">
            <p className="text-sm text-muted-foreground mb-2">Note</p>
            <p className="text-foreground whitespace-pre-wrap text-sm">{capsuleData.note}</p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{error}</p>}

      {/* Submit button */}
      <Button onClick={onSubmit} disabled={isSubmitting} className="w-full gap-2" size="lg">
        {isSubmitting ? (
          "Envoi en cours..."
        ) : (
          <>
            <SendIcon className="w-4 h-4" />
            Sceller et envoyer
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Une fois envoyée, la capsule ne pourra plus être modifiée
      </p>
    </div>
  )
}
