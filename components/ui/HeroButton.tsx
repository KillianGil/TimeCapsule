"use client"

import React from "react"
import { StyleSheet, Pressable, Text, View } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
    interpolate,
} from "react-native-reanimated"

interface HeroButtonProps {
    onPress: () => void
    label: string
    icon?: React.ReactNode
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export function HeroButton({ onPress, label, icon }: HeroButtonProps) {
    const scale = useSharedValue(1)
    const glow = useSharedValue(0)

    const handlePressIn = () => {
        scale.value = withSpring(0.96, { damping: 15, stiffness: 400 })
        glow.value = withTiming(1, { duration: 150 })
    }

    const handlePressOut = () => {
        scale.value = withSequence(
            withSpring(1.02, { damping: 10, stiffness: 400 }),
            withSpring(1, { damping: 15, stiffness: 300 })
        )
        glow.value = withTiming(0, { duration: 300 })
    }

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }))

    const glowStyle = useAnimatedStyle(() => ({
        opacity: interpolate(glow.value, [0, 1], [0.6, 1]),
        shadowOpacity: interpolate(glow.value, [0, 1], [0.3, 0.6]),
    }))

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[styles.container, animatedStyle]}
        >
            <Animated.View style={[styles.shadowContainer, glowStyle]}>
                <LinearGradient
                    colors={["#D4A574", "#C49660", "#B8865A"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradient}
                >
                    {/* Inner highlight */}
                    <View style={styles.innerHighlight} />

                    <View style={styles.content}>
                        {icon && <View style={styles.icon}>{icon}</View>}
                        <Text style={styles.label}>{label}</Text>
                    </View>
                </LinearGradient>
            </Animated.View>
        </AnimatedPressable>
    )
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
    },
    shadowContainer: {
        borderRadius: 16,
        shadowColor: "#D4A574",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 24,
        elevation: 12,
    },
    gradient: {
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
    },
    innerHighlight: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "50%",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 18,
        paddingHorizontal: 32,
        gap: 12,
    },
    icon: {
        opacity: 0.9,
    },
    label: {
        color: "#FFFFFF",
        fontSize: 17,
        fontWeight: "600",
        letterSpacing: 0.3,
    },
})
