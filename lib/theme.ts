/**
 * Theme constants for TimeCapsule
 * Centralized color and spacing definitions
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

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
}

export const RADIUS = {
    sm: 8,
    md: 12,
    lg: 14,
    xl: 16,
    round: 9999,
}

export const FONTS = {
    size: {
        xs: 10,
        sm: 12,
        md: 14,
        base: 15,
        lg: 16,
        xl: 18,
        xxl: 24,
        huge: 28,
    },
    weight: {
        regular: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
    },
}

// Gradient presets for LinearGradient
export const GRADIENTS = {
    primary: ['#FF6B35', '#D4A574'] as const,
    disabled: ['#8B7355', '#8B7355'] as const,
}
