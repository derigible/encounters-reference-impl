import { gql } from '@apollo/client'

import { TICKET_FRAGMENT } from '../fragments/ticket_fragment'

export const CREATE_TICKET_MUTATION = gql`
  ${TICKET_FRAGMENT}
  mutation CreateTicket(
    $assigneeId: ID!
    $memberId: ID!
    $ticketTypeId: ID!
    $sourceId: ID
    $sourceType: String
    $notes: String
    $claim: Boolean
    $memberRequestId: ID
  ) {
    createTicket(
      assignee_id: $assigneeId
      member_id: $memberId
      ticket_type_id: $ticketTypeId
      source_id: $sourceId
      source_type: $sourceType
      notes: $notes
      claim: $claim
      member_request_id: $memberRequestId
    ) {
      errors {
        messages
      }
      ticket {
        ...TicketFragment
      }
    }
  }
`
