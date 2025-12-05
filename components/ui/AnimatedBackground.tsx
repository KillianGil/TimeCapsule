
"use client"

import React, { useEffect } from "react"
import { StyleSheet, Dimensions, View } from "react-native"
import { Canvas, Rect, Circle, Blur, vec, Group, RadialGradient } from "@shopify/react-native-skia"
import {
    useSharedValue,
    withRepeat,
    withTiming,
    Easing,
    useDerivedValue,
} from "react-native-reanimated"

const { width, height } = Dimensions.get("window")

interface AnimatedBackgroundProps {
    children?: React.ReactNode
}

export function AnimatedBackground({ children }: AnimatedBackgroundProps) {
    // Shared values for breathing animation
    const breathe = useSharedValue(0)
    const rotate = useSharedValue(0)

    useEffect(() => {
        breathe.value = withRepeat(
            withTiming(1, { duration: 10000, easing: Easing.inOut(Easing.sin) }),
            -1,
            true
        )
        rotate.value = withRepeat(
            withTiming(2 * Math.PI, { duration: 20000, easing: Easing.linear }),
            -1,
            false
        )
    }, [])

    // Derived values for dynamic positioning and sizing
    const center = vec(width / 2, height / 2)

    // Solar Core (Bottom Center)
    const sunRadius = useDerivedValue(() => {
        // Manual mix: start * (1 - value) + end * value
        const start = width * 0.6
        const end = width * 0.7
        return start + (end - start) * breathe.value
    })

    // Ambient Light (Top Left)
    const ambientRadius = useDerivedValue(() => {
        const start = width * 0.8
        const end = width * 0.9
        return start + (end - start) * breathe.value
    })

    return (
        <View style={styles.container}>
            <Canvas style={styles.canvas}>
                {/* Deep Space Background */}
                <Rect x={0} y={0} width={width} height={height} color="#0F0D0B" />

                <Group>
                    <Blur blur={60} />

                    {/* Primary Solar Glow (Bottom) */}
                    <Circle cx={width * 0.5} cy={height * 0.85} r={sunRadius}>
                        <RadialGradient
                            c={vec(width * 0.5, height * 0.85)}
                            r={width * 0.8}
                            colors={["#FF6B3540", "#D4A57410", "#00000000"]}
                        />
                    </Circle>

                    {/* Secondary Ambient Glow (Top Left) */}
                    <Circle cx={0} cy={0} r={ambientRadius}>
                        <RadialGradient
                            c={vec(0, 0)}
                            r={width}
                            colors={["#8B454530", "#00000000"]}
                        />
                    </Circle>

                    {/* Tertiary Accent Glow (Right Center) */}
                    <Circle cx={width} cy={height * 0.4} r={width * 0.5} color="#7C3AED15">
                        <Blur blur={40} />
                    </Circle>
                </Group>
            </Canvas>

            <View style={styles.content}>
                {children}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0F0D0B",
    },
    canvas: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    content: {
        flex: 1,
    },
})
