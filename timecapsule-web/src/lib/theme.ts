/**
 * Theme constants for TimeCapsule Web
 * Same design system as mobile app
 */

export const COLORS = {
    // Primary accent color
    primary: '#FF6B35',
    primaryLight: 'rgba(255, 107, 53, 0.15)',
    primaryMuted: 'rgba(255, 107, 53, 0.3)',

    // Secondary accent
    secondary: '#D4A574',
    gold: '#FFD700',

    // Backgrounds
    background: '#0F0D0B',
    backgroundCard: 'rgba(255,255,255,0.04)',
    backgroundCardHover: 'rgba(255,255,255,0.06)',
    backgroundHighlight: 'rgba(255, 107, 53, 0.08)',

    // Text
    text: '#FEFEFE',
    textMuted: 'rgba(255,255,255,0.5)',
    textDimmed: 'rgba(255,255,255,0.4)',
    textDisabled: 'rgba(255,255,255,0.3)',

    // Borders
    border: 'rgba(255,255,255,0.06)',
    borderLight: 'rgba(255,255,255,0.08)',
    borderHighlight: 'rgba(255, 107, 53, 0.15)',

    // Status
    success: '#4CAF50',
    error: '#FF5252',
    warning: '#FFA726',

    // Special
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
}

// Tailwind CSS class helpers for consistency
export const tw = {
    // Backgrounds
    bgPrimary: 'bg-[#FF6B35]',
    bgBackground: 'bg-[#0F0D0B]',
    bgCard: 'bg-white/[0.04]',
    bgCardHover: 'hover:bg-white/[0.06]',
    bgHighlight: 'bg-[#FF6B35]/[0.08]',

    // Text
    textPrimary: 'text-[#FF6B35]',
    textWhite: 'text-[#FEFEFE]',
    textMuted: 'text-white/50',
    textDimmed: 'text-white/40',

    // Borders
    borderDefault: 'border-white/[0.06]',
    borderLight: 'border-white/[0.08]',
    borderHighlight: 'border-[#FF6B35]/[0.15]',

    // Gradients (for style attribute)
    gradientPrimary: 'linear-gradient(135deg, #FF6B35 0%, #D4A574 100%)',
}
