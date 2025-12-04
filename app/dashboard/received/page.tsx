import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CapsuleList } from "@/components/dashboard/capsule-list"
import { InboxIcon } from "@/components/icons"
import type { Capsule } from "@/lib/types"

export default async function ReceivedCapsulesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: capsules } = (await supabase
    .from("capsules")
    .select(`
      *,
      sender:profiles!capsules_sender_id_fkey(*),
      receiver:profiles!capsules_receiver_id_fkey(*)
    `)
    .eq("receiver_id", user.id)
    .order("unlock_date", { ascending: true })) as { data: Capsule[] | null }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <InboxIcon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Capsules reçues</h1>
          <p className="text-sm text-muted-foreground">
            {capsules?.length || 0} capsule{(capsules?.length || 0) > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <CapsuleList
        capsules={capsules || []}
        currentUserId={user.id}
        emptyMessage="Vous n'avez pas encore reçu de capsule. Invitez vos amis !"
      />
    </div>
  )
}
