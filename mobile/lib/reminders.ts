import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import { weekdaysForGoal } from './reminderSchedule'

const CHANNEL_ID = 'training-reminders'
const REMINDER_HOUR = 18
const REMINDER_MINUTE = 0

async function ensureChannel() {
  if (Platform.OS !== 'android') return
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Training reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
  })
}

/**
 * These are local notifications, scheduled on the device. Remote push would
 * need a server to send from, which the free Firebase tier does not run — and a
 * reminder to train does not need one, since the schedule is known up front.
 *
 * Replaces the whole schedule rather than adding to it, so changing the goal
 * or turning reminders off cannot leave older notifications behind.
 */
export async function syncReminders(options: {
  enabled: boolean
  weeklyGoal: number | null
  title: string
  body: string
}) {
  await Notifications.cancelAllScheduledNotificationsAsync()
  if (!options.enabled) return

  const { status } = await Notifications.getPermissionsAsync()
  let granted = status === 'granted'
  if (!granted) {
    const asked = await Notifications.requestPermissionsAsync()
    granted = asked.status === 'granted'
  }
  // A denied prompt is a normal outcome, not an error: the toggle stays on and
  // the user can grant permission later from system settings.
  if (!granted) return

  await ensureChannel()

  for (const weekday of weekdaysForGoal(options.weeklyGoal)) {
    await Notifications.scheduleNotificationAsync({
      content: { title: options.title, body: options.body },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        channelId: CHANNEL_ID,
        weekday,
        hour: REMINDER_HOUR,
        minute: REMINDER_MINUTE,
      },
    })
  }
}
