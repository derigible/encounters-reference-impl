import { gql } from '@apollo/client'

export const ALARM_FRAGMENT = gql`
  fragment AlarmFragment on Alarm {
    id
    notes
    alert_at
    created_by {
      id
      name
    }
    for {
      id
      name
    }
  }
`
