'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'
import AnimatedBackground from '@/components/AnimatedBackground'

export default function LandingPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <AnimatedBackground>
      {/* CENTERED CONTAINER */}
      <div style={{
        maxWidth: '400px',
        margin: '0 auto',
        padding: '40px 28px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 50, damping: 10 }}
          style={{ marginBottom: '20px', width: '100%', display: 'flex', justifyContent: 'center' }}
        >
          <div style={{ position: 'relative', width: '95%', maxWidth: '340px', aspectRatio: '340/220' }}>
            <Image
              src="/logo.png"
              alt="TimeCapsule Logo"
              fill
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 50 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <Sparkles size={14} color="#FF6B35" />
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#FF6B35', letterSpacing: '4px' }}>SOUVENIRS FUTURS</span>
            <Sparkles size={14} color="#FF6B35" />
          </div>

          <h1 style={{
            fontSize: '48px',
            fontWeight: 900,
            color: '#FEFEFE',
            textAlign: 'center',
            lineHeight: 1.1,
            marginBottom: '20px',
            margin: '0 0 20px 0'
          }}>
            Capturez<br />l&apos;instant.
          </h1>

          <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 1.5, margin: 0 }}>
            Envoyez des messages vidéo<br />à ouvrir dans le futur.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 40 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          <button
            onClick={() => router.push("/auth/signup")}
            style={{
              width: '100%',
              height: '60px',
              borderRadius: '18px',
              border: 'none',
              background: 'linear-gradient(to right, #FF6B35, #FF8F65)',
              boxShadow: '0 8px 24px rgba(255, 107, 53, 0.4)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#FFF' }}>Commencer</span>
            <ArrowRight size={20} color="#FFF" strokeWidth={2.5} />
          </button>

          <button
            onClick={() => router.push("/auth/login")}
            style={{
              width: '100%',
              height: '56px',
              borderRadius: '18px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span style={{ fontSize: '16px', fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>J&apos;ai déjà un compte</span>
          </button>
        </motion.div>
      </div>
    </AnimatedBackground>
  )
}
