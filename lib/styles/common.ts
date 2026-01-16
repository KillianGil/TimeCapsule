import { StyleSheet } from 'react-native'
import { COLORS, RADIUS, FONTS, SPACING } from '../theme'

/**
 * Common reusable styles across the application
 * Import and spread these in your component styles
 */
export const commonStyles = StyleSheet.create({
    // Loading states
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.background,
    },

    // Containers
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: SPACING.xl,
        paddingTop: 60,
        paddingBottom: 100,
    },

    // Headers
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xxl,
    },
    headerTitle: {
        fontSize: FONTS.size.xl,
        fontWeight: FONTS.weight.bold,
        color: COLORS.text,
    },

    // Cards
    card: {
        padding: SPACING.lg,
        backgroundColor: COLORS.backgroundCard,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardHighlight: {
        backgroundColor: COLORS.backgroundHighlight,
        borderColor: COLORS.borderHighlight,
    },

    // Inputs
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundCardHover,
        borderRadius: RADIUS.lg,
        paddingHorizontal: SPACING.lg,
        height: 52,
        gap: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    input: {
        flex: 1,
        fontSize: FONTS.size.lg,
        color: COLORS.text,
    },

    // Buttons
    buttonPrimary: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        height: 56,
        borderRadius: RADIUS.lg,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 17,
        fontWeight: FONTS.weight.bold,
    },

    // Profile buttons
    profileButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.backgroundCardHover,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },

    // Section headers
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    sectionTitle: {
        fontSize: FONTS.size.xl,
        fontWeight: FONTS.weight.semibold,
        color: COLORS.text,
    },
    seeAllText: {
        fontSize: FONTS.size.md,
        color: COLORS.primary,
        fontWeight: FONTS.weight.medium,
    },

    // Empty states
    emptyState: {
        alignItems: 'center',
        padding: SPACING.xxl,
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: RADIUS.xl,
        gap: SPACING.md,
    },
    emptyText: {
        fontSize: FONTS.size.md,
        color: COLORS.textDimmed,
    },

    // Labels
    label: {
        fontSize: FONTS.size.md,
        fontWeight: FONTS.weight.semibold,
        color: COLORS.textMuted,
    },

    // Row layouts
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowBetween: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    // Gaps
    gap8: { gap: 8 },
    gap12: { gap: 12 },
    gap16: { gap: 16 },
    gap24: { gap: 24 },
})
