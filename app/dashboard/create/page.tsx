import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CapsuleWizard } from "@/components/create/capsule-wizard"
import type { Profile } from "@/lib/types"

export default async function CreateCapsulePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single<Profile>()

  // Fetch friends list
  const { data: friendships } = await supabase
    .from("friendships")
    .select(`
      *,
      requester:profiles!friendships_requester_id_fkey(*),
      receiver:profiles!friendships_receiver_id_fkey(*)
    `)
    .eq("status", "accepted")
    .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)

  // Extract friend profiles
  const friends: Profile[] = (friendships || [])
    .map((f) => {
      if (f.requester_id === user.id) {
        return f.receiver as Profile
      }
      return f.requester as Profile
    })
    .filter(Boolean)

  return <CapsuleWizard userId={user.id} userProfile={profile} friends={friends} />
}
