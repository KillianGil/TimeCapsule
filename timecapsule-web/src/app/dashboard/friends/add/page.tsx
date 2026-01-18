'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, UserPlus, Check } from 'lucide-react'
import { getSupabase } from '@/lib/supabase'
import type { Profile } from '@/lib/types'
import AnimatedBackground from '@/components/AnimatedBackground'

export default function AddFriendPage() {
    const router = useRouter()
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<Profile[]>([])
    const [searching, setSearching] = useState(false)
    const [sent, setSent] = useState<string[]>([])

    const handleSearch = async () => {
        if (query.trim().length < 2) return
        setSearching(true)
        try {
            const supabase = getSupabase()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data } = await supabase.from('profiles').select('*').ilike('username', `%${query}%`).neq('id', user.id).limit(10)
            if (data) setResults(data)
        } catch (error) { console.error(error) }
        finally { setSearching(false) }
    }

    const sendRequest = async (friendId: string) => {
        try {
            const supabase = getSupabase()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Check if already friends or pending
            const { data: existing } = await supabase.from('friendships').select('*').or(`and(requester_id.eq.${user.id},receiver_id.eq.${friendId}),and(requester_id.eq.${friendId},receiver_id.eq.${user.id})`).single()
            if (existing) { alert('Demande déjà envoyée ou déjà amis'); return }

            const { error } = await supabase.from('friendships').insert({ requester_id: user.id, receiver_id: friendId, status: 'pending' })
            if (error) throw error
            setSent(prev => [...prev, friendId])
        } catch (error: any) { alert(error.message) }
    }

    return (
        <AnimatedBackground>
            <div style={{ maxWidth: '480px', margin: '0 auto', padding: '60px 24px 100px 24px', minHeight: '100vh' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                    <button onClick={() => router.back()} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px' }}>
                        <ArrowLeft size={24} color="#FEFEFE" />
                    </button>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#FEFEFE', margin: 0 }}>Ajouter un ami</h1>
                </div>

                {/* Search */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '14px', padding: '0 16px', height: '52px', gap: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Search size={20} color="rgba(255,255,255,0.4)" />
                        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="Rechercher par pseudo" style={{ flex: 1, backgroundColor: 'transparent', border: 'none', outline: 'none', fontSize: '16px', color: '#FEFEFE' }} />
                    </div>
                    <button onClick={handleSearch} disabled={searching} style={{ padding: '0 20px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #FF6B35, #D4A574)', cursor: 'pointer' }}>
                        <Search size={20} color="#FFF" />
                    </button>
                </div>

                {/* Results */}
                {results.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {results.map((profile) => (
                            <div key={profile.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '16px', backgroundColor: 'rgba(212,165,116,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ fontSize: '18px', fontWeight: 700, color: '#D4A574' }}>{profile.username?.[0]?.toUpperCase()}</span>
                                    </div>
                                    <span style={{ fontSize: '16px', fontWeight: 600, color: '#FEFEFE' }}>{profile.username}</span>
                                </div>
                                {sent.includes(profile.id) ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#22c55e' }}>
                                        <Check size={18} />
                                        <span style={{ fontSize: '14px', fontWeight: 500 }}>Envoyée</span>
                                    </div>
                                ) : (
                                    <button onClick={() => sendRequest(profile.id)} style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #FF6B35, #D4A574)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <UserPlus size={20} color="#FFF" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px', gap: '12px' }}>
                        <Search size={40} color="rgba(255,255,255,0.2)" />
                        <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', margin: 0 }}>Recherchez un utilisateur par son pseudo pour l&apos;ajouter en ami</p>
                    </div>
                )}
            </div>
        </AnimatedBackground>
    )
}
