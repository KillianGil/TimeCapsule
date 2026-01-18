'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, ArrowLeft } from 'lucide-react'
import { getSupabase } from '@/lib/supabase'
import AnimatedBackground from '@/components/AnimatedBackground'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        let loginEmail = email.trim()
        const isEmail = loginEmail.includes('@')

        try {
            const supabase = getSupabase()

            if (!isEmail) {
                const { data: userEmail, error: rpcError } = await supabase
                    .rpc('get_email_for_username', { username_input: loginEmail })

                if (rpcError) {
                    throw new Error("Erreur lors de la recherche du pseudo")
                }

                if (!userEmail) {
                    throw new Error("Aucun compte trouvé avec ce pseudo")
                }

                loginEmail = userEmail
            }

            const { error } = await supabase.auth.signInWithPassword({
                email: loginEmail,
                password,
            })

            if (error) throw error

            router.push('/dashboard')
        } catch (err: any) {
            setError(err.message || "Identifiants incorrects")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AnimatedBackground>
            {/* CENTERED CONTAINER */}
            <div style={{
                maxWidth: '400px',
                margin: '0 auto',
                padding: '60px 28px 40px 28px',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
            }}>
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    style={{
                        width: '44px',
                        height: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: '-10px',
                        marginBottom: '20px',
                        borderRadius: '22px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer'
                    }}
                >
                    <ArrowLeft size={24} color="#FEFEFE" strokeWidth={2} />
                </button>

                {/* Header */}
                <div style={{ marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#FEFEFE', marginBottom: '8px', margin: '0 0 8px 0' }}>Connexion</h1>
                    <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Content de vous revoir !</p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Email */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginLeft: '4px' }}>Email ou Pseudo</label>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: 'rgba(255,255,255,0.06)',
                            borderRadius: '14px',
                            padding: '0 16px',
                            height: '56px',
                            gap: '12px',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <Mail size={20} color="rgba(255,255,255,0.4)" />
                            <input
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="votre@email.com"
                                required
                                style={{
                                    flex: 1,
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    fontSize: '16px',
                                    color: '#FEFEFE'
                                }}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginLeft: '4px' }}>Mot de passe</label>
                            <Link href="/auth/forgot-password" style={{ fontSize: '13px', fontWeight: 600, color: '#FF6B35', textDecoration: 'none' }}>
                                Oublié ?
                            </Link>
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: 'rgba(255,255,255,0.06)',
                            borderRadius: '14px',
                            padding: '0 16px',
                            height: '56px',
                            gap: '12px',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <Lock size={20} color="rgba(255,255,255,0.4)" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                style={{
                                    flex: 1,
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    fontSize: '16px',
                                    color: '#FEFEFE'
                                }}
                            />
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.15)',
                            borderRadius: '12px',
                            padding: '14px',
                            border: '1px solid rgba(239, 68, 68, 0.3)'
                        }}>
                            <p style={{ color: '#EF4444', fontSize: '14px', textAlign: 'center', fontWeight: 500, margin: 0 }}>{error}</p>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            height: '56px',
                            borderRadius: '14px',
                            border: 'none',
                            background: 'linear-gradient(to right, #FF6B35, #D4A574)',
                            cursor: isLoading ? 'default' : 'pointer',
                            marginTop: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: isLoading ? 0.8 : 1
                        }}
                    >
                        {isLoading ? (
                            <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFF', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        ) : (
                            <span style={{ fontSize: '17px', fontWeight: 700, color: '#FFF' }}>Se connecter</span>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px', gap: '4px' }}>
                    <span style={{ fontSize: '15px', color: 'rgba(255,255,255,0.4)' }}>Pas encore de compte ?</span>
                    <Link href="/auth/signup" style={{ fontSize: '15px', fontWeight: 600, color: '#FF6B35', textDecoration: 'none' }}>
                        Créer un compte
                    </Link>
                </div>
            </div>
        </AnimatedBackground>
    )
}
