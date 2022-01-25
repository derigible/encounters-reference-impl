import { gql } from '@apollo/client'

export const NOTIFICATION_FRAGMENT = gql`
  fragment NotificationFragment on Notification {
    content
    health_guide {
      id
      name
    }
    hidden
    id
    notification_type
    resource_id
    resource_type
    sent_at
  }
`
