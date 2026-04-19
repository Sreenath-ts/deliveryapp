import webpush from "web-push"

webpush.setVapidDetails(
    process.env.VAPID_EMAIL!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
)

interface PushPayload {
    title: string
    body: string
    url?: string
}

export async function sendWebPush(subscription: object, payload: PushPayload): Promise<void> {
    try {
        await webpush.sendNotification(
            subscription as webpush.PushSubscription,
            JSON.stringify(payload)
        )
    } catch {
        // Subscription may be expired or invalid — silently skip
    }
}
