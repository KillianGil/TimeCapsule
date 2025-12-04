import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { FriendsManager } from "@/components/friends/friends-manager"
import { UsersIcon } from "@/components/icons"
import type { Friendship } from "@/lib/types"

export default async function FriendsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Fetch all friendships involving the user
  const { data: friendships } = (await supabase
    .from("friendships")
    .select(`
      *,
      requester:profiles!friendships_requester_id_fkey(*),
      receiver:profiles!friendships_receiver_id_fkey(*)
    `)
    .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)) as { data: Friendship[] | null }

  // Separate into categories
  const acceptedFriends: Friendship[] = []
  const pendingReceived: Friendship[] = []
  const pendingSent: Friendship[] = []
  ;(friendships || []).forEach((f) => {
    if (f.status === "accepted") {
      acceptedFriends.push(f)
    } else if (f.status === "pending") {
      if (f.receiver_id === user.id) {
        pendingReceived.push(f)
      } else {
        pendingSent.push(f)
      }
    }
  })

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <UsersIcon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mes Amis</h1>
          <p className="text-sm text-muted-foreground">
            {acceptedFriends.length} ami{acceptedFriends.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <FriendsManager
        userId={user.id}
        acceptedFriends={acceptedFriends}
        pendingReceived={pendingReceived}
        pendingSent={pendingSent}
      />
    </div>
  )
}
