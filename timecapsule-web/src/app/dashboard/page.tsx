'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Inbox, Send, Gift, Plus, Clock, ChevronRight, Users, User } from 'lucide-react'
import { getSupabase } from '@/lib/supabase'
import type { Capsule } from '@/lib/types'
import AnimatedBackground from '@/components/AnimatedBackground'

export default function DashboardPage() {
    const router = useRouter()
    const [receivedCapsules, setReceivedCapsules] = useState<Capsule[]>([])
    const [sentCapsules, setSentCapsules] = useState<Capsule[]>([])
    const [stats, setStats] = useState({ received: 0, sent: 0, unviewed: 0 })
    const [loading, setLoading] = useState(true)
    const [username, setUsername] = useState('')

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        try {
            const supabase = getSupabase()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', user.id)
                .single()
            if (profile) setUsername(profile.username || '')

            const { data: received } = await supabase
                .from('capsules')
                .select(`*, sender:profiles!capsules_sender_id_fkey(*), receiver:profiles!capsules_receiver_id_fkey(*)`)
                .eq('receiver_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10)
            if (received) {
                // Sort: locked capsules first, then by most recent
                const sorted = (received as Capsule[]).sort((a, b) => {
                    const aLocked = new Date(a.unlock_date) > new Date()
                    const bLocked = new Date(b.unlock_date) > new Date()
                    // Locked capsules come first
                    if (aLocked && !bLocked) return -1
                    if (!aLocked && bLocked) return 1
                    // Then sort by created_at (most recent first)
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                })
                setReceivedCapsules(sorted.slice(0, 5))
            }

            const { data: sent } = await supabase
                .from('capsules')
                .select(`*, sender:profiles!capsules_sender_id_fkey(*), receiver:profiles!capsules_receiver_id_fkey(*)`)
                .eq('sender_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5)
            if (sent) setSentCapsules(sent as Capsule[])

            const { count: totalReceived } = await supabase.from('capsules').select('*', { count: 'exact', head: true }).eq('receiver_id', user.id)
            const { count: totalSent } = await supabase.from('capsules').select('*', { count: 'exact', head: true }).eq('sender_id', user.id)
            const { count: unviewedCount } = await supabase.from('capsules').select('*', { count: 'exact', head: true }).eq('receiver_id', user.id).eq('is_viewed', false).lte('unlock_date', new Date().toISOString())

            setStats({ received: totalReceived || 0, sent: totalSent || 0, unviewed: unviewedCount || 0 })
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#0F0D0B' }}>
                <div style={{ width: '32px', height: '32px', border: '2px solid rgba(255,107,53,0.3)', borderTopColor: '#FF6B35', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            </div>
        )
    }

    return (
        <AnimatedBackground>
            {/* Desktop: Wider container, more spacing */}
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 32px 100px 32px', minHeight: '100vh' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: '#FF6B35', letterSpacing: '2px', marginBottom: '6px' }}>BON RETOUR</p>
                        <h1 style={{ fontSize: '36px', fontWeight: 700, color: '#FEFEFE', margin: 0 }}>{username || 'Voyageur'}</h1>
                    </div>
                    <button
                        onClick={() => router.push('/dashboard/profile')}
                        style={{ width: '48px', height: '48px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                        <User size={22} color="#FF6B35" strokeWidth={1.5} />
                    </button>
                </div>

                {/* Stats Row + Create Button - Desktop Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '40px' }}>
                    <div style={{ padding: '24px', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                        <Inbox size={24} style={{ color: '#FF6B35' }} strokeWidth={1.5} />
                        <span style={{ fontSize: '32px', fontWeight: 700, color: '#FEFEFE' }}>{stats.received}</span>
                        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>Reçues</span>
                    </div>
                    <div style={{ padding: '24px', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                        <Send size={24} style={{ color: '#FF6B35' }} strokeWidth={1.5} />
                        <span style={{ fontSize: '32px', fontWeight: 700, color: '#FEFEFE' }}>{stats.sent}</span>
                        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>Envoyées</span>
                    </div>
                    <div style={{ padding: '24px', backgroundColor: 'rgba(255,107,53,0.08)', borderRadius: '20px', border: '1px solid rgba(255,107,53,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                        <Gift size={24} style={{ color: '#FF6B35' }} strokeWidth={1.5} />
                        <span style={{ fontSize: '32px', fontWeight: 700, color: '#FF6B35' }}>{stats.unviewed}</span>
                        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>À ouvrir</span>
                    </div>
                    <button
                        onClick={() => router.push('/dashboard/create')}
                        style={{ padding: '24px', borderRadius: '20px', border: 'none', background: 'linear-gradient(135deg, #FF6B35, #D4A574)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', boxShadow: '0 8px 24px rgba(255,107,53,0.3)' }}
                    >
                        <Plus size={28} color="#FFFFFF" strokeWidth={2} />
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>Nouvelle Capsule</span>
                    </button>
                </div>

                {/* Two Column Layout for Desktop */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '32px' }}>
                    {/* Received Section */}
                    <section>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#FEFEFE', margin: 0 }}>Capsules reçues</h2>
                            <Link href="/dashboard/received" style={{ fontSize: '14px', fontWeight: 500, color: '#FF6B35', textDecoration: 'none' }}>
                                Voir tout
                            </Link>
                        </div>

                        {receivedCapsules.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {receivedCapsules.map((capsule) => {
                                    const isUnlocked = new Date(capsule.unlock_date) <= new Date()
                                    return (
                                        <button
                                            key={capsule.id}
                                            onClick={() => router.push(`/dashboard/capsule/${capsule.id}`)}
                                            style={{
                                                width: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '16px',
                                                borderRadius: '16px',
                                                border: isUnlocked ? '1px solid rgba(255,107,53,0.15)' : '1px solid rgba(255,255,255,0.06)',
                                                backgroundColor: isUnlocked ? 'rgba(255,107,53,0.08)' : 'rgba(255,255,255,0.04)',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                transition: 'background-color 0.2s'
                                            }}
                                        >
                                            <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px' }}>
                                                {isUnlocked ? <Gift size={22} style={{ color: '#FF6B35' }} strokeWidth={1.5} /> : <Clock size={22} style={{ color: 'rgba(255,255,255,0.4)' }} strokeWidth={1.5} />}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontSize: '16px', fontWeight: 600, color: '#FEFEFE', margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{capsule.title || 'Sans titre'}</p>
                                                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>De {capsule.sender?.username}</p>
                                            </div>
                                            <div style={{ padding: '8px 14px', borderRadius: '10px', backgroundColor: isUnlocked ? 'rgba(255,107,53,0.2)' : 'rgba(255,255,255,0.06)' }}>
                                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#FF6B35' }}>
                                                    {isUnlocked ? 'Ouvrir' : new Date(capsule.unlock_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                                </span>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '20px', gap: '12px' }}>
                                <Inbox size={40} style={{ color: 'rgba(255,255,255,0.2)' }} strokeWidth={1} />
                                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Aucune capsule reçue</p>
                            </div>
                        )}
                    </section>

                    {/* Sent Section */}
                    <section>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#FEFEFE', margin: 0 }}>Capsules envoyées</h2>
                            <Link href="/dashboard/sent" style={{ fontSize: '14px', fontWeight: 500, color: '#FF6B35', textDecoration: 'none' }}>
                                Voir tout
                            </Link>
                        </div>

                        {sentCapsules.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {sentCapsules.map((capsule) => (
                                    <button
                                        key={capsule.id}
                                        onClick={() => router.push(`/dashboard/capsule/${capsule.id}`)}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '16px',
                                            borderRadius: '16px',
                                            border: '1px solid rgba(255,255,255,0.06)',
                                            backgroundColor: 'rgba(255,255,255,0.04)',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'background-color 0.2s'
                                        }}
                                    >
                                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px' }}>
                                            <Send size={22} style={{ color: 'rgba(255,255,255,0.4)' }} strokeWidth={1.5} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: '16px', fontWeight: 600, color: '#FEFEFE', margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{capsule.title || 'Sans titre'}</p>
                                            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>À {capsule.receiver?.username}</p>
                                        </div>
                                        <div style={{ padding: '8px 14px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.06)' }}>
                                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#FF6B35' }}>
                                                {new Date(capsule.unlock_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '20px', gap: '12px' }}>
                                <Send size={40} style={{ color: 'rgba(255,255,255,0.2)' }} strokeWidth={1} />
                                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Aucune capsule envoyée</p>
                            </div>
                        )}
                    </section>
                </div>

                {/* Quick Links - Full width */}
                <div style={{ marginTop: '32px' }}>
                    <button
                        onClick={() => router.push('/dashboard/friends')}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '20px 24px',
                            borderRadius: '16px',
                            backgroundColor: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            gap: '16px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        <Users size={24} style={{ color: '#FF6B35' }} strokeWidth={1.5} />
                        <span style={{ flex: 1, fontSize: '16px', fontWeight: 500, color: '#FEFEFE' }}>Gérer mes amis</span>
                        <ChevronRight size={20} style={{ color: 'rgba(255,255,255,0.3)' }} strokeWidth={1.5} />
                    </button>
                </div>
            </div>
        </AnimatedBackground>
    )
}
