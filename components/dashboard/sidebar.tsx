"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  TimeCapsuleLogo,
  HomeIcon,
  InboxIcon,
  SendIcon,
  UsersIcon,
  PlusIcon,
  UserIcon,
  LogOutIcon,
  SettingsIcon,
} from "@/components/icons"
import type { Profile } from "@/lib/types"

const navItems = [
  { href: "/dashboard", icon: HomeIcon, label: "Accueil" },
  { href: "/dashboard/received", icon: InboxIcon, label: "Reçues" },
  { href: "/dashboard/sent", icon: SendIcon, label: "Envoyées" },
  { href: "/dashboard/friends", icon: UsersIcon, label: "Amis" },
]

interface SidebarProps {
  profile: Profile | null
}

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-2 p-4 border-b border-border">
        <TimeCapsuleLogo className="w-8 h-8 text-primary" />
        <span className="text-lg font-semibold text-foreground">TimeCapsule</span>
      </div>

      {/* Create Button */}
      <div className="p-4">
        <Button asChild className="w-full gap-2">
          <Link href="/dashboard/create">
            <PlusIcon className="w-4 h-4" />
            Nouvelle Capsule
          </Link>
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url || "/placeholder.svg"}
                alt={profile.username}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <UserIcon className="w-5 h-5 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{profile?.username || "Utilisateur"}</p>
            <p className="text-xs text-muted-foreground">Connecté</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="flex-1" asChild>
            <Link href="/dashboard/profile">
              <SettingsIcon className="w-4 h-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" className="flex-1" onClick={handleLogout}>
            <LogOutIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  )
}
