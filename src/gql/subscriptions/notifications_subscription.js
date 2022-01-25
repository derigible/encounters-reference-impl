import { gql } from '@apollo/client'

import { NOTIFICATION_FRAGMENT } from '../fragments/notification_fragment'

export const NOTIFICATIONS_SUBSCRIPTION = gql`
  ${NOTIFICATION_FRAGMENT}
  subscription Notifications {
    notifications {
      notification {
        ...NotificationFragment
      }
      remove
    }
  }
`
