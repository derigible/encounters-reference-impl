import { gql } from '@apollo/client'

import { ALARM_FRAGMENT } from '../fragments/alarm_fragment'

export const DELETE_ALARM_MUTATION = gql`
  ${ALARM_FRAGMENT}
  mutation DeleteAlarm($alarmId: ID!) {
    deleteAlarm(alarm_id: $alarmId) {
      errors {
        messages
      }
      alarm {
        ...AlarmFragment
      }
    }
  }
`
