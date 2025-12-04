import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UsersIcon, CapsuleIcon, VideoIcon, InboxIcon } from "@/components/icons"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Fetch stats
  const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  const { count: totalCapsules } = await supabase.from("capsules").select("*", { count: "exact", head: true })

  const { count: unlockedCapsules } = await supabase
    .from("capsules")
    .select("*", { count: "exact", head: true })
    .lte("unlock_date", new Date().toISOString())

  const { count: pendingCapsules } = await supabase
    .from("capsules")
    .select("*", { count: "exact", head: true })
    .gt("unlock_date", new Date().toISOString())

  // Recent activity
  const { data: recentCapsules } = await supabase
    .from("capsules")
    .select(`
      *,
      sender:profiles!capsules_sender_id_fkey(username),
      receiver:profiles!capsules_receiver_id_fkey(username)
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard Admin</h1>
        <p className="text-muted-foreground">Vue d'ensemble de la plateforme</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Utilisateurs</CardTitle>
            <UsersIcon className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{totalUsers || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Capsules</CardTitle>
            <CapsuleIcon className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{totalCapsules || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Déverrouillées</CardTitle>
            <VideoIcon className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{unlockedCapsules || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">En attente</CardTitle>
            <InboxIcon className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{pendingCapsules || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Derniers inscrits</CardTitle>
          </CardHeader>
          <CardContent>
            {recentUsers && recentUsers.length > 0 ? (
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <UsersIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{user.username}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Aucun utilisateur</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Capsules */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dernières capsules</CardTitle>
          </CardHeader>
          <CardContent>
            {recentCapsules && recentCapsules.length > 0 ? (
              <div className="space-y-4">
                {recentCapsules.map((capsule) => (
                  <div key={capsule.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <CapsuleIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{capsule.title || "Sans titre"}</p>
                      <p className="text-xs text-muted-foreground">
                        {capsule.sender?.username} → {capsule.receiver?.username}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(capsule.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Aucune capsule</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
