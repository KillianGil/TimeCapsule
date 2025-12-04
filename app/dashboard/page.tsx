import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CapsuleList } from "@/components/dashboard/capsule-list"
import { PlusIcon, InboxIcon, SendIcon } from "@/components/icons"
import type { Capsule } from "@/lib/types"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Fetch recent capsules (received)
  const { data: receivedCapsules } = (await supabase
    .from("capsules")
    .select(`
      *,
      sender:profiles!capsules_sender_id_fkey(*),
      receiver:profiles!capsules_receiver_id_fkey(*)
    `)
    .eq("receiver_id", user.id)
    .order("unlock_date", { ascending: true })
    .limit(5)) as { data: Capsule[] | null }

  // Fetch recent capsules (sent)
  const { data: sentCapsules } = (await supabase
    .from("capsules")
    .select(`
      *,
      sender:profiles!capsules_sender_id_fkey(*),
      receiver:profiles!capsules_receiver_id_fkey(*)
    `)
    .eq("sender_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)) as { data: Capsule[] | null }

  // Count stats
  const { count: totalReceived } = await supabase
    .from("capsules")
    .select("*", { count: "exact", head: true })
    .eq("receiver_id", user.id)

  const { count: totalSent } = await supabase
    .from("capsules")
    .select("*", { count: "exact", head: true })
    .eq("sender_id", user.id)

  const { count: unviewedCount } = await supabase
    .from("capsules")
    .select("*", { count: "exact", head: true })
    .eq("receiver_id", user.id)
    .eq("is_viewed", false)
    .lte("unlock_date", new Date().toISOString())

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Tableau de bord</h1>
          <p className="text-muted-foreground mt-1">Bienvenue dans votre coffre temporel</p>
        </div>
        <Button asChild className="hidden md:flex gap-2">
          <Link href="/dashboard/create">
            <PlusIcon className="w-4 h-4" />
            Nouvelle Capsule
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-card border border-border">
          <p className="text-2xl font-bold text-foreground">{totalReceived || 0}</p>
          <p className="text-sm text-muted-foreground">Reçues</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border">
          <p className="text-2xl font-bold text-foreground">{totalSent || 0}</p>
          <p className="text-sm text-muted-foreground">Envoyées</p>
        </div>
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
          <p className="text-2xl font-bold text-primary">{unviewedCount || 0}</p>
          <p className="text-sm text-muted-foreground">À ouvrir</p>
        </div>
      </div>

      {/* Received Capsules */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <InboxIcon className="w-5 h-5 text-primary" />
            Capsules reçues
          </h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/received">Voir tout</Link>
          </Button>
        </div>
        <CapsuleList
          capsules={receivedCapsules || []}
          currentUserId={user.id}
          emptyMessage="Aucune capsule reçue pour le moment"
        />
      </section>

      {/* Sent Capsules */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <SendIcon className="w-5 h-5 text-primary" />
            Capsules envoyées
          </h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/sent">Voir tout</Link>
          </Button>
        </div>
        <CapsuleList
          capsules={sentCapsules || []}
          currentUserId={user.id}
          emptyMessage="Vous n'avez pas encore envoyé de capsule"
        />
      </section>
    </div>
  )
}
