import { gql } from '@apollo/client'

import { TICKET_FRAGMENT } from '../fragments/ticket_fragment'

export const UNASSIGN_TICKET_MUTATION = gql`
  ${TICKET_FRAGMENT}
  mutation UnassignTicket($ticketId: ID!, $healthGuideId: ID!) {
    unassignTicket(ticket_id: $ticketId, health_guide_id: $healthGuideId) {
      errors {
        messages
      }
      ticket {
        ...TicketFragment
      }
    }
  }
`
