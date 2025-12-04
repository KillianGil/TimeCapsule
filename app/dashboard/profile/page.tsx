import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProfileForm } from "@/components/dashboard/profile-form"
import { UserIcon } from "@/components/icons"
import type { Profile } from "@/lib/types"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single<Profile>()

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <UserIcon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mon Profil</h1>
          <p className="text-sm text-muted-foreground">Gérez vos informations personnelles</p>
        </div>
      </div>

      <ProfileForm profile={profile} userEmail={user.email || ""} />
    </div>
  )
}
