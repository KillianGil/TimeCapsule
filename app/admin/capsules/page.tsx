import { createClient } from "@/lib/supabase/server"
import { CapsuleManagement } from "@/components/admin/capsule-management"
import type { Capsule } from "@/lib/types"

export default async function AdminCapsulesPage() {
  const supabase = await createClient()

  const { data: capsules } = (await supabase
    .from("capsules")
    .select(`
      *,
      sender:profiles!capsules_sender_id_fkey(*),
      receiver:profiles!capsules_receiver_id_fkey(*)
    `)
    .order("created_at", { ascending: false })) as { data: Capsule[] | null }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Capsules</h1>
        <p className="text-muted-foreground">Modérer et gérer les capsules ({capsules?.length || 0} total)</p>
      </div>

      <CapsuleManagement capsules={capsules || []} />
    </div>
  )
}
