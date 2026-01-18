'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Inbox, Clock, Gift } from 'lucide-react'
import { getSupabase } from '@/lib/supabase'
import type { Capsule } from '@/lib/types'
import AnimatedBackground from '@/components/AnimatedBackground'

export default function ReceivedCapsulesPage() {
    const router = useRouter()
    const [capsules, setCapsules] = useState<Capsule[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => { fetchData() }, [])

    async function fetchData() {
        try {
            const supabase = getSupabase()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.replace('/auth/login'); return }

            const { data } = await supabase.from('capsules').select(`*, sender:profiles!capsules_sender_id_fkey(*)`).eq('receiver_id', user.id).order('unlock_date', { ascending: true })
            if (data) setCapsules(data as Capsule[])
        } catch (error) { console.error(error) }
        finally { setLoading(false) }
    }

    if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F0D0B' }}><div style={{ width: '32px', height: '32px', border: '2px solid rgba(255,107,53,0.3)', borderTopColor: '#FF6B35', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /></div>

    return (
        <AnimatedBackground>
            <div style={{ maxWidth: '480px', margin: '0 auto', padding: '60px 24px 100px 24px', minHeight: '100vh' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#FEFEFE', marginBottom: '32px' }}>Capsules reçues</h1>

                {capsules.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {capsules.map((capsule) => {
                            const isUnlocked = new Date(capsule.unlock_date) <= new Date()
                            return (
                                <button key={capsule.id} onClick={() => isUnlocked && router.push(`/dashboard/capsule/${capsule.id}`)} disabled={!isUnlocked} style={{
                                    width: '100%', display: 'flex', alignItems: 'center', padding: '16px', borderRadius: '14px', textAlign: 'left',
                                    border: isUnlocked ? '1px solid rgba(255,107,53,0.15)' : '1px solid rgba(255,255,255,0.06)',
                                    backgroundColor: isUnlocked ? 'rgba(255,107,53,0.08)' : 'rgba(255,255,255,0.04)',
                                    cursor: isUnlocked ? 'pointer' : 'default', opacity: isUnlocked ? 1 : 0.8
                                }}>
                                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '14px' }}>
                                        {isUnlocked ? <Gift size={20} color="#FF6B35" /> : <Clock size={20} color="rgba(255,255,255,0.4)" />}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: '15px', fontWeight: 600, color: '#FEFEFE', margin: '0 0 2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{capsule.title || 'Sans titre'}</p>
                                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>De {capsule.sender?.username}</p>
                                    </div>
                                    <div style={{ padding: '6px 12px', borderRadius: '8px', backgroundColor: isUnlocked ? 'rgba(255,107,53,0.2)' : 'rgba(255,255,255,0.06)' }}>
                                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#FF6B35' }}>{isUnlocked ? 'Ouvrir' : new Date(capsule.unlock_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '16px', gap: '12px' }}>
                        <Inbox size={40} color="rgba(255,255,255,0.2)" />
                        <p style={{ color: 'rgba(255,255,255,0.4)', margin: 0 }}>Aucune capsule reçue</p>
                    </div>
                )}
            </div>
        </AnimatedBackground>
    )
}
