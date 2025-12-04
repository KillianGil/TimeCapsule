"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { HomeIcon, InboxIcon, PlusIcon, UsersIcon, UserIcon } from "@/components/icons"

const navItems = [
  { href: "/dashboard", icon: HomeIcon, label: "Accueil" },
  { href: "/dashboard/received", icon: InboxIcon, label: "Reçues" },
  { href: "/dashboard/create", icon: PlusIcon, label: "Créer", primary: true },
  { href: "/dashboard/friends", icon: UsersIcon, label: "Amis" },
  { href: "/dashboard/profile", icon: UserIcon, label: "Profil" },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-card z-50">
      <ul className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                  item.primary ? "text-primary-foreground" : isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center",
                    item.primary && "w-12 h-12 -mt-6 rounded-full bg-primary shadow-lg",
                  )}
                >
                  <item.icon className={cn("w-5 h-5", item.primary && "w-6 h-6")} />
                </div>
                <span className="text-xs">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
