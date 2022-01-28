import { gql } from '@apollo/client'

import { NOTIFICATION_FRAGMENT } from '../fragments/notification_fragment'

export const HIDE_NOTIFICATION_MUTATION = gql`
  ${NOTIFICATION_FRAGMENT}
  mutation HideNotification($notificationId: ID!) {
    hideNotification(notification_id: $notificationId) {
      errors {
        messages
      }
      notification {
        ...NotificationFragment
      }
    }
  }
`
