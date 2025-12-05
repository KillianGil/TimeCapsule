import { Stack } from "expo-router"

export default function AuthLayout() {
    return (
        <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
            <Stack.Screen name="login/index" />
            <Stack.Screen name="sign-up/index" />
            <Stack.Screen name="sign-up-success/index" />
            <Stack.Screen name="error/index" />
        </Stack>
    )
}
