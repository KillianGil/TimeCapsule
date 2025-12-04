"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { SearchIcon, CapsuleIcon, XIcon, LockIcon, UnlockIcon } from "@/components/icons"
import { isUnlocked } from "@/lib/utils/time"
import type { Capsule } from "@/lib/types"

interface CapsuleManagementProps {
  capsules: Capsule[]
}

export function CapsuleManagement({ capsules: initialCapsules }: CapsuleManagementProps) {
  const router = useRouter()
  const [capsules, setCapsules] = useState(initialCapsules)
  const [searchQuery, setSearchQuery] = useState("")
  const [capsuleToDelete, setCapsuleToDelete] = useState<Capsule | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredCapsules = capsules.filter(
    (capsule) =>
      (capsule.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      capsule.sender?.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      capsule.receiver?.username.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDeleteCapsule = async () => {
    if (!capsuleToDelete) return

    setIsDeleting(true)

    const supabase = createClient()

    // Delete video from storage
    if (capsuleToDelete.video_path) {
      await supabase.storage.from("capsule-videos").remove([capsuleToDelete.video_path])
    }

    // Delete capsule record
    const { error } = await supabase.from("capsules").delete().eq("id", capsuleToDelete.id)

    if (!error) {
      setCapsules((prev) => prev.filter((c) => c.id !== capsuleToDelete.id))
      router.refresh()
    }

    setIsDeleting(false)
    setCapsuleToDelete(null)
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-md">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher par titre ou utilisateur..."
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Capsule</TableHead>
              <TableHead>Expéditeur</TableHead>
              <TableHead>Destinataire</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date de déverrouillage</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCapsules.length > 0 ? (
              filteredCapsules.map((capsule) => {
                const unlocked = isUnlocked(capsule.unlock_date)
                return (
                  <TableRow key={capsule.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <CapsuleIcon className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium truncate max-w-[150px]">{capsule.title || "Sans titre"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{capsule.sender?.username || "-"}</TableCell>
                    <TableCell className="text-muted-foreground">{capsule.receiver?.username || "-"}</TableCell>
                    <TableCell>
                      {unlocked ? (
                        <Badge variant="default" className="gap-1 bg-primary/10 text-primary border-0">
                          <UnlockIcon className="w-3 h-3" />
                          Déverrouillée
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <LockIcon className="w-3 h-3" />
                          Verrouillée
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(capsule.unlock_date).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCapsuleToDelete(capsule)}
                        className="text-destructive hover:text-destructive"
                      >
                        <XIcon className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Aucune capsule trouvée
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!capsuleToDelete} onOpenChange={() => setCapsuleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la capsule ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la capsule{" "}
              <span className="font-semibold">"{capsuleToDelete?.title || "Sans titre"}"</span> envoyée par{" "}
              {capsuleToDelete?.sender?.username} ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCapsule}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
