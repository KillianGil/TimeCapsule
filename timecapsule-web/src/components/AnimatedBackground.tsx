'use client'

import { useEffect, useRef } from 'react'

interface AnimatedBackgroundProps {
    children?: React.ReactNode
    className?: string
}

export default function AnimatedBackground({ children, className = '' }: AnimatedBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animationId: number
        const startTime = Date.now()

        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
        window.addEventListener('resize', resize)
        resize()

        const draw = () => {
            if (!ctx || !canvas) return

            const currentTime = Date.now()
            const elapsed = currentTime - startTime
            const width = canvas.width
            const height = canvas.height

            ctx.fillStyle = '#0F0D0B'
            ctx.fillRect(0, 0, width, height)

            const t = (elapsed % 10000) / 10000
            const sinValue = (Math.sin(t * Math.PI * 2) + 1) / 2

            const sunStartRadius = width * 0.6
            const sunEndRadius = width * 0.7
            const sunRadius = sunStartRadius + (sunEndRadius - sunStartRadius) * sinValue

            const sunGradient = ctx.createRadialGradient(
                width * 0.5, height * 0.85, 0,
                width * 0.5, height * 0.85, sunRadius
            )
            sunGradient.addColorStop(0, 'rgba(255, 107, 53, 0.25)')
            sunGradient.addColorStop(0.5, 'rgba(212, 165, 116, 0.06)')
            sunGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

            ctx.fillStyle = sunGradient
            ctx.fillRect(0, 0, width, height)

            const ambientStartRadius = width * 0.8
            const ambientEndRadius = width * 0.9
            const ambientRadius = ambientStartRadius + (ambientEndRadius - ambientStartRadius) * sinValue

            const ambientGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, ambientRadius)
            ambientGradient.addColorStop(0, 'rgba(139, 69, 69, 0.19)')
            ambientGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

            ctx.fillStyle = ambientGradient
            ctx.fillRect(0, 0, width, height)

            const accentRadius = width * 0.5
            const accentGradient = ctx.createRadialGradient(width, height * 0.4, 0, width, height * 0.4, accentRadius)
            accentGradient.addColorStop(0, 'rgba(124, 58, 237, 0.08)')
            accentGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

            ctx.filter = 'blur(40px)'
            ctx.fillStyle = accentGradient
            ctx.fillRect(0, 0, width, height)
            ctx.filter = 'none'

            animationId = requestAnimationFrame(draw)
        }

        draw()

        return () => {
            window.removeEventListener('resize', resize)
            cancelAnimationFrame(animationId)
        }
    }, [])

    return (
        <div className={`relative min-h-screen w-full overflow-hidden bg-[#0F0D0B] ${className}`}>
            <canvas
                ref={canvasRef}
                className="fixed inset-0 w-full h-full pointer-events-none"
            />
            {/* CENTERED CONTENT WRAPPER */}
            <div className="relative z-10 min-h-screen w-full flex justify-center">
                <div className="w-full">
                    {children}
                </div>
            </div>
        </div>
    )
}
