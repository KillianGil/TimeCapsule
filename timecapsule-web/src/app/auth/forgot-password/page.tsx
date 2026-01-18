'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, ArrowLeft } from 'lucide-react'
import { getSupabase } from '@/lib/supabase'
import AnimatedBackground from '@/components/AnimatedBackground'

export default function ForgotPasswordPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) {
            setError("Veuillez entrer votre email")
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const supabase = getSupabase()
            const { error } = await supabase.auth.resetPasswordForEmail(email)
            if (error) throw error
            setIsSuccess(true)
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AnimatedBackground>
            <div style={{ maxWidth: '400px', margin: '0 auto', padding: '60px 28px 40px 28px', minHeight: '100vh' }}>
                {/* Back */}
                <button onClick={() => router.back()} style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '-10px', marginBottom: '20px', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                    <ArrowLeft size={24} color="#FEFEFE" strokeWidth={2} />
                </button>

                {/* Header */}
                <div style={{ marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#FEFEFE', margin: '0 0 8px 0' }}>Mot de passe oublié</h1>
                    <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.5 }}>Entrez votre email pour recevoir les instructions de réinitialisation.</p>
                </div>

                {isSuccess ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '20px', gap: '16px' }}>
                        <span style={{ fontSize: '48px', marginBottom: '8px' }}>📧</span>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#FEFEFE', margin: 0 }}>Email envoyé !</h2>
                        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 1.5, margin: 0 }}>Si un compte existe avec cet email, vous recevrez un lien pour réinitialiser votre mot de passe.</p>
                        <button onClick={() => router.back()} style={{ padding: '12px 24px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', marginTop: '10px', border: 'none', cursor: 'pointer' }}>
                            <span style={{ color: '#FEFEFE', fontWeight: 600 }}>Retour à la connexion</span>
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginLeft: '4px' }}>Email</label>
                            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '14px', padding: '0 16px', height: '56px', gap: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <Mail size={20} color="rgba(255,255,255,0.4)" />
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" required style={{ flex: 1, backgroundColor: 'transparent', border: 'none', outline: 'none', fontSize: '16px', color: '#FEFEFE' }} />
                            </div>
                        </div>

                        {error && (
                            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', borderRadius: '12px', padding: '14px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                                <p style={{ color: '#EF4444', fontSize: '14px', textAlign: 'center', fontWeight: 500, margin: 0 }}>{error}</p>
                            </div>
                        )}

                        <button type="submit" disabled={isLoading} style={{ width: '100%', height: '56px', borderRadius: '14px', border: 'none', background: 'linear-gradient(to right, #FF6B35, #D4A574)', cursor: isLoading ? 'default' : 'pointer', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isLoading ? 0.8 : 1 }}>
                            {isLoading ? <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFF', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <span style={{ fontSize: '17px', fontWeight: 700, color: '#FFF' }}>Envoyer le lien</span>}
                        </button>
                    </form>
                )}
            </div>
        </AnimatedBackground>
    )
}
