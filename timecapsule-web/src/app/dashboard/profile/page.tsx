'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, User, Send, Inbox, Users, Music, Camera } from 'lucide-react'
import { getSupabase } from '@/lib/supabase'
import type { Profile } from '@/lib/types'
import AnimatedBackground from '@/components/AnimatedBackground'

export default function ProfilePage() {
    const router = useRouter()
    const [profile, setProfile] = useState<Profile | null>(null)
    const [userEmail, setUserEmail] = useState('')
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [stats, setStats] = useState({ sentCount: 0, receivedCount: 0, friendsCount: 0, musicCapsulesCount: 0 })
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => { fetchData() }, [])

    async function fetchData() {
        try {
            const supabase = getSupabase()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.replace('/auth/login'); return }
            setUserEmail(user.email || '')
            const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
            if (data) setProfile(data)

            const [sentResult, receivedResult, friendsResult, musicResult] = await Promise.all([
                supabase.from('capsules').select('*', { count: 'exact', head: true }).eq('sender_id', user.id),
                supabase.from('capsules').select('*', { count: 'exact', head: true }).eq('receiver_id', user.id),
                supabase.from('friendships').select('*', { count: 'exact', head: true }).eq('status', 'accepted').or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`),
                supabase.from('capsules').select('*', { count: 'exact', head: true }).eq('sender_id', user.id).not('music_title', 'is', null),
            ])
            setStats({ sentCount: sentResult.count || 0, receivedCount: receivedResult.count || 0, friendsCount: friendsResult.count || 0, musicCapsulesCount: musicResult.count || 0 })
        } catch (error) { console.error(error) }
        finally { setLoading(false) }
    }

    const handleLogout = async () => {
        if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
            const supabase = getSupabase()
            await supabase.auth.signOut()
            router.replace('/')
        }
    }

    const handleAvatarClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Veuillez sélectionner une image')
            return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('L\'image ne doit pas dépasser 5MB')
            return
        }

        try {
            setUploading(true)
            const supabase = getSupabase()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
            const fileName = `${user.id}/${Date.now()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true
                })

            if (uploadError) {
                if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('not found')) {
                    throw new Error("Le bucket 'avatars' n'existe pas. Créez-le dans Supabase Dashboard > Storage > New Bucket 'avatars' (public).")
                }
                throw uploadError
            }

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName)

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id)

            if (updateError) throw updateError

            setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null)
            alert('Photo de profil mise à jour !')
        } catch (error: any) {
            alert(error.message || 'Impossible de mettre à jour la photo')
            console.error(error)
        } finally {
            setUploading(false)
        }
    }

    if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F0D0B' }}><div style={{ width: '32px', height: '32px', border: '2px solid rgba(255,107,53,0.3)', borderTopColor: '#FF6B35', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /></div>

    const statCardStyle = (color: string) => ({ flex: 1, padding: '16px', borderRadius: '16px', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '8px', border: '1px solid rgba(255,255,255,0.06)', background: `linear-gradient(135deg, ${color}20, ${color}08)` })

    return (
        <AnimatedBackground>
            <div style={{ maxWidth: '700px', margin: '0 auto', padding: '16px 40px 100px 40px', minHeight: '100vh' }}>
                {/* Profile Header Card */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '32px', padding: '32px', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '32px' }}>
                    {/* Avatar - Clickable to upload */}
                    <div
                        onClick={handleAvatarClick}
                        style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '24px',
                            background: 'linear-gradient(135deg, #FF6B35, #D4A574)',
                            padding: '3px',
                            flexShrink: 0,
                            cursor: 'pointer',
                            position: 'relative'
                        }}
                    >
                        <div style={{ width: '100%', height: '100%', borderRadius: '22px', backgroundColor: '#1A1512', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            {uploading ? (
                                <div style={{ width: '32px', height: '32px', border: '2px solid rgba(255,107,53,0.3)', borderTopColor: '#FF6B35', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                            ) : profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <User size={48} color="#FEFEFE" />
                            )}
                        </div>
                        {/* Camera overlay */}
                        <div style={{
                            position: 'absolute',
                            bottom: '0',
                            right: '0',
                            width: '36px',
                            height: '36px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #FF6B35, #D4A574)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '3px solid #1A1512',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                        }}>
                            <Camera size={16} color="#FFFFFF" />
                        </div>
                    </div>
                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                    {/* Info */}
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#FEFEFE', margin: '0 0 8px 0' }}>{profile?.username || 'Utilisateur'}</h1>
                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: '0 0 4px 0' }}>{userEmail}</p>
                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Membre depuis {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</p>
                    </div>
                </div>

                {/* Stats - 4 columns on desktop */}
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

                {/* Logout */}
                <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '16px 32px', borderRadius: '14px', border: '1px solid rgba(255,107,53,0.3)', backgroundColor: 'rgba(255,107,53,0.08)', cursor: 'pointer', transition: 'all 0.2s ease' }}>
                    <LogOut size={18} color="#FF6B35" />
                    <span style={{ color: '#FF6B35', fontSize: '15px', fontWeight: 600 }}>Se déconnecter</span>
                </button>
            </div>
        </AnimatedBackground>
    )
}
