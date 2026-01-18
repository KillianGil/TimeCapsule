'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ArrowLeft, Clock, Play, Pause, Music, MessageSquare, Lock, Gift, Calendar, User } from 'lucide-react'
import { getSupabase } from '@/lib/supabase'
import type { Capsule } from '@/lib/types'
import AnimatedBackground from '@/components/AnimatedBackground'

// Dynamic import for Lottie to avoid SSR issues
const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

export default function CapsuleDetailPage() {
    const router = useRouter()
    const params = useParams()
    const [capsule, setCapsule] = useState<Capsule | null>(null)
    const [loading, setLoading] = useState(true)
    const [isUnlocked, setIsUnlocked] = useState(false)
    const [showContent, setShowContent] = useState(false)
    const [showOpeningAnimation, setShowOpeningAnimation] = useState(false)
    const [animationData, setAnimationData] = useState<any>(null)
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
    const [isPlaying, setIsPlaying] = useState(false)
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

    useEffect(() => {
        fetchCapsule()
        // Load Lottie animation
        fetch('/anim-ouverture.json')
            .then(res => res.json())
            .then(data => setAnimationData(data))
            .catch(err => console.log('Lottie not found:', err))

        return () => { if (audio) audio.pause() }
    }, [])

    // Countdown timer
    useEffect(() => {
        if (capsule && !isUnlocked) {
            const interval = setInterval(() => {
                const now = new Date().getTime()
                const unlockTime = new Date(capsule.unlock_date).getTime()
                const distance = unlockTime - now

                if (distance <= 0) {
                    setIsUnlocked(true)
                    clearInterval(interval)
                    return
                }

                setCountdown({
                    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((distance % (1000 * 60)) / 1000)
                })
            }, 1000)
            return () => clearInterval(interval)
        }
    }, [capsule, isUnlocked])

    async function fetchCapsule() {
        try {
            const supabase = getSupabase()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.replace('/auth/login'); return }

            const { data } = await supabase.from('capsules').select(`*, sender:profiles!capsules_sender_id_fkey(*), receiver:profiles!capsules_receiver_id_fkey(*)`).eq('id', params.id).single()
            if (data) {
                setCapsule(data as Capsule)
                const unlocked = new Date(data.unlock_date) <= new Date()
                setIsUnlocked(unlocked)

                // Mark as viewed if unlocked
                if (unlocked && data.receiver_id === user.id && !data.is_viewed) {
                    await supabase.from('capsules').update({ is_viewed: true }).eq('id', params.id)
                }
            }
        } catch (error) { console.error(error) }
        finally { setLoading(false) }
    }

    const handleOpenCapsule = () => {
        if (animationData) {
            setShowOpeningAnimation(true)
        } else {
            setShowContent(true)
        }
    }

    const toggleMusic = () => {
        if (!capsule?.music_preview_url) return
        if (audio) {
            if (isPlaying) { audio.pause() } else { audio.play() }
            setIsPlaying(!isPlaying)
        } else {
            const newAudio = new Audio(capsule.music_preview_url)
            newAudio.play()
            setAudio(newAudio)
            setIsPlaying(true)
            newAudio.onended = () => setIsPlaying(false)
        }
    }

    // Loading state
    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F0D0B' }}>
            <div style={{ width: '32px', height: '32px', border: '2px solid rgba(255,107,53,0.3)', borderTopColor: '#FF6B35', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
    )

    if (!capsule) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F0D0B', color: '#FEFEFE' }}>
            Capsule introuvable
        </div>
    )

    // Opening animation overlay
    if (showOpeningAnimation && animationData) {
        return (
            <div style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.95)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100
            }}>
                <div style={{ width: '300px', height: '300px' }}>
                    <Lottie
                        animationData={animationData}
                        loop={false}
                        onComplete={() => {
                            setShowOpeningAnimation(false)
                            setShowContent(true)
                        }}
                    />
                </div>
                <p style={{
                    color: '#FEFEFE',
                    fontSize: '20px',
                    fontWeight: 600,
                    marginTop: '24px'
                }}>
                    🎁 Ouverture de la capsule...
                </p>
                <button
                    onClick={() => {
                        setShowOpeningAnimation(false)
                        setShowContent(true)
                    }}
                    style={{
                        marginTop: '32px',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        backgroundColor: 'transparent',
                        color: 'rgba(255,255,255,0.6)',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    Passer l&apos;animation
                </button>
            </div>
        )
    }

    // LOCKED STATE - Beautiful countdown like mobile
    if (!isUnlocked) {
        return (
            <AnimatedBackground>
                <div style={{ maxWidth: '500px', margin: '0 auto', padding: '24px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <button onClick={() => router.back()} style={{ width: '44px', height: '44px', background: 'transparent', border: 'none', cursor: 'pointer', marginBottom: '20px' }}>
                        <ArrowLeft size={24} color="#FEFEFE" />
                    </button>

                    {/* Locked Content */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingBottom: '100px' }}>
                        {/* Lock Icon with Glow */}
                        <div style={{ position: 'relative', marginBottom: '32px' }}>
                            <div style={{
                                position: 'absolute',
                                width: '180px',
                                height: '180px',
                                borderRadius: '90px',
                                background: 'rgba(255,107,53,0.15)',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                animation: 'pulse 2s ease-in-out infinite'
                            }} />
                            <div style={{
                                position: 'absolute',
                                width: '140px',
                                height: '140px',
                                borderRadius: '70px',
                                background: 'rgba(255,107,53,0.2)',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)'
                            }} />
                            <div style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: '50px',
                                background: 'linear-gradient(135deg, rgba(255,107,53,0.3), rgba(255,107,53,0.1))',
                                border: '2px solid rgba(255,107,53,0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Lock size={48} color="#FF6B35" strokeWidth={1.5} />
                            </div>
                        </div>

                        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#FEFEFE', margin: '0 0 8px 0' }}>
                            Capsule verrouillée
                        </h1>
                        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', margin: '0 0 40px 0' }}>
                            De {capsule.sender?.username}
                        </p>

                        {/* Countdown */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '40px', gap: '4px' }}>
                            {[
                                { value: countdown.days, label: 'jours' },
                                { value: countdown.hours, label: 'heures' },
                                { value: countdown.minutes, label: 'min' },
                                { value: countdown.seconds, label: 'sec' },
                            ].map((item, index) => (
                                <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start' }}>
                                    {index > 0 && <span style={{ fontSize: '28px', color: '#FF6B35', margin: '18px 4px 0', fontWeight: 700 }}>:</span>}
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{
                                            width: '65px',
                                            height: '75px',
                                            borderRadius: '14px',
                                            background: 'linear-gradient(135deg, rgba(255,107,53,0.15), rgba(255,107,53,0.05))',
                                            border: '1px solid rgba(255,107,53,0.2)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <span style={{ fontSize: '28px', fontWeight: 700, color: '#FF6B35' }}>
                                                {String(item.value).padStart(2, '0')}
                                            </span>
                                        </div>
                                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '8px', display: 'block' }}>
                                            {item.label}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Info */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            backgroundColor: 'rgba(255,255,255,0.04)',
                            padding: '14px 20px',
                            borderRadius: '14px',
                            border: '1px solid rgba(255,255,255,0.06)'
                        }}>
                            <Calendar size={16} color="#FF6B35" />
                            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                                Ouverture le {new Date(capsule.unlock_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </div>

                <style jsx global>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
            50% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
          }
        `}</style>
            </AnimatedBackground>
        )
    }

    // UNLOCKED BUT NOT OPENED - Show open button
    if (!showContent) {
        return (
            <AnimatedBackground>
                <div style={{ maxWidth: '500px', margin: '0 auto', padding: '24px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <button onClick={() => router.back()} style={{ width: '44px', height: '44px', background: 'transparent', border: 'none', cursor: 'pointer', marginBottom: '20px' }}>
                        <ArrowLeft size={24} color="#FEFEFE" />
                    </button>

                    {/* Unlocked Content */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingBottom: '100px' }}>
                        {/* Gift Icon */}
                        <div style={{ position: 'relative', marginBottom: '32px' }}>
                            <div style={{
                                position: 'absolute',
                                width: '160px',
                                height: '160px',
                                borderRadius: '80px',
                                background: 'rgba(255,107,53,0.2)',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)'
                            }} />
                            <div style={{
                                width: '110px',
                                height: '110px',
                                borderRadius: '55px',
                                background: 'linear-gradient(135deg, #FF6B35, #FF8B5A)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 15px 30px rgba(255,107,53,0.5)'
                            }}>
                                <Gift size={56} color="#FFFFFF" strokeWidth={1.5} />
                            </div>
                        </div>

                        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#FEFEFE', margin: '0 0 8px 0', textAlign: 'center' }}>
                            {capsule.title || 'Capsule temporelle'}
                        </h1>
                        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', margin: '0 0 8px 0' }}>
                            De {capsule.sender?.username}
                        </p>
                        <p style={{ fontSize: '15px', color: '#FF6B35', margin: '0 0 40px 0' }}>
                            ✨ Prête à être ouverte !
                        </p>

                        <button
                            onClick={handleOpenCapsule}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '14px',
                                padding: '20px 36px',
                                borderRadius: '18px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #FF6B35, #D4A574)',
                                cursor: 'pointer',
                                boxShadow: '0 10px 25px rgba(255,107,53,0.4)'
                            }}
                        >
                            <Play size={24} color="#FFFFFF" fill="#FFFFFF" />
                            <span style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>Ouvrir la capsule</span>
                        </button>
                    </div>
                </div>
            </AnimatedBackground>
        )
    }

    // CONTENT VIEW - Show video, music, note
    return (
        <AnimatedBackground>
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 24px 100px 24px', minHeight: '100vh' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                    <button onClick={() => router.back()} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px' }}>
                        <ArrowLeft size={24} color="#FEFEFE" />
                    </button>
                </div>

                {/* Success Badge */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginBottom: '24px',
                    padding: '12px 20px',
                    backgroundColor: 'rgba(255,107,53,0.1)',
                    borderRadius: '20px',
                    width: 'fit-content',
                    margin: '0 auto 24px'
                }}>
                    <span style={{ fontSize: '18px' }}>🎉</span>
                    <span style={{ color: '#FF6B35', fontSize: '15px', fontWeight: 600 }}>Capsule ouverte !</span>
                </div>

                {/* Title & Sender */}
                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#FEFEFE', margin: '0 0 12px 0' }}>{capsule.title || 'Capsule temporelle'}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '14px', background: 'linear-gradient(135deg, #FF6B35, #D4A574)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={14} color="#FFFFFF" />
                        </div>
                        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px' }}>De {capsule.sender?.username}</span>
                    </div>
                </div>

                {/* Video */}
                {capsule.video_path && (
                    <div style={{ marginBottom: '24px', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#000' }}>
                        <video src={capsule.video_path} controls style={{ width: '100%', display: 'block' }} />
                    </div>
                )}

                {/* Music */}
                {capsule.music_title && (
                    <div style={{
                        padding: '16px',
                        marginBottom: '24px',
                        backgroundColor: 'rgba(255,107,53,0.1)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255,107,53,0.2)'
                    }}>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: '#FF6B35', letterSpacing: '1px', margin: '0 0 12px 0' }}>🎵 MUSIQUE D&apos;AMBIANCE</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {capsule.music_cover_url && <img src={capsule.music_cover_url} alt="" style={{ width: '56px', height: '56px', borderRadius: '10px' }} />}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: '16px', fontWeight: 600, color: '#FEFEFE', margin: '0 0 2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{capsule.music_title}</p>
                                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>{capsule.music_artist}</p>
                            </div>
                            {capsule.music_preview_url && (
                                <button onClick={toggleMusic} style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '22px',
                                    backgroundColor: isPlaying ? '#FF6B35' : 'rgba(255,107,53,0.3)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {isPlaying ? <Pause size={20} color="#FFF" /> : <Music size={20} color="#FFF" />}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Note */}
                {capsule.note && (
                    <div style={{ padding: '20px', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '16px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <MessageSquare size={16} color="#FF6B35" />
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#FF6B35', textTransform: 'uppercase', letterSpacing: '1px' }}>Message</span>
                        </div>
                        <p style={{ fontSize: '16px', color: '#FEFEFE', lineHeight: 1.6, margin: 0 }}>{capsule.note}</p>
                    </div>
                )}

                {/* Date Info */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Clock size={14} color="rgba(255,255,255,0.4)" />
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
                        Envoyée le {new Date(capsule.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                </div>
            </div>
        </AnimatedBackground>
    )
}
