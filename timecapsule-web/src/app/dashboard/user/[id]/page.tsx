'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, User, Send, Inbox, Users, Music } from 'lucide-react'
import { getSupabase } from '@/lib/supabase'
import type { Profile } from '@/lib/types'
import AnimatedBackground from '@/components/AnimatedBackground'

export default function UserProfilePage() {
    const router = useRouter()
    const params = useParams()
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ sentCount: 0, receivedCount: 0, friendsCount: 0, musicCapsulesCount: 0 })

    useEffect(() => { fetchData() }, [])

    async function fetchData() {
        try {
            const supabase = getSupabase()
            const { data } = await supabase.from('profiles').select('*').eq('id', params.id).single()
            if (data) {
                setProfile(data)

                const [sentResult, receivedResult, friendsResult, musicResult] = await Promise.all([
                    supabase.from('capsules').select('*', { count: 'exact', head: true }).eq('sender_id', params.id),
                    supabase.from('capsules').select('*', { count: 'exact', head: true }).eq('receiver_id', params.id),
                    supabase.from('friendships').select('*', { count: 'exact', head: true }).eq('status', 'accepted').or(`requester_id.eq.${params.id},receiver_id.eq.${params.id}`),
                    supabase.from('capsules').select('*', { count: 'exact', head: true }).eq('sender_id', params.id).not('music_title', 'is', null),
                ])
                setStats({ sentCount: sentResult.count || 0, receivedCount: receivedResult.count || 0, friendsCount: friendsResult.count || 0, musicCapsulesCount: musicResult.count || 0 })
            }
        } catch (error) { console.error(error) }
        finally { setLoading(false) }
    }

    if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F0D0B' }}><div style={{ width: '32px', height: '32px', border: '2px solid rgba(255,107,53,0.3)', borderTopColor: '#FF6B35', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /></div>

    if (!profile) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F0D0B', color: '#FEFEFE' }}>Utilisateur introuvable</div>

    const statCardStyle = (color: string) => ({ flex: 1, padding: '16px', borderRadius: '16px', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '8px', border: '1px solid rgba(255,255,255,0.06)', background: `linear-gradient(135deg, ${color}20, ${color}08)` })

    return (
        <AnimatedBackground>
            <div style={{ maxWidth: '700px', margin: '0 auto', padding: '16px 40px 100px 40px', minHeight: '100vh' }}>

                {/* Profile Header Card - Same design as user profile */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '32px', padding: '32px', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '32px' }}>
                    {/* Avatar */}
                    <div style={{ width: '120px', height: '120px', borderRadius: '24px', background: 'linear-gradient(135deg, #FF6B35, #D4A574)', padding: '3px', flexShrink: 0 }}>
                        <div style={{ width: '100%', height: '100%', borderRadius: '22px', backgroundColor: '#1A1512', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            {profile.avatar_url ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={48} color="#FEFEFE" />}
                        </div>
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#FEFEFE', margin: '0 0 8px 0' }}>{profile.username}</h1>
                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: '0 0 4px 0' }}>@{profile.username?.toLowerCase()}</p>
                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Membre depuis {profile.created_at ? new Date(profile.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</p>
                    </div>
                </div>

                {/* Stats - 4 columns on desktop - Same design as user profile */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
                    <div style={statCardStyle('#FF6B35')}>
                        <Send size={24} color="#FF6B35" />
                        <span style={{ fontSize: '32px', fontWeight: 800, color: '#FF6B35' }}>{stats.sentCount}</span>
                        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>Envoyées</span>
                    </div>
                    <div style={statCardStyle('#22c55e')}>
                        <Inbox size={24} color="#22c55e" />
                        <span style={{ fontSize: '32px', fontWeight: 800, color: '#22c55e' }}>{stats.receivedCount}</span>
                        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>Reçues</span>
                    </div>
                    <div style={statCardStyle('#3b82f6')}>
                        <Users size={24} color="#3b82f6" />
                        <span style={{ fontSize: '32px', fontWeight: 800, color: '#3b82f6' }}>{stats.friendsCount}</span>
                        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>Amis</span>
                    </div>
                    <div style={statCardStyle('#a855f7')}>
                        <Music size={24} color="#a855f7" />
                        <span style={{ fontSize: '32px', fontWeight: 800, color: '#a855f7' }}>{stats.musicCapsulesCount}</span>
                        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>Avec musique</span>
                    </div>
                </div>
            </div>
        </AnimatedBackground>
    )
}
