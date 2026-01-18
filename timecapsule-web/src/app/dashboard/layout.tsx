'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Home, Users, User, Plus, Menu, X } from 'lucide-react'
import { getSupabase } from '@/lib/supabase'
import type { Profile } from '@/lib/types'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const pathname = usePathname()
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
        checkAuth()
    }, [])

    async function checkAuth() {
        try {
            const supabase = getSupabase()
            const { data: { user }, error } = await supabase.auth.getUser()

            if (error || !user) {
                router.replace('/auth/login')
                return
            }

            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (profileData) {
                setProfile(profileData)
            }
        } catch (error) {
            router.replace('/auth/login')
        } finally {
            setLoading(false)
        }
    }

    const navItems = [
        { href: '/dashboard', icon: Home, label: 'Accueil' },
        { href: '/dashboard/friends', icon: Users, label: 'Amis' },
        { href: '/dashboard/profile', icon: User, label: 'Profil' },
    ]

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F0D0B' }}>
                <div style={{ width: '32px', height: '32px', border: '2px solid rgba(255,107,53,0.3)', borderTopColor: '#FF6B35', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            </div>
        )
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0F0D0B', color: '#FEFEFE' }}>
            {/* FLOATING NAVBAR - Same small height, but WIDER gaps */}
            <header style={{
                position: 'fixed',
                top: '12px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 50,
                backgroundColor: 'rgba(26,21,18,0.92)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '14px',
                padding: '6px 32px',
                display: 'flex',
                alignItems: 'center',
                gap: '60px'
            }}>
                {/* Small Logo - same as before */}
                <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    <Image
                        src="/logo.png"
                        alt="TimeCapsule"
                        width={80}
                        height={28}
                        style={{ objectFit: 'contain' }}
                        priority
                    />
                </Link>

                {/* Nav Links - Same small size, WIDER gaps */}
                <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="hidden-mobile">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href === '/dashboard' && pathname === '/dashboard') ||
                            (item.href !== '/dashboard' && pathname.startsWith(item.href))
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 16px',
                                    borderRadius: '8px',
                                    color: isActive ? '#FF6B35' : 'rgba(255,255,255,0.6)',
                                    backgroundColor: isActive ? 'rgba(255,107,53,0.12)' : 'transparent',
                                    textDecoration: 'none',
                                    fontWeight: 500,
                                    fontSize: '14px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <item.icon size={14} strokeWidth={isActive ? 2 : 1.5} />
                                <span>{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                {/* Create Button - Same small size */}
                <Link
                    href="/dashboard/create"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #FF6B35, #D4A574)',
                        textDecoration: 'none',
                        color: '#FFF',
                        fontWeight: 600,
                        fontSize: '14px',
                        flexShrink: 0
                    }}
                    className="hidden-mobile"
                >
                    <Plus size={14} />
                    <span>Nouvelle Capsule</span>
                </Link>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    style={{
                        padding: '4px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        color: 'rgba(255,255,255,0.6)'
                    }}
                    className="show-mobile"
                >
                    {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </header>

            {/* Mobile dropdown */}
            {mobileMenuOpen && (
                <div style={{
                    position: 'fixed',
                    top: '60px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 49,
                    backgroundColor: 'rgba(15,13,11,0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '14px',
                    padding: '12px',
                    minWidth: '200px'
                }} className="show-mobile">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                color: 'rgba(255,255,255,0.7)',
                                textDecoration: 'none',
                                fontWeight: 500,
                                fontSize: '14px'
                            }}
                        >
                            <item.icon size={18} />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                    <Link
                        href="/dashboard/create"
                        onClick={() => setMobileMenuOpen(false)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            padding: '10px',
                            marginTop: '8px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #FF6B35, #D4A574)',
                            textDecoration: 'none',
                            color: '#FFF',
                            fontWeight: 600,
                            fontSize: '13px'
                        }}
                    >
                        <Plus size={16} />
                        <span>Nouvelle Capsule</span>
                    </Link>
                </div>
            )}

            {/* Main Content - More padding to avoid navbar hiding content */}
            <main style={{ minHeight: '100vh', paddingTop: '100px' }}>
                {children}
            </main>

            {/* CSS for responsive */}
            <style jsx global>{`
                .hidden-mobile { display: flex; }
                .show-mobile { display: none; }
                @media (max-width: 768px) {
                    .hidden-mobile { display: none !important; }
                    .show-mobile { display: flex !important; }
                }
            `}</style>
        </div>
    )
}
