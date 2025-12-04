import { CapsuleCard } from "./capsule-card"
import { CapsuleIcon } from "@/components/icons"
import type { Capsule } from "@/lib/types"

interface CapsuleListProps {
  capsules: Capsule[]
  currentUserId: string
  emptyMessage?: string
}

export function CapsuleList({ capsules, currentUserId, emptyMessage = "Aucune capsule" }: CapsuleListProps) {
  if (capsules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <CapsuleIcon className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {capsules.map((capsule) => (
        <CapsuleCard key={capsule.id} capsule={capsule} currentUserId={currentUserId} />
      ))}
    </div>
  )
}
