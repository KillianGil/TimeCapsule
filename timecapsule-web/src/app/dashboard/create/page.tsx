'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, Calendar, Users, MessageSquare, Video, X, Music, Search, Check } from 'lucide-react'
import { getSupabase } from '@/lib/supabase'
import type { Profile } from '@/lib/types'
import AnimatedBackground from '@/components/AnimatedBackground'

interface iTunesTrack {
    trackId: number
    trackName: string
    artistName: string
    artworkUrl100: string
    previewUrl: string
}

export default function CreateCapsulePage() {
    const router = useRouter()
    const [userId, setUserId] = useState<string | null>(null)
    const [friends, setFriends] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [success, setSuccess] = useState(false)

    const [title, setTitle] = useState('')
    const [note, setNote] = useState('')
    const [selectedFriends, setSelectedFriends] = useState<string[]>([])
    const [unlockDate, setUnlockDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [videoPreview, setVideoPreview] = useState<string | null>(null)

    // Music states
    const [showMusicModal, setShowMusicModal] = useState(false)
    const [musicSearch, setMusicSearch] = useState('')
    const [musicResults, setMusicResults] = useState<iTunesTrack[]>([])
    const [searchingMusic, setSearchingMusic] = useState(false)
    const [selectedMusic, setSelectedMusic] = useState<iTunesTrack | null>(null)

    useEffect(() => { fetchData() }, [])

    async function fetchData() {
        try {
            const supabase = getSupabase()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.replace('/auth/login'); return }
            setUserId(user.id)

            const { data: friendships } = await supabase.from('friendships').select(`*, requester:profiles!friendships_requester_id_fkey(*), receiver:profiles!friendships_receiver_id_fkey(*)`).eq('status', 'accepted').or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
            const friendsList: Profile[] = (friendships || []).map((f: any) => f.requester_id === user.id ? f.receiver : f.requester).filter(Boolean)
            setFriends(friendsList)
        } catch (error) { console.error(error) }
        finally { setLoading(false) }
    }

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) { setVideoFile(file); setVideoPreview(URL.createObjectURL(file)) }
    }

    const toggleFriendSelection = (friendId: string) => {
        setSelectedFriends(prev => prev.includes(friendId) ? prev.filter(id => id !== friendId) : [...prev, friendId])
    }

    // Music search using iTunes API
    const searchMusic = async (query: string) => {
        if (!query.trim()) { setMusicResults([]); return }
        setSearchingMusic(true)
        try {
            const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=15`)
            const data = await response.json()
            setMusicResults(data.results || [])
        } catch (error) {
            console.error('Music search error:', error)
            setMusicResults([])
        } finally {
            setSearchingMusic(false)
        }
    }

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (musicSearch) searchMusic(musicSearch)
        }, 300)
        return () => clearTimeout(timer)
    }, [musicSearch])

    const handleSend = async () => {
        if (selectedFriends.length === 0) { alert('Sélectionnez au moins un ami.'); return }
        if (!videoFile) { alert('Ajoutez une vidéo.'); return }

        setSending(true)
        try {
            const supabase = getSupabase()
            const fileExt = videoFile.name.split('.').pop()?.toLowerCase() || 'mp4'
            const fileName = `${userId}/${Date.now()}.${fileExt}`

            const { error: uploadError } = await supabase.storage.from('capsules').upload(fileName, videoFile, { cacheControl: '3600', upsert: true })
            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage.from('capsules').getPublicUrl(fileName)

            const capsulesToInsert = selectedFriends.map(friendId => ({
                sender_id: userId, receiver_id: friendId, title, note, video_path: publicUrl,
                unlock_date: new Date(unlockDate).toISOString(), is_viewed: false,
                music_title: selectedMusic?.trackName || null,
                music_artist: selectedMusic?.artistName || null,
                music_cover_url: selectedMusic?.artworkUrl100 || null,
                music_preview_url: selectedMusic?.previewUrl || null,
            }))

            const { error } = await supabase.from('capsules').insert(capsulesToInsert)
            if (error) throw error

            setSuccess(true)
            setTimeout(() => router.push('/dashboard'), 2000)
        } catch (error: any) { alert(error.message || "Erreur lors de l'envoi") }
        finally { setSending(false) }
    }

    if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F0D0B' }}><div style={{ width: '32px', height: '32px', border: '2px solid rgba(255,107,53,0.3)', borderTopColor: '#FF6B35', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /></div>

    if (success) return (
        <AnimatedBackground>
            <div style={{ maxWidth: '480px', margin: '0 auto', padding: '60px 24px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '40px', backgroundColor: 'rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                    <Check size={40} color="#22c55e" />
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#FEFEFE', margin: '0 0 8px 0' }}>Capsule envoyée ! 🎉</h2>
                <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Envoyée à {selectedFriends.length} ami{selectedFriends.length > 1 ? 's' : ''}</p>
            </div>
        </AnimatedBackground>
    )

    const inputContainerStyle = { display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '14px', padding: '0 16px', height: '56px', gap: '12px', border: '1px solid rgba(255,255,255,0.1)' }

    return (
        <AnimatedBackground>
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px 40px 100px 40px', minHeight: '100vh' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
                    <button onClick={() => router.back()} style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ArrowLeft size={20} color="#FEFEFE" />
                    </button>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#FEFEFE', margin: 0 }}>Nouvelle Capsule</h1>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Title */}
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>Titre</label>
                        <div style={inputContainerStyle}>
                            <MessageSquare size={18} color="rgba(255,255,255,0.4)" />
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre de la capsule" style={{ flex: 1, backgroundColor: 'transparent', border: 'none', outline: 'none', fontSize: '16px', color: '#FEFEFE' }} />
                        </div>
                    </div>

                    {/* Recipients */}
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>Destinataire{selectedFriends.length > 1 ? 's' : ''} {selectedFriends.length > 0 && `(${selectedFriends.length})`}</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {friends.map((friend) => {
                                const isSelected = selectedFriends.includes(friend.id)
                                return (
                                    <button key={friend.id} onClick={() => toggleFriendSelection(friend.id)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '20px', border: isSelected ? '1px solid #FF6B35' : '1px solid rgba(255,107,53,0.3)', backgroundColor: isSelected ? '#FF6B35' : 'rgba(255,107,53,0.1)', cursor: 'pointer', color: isSelected ? '#FFF' : '#FF6B35' }}>
                                        {isSelected && <Check size={14} />}
                                        <Users size={14} />
                                        <span style={{ fontWeight: 500 }}>{friend.username}</span>
                                    </button>
                                )
                            })}
                            {friends.length === 0 && <p style={{ color: 'rgba(255,255,255,0.4)', margin: 0 }}>Ajoutez des amis d&apos;abord</p>}
                        </div>
                    </div>

                    {/* Video */}
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>Message vidéo</label>
                        {videoPreview ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <Video size={32} color="#FF6B35" />
                                <span style={{ flex: 1, color: '#FEFEFE' }}>Vidéo sélectionnée</span>
                                <button onClick={() => { setVideoFile(null); setVideoPreview(null) }} style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', border: 'none', cursor: 'pointer' }}><X size={16} color="#FFF" /></button>
                            </div>
                        ) : (
                            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '14px', border: '2px dashed rgba(255,107,53,0.3)', cursor: 'pointer' }}>
                                <Video size={32} color="#FF6B35" style={{ marginBottom: '12px' }} />
                                <span style={{ color: '#FF6B35', fontWeight: 500 }}>Choisir une vidéo</span>
                                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginTop: '4px' }}>MP4, MOV • Max 60s</span>
                                <input type="file" accept="video/*" onChange={handleVideoChange} style={{ display: 'none' }} />
                            </label>
                        )}
                    </div>

                    {/* Music */}
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>Musique (Optionnel)</label>
                        {selectedMusic ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', backgroundColor: 'rgba(168,85,247,0.1)', borderRadius: '14px', border: '1px solid rgba(168,85,247,0.2)' }}>
                                <img src={selectedMusic.artworkUrl100} alt="" style={{ width: '56px', height: '56px', borderRadius: '10px' }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: '15px', fontWeight: 600, color: '#FEFEFE', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedMusic.trackName}</p>
                                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>{selectedMusic.artistName}</p>
                                </div>
                                <button onClick={() => setSelectedMusic(null)} style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', border: 'none', cursor: 'pointer' }}><X size={16} color="#FFF" /></button>
                            </div>
                        ) : (
                            <button onClick={() => setShowMusicModal(true)} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '14px', border: '2px dashed rgba(168,85,247,0.3)', cursor: 'pointer' }}>
                                <Music size={32} color="#a855f7" style={{ marginBottom: '12px' }} />
                                <span style={{ color: '#a855f7', fontWeight: 500 }}>Ajouter une musique</span>
                                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginTop: '4px' }}>Rechercher sur iTunes</span>
                            </button>
                        )}
                    </div>

                    {/* Note */}
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>Note (Optionnel)</label>
                        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Une petite note pour accompagner la vidéo..." style={{ width: '100%', minHeight: '100px', padding: '16px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', outline: 'none', fontSize: '16px', color: '#FEFEFE', resize: 'none', boxSizing: 'border-box' }} />
                    </div>

                    {/* Date */}
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>Date d&apos;ouverture</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <Calendar size={20} color="#FF6B35" />
                            <input type="date" value={unlockDate} onChange={(e) => setUnlockDate(e.target.value)} min={new Date().toISOString().split('T')[0]} style={{ flex: 1, backgroundColor: 'transparent', border: 'none', outline: 'none', fontSize: '16px', color: '#FEFEFE' }} />
                        </div>
                    </div>

                    {/* Send */}
                    <button onClick={handleSend} disabled={sending} style={{ width: '100%', height: '56px', borderRadius: '14px', border: 'none', background: 'linear-gradient(to right, #FF6B35, #D4A574)', cursor: sending ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: sending ? 0.8 : 1 }}>
                        {sending ? <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFF', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <><Send size={20} color="#FFF" /><span style={{ fontSize: '17px', fontWeight: 700, color: '#FFF' }}>Envoyer la capsule</span></>}
                    </button>
                </div>
            </div>

            {/* Music Search Modal */}
            {showMusicModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowMusicModal(false)}>
                    <div style={{ width: '100%', maxWidth: '500px', maxHeight: '80vh', backgroundColor: '#1A1815', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#FEFEFE', margin: 0 }}>Ajouter une musique</h3>
                                <button onClick={() => setShowMusicModal(false)} style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', border: 'none', cursor: 'pointer' }}><X size={20} color="#FFF" /></button>
                            </div>
                            {/* Search Input */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <Search size={18} color="rgba(255,255,255,0.4)" />
                                <input
                                    type="text"
                                    value={musicSearch}
                                    onChange={(e) => setMusicSearch(e.target.value)}
                                    placeholder="Rechercher un titre ou artiste..."
                                    autoFocus
                                    style={{ flex: 1, backgroundColor: 'transparent', border: 'none', outline: 'none', fontSize: '15px', color: '#FEFEFE' }}
                                />
                                {searchingMusic && <div style={{ width: '18px', height: '18px', border: '2px solid rgba(168,85,247,0.3)', borderTopColor: '#a855f7', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />}
                            </div>
                        </div>

                        {/* Results */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                            {musicResults.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {musicResults.map((track) => (
                                        <button
                                            key={track.trackId}
                                            onClick={() => { setSelectedMusic(track); setShowMusicModal(false); setMusicSearch(''); setMusicResults([]) }}
                                            style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease' }}
                                        >
                                            <img src={track.artworkUrl100} alt="" style={{ width: '50px', height: '50px', borderRadius: '8px' }} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontSize: '15px', fontWeight: 600, color: '#FEFEFE', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.trackName}</p>
                                                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>{track.artistName}</p>
                                            </div>
                                            <Music size={18} color="#a855f7" />
                                        </button>
                                    ))}
                                </div>
                            ) : musicSearch && !searchingMusic ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px', gap: '12px' }}>
                                    <Music size={40} color="rgba(255,255,255,0.1)" />
                                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: 0 }}>Aucun résultat</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px', gap: '12px' }}>
                                    <Search size={40} color="rgba(255,255,255,0.1)" />
                                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: 0 }}>Recherchez une musique</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AnimatedBackground>
    )
}
