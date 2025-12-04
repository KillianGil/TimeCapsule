import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { CapsuleViewer } from "@/components/dashboard/capsule-viewer"
import type { Capsule } from "@/lib/types"

interface CapsulePageProps {
  params: Promise<{ id: string }>
}

export default async function CapsulePage({ params }: CapsulePageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: capsule, error } = (await supabase
    .from("capsules")
    .select(`
      *,
      sender:profiles!capsules_sender_id_fkey(*),
      receiver:profiles!capsules_receiver_id_fkey(*)
    `)
    .eq("id", id)
    .single()) as { data: Capsule | null; error: unknown }

  if (error || !capsule) {
    notFound()
  }

  // Check if user has access
  if (capsule.sender_id !== user.id && capsule.receiver_id !== user.id) {
    notFound()
  }

  // Check if unlocked
  const isUnlocked = new Date(capsule.unlock_date) <= new Date()
  if (!isUnlocked) {
    redirect("/dashboard")
  }

  // Mark as viewed if receiver
  if (capsule.receiver_id === user.id && !capsule.is_viewed) {
    await supabase.from("capsules").update({ is_viewed: true, viewed_at: new Date().toISOString() }).eq("id", id)
  }

  return <CapsuleViewer capsule={capsule} currentUserId={user.id} />
}
