import { createClient } from "@/lib/supabase/server"
import { UserManagement } from "@/components/admin/user-management"
import type { Profile } from "@/lib/types"

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const { data: users } = (await supabase.from("profiles").select("*").order("created_at", { ascending: false })) as {
    data: Profile[] | null
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Utilisateurs</h1>
        <p className="text-muted-foreground">Gérer les comptes utilisateurs ({users?.length || 0} total)</p>
      </div>

      <UserManagement users={users || []} />
    </div>
  )
}
