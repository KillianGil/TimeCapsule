"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { TimeCapsuleLogo, HomeIcon, UsersIcon, CapsuleIcon, SettingsIcon, LogOutIcon } from "@/components/icons"

const navItems = [
  { href: "/admin", icon: HomeIcon, label: "Dashboard" },
  { href: "/admin/users", icon: UsersIcon, label: "Utilisateurs" },
  { href: "/admin/capsules", icon: CapsuleIcon, label: "Capsules" },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <aside className="flex flex-col w-64 border-r border-border bg-card h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-2 p-4 border-b border-border">
        <TimeCapsuleLogo className="w-8 h-8 text-primary" />
        <div>
          <span className="text-lg font-semibold text-foreground">TimeCapsule</span>
          <p className="text-xs text-muted-foreground">Administration</p>
        </div>
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

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-2">
        <Button variant="ghost" className="w-full justify-start gap-2" asChild>
          <Link href="/dashboard">
            <SettingsIcon className="w-4 h-4" />
            Retour à l'app
          </Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground" onClick={handleLogout}>
          <LogOutIcon className="w-4 h-4" />
          Déconnexion
        </Button>
      </div>
    </aside>
  )
}
