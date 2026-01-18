'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, UserPlus, Check, X, Clock } from 'lucide-react'
import { getSupabase } from '@/lib/supabase'
import type { Friendship } from '@/lib/types'
import AnimatedBackground from '@/components/AnimatedBackground'

export default function FriendsPage() {
    const router = useRouter()
    const [userId, setUserId] = useState<string | null>(null)
    const [acceptedFriends, setAcceptedFriends] = useState<Friendship[]>([])
    const [pendingReceived, setPendingReceived] = useState<Friendship[]>([])
    const [pendingSent, setPendingSent] = useState<Friendship[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => { fetchData() }, [])

    async function fetchData() {
        try {
            const supabase = getSupabase()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.replace('/auth/login'); return }
            setUserId(user.id)

            const { data: friendships } = await supabase
                .from('friendships')
                .select(`*, requester:profiles!friendships_requester_id_fkey(*), receiver:profiles!friendships_receiver_id_fkey(*)`)
                .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)

            const accepted: Friendship[] = [], received: Friendship[] = [], sent: Friendship[] = []
                ; (friendships || []).forEach((f: any) => {
                    if (f.status === 'accepted') accepted.push(f)
                    else if (f.status === 'pending') {
                        if (f.receiver_id === user.id) received.push(f)
                        else sent.push(f)
                    }
                })
            setAcceptedFriends(accepted)
            setPendingReceived(received)
            setPendingSent(sent)
        } catch (error) { console.error(error) }
        finally { setLoading(false) }
    }

    async function acceptRequest(id: string) {
        const supabase = getSupabase()
        await supabase.from('friendships').update({ status: 'accepted' }).eq('id', id)
        fetchData()
    }

    async function rejectRequest(id: string) {
        const supabase = getSupabase()
        await supabase.from('friendships').delete().eq('id', id)
        fetchData()
    }

    if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F0D0B' }}><div style={{ width: '32px', height: '32px', border: '2px solid rgba(255,107,53,0.3)', borderTopColor: '#FF6B35', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /></div>

    const cardStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '16px', marginBottom: '12px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', transition: 'background-color 0.2s' }

    return (
        <AnimatedBackground>
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 24px 100px 24px', minHeight: '100vh' }}>
                {/* Header with more spacing */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div>
                        <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#FEFEFE', margin: 0, marginBottom: '4px' }}>Mes Amis</h1>
                        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>{acceptedFriends.length} ami{acceptedFriends.length > 1 ? 's' : ''}</p>
                    </div>
                    <Link href="/dashboard/friends/add" style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #FF6B35, #D4A574)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', boxShadow: '0 4px 12px rgba(255,107,53,0.3)' }}>
                        <UserPlus size={22} color="#FEFEFE" />
                    </Link>
                </div>

                {/* Pending Received */}
                {pendingReceived.length > 0 && (
                    <section style={{ marginBottom: '40px' }}>
                        <p style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', marginBottom: '16px' }}>DEMANDES REÇUES</p>
                        {pendingReceived.map((f) => (
                            <div key={f.id} style={{ ...cardStyle, border: '1px solid rgba(255,107,53,0.3)', backgroundColor: 'rgba(255,255,255,0.06)', cursor: 'default' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: '52px', height: '52px', borderRadius: '16px', overflow: 'hidden', backgroundColor: 'rgba(212,165,116,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {f.requester?.avatar_url ? (
                                            <img src={f.requester.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <span style={{ fontSize: '20px', fontWeight: 700, color: '#D4A574' }}>{f.requester?.username?.[0]?.toUpperCase()}</span>
                                        )}
                                    </div>
                                    <span style={{ fontSize: '16px', fontWeight: 600, color: '#FEFEFE' }}>{f.requester?.username}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => acceptRequest(f.id)} style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#FF6B35', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={18} color="#FEFEFE" /></button>
                                    <button onClick={() => rejectRequest(f.id)} style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} color="#FEFEFE" /></button>
                                </div>
                            </div>
                        ))}
                    </section>
                )}

                {/* Accepted Friends - Clickable with profile photos */}
                <section style={{ marginBottom: '40px' }}>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', marginBottom: '16px' }}>AMIS</p>
                    {acceptedFriends.length > 0 ? acceptedFriends.map((f) => {
                        const friend = f.requester_id === userId ? f.receiver : f.requester
                        return (
                            <Link
                                key={f.id}
                                href={`/dashboard/user/${friend?.id}`}
                                style={{ ...cardStyle, textDecoration: 'none' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: '52px', height: '52px', borderRadius: '16px', overflow: 'hidden', backgroundColor: 'rgba(212,165,116,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {friend?.avatar_url ? (
                                            <img src={friend.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <span style={{ fontSize: '20px', fontWeight: 700, color: '#D4A574' }}>{friend?.username?.[0]?.toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '16px', fontWeight: 600, color: '#FEFEFE', margin: 0, marginBottom: '2px' }}>{friend?.username}</p>
                                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>@{friend?.username?.toLowerCase()}</p>
                                    </div>
                                </div>
                            </Link>
                        )
                    }) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px', gap: '16px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '20px' }}>
                            <Users size={48} color="rgba(255,255,255,0.15)" />
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', fontStyle: 'italic', margin: 0, textAlign: 'center' }}>Répandez la lumière, invitez un ami</p>
                        </div>
                    )}
                </section>

                {/* Pending Sent */}
                {pendingSent.length > 0 && (
                    <section style={{ marginBottom: '40px' }}>
                        <p style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', marginBottom: '16px' }}>EN ATTENTE</p>
                        {pendingSent.map((f) => (
                            <div key={f.id} style={{ ...cardStyle, cursor: 'default' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: '52px', height: '52px', borderRadius: '16px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {f.receiver?.avatar_url ? (
                                            <img src={f.receiver.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <span style={{ fontSize: '20px', fontWeight: 700, color: 'rgba(255,255,255,0.3)' }}>{f.receiver?.username?.[0]?.toUpperCase()}</span>
                                        )}
                                    </div>
                                    <span style={{ fontSize: '16px', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>{f.receiver?.username}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '10px', backgroundColor: 'rgba(212,165,116,0.1)' }}>
                                    <Clock size={14} color="#D4A574" />
                                    <span style={{ fontSize: '13px', color: '#D4A574', fontWeight: 500 }}>En attente</span>
                                </div>
                            </div>
                        ))}
                    </section>
                )}
            </div>
        </AnimatedBackground>
    )
}
