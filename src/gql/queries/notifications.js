import { gql } from '@apollo/client'
import { NOTIFICATION_FRAGMENT } from '../fragments/notification_fragment'

export const NOTIFICATIONS_QUERY = gql`
  ${NOTIFICATION_FRAGMENT}
  query Notifications($withHidden: Boolean) {
    notifications(with_hidden: $withHidden) {
      ...NotificationFragment
    }
  }
`
