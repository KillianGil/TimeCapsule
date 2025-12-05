"use client"

import React from "react"
import { StyleSheet, View, ViewStyle } from "react-native"
import { BlurView } from "expo-blur"
import Animated, {
    FadeInDown,
    FadeInUp,
} from "react-native-reanimated"

interface GlassCardProps {
    children: React.ReactNode
    style?: ViewStyle
    intensity?: number
    delay?: number
    direction?: "up" | "down"
}

export function GlassCard({
    children,
    style,
    intensity = 20,
    delay = 0,
    direction = "up"
}: GlassCardProps) {
    const enteringAnimation = direction === "up"
        ? FadeInUp.delay(delay).duration(600).springify()
        : FadeInDown.delay(delay).duration(600).springify()

    return (
        <Animated.View
            entering={enteringAnimation}
            style={[styles.container, style]}
        >
            <BlurView intensity={intensity} tint="dark" style={styles.blur}>
                <View style={styles.content}>
                    {children}
                </View>
            </BlurView>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.08)",
    },
    blur: {
        flex: 1,
    },
    content: {
        padding: 24,
        backgroundColor: "rgba(255, 255, 255, 0.03)",
    },
})
