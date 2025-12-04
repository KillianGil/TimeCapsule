"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserIcon, LogOutIcon } from "@/components/icons"
import type { Profile } from "@/lib/types"

interface ProfileFormProps {
  profile: Profile | null
  userEmail: string
}

export function ProfileForm({ profile, userEmail }: ProfileFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [username, setUsername] = useState(profile?.username || "")
  const [bio, setBio] = useState(profile?.bio || "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    const supabase = createClient()

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        username: username.toLowerCase().replace(/\s+/g, "_"),
        bio,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile?.id)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess(true)
      router.refresh()
    }

    setIsLoading(false)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informations du profil</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url || "/placeholder.svg"}
                    alt={profile.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-10 h-10 text-primary" />
                )}
              </div>
              <div>
                <p className="font-medium text-foreground">{profile?.username}</p>
                <p className="text-sm text-muted-foreground">{userEmail}</p>
              </div>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Nom d'utilisateur</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="votre_pseudo"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Parlez-nous de vous..."
                rows={3}
              />
            </div>

            {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{error}</p>}

            {success && (
              <p className="text-sm text-primary bg-primary/10 p-3 rounded-lg">Profil mis à jour avec succès !</p>
            )}

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-lg text-destructive">Zone dangereuse</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleLogout} className="gap-2">
            <LogOutIcon className="w-4 h-4" />
            Se déconnecter
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
