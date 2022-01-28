import { gql } from '@apollo/client'
import { TICKET_FRAGMENT } from '../fragments/ticket_fragment'

export const TICKETS_QUERY = gql`
  ${TICKET_FRAGMENT}
  query Tickets($filters: TicketsFilterInput) {
    encounter_tickets(filters: $filters) {
      ...TicketFragment
    }
  }
`
