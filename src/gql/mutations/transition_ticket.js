import { gql } from '@apollo/client'

import { TICKET_FRAGMENT } from '../fragments/ticket_fragment'

export const TRANSITION_TICKET_MUTATION = gql`
  ${TICKET_FRAGMENT}
  mutation TransitionTicket($ticketId: ID!, $transition: Transitions!) {
    transitionTicket(ticket_id: $ticketId, transition: $transition) {
      errors {
        messages
      }
      ticket {
        ...TicketFragment
      }
    }
  }
`
