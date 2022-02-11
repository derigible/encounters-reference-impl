import { gql } from '@apollo/client'

import { TICKET_FRAGMENT } from '../fragments/ticket_fragment'

export const UPDATE_TICKET_MUTATION = gql`
  ${TICKET_FRAGMENT}
  mutation UpdateTicket($ticketId: ID!, $updates: TicketUpdatesInput!) {
    updateTicket(ticket_id: $ticketId, updates: $updates) {
      errors {
        messages
      }
      ticket {
        ...TicketFragment
      }
    }
  }
`
