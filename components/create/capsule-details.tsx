"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MusicIcon } from "@/components/icons"

interface CapsuleDetailsProps {
  initialTitle: string
  initialNote: string
  initialMusicTitle: string
  onComplete: (title: string, note: string, musicTitle: string) => void
}

export function CapsuleDetails({ initialTitle, initialNote, initialMusicTitle, onComplete }: CapsuleDetailsProps) {
  const [title, setTitle] = useState(initialTitle)
  const [note, setNote] = useState(initialNote)
  const [musicTitle, setMusicTitle] = useState(initialMusicTitle)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onComplete(title, note, musicTitle)
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 md:p-8 max-w-lg mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-2">Ajoutez des détails</h2>
        <p className="text-sm text-muted-foreground">Personnalisez votre capsule temporelle</p>
      </div>

      <div className="space-y-4">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Titre de la capsule</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Message d'anniversaire 2025"
            maxLength={100}
          />
        </div>

        {/* Note */}
        <div className="space-y-2">
          <Label htmlFor="note">Note personnelle (optionnel)</Label>
          <Textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ajoutez un message écrit qui accompagnera la vidéo..."
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right">{note.length}/500</p>
        </div>

        {/* Music */}
        <div className="space-y-2">
          <Label htmlFor="music" className="flex items-center gap-2">
            <MusicIcon className="w-4 h-4" />
            Titre de musique (optionnel)
          </Label>
          <Input
            id="music"
            value={musicTitle}
            onChange={(e) => setMusicTitle(e.target.value)}
            placeholder="Ex: La chanson qu'on écoutait..."
          />
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg">
        Continuer
      </Button>
    </form>
  )
}
