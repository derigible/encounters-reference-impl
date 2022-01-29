import { gql } from '@apollo/client'

import { TICKET_FRAGMENT } from '../fragments/ticket_fragment'

export const ASSIGN_TICKET_MUTATION = gql`
  ${TICKET_FRAGMENT}
  mutation AssignTicket($ticketId: ID!, $healthGuideIds: [ID!]!) {
    assignTicket(ticket_id: $ticketId, health_guide_ids: $healthGuideIds) {
      errors {
        messages
      }
      ticket {
        ...TicketFragment
      }
    }
  }
`
