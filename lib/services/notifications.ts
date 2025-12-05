import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import { supabase } from '@/lib/supabase/mobile'

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
})

export async function registerForPushNotifications(): Promise<string | null> {
    // Push notifications only work on physical devices
    if (!Device.isDevice) {
        console.log('Push notifications require a physical device')
        return null
    }

    try {
        // Check existing permissions
        const { status: existingStatus } = await Notifications.getPermissionsAsync()
        let finalStatus = existingStatus

        // Request permissions if not granted
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync()
            finalStatus = status
        }

        if (finalStatus !== 'granted') {
            console.log('Push notification permission denied')
            return null
        }

        // Get the Expo push token
        const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId: process.env.EXPO_PUBLIC_PROJECT_ID, // Add this to .env
        })
        const token = tokenData.data

        console.log('Push token:', token)

        // Save token to user's profile
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            await supabase
                .from('profiles')
                .update({ push_token: token })
                .eq('id', user.id)
        }

        // Android-specific channel setup
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'TimeCapsule',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF6B35',
            })
        }

        return token
    } catch (error) {
        console.error('Error registering for push notifications:', error)
        return null
    }
}

export async function sendLocalNotification(title: string, body: string, data?: Record<string, unknown>) {
    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            data: data || {},
            sound: true,
        },
        trigger: null, // Show immediately
    })
}

// Schedule a notification for when a capsule unlocks
export async function scheduleCapsuleUnlockNotification(
    capsuleId: string,
    capsuleTitle: string,
    unlockDate: Date,
    senderName: string
) {
    const now = new Date()
    const triggerDate = new Date(unlockDate)

    // Only schedule if unlock date is in the future
    if (triggerDate <= now) {
        return null
    }

    const identifier = await Notifications.scheduleNotificationAsync({
        content: {
            title: '🎁 Capsule déverrouillée !',
            body: `La capsule "${capsuleTitle}" de ${senderName} est prête à être ouverte !`,
            data: { capsuleId, type: 'unlock' },
            sound: true,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: triggerDate,
        },
    })

    return identifier
}

// Cancel a scheduled notification
export async function cancelScheduledNotification(identifier: string) {
    await Notifications.cancelScheduledNotificationAsync(identifier)
}

// Send push notification to another user (requires backend)
export async function sendPushToUser(userId: string, title: string, body: string, data?: object) {
    // Get the user's push token
    const { data: profile } = await supabase
        .from('profiles')
        .select('push_token')
        .eq('id', userId)
        .single()

    if (!profile?.push_token) {
        console.log('User has no push token')
        return false
    }

    // Send via Expo's push service
    try {
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: profile.push_token,
                title,
                body,
                data,
                sound: 'default',
                priority: 'high',
            }),
        })

        const result = await response.json()
        console.log('Push sent:', result)
        return true
    } catch (error) {
        console.error('Error sending push:', error)
        return false
    }
}
