'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, ArrowLeft } from 'lucide-react'
import { getSupabase } from '@/lib/supabase'
import AnimatedBackground from '@/components/AnimatedBackground'

export default function SignUpPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas")
            setIsLoading(false)
            return
        }

        if (username.length < 3) {
            setError("Le pseudo doit contenir au moins 3 caractères")
            setIsLoading(false)
            return
        }

        try {
            const supabase = getSupabase()
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { username: username.toLowerCase().replace(/\s+/g, "_") } },
            })
            if (error) throw error
            router.push('/auth/login?registered=true')
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue")
        } finally {
            setIsLoading(false)
        }
    }

    const inputStyle = {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: '14px',
        padding: '0 16px',
        height: '56px',
        gap: '12px',
        border: '1px solid rgba(255,255,255,0.1)'
    }

    return (
        <AnimatedBackground>
            <div style={{ maxWidth: '400px', margin: '0 auto', padding: '60px 28px 40px 28px', minHeight: '100vh' }}>
                {/* Back */}
                <button onClick={() => router.back()} style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '-10px', marginBottom: '20px', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                    <ArrowLeft size={24} color="#FEFEFE" strokeWidth={2} />
                </button>

                {/* Header */}
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#FEFEFE', margin: '0 0 8px 0' }}>Inscription</h1>
                    <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Créez votre compte</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginLeft: '4px' }}>Pseudo</label>
                        <div style={inputStyle}>
                            <User size={20} color="rgba(255,255,255,0.4)" />
                            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="votre_pseudo" required style={{ flex: 1, backgroundColor: 'transparent', border: 'none', outline: 'none', fontSize: '16px', color: '#FEFEFE' }} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginLeft: '4px' }}>Email</label>
                        <div style={inputStyle}>
                            <Mail size={20} color="rgba(255,255,255,0.4)" />
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" required style={{ flex: 1, backgroundColor: 'transparent', border: 'none', outline: 'none', fontSize: '16px', color: '#FEFEFE' }} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginLeft: '4px' }}>Mot de passe</label>
                        <div style={inputStyle}>
                            <Lock size={20} color="rgba(255,255,255,0.4)" />
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required style={{ flex: 1, backgroundColor: 'transparent', border: 'none', outline: 'none', fontSize: '16px', color: '#FEFEFE' }} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginLeft: '4px' }}>Confirmer</label>
                        <div style={inputStyle}>
                            <Lock size={20} color="rgba(255,255,255,0.4)" />
                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required style={{ flex: 1, backgroundColor: 'transparent', border: 'none', outline: 'none', fontSize: '16px', color: '#FEFEFE' }} />
                        </div>
                    </div>

                    {error && (
                        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', borderRadius: '12px', padding: '14px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                            <p style={{ color: '#EF4444', fontSize: '14px', textAlign: 'center', fontWeight: 500, margin: 0 }}>{error}</p>
                        </div>
                    )}

                    <button type="submit" disabled={isLoading} style={{ width: '100%', height: '56px', borderRadius: '14px', border: 'none', background: 'linear-gradient(to right, #FF6B35, #D4A574)', cursor: isLoading ? 'default' : 'pointer', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isLoading ? 0.8 : 1 }}>
                        {isLoading ? <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFF', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <span style={{ fontSize: '17px', fontWeight: 700, color: '#FFF' }}>Créer mon compte</span>}
                    </button>
                </form>

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px', gap: '4px' }}>
                    <span style={{ fontSize: '15px', color: 'rgba(255,255,255,0.4)' }}>Déjà un compte ?</span>
                    <Link href="/auth/login" style={{ fontSize: '15px', fontWeight: 600, color: '#FF6B35', textDecoration: 'none' }}>Se connecter</Link>
                </div>
            </div>
        </AnimatedBackground>
    )
}
