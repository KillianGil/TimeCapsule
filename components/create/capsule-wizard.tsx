"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, XIcon } from "@/components/icons"
import { VideoRecorder } from "./video-recorder"
import { CapsuleDetails } from "./capsule-details"
import { DateTimePicker } from "./date-time-picker"
import { RecipientSelector } from "./recipient-selector"
import { CapsulePreview } from "./capsule-preview"
import type { Profile } from "@/lib/types"

type WizardStep = "record" | "details" | "schedule" | "recipient" | "preview"

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

interface CapsuleWizardProps {
  userId: string
  userProfile: Profile | null
  friends: Profile[]
}

export function CapsuleWizard({ userId, userProfile, friends }: CapsuleWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState<WizardStep>("record")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [capsuleData, setCapsuleData] = useState<CapsuleData>({
    videoBlob: null,
    videoUrl: null,
    title: "",
    note: "",
    musicTitle: "",
    location: null,
    unlockDate: null,
    recipientId: userId, // Default to self
  })

  const steps: WizardStep[] = ["record", "details", "schedule", "recipient", "preview"]
  const currentIndex = steps.indexOf(step)

  const goNext = () => {
    const nextIndex = currentIndex + 1
    if (nextIndex < steps.length) {
      setStep(steps[nextIndex])
    }
  }

  const goBack = () => {
    const prevIndex = currentIndex - 1
    if (prevIndex >= 0) {
      setStep(steps[prevIndex])
    } else {
      router.push("/dashboard")
    }
  }

  const handleVideoRecorded = (blob: Blob, url: string, location: { lat: number; lng: number } | null) => {
    setCapsuleData((prev) => ({ ...prev, videoBlob: blob, videoUrl: url, location }))
    goNext()
  }

  const handleDetailsComplete = (title: string, note: string, musicTitle: string) => {
    setCapsuleData((prev) => ({ ...prev, title, note, musicTitle }))
    goNext()
  }

  const handleDateSelected = (date: Date) => {
    setCapsuleData((prev) => ({ ...prev, unlockDate: date }))
    goNext()
  }

  const handleRecipientSelected = (recipientId: string) => {
    setCapsuleData((prev) => ({ ...prev, recipientId }))
    goNext()
  }

  const handleSubmit = async () => {
    if (!capsuleData.videoBlob || !capsuleData.unlockDate) {
      setError("Données manquantes")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()

      // Upload video to storage
      const fileName = `${userId}/${Date.now()}_${crypto.randomUUID()}.webm`
      const { error: uploadError } = await supabase.storage
        .from("capsule-videos")
        .upload(fileName, capsuleData.videoBlob, {
          contentType: "video/webm",
        })

      if (uploadError) throw uploadError

      // Create capsule record
      const { error: insertError } = await supabase.from("capsules").insert({
        sender_id: userId,
        receiver_id: capsuleData.recipientId,
        title: capsuleData.title || null,
        video_path: fileName,
        music_title: capsuleData.musicTitle || null,
        note: capsuleData.note || null,
        location_data: capsuleData.location,
        unlock_date: capsuleData.unlockDate.toISOString(),
      })

      if (insertError) throw insertError

      router.push("/dashboard?created=true")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'envoi")
    } finally {
      setIsSubmitting(false)
    }
  }

  const stepTitles: Record<WizardStep, string> = {
    record: "Enregistrer",
    details: "Détails",
    schedule: "Planifier",
    recipient: "Destinataire",
    preview: "Aperçu",
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-4 p-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={goBack}>
          {currentIndex === 0 ? <XIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
        </Button>
        <div className="flex-1">
          <h1 className="font-semibold text-foreground">{stepTitles[step]}</h1>
          <p className="text-xs text-muted-foreground">
            Étape {currentIndex + 1} sur {steps.length}
          </p>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {step === "record" && <VideoRecorder onVideoRecorded={handleVideoRecorded} />}

        {step === "details" && (
          <CapsuleDetails
            initialTitle={capsuleData.title}
            initialNote={capsuleData.note}
            initialMusicTitle={capsuleData.musicTitle}
            onComplete={handleDetailsComplete}
          />
        )}

        {step === "schedule" && (
          <DateTimePicker initialDate={capsuleData.unlockDate} onDateSelected={handleDateSelected} />
        )}

        {step === "recipient" && (
          <RecipientSelector
            userId={userId}
            userProfile={userProfile}
            friends={friends}
            selectedId={capsuleData.recipientId}
            onSelect={handleRecipientSelected}
          />
        )}

        {step === "preview" && (
          <CapsulePreview
            capsuleData={capsuleData}
            userProfile={userProfile}
            friends={friends}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            error={error}
          />
        )}
      </div>
    </div>
  )
}
