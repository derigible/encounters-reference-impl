import { gql } from '@apollo/client'

import { ALARM_FRAGMENT } from '../fragments/alarm_fragment'

export const CREATE_ALARM_MUTATION = gql`
  ${ALARM_FRAGMENT}
  mutation CreateAlarm($ticketId: ID!, $alarmData: AlarmInput!) {
    createAlarm(ticket_id: $ticketId, alarm_data: $alarmData) {
      errors {
        messages
      }
      alarm {
        ...AlarmFragment
      }
    }
  }
`
