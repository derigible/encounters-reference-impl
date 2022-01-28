import { gql } from '@apollo/client'
import { ALARM_FRAGMENT } from './alarm_fragment'

export const TICKET_FRAGMENT = gql`
  ${ALARM_FRAGMENT}
  fragment TicketFragment on Ticket {
    id
    ticket_type {
      id
      display_name
    }
    state
    assignees {
      id
      name
    }
    claimed
    created_by {
      id
      name
    }
    member {
      id
      name
    }
    notes
    parent_ticket {
      id
    }
    source
    alarms {
      ...AlarmFragment
    }
    valid_transitions
    created_at
    updated_at
  }
`
